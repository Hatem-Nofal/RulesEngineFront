import { inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import type { SelectedDropDownList } from "@proxy/common/dtos/models";
import { LookupService } from "@proxy/ehealth-claims/lookups";
import { map, Observable, tap } from "rxjs";

const toItems = (
  list: SelectedDropDownList[] | null | undefined
): SelectedDropDownList[] =>
  (list ?? [])
    .filter((x) => x.id != null)
    .map((x) => ({
      id: x.id as number,
      name: x.name ?? "",
      disabled: x.disabled,
      // the autocomplete stores the code, so it must survive the mapping - as a trimmed string
      code: x.code == null || String(x.code).trim() === "" ? null : String(x.code).trim(),
    }));

/**
 * Search results are what the user picks from, and the CODE is what gets stored: an entry without a code
 * cannot be stored, so it is shown greyed out instead of silently doing nothing when clicked.
 */
const toSearchResults = (
  list: SelectedDropDownList[] | null | undefined
): SelectedDropDownList[] =>
  toItems(list).map((item) => ({
    ...item,
    disabled: item.disabled || !item.code,
  }));

/** Where a stored code is resolved: activity codes belong to an Activity Type, diagnosis codes are global. */
export type LabelSource =
  | { kind: "activity"; activityTypeId: number }
  | { kind: "diagnosis" };

const scopeOf = (source: LabelSource): string =>
  source.kind === "activity" ? `activity:${source.activityTypeId}` : "diagnosis";

/**
 * Lookups whose complete list is loaded once and then shared (shown in a p-multiselect / p-select).
 * A field key is attached to one of these in RuleNodeComponent (MULTISELECT_FIELD_LOOKUPS).
 */
export type PreloadedLookup =
  | "batchTypes"
  | "specialities"
  | "genericDrugs"
  | "procedureGroups"
  | "duplicateTherapyGroups"
  | "morbidityGroups";

/**
 * Loads and caches the Activity Type and Activity lookups.
 *
 * A rule can contain many condition nodes and every one of them needs the same lists, so each list is
 * requested once and shared through signals. A failed request is forgotten so a later call can retry it.
 */
@Injectable({ providedIn: "root" })
export class LoadingLookupService {
  private readonly lookupService = inject(LookupService);

  private readonly _types = signal<SelectedDropDownList[]>([]);
  private readonly _activitiesByType = signal<
    Record<number, SelectedDropDownList[]>
  >({});
  private readonly _diagnoses = signal<SelectedDropDownList[]>([]);
  private readonly preloadedItems: Record<
    PreloadedLookup,
    WritableSignal<SelectedDropDownList[]>
  > = {
    batchTypes: signal<SelectedDropDownList[]>([]),
    specialities: signal<SelectedDropDownList[]>([]),
    genericDrugs: signal<SelectedDropDownList[]>([]),
    procedureGroups: signal<SelectedDropDownList[]>([]),
    duplicateTherapyGroups: signal<SelectedDropDownList[]>([]),
    morbidityGroups: signal<SelectedDropDownList[]>([]),
  };

  private readonly preloadedLoaders: Record<
    PreloadedLookup,
    () => Observable<SelectedDropDownList[]>
  > = {
    batchTypes: () => this.lookupService.getBatchTypesDropDownList(),
    specialities: () => this.lookupService.getSpecialitiesIdDropDownList(),
    genericDrugs: () => this.lookupService.getGenericDrugsDropDownList(),
    procedureGroups: () => this.lookupService.getProcedureGroupsDropDownList(),
    duplicateTherapyGroups: () =>
      this.lookupService.getDuplicateTherapyGroupsDropDownList(),
    morbidityGroups: () => this.lookupService.getMorbidityGroupsDropDownList(),
  };

  private readonly preloadedRequested = new Set<PreloadedLookup>();

  /** code -> name of every code that has appeared in a search result, per scope (see scopeOf). */
  private readonly _labels = signal<Record<string, string>>({});
  private readonly labelsRequested = new Set<string>();

  private typesRequested = false;
  private diagnosesRequested = false;
  private readonly activitiesRequested = new Set<number>();

  /** All activity types (GET activity-type-drop-down-list). */
  readonly types = this._types.asReadonly();

  /** Activities already loaded, keyed by activity type id (GET activity-sub-type-drop-down-list/{activityTypeId}). */
  readonly activitiesByType = this._activitiesByType.asReadonly();
  readonly diagnoses = this._diagnoses.asReadonly();

  ensureTypes(): void {
    if (this.typesRequested) return;
    this.typesRequested = true;

    this.lookupService.getActivityTypeDropDownList().subscribe({
      next: (list) => this._types.set(toItems(list)),
      error: () => (this.typesRequested = false),
    });
  }

  ensureActivities(activityTypeId: number): void {
    if (this.activitiesRequested.has(activityTypeId)) return;
    this.activitiesRequested.add(activityTypeId);

    this.lookupService
      .getActivitySubTypeDropDownListByActivityTypeId(activityTypeId)
      .subscribe({
        next: (list) =>
          this._activitiesByType.update((byType) => ({
            ...byType,
            [activityTypeId]: toItems(list),
          })),
        error: () => this.activitiesRequested.delete(activityTypeId),
      });
  }

  ensureDiagnoses(): void {
    if (this.diagnosesRequested) return;
    this.diagnosesRequested = true;

    this.lookupService.getDiagnosisDropDownList().subscribe({
      next: (list) => this._diagnoses.set(toItems(list)),
      error: () => (this.diagnosesRequested = false),
    });
  }
  /** The loaded list of a preloaded lookup (empty until `ensurePreloaded` has finished). */
  preloaded(lookup: PreloadedLookup): Signal<SelectedDropDownList[]> {
    return this.preloadedItems[lookup].asReadonly();
  }

  /** Requests the list once, however many nodes ask; a failed request is forgotten so it can be retried. */
  ensurePreloaded(lookup: PreloadedLookup): void {
    if (this.preloadedRequested.has(lookup)) return;
    this.preloadedRequested.add(lookup);

    this.preloadedLoaders[lookup]().subscribe({
      next: (list) => this.preloadedItems[lookup].set(toItems(list)),
      error: () => this.preloadedRequested.delete(lookup),
    });
  }

  ensureSpecialities(): void {
    this.ensurePreloaded("specialities");
  }
  ensureGenericDrugs(): void {
    this.ensurePreloaded("genericDrugs");
  }
  ensureProcedureGroups(): void {
    this.ensurePreloaded("procedureGroups");
  }
  ensureDuplicateTherapyGroups(): void {
    this.ensurePreloaded("duplicateTherapyGroups");
  }
  ensureMorbidityGroups(): void {
    this.ensurePreloaded("morbidityGroups");
  }
  ensureBatchTypes(): void {
    this.ensurePreloaded("batchTypes");
  }

  /**
   * Name of a stored code, once it has appeared in a search result (reactive: reading it inside a
   * computed/template re-evaluates when the name arrives). `undefined` while unknown.
   */
  labelOf(source: LabelSource, code: string): string | undefined {
    return this._labels()[`${scopeOf(source)}|${code}`];
  }

  /**
   * A saved rule only holds codes. Looks up the names of the codes that are not known yet, by searching
   * for the code itself. Each code is requested once, however many nodes show it; the result lands in
   * `labelOf`. A code that cannot be found keeps being shown as the code.
   */
  resolveLabels(source: LabelSource, codes: readonly string[]): void {
    const scope = scopeOf(source);
    for (const code of new Set(codes)) {
      const id = `${scope}|${code}`;
      if (this._labels()[id] !== undefined || this.labelsRequested.has(id)) continue;
      this.labelsRequested.add(id);

      const search$ =
        source.kind === "activity"
          ? this.searchActivities(source.activityTypeId, code)
          : this.searchDiagnoses(code);
      search$.subscribe({ error: () => this.labelsRequested.delete(id) }); // allow a retry
    }
  }

  /**
   * Names seen in search results. The FIRST name seen for a code is kept: several activities can share a
   * code, and a later search that happens to return another one of them must not rename a chip that is
   * already on screen.
   */
  private remember(source: LabelSource, items: SelectedDropDownList[]): void {
    const scope = scopeOf(source);
    const found: Record<string, string> = {};
    for (const item of items) {
      const id = `${scope}|${item.code}`;
      if (item.code && this._labels()[id] === undefined && found[id] === undefined) {
        found[id] = item.name ?? "";
      }
    }
    if (Object.keys(found).length) {
      this._labels.update((labels) => ({ ...labels, ...found }));
    }
  }

  /**
   * The name of the entry the user actually picked wins over whatever a search happened to show first.
   * (The rule only stores the code, so this is what keeps the chip on the name that was clicked.)
   */
  pinLabel(source: LabelSource, code: string, name: string): void {
    const id = `${scopeOf(source)}|${code}`;
    if (this._labels()[id] === name) return;
    this._labels.update((labels) => ({ ...labels, [id]: name }));
  }

  /**
   * Server-side search of the activities of one type (autocomplete). Returns the result instead of
   * caching it: results depend on the search term, so they belong to the caller that asked for them.
   * (Only the code -> name pairs are remembered, to label stored codes.)
   */
  searchActivities(
    activityTypeId: number,
    searchTerm: string
  ): Observable<SelectedDropDownList[]> {
    const source: LabelSource = { kind: "activity", activityTypeId };
    return this.lookupService
      .getActivitySubTypeDropDownListPagedByActivityTypeIdAndSearchTerm(
        activityTypeId,
        searchTerm
      )
      .pipe(
        map(toSearchResults),
        tap((items) => this.remember(source, items))
      );
  }

  /** Server-side search of diagnoses (autocomplete). */
  searchDiagnoses(searchTerm: string): Observable<SelectedDropDownList[]> {
    const source: LabelSource = { kind: "diagnosis" };
    return this.lookupService
      .getDiagnosisDropDownListPagedBySearchTerm(searchTerm)
      .pipe(
        map(toSearchResults),
        tap((items) => this.remember(source, items))
      );
  }
}
