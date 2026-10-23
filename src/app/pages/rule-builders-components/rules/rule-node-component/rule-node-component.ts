import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { LookupDto } from "@proxy/lookups/dtos";
import {
  RuleFormFieldDto,
  RuleNodeDto,
} from "@proxy/work-flows/dtos/rule-builders-dtos";
import { RuleNodeType } from "@proxy/common/enums/rule-node-type.enum";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { SelectModule } from "primeng/select";
import {
  defaultValue,
  isCollectionType,
  isDataType,
  isListOperator,
  operatorIds,
  OPERATORS,
} from "src/app/shared/models/constant";
import {
  LoadingLookupService,
  PreloadedLookup,
} from "../rules-services/loadingLookup-service";
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from "primeng/autocomplete";
import { CheckboxModule } from "primeng/checkbox";
import { catchError, Observable, of, Subject, switchMap } from "rxjs";

/**
 * Shared, referentially stable empty / static option lists.
 * The template used to build a fresh array literal on every change-detection
 * pass (`[]`, `[{...}]`), which made every PrimeNG select/multiselect
 * re-process its options on each cycle.
 */
/** `lookupSource` is read by the template but is not (yet) part of the generated RuleFormFieldDto proxy. */
type RuleFieldWithLookup = RuleFormFieldDto & { lookupSource?: string | null };

/** Anything a list control can show: lookup items (string ids) and activity lookups (numeric ids, optional `disabled`). */
type ListOption = {
  id?: string | number;
  name?: string;
  disabled?: boolean;
  code?: string | null;
};

const NO_OPTIONS: LookupDto[] = [];
const NO_VALUES: string[] = [];
const NO_ENUM_OPTIONS: any[] = [];

/** Field keys that are filtered by an Activity Type before their own list is shown. */
const ACTIVITY_FIELD_KEYS: ReadonlySet<string> = new Set([
  "Activities",
  "Activity",
]);
const DIAGNOSES_FIELD_KEYS: ReadonlySet<string> = new Set(["Diagnoses"]);

/**
 * List fields that are searched on the server while typing (too many entries to preload)
 * -> rendered with p-autoComplete. A key needs a search source in `loadSuggestions`.
 */
const AUTOCOMPLETE_FIELD_KEYS: ReadonlySet<string> = new Set([
  ...ACTIVITY_FIELD_KEYS,
  ...DIAGNOSES_FIELD_KEYS,
]);

/**
 * List fields whose complete list is preloaded once and shown in the classic
 * p-multiselect (multiple) / p-select (single).
 * Add one line per field key: `["<field key>", "<lookup in LoadingLookupService>"]`.
 * (Loaders already exist for: batchTypes, specialities, genericDrugs, procedureGroups,
 * duplicateTherapyGroups, morbidityGroups.)
 */
const MULTISELECT_FIELD_LOOKUPS: ReadonlyMap<string, PreloadedLookup> = new Map(
  [["BatchType", "batchTypes"]]
);

/** Server-searched lists (activities, diagnoses) are queried from this many characters on. */
const SEARCH_MIN_LENGTH = 3;

/**
 * The value stored on a node is the option's *name*. Older nodes saved by an earlier autocomplete
 * build hold whole option objects, so accept both.
 */
const toName = (v: unknown): string | undefined =>
  v != null && typeof v === "object"
    ? (v as ListOption).name
    : v == null
    ? undefined
    : String(v);

const toCode = (v: unknown): string | undefined =>
  v != null && typeof v === "object"
    ? (v as ListOption).code??''
    : v == null
    ? undefined
    : String(v);

@Component({
  selector: "app-rule-node",
  imports: [
    ButtonModule,
    FormsModule,
    InputTextModule,
    MultiSelectModule,
    SelectModule,
    AutoCompleteModule,
    CheckboxModule,
  ],
  templateUrl: "./rule-node-component.html",
  styleUrl: "./rule-node-component.scss",
  // All state flows through signal inputs / model(), so OnPush is safe and stops
  // every keystroke from re-checking the whole recursive rule tree.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleNodeComponent {
  private readonly loadingLookupService = inject(LoadingLookupService);
  node = model.required<RuleNodeDto>();
  fields = input.required<RuleFormFieldDto[]>();
  /** Preloaded options keyed by lookup source or field key. */
  lookups = input<Record<string, LookupDto[]>>({});
  allowGroups = input(true);
  isRoot = input(false);
  remove = output<void>();

  logicalOperators = [
    { value: 1, label: "AND" },
    { value: 2, label: "OR" },
  ];

  field = computed(() =>
    this.fields().find((f) => f.key === this.node().fieldKey)
  );

  operators = computed(() => {
    const f = this.field();
    if (!f || !isDataType(f.dataType)) return [];
    const ids = operatorIds(f);
    return OPERATORS[f.dataType as keyof typeof OPERATORS].filter((o) =>
      ids.includes(o.v)
    );
  });

  /**
   * Which property of an operator option is stored on the node. Must match the operator select's
   * `[optionValue]` (bound to this field in the template): 'l' stores the label, 'v' the numeric id.
   */

  /** The only allowed operator (as it is stored on the node), or null when there are several (or none). */
  readonly singleOperator = computed<number | string | null>(() => {
    const ops = this.operators();
    return ops.length === 1 ? ops[0]["v"] : null;
  });

  constructor() {
    // Activity Type list: only fetched (once, shared) when a node actually shows the select.
    effect(() => {
      if (this.usesActivityType())
        untracked(() => this.loadingLookupService.ensureTypes());
    });

    // Activities are requested only for a type that is selected, or that the saved node already carries
    // (activityTypeId). Nothing is loaded for a node without a type.
    // effect(() => {
    //   const typeId = this.activityType();
    //   if (typeId != null)
    //     untracked(() => this.loadingLookupService.ensureActivities(typeId));
    // });

    // Suggestions of the autocomplete: one request per search, only the latest answer is used
    // (switchMap drops stale responses); `null` cancels a request in flight and clears the list.
    this.query$
      .pipe(
        switchMap((query) =>
          query === null ? of([]) : this.loadSuggestions(query)
        ),
        takeUntilDestroyed()
      )
      .subscribe((items) => this.suggestions.set(items));

    // The complete diagnoses list is only needed by controls that are not autocomplete-driven.
    effect(() => {
      const key = this.field()?.key;
      if (key && DIAGNOSES_FIELD_KEYS.has(key) && !this.usesAutoComplete())
        untracked(() => this.loadingLookupService.ensureDiagnoses());
    });

    // Preloaded list of a p-multiselect / p-select field: requested once, shared by all nodes.
    effect(() => {
      const lookup = this.preloadedLookup();
      if (lookup)
        untracked(() => this.loadingLookupService.ensurePreloaded(lookup));
    });

    // With exactly one operator there is nothing to choose: make sure it is the selected one.
    // (New conditions already get it via onField; this also corrects rules loaded without it.)
    effect(() => {
      const only = this.singleOperator();
      const n = this.node();
      if (
        only !== null &&
        n.nodeType !== RuleNodeType.Group &&
        n.operator !== only
      ) {
        untracked(() => this.onOperator(only as number));
      }
    });
  }

  // ---- memoised view-model used by the template (recomputed only when its inputs change) ----
  /** Current value as a list (legacy rules stored a single string). */
  readonly valueList = computed<any[]>(() => {
    const v = this.node().value;
    if (Array.isArray(v)) return v;
    if (!v) return NO_VALUES;
    return [this.usesActivityType() ? v : String(v)]; // activity ids are numbers – keep them as they are
  });

  readonly collectionField = computed(() => {
    const f = this.field();
    return !!f && this.isCollection(f);
  });

  readonly multipleSelectField = computed(() => {
    const f = this.field();
    return !!f && !!this.isMultipleSelect(f);
  });

  readonly lookupOptions = computed<LookupDto[]>(() => {
    const source = (this.field() as RuleFieldWithLookup | undefined)
      ?.lookupSource;
    return (source ? this.lookups()[source] : undefined) ?? NO_OPTIONS;
  });

  // ---- Activity Type (Activities / PrimaryActivity / SecondaryActivity) ----
  /** Activity types from the API (loaded on demand, shared by all nodes). */
  readonly activityTypes = this.loadingLookupService.types;
  readonly diagnoses = this.loadingLookupService.diagnoses;

  readonly usesActivityType = computed(() =>
    ACTIVITY_FIELD_KEYS.has(this.field()?.key ?? "")
  );

  /**
   * The Activity Type of this condition: the `activityTypeId` returned with the saved rule, or the one
   * the user just picked. It lives on the node, so it follows the node when siblings are added/removed.
   */
  readonly activityType = computed<number | null>(() =>
    this.usesActivityType() ? this.node().activityTypeId ?? null : null
  );

  /** The activity list can only be used once an Activity Type is chosen. */
  readonly valueSelectDisabled = computed(
    () => this.usesActivityType() && !this.activityType()
  );

  // ---- p-autoComplete (List fields: searched on the server for activities / diagnoses) ----
  /** List fields of AUTOCOMPLETE_FIELD_KEYS are rendered with p-autoComplete; every other List field with the classic p-multiselect / p-select. */
  readonly usesAutoComplete = computed(
    () =>
      this.field()?.dataType === "List" &&
      this.collectionField() &&
      AUTOCOMPLETE_FIELD_KEYS.has(this.field()?.key ?? "")
  );

  /** The preloaded lookup behind this field's p-multiselect / p-select, if its key is registered. */
  readonly preloadedLookup = computed<PreloadedLookup | null>(
    () => MULTISELECT_FIELD_LOOKUPS.get(this.field()?.key ?? "") ?? null
  );

  /** Activities and diagnoses are too big to preload: they are searched on the server. */
  private readonly serverSearched = computed(() => {
    const key = this.field()?.key ?? "";
    return ACTIVITY_FIELD_KEYS.has(key) || DIAGNOSES_FIELD_KEYS.has(key);
  });

  readonly searchMinLength = computed(() =>
    this.serverSearched() ? SEARCH_MIN_LENGTH : 1
  );

  /** What the dropdown currently offers (result of the last search of THIS node). */
  readonly suggestions = signal<ListOption[]>([]);
  private readonly query$ = new Subject<string | null>();

  /**
   * p-autoComplete renders its chips / input text from the model entries via `optionLabel`, so the model has to
   * hold option objects. The node stores plain names, so they are converted both ways and a saved rule
   * shows its selection without any lookup request.
   */
  readonly selectedItems = computed<ListOption[]>(() =>
    this.valueList().map((v) => ({ name: toName(v) ?? "" }))
  );
  readonly selectedItem = computed<ListOption | null>(() => {
    const name = toName(this.valueList()[0]);
    return name ? { name } : null;
  });
  /** Names that are selected – used to tick the suggestion rows. */
  readonly selectedNames = computed(
    () => new Set(this.valueList().map((v) => toName(v)))
  );

  readonly listOptions = computed<ListOption[]>(() =>
    this.loadOptionsForField(this.field()?.key, this.activityType())
  );

  readonly enumOptions = computed<any[]>(
    () => this.field()?.options ?? NO_ENUM_OPTIONS
  );

  patch(p: Partial<RuleNodeDto>) {
    this.node.update((n) => ({ ...n, ...p }));
  }

  isCollection(f: RuleFormFieldDto) {
    if (!f.dataType || !isDataType(f.dataType)) return false;
    return isCollectionType(f.dataType);
  }
  isMultipleSelect(f: RuleFormFieldDto) {
    if (!f.dataType || !isDataType(f.dataType)) return false;
    return isCollectionType(f.dataType) && f.isMultiple;
  }

  loadOptionsForField(
    fieldKey?: string | null,
    activityTypeId?: number | null
  ): ListOption[] {
    if (fieldKey && ACTIVITY_FIELD_KEYS.has(fieldKey)) {
      // Activities depend on the selected Activity Type; empty until that type's list has loaded.
      return (
        (activityTypeId != null
          ? this.loadingLookupService.activitiesByType()[activityTypeId]
          : undefined) ?? NO_OPTIONS
      );
    }

    const preloaded = fieldKey
      ? MULTISELECT_FIELD_LOOKUPS.get(fieldKey)
      : undefined;
    if (preloaded) {
      return this.loadingLookupService.preloaded(preloaded)();
    }

    if (fieldKey && fieldKey === "Diagnoses") {
      return this.loadingLookupService.diagnoses();
    }
    return NO_OPTIONS;
  }

  /** Older rules stored a single string; the editor always works with a list. */
  asArray(v: unknown): string[] {
    return Array.isArray(v) ? v : v ? [String(v)] : NO_VALUES;
  }

  isList(op?: number | null) {
    return isListOperator(op);
  }

  /** Selection changed in p-autoComplete (objects or null) -> store the names. */
  onAutoCompleteChange(selection: unknown): void {
    if (this.multipleSelectField()) {
      const items = Array.isArray(selection)
        ? selection
        : selection == null
        ? []
        : [selection];
      this.patch({
        value: items.map(toName).filter((code): code is string => !!code),
      });
    } else {
      this.patch({
        value:
          toName(Array.isArray(selection) ? selection[0] : selection) || null,
      });
    }
  }

  onField(key: string) {
    const f = this.fields().find((x) => x.key === key);
    if (!f) return;
    const op = operatorIds(f)[0];
    this.patch({
      fieldKey: key,
      operator: op,
      value: defaultValue(f, op),
      isMultiple: f.isMultiple,
      activityTypeId: undefined, // belongs to the previous field
    });
    this.query$.next(null);
  }

  /** Changing the Activity Type loads a different list, so previously selected activities no longer apply. */
  onActivityType(typeId: number | null) {
    const f = this.field();
    if (!f) return;
    const op = this.node().operator ?? operatorIds(f)[0];
    this.patch({ activityTypeId: typeId, value: defaultValue(f, op) });
    this.query$.next(null); // suggestions of the previous type no longer apply
  }

  /** Switching between single (Equals) and list (In) operators converts the value shape. */
  onOperator(op: number) {
    const f = this.field();
    const v = this.node().value;
    let value = v;
    if (f?.dataType === "Enum") {
      if (isListOperator(op)) value = Array.isArray(v) ? v : v ? [v] : [];
      else value = Array.isArray(v) ? v[0] ?? null : v;
    } else if (f && isDataType(f.dataType) && isCollectionType(f.dataType)) {
      if (this.isMultipleSelect(f))
        value = Array.isArray(v) ? v : v == null ? [] : [v];
      else value = Array.isArray(v) ? v[0] ?? null : v;
    }
    this.patch({ operator: op, value: value, isMultiple: f?.isMultiple });
  }

  toggleValue(option: string) {
    const current: string[] = Array.isArray(this.node().value)
      ? this.node().value
      : [];
    this.patch({
      value: current.includes(option)
        ? current.filter((x) => x !== option)
        : [...current, option],
    });
  }

  addCondition() {
    const f = this.fields()[0];
    if (!f) return;

    const op = operatorIds(f)[0];
    const children = this.node().children ?? [];
    const condition: RuleNodeDto = {
      nodeType: RuleNodeType.Condition,
      logicalJoinOperator: 1,
      logicalOperator: 1,
      fieldKey: f.key,
      operator: op,
      value: defaultValue(f, op),
      children: [],
      isMultiple: f.isMultiple,
    };
    this.patch({
      children: [condition, ...children],
    });
  }

  addGroup() {
    this.patch({
      children: [
        ...(this.node().children ?? []),
        {
          nodeType: RuleNodeType.Group,
          logicalOperator: 1,
          logicalJoinOperator: 1,
          children: [],
        },
      ],
    });
  }

  /** Sets the AND / OR that connects child i to the previous child. */
  setJoin(i: number, op: number) {
    const children = this.node().children ?? [];
    const child = children[i];
    if (!child) return;

    this.patch({
      children: children.map((current, index) =>
        index === i ? { ...current, logicalJoinOperator: op } : current
      ),
      isMultiple: child.isMultiple,
    });
  }

  updateChild(previousChild: RuleNodeDto, updatedChild: RuleNodeDto) {
    const children = this.node().children ?? [];
    const childIndex = children.indexOf(previousChild);
    if (childIndex === -1) return;

    const child =
      updatedChild.nodeType === RuleNodeType.Group
        ? updatedChild
        : { ...updatedChild, nodeType: RuleNodeType.Condition };
    this.patch({
      children: children.map((current, index) =>
        index === childIndex ? child : current
      ),
      isMultiple: child.isMultiple,
    });
  }

  removeChild(i: number) {
    this.patch({
      children: (this.node().children ?? []).filter(
        (_: any, idx: number) => idx !== i
      ),
    });
  }
  onValueChange(value: string): void {
    this.patch({
      value: value === "" ? null : Number(value),
    });
  }

  /** `completeMethod` of p-autoComplete (called after `minLength` characters, debounced by its `delay`). */
  search(event: AutoCompleteCompleteEvent): void {
    this.query$.next((event.query ?? "").trim());
  }

  private loadSuggestions(query: string): Observable<ListOption[]> {
    const key = this.field()?.key ?? "";

    if (ACTIVITY_FIELD_KEYS.has(key)) {
      const typeId = this.activityType();
      return typeId == null
        ? of([])
        : this.loadingLookupService
            .searchActivities(typeId, query)
            .pipe(catchError(() => of([])));
    }

    if (DIAGNOSES_FIELD_KEYS.has(key)) {
      return this.loadingLookupService
        .searchDiagnoses(query)
        .pipe(catchError(() => of([])));
    }

    // Only the keys of AUTOCOMPLETE_FIELD_KEYS use the autocomplete, and they are all handled above.
    return of([]);
  }
}
