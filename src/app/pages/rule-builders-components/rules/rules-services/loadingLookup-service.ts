import { inject, Injectable, signal } from "@angular/core";
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
    }));

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
  private readonly _specialities = signal<SelectedDropDownList[]>([]);
  private readonly _genericDrugs = signal<SelectedDropDownList[]>([]);
  private readonly _procedureGroups = signal<SelectedDropDownList[]>([]);
  private readonly _duplicateTherapyGroups = signal<SelectedDropDownList[]>([]);
  private readonly _morbidityGroups = signal<SelectedDropDownList[]>([]);
  private readonly _batchTypes = signal<SelectedDropDownList[]>([]);

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
  ensureSpecialities(): void {
    this.lookupService.getSpecialitiesIdDropDownList().subscribe({
      next: (list) => this._specialities.set(toItems(list)),
    });
  }
  ensureGenericDrugs(): void {
    this.lookupService.getGenericDrugsDropDownList().subscribe({
      next: (list) => this._genericDrugs.set(toItems(list)),
    });
  }

  ensureProcedureGroups(): void {
    this.lookupService.getProcedureGroupsDropDownList().subscribe({
      next: (list) => this._procedureGroups.set(toItems(list)),
    });
  }

  ensureDuplicateTherapyGroups(): void {
    this.lookupService.getDuplicateTherapyGroupsDropDownList().subscribe({
      next: (list) => this._duplicateTherapyGroups.set(toItems(list)),
    });
  }

  ensureMorbidityGroups(): void {
    this.lookupService.getMorbidityGroupsDropDownList().subscribe({
      next: (list) => this._morbidityGroups.set(toItems(list)),
    });
  }
  ensureBatchTypes(): void {
    this.lookupService.getBatchTypesDropDownList().subscribe({
      next: (list) => this._batchTypes.set(toItems(list)),
    });
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
