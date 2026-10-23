import { inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import type { SelectedDropDownList } from "@proxy/common/dtos/models";
import { LookupService } from "@proxy/ehealth-claims/lookups";
import { map, Observable } from "rxjs";

const toItems = (
  list: SelectedDropDownList[] | null | undefined
): SelectedDropDownList[] =>
  (list ?? [])
    .filter((x) => x.id != null)
    .map((x) => ({
      id: x.id as number,
      name: x.name ?? "",
      disabled: x.disabled,
      code:x.code
    }));

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
   * Server-side search of the activities of one type (autocomplete). Returns the result instead of
   * caching it: results depend on the search term, so they belong to the caller that asked for them.
   */
  searchActivities(
    activityTypeId: number,
    searchTerm: string
  ): Observable<SelectedDropDownList[]> {
    return this.lookupService
      .getActivitySubTypeDropDownListPagedByActivityTypeIdAndSearchTerm(
        activityTypeId,
        searchTerm
      )
      .pipe(map(toItems));
  }

  /** Server-side search of diagnoses (autocomplete). */
  searchDiagnoses(searchTerm: string): Observable<SelectedDropDownList[]> {
    return this.lookupService
      .getDiagnosisDropDownListPagedBySearchTerm(searchTerm)
      .pipe(map(toItems));
  }
}
