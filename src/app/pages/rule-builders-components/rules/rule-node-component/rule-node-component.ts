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
  LabelSource,
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
 * The value a node holds for one selected entry. Older nodes saved by an earlier autocomplete build hold
 * whole option objects, so accept both.
 */
const storedValue = (v: unknown): string | undefined => {
  if (v == null) return undefined;
  if (typeof v !== "object") return String(v);
  const option = v as ListOption;
  return option.code ?? option.name ?? undefined;
};

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

    // A saved rule only holds codes: look up their names (once per code, shared by all nodes).
    // Until a name is known the chip shows the code.
    effect(() => {
      const source = this.labelSource();
      if (!source) return;
      const codes = this.valueList()
        .map(storedValue)
        .filter((code): code is string => !!code);
      if (codes.length)
        untracked(() => this.loadingLookupService.resolveLabels(source, codes));
    });

    // The complete diagnoses list is only needed by controls that are not autocomplete-driven.
    effect(() => {
      const key = this.field()?.key;
      if (key && DIAGNOSES_FIELD_KEYS.has(key) && !this.usesAutoComplete())
        untracked(() => this.loadingLookupService.ensureDiagnoses());
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

  /**
   * p-autoComplete in multiple mode: the field is flagged `isMultiple`, or the node already holds a list
   * (a rule can hold a list for a field that is not flagged; as a single-select, the next pick would replace it).
   */
  readonly autoCompleteMultiple = computed(
    () => this.multipleSelectField() || Array.isArray(this.node().value)
  );

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
   * What the node stores for an option of this field: the CODE for the server-searched lists (activities,
   * diagnoses), the name for every other autocomplete list.
   */
  readonly optionKey = computed<"code" | "name">(() =>
    this.serverSearched() ? "code" : "name"
  );

  /** Where the stored codes of this field are resolved to names; null when the field stores names. */
  private readonly labelSource = computed<LabelSource | null>(() => {
    const key = this.field()?.key ?? "";
    if (ACTIVITY_FIELD_KEYS.has(key)) {
      const activityTypeId = this.activityType();
      return activityTypeId == null
        ? null
        : { kind: "activity", activityTypeId };
    }
    return DIAGNOSES_FIELD_KEYS.has(key) ? { kind: "diagnosis" } : null;
  });

  /**
   * p-autoComplete renders its chips / input text from the model entries via `optionLabel`, so the model holds
   * option objects: the node stores the code, the control shows the NAME. The name of a saved code comes
   * from the search results (`labelOf`); until it is known the code is shown.
   * (Do not set `optionValue="code"` on the control: PrimeNG would then push bare codes next to
   * these option objects and its `unique` check no longer recognises them, so one row can be added twice.)
   */
  readonly selectedItems = computed<ListOption[]>(() =>
    this.valueList().map((v) => this.toModelItem(storedValue(v) ?? ""))
  );
  readonly selectedItem = computed<ListOption | null>(() => {
    const stored = storedValue(this.valueList()[0]);
    return stored ? this.toModelItem(stored) : null;
  });
  /** Stored values that are selected – used to tick the suggestion rows. */
  readonly selectedKeys = computed(
    () => new Set(this.valueList().map((v) => storedValue(v)))
  );

  /**
   * The dropdown rows. The node stores the code, so a row whose code is already selected is the same value:
   * it is ticked AND disabled instead of being silently ignored when clicked.
   */
  readonly suggestionRows = computed<ListOption[]>(() => {
    if (this.optionKey() !== "code") return this.suggestions();
    const selected = this.selectedKeys();
    return this.suggestions().map((row) =>
      row.code && selected.has(row.code) ? { ...row, disabled: true } : row
    );
  });

  private toModelItem(stored: string): ListOption {
    if (this.optionKey() === "name") return { name: stored };
    const source = this.labelSource();
    return {
      code: stored,
      name: (source && this.loadingLookupService.labelOf(source, stored)) || stored,
    };
  }

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

  /** Selection changed in p-autoComplete (objects or null) -> store the CODES (names for non-searched lists). */
  onAutoCompleteChange(selection: unknown): void {
    this.pinPickedNames(selection);
    if (this.autoCompleteMultiple()) {
      const items = Array.isArray(selection)
        ? selection
        : selection == null
        ? []
        : [selection];
      this.patch({
        value: items
          .map((option) => this.pickValue(option))
          .filter((code): code is string => !!code),
      });
    } else {
      this.patch({
        value:
          this.pickValue(Array.isArray(selection) ? selection[0] : selection) ||
          null,
      });
    }
  }

  /** Keeps the chip on the name the user clicked (see LoadingLookupService.pinLabel). */
  private pinPickedNames(selection: unknown): void {
    const source = this.labelSource();
    if (!source || this.optionKey() !== "code") return;
    const entries = Array.isArray(selection) ? selection : [selection];
    for (const entry of entries) {
      const option = entry as ListOption | null;
      if (option && typeof option === "object" && option.code && option.name && option.name !== option.code) {
        this.loadingLookupService.pinLabel(source, option.code, option.name);
      }
    }
  }

  /** What the node stores for one picked option. */
  private pickValue(option: unknown): string | undefined {
    if (option == null) return undefined;
    if (typeof option !== "object") return String(option);
    const picked = option as ListOption;
    return (this.optionKey() === "code" ? picked.code : picked.name) ?? undefined;
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
