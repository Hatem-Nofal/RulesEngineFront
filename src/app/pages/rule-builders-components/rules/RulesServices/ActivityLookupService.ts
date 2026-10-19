import { inject, Injectable, signal } from '@angular/core';
import type { SelectedDropDownList } from '@proxy/common/dtos/models';
import { LookupService } from '@proxy/ehealth-claims/lookups';

export interface ActivityLookupItem {
  id: number;
  name: string;
  disabled?: boolean;
}

const toItems = (list: SelectedDropDownList[] | null | undefined): ActivityLookupItem[] =>
  (list ?? [])
    .filter(x => x.id != null)
    .map(x => ({ id: x.id as number, name: x.name ?? '', disabled: x.disabled }));

/**
 * Loads and caches the Activity Type and Activity lookups.
 *
 * A rule can contain many condition nodes and every one of them needs the same lists, so each list is
 * requested once and shared through signals. A failed request is forgotten so a later call can retry it.
 */
@Injectable({ providedIn: 'root' })
export class ActivityLookupService {
  private readonly lookupService = inject(LookupService);

  private readonly _types = signal<ActivityLookupItem[]>([]);
  private readonly _activitiesByType = signal<Record<number, ActivityLookupItem[]>>({});

  private typesRequested = false;
  private readonly activitiesRequested = new Set<number>();

  /** All activity types (GET activity-type-drop-down-list). */
  readonly types = this._types.asReadonly();

  /** Activities already loaded, keyed by activity type id (GET activity-sub-type-drop-down-list/{activityTypeId}). */
  readonly activitiesByType = this._activitiesByType.asReadonly();

  ensureTypes(): void {
    if (this.typesRequested) return;
    this.typesRequested = true;

    this.lookupService.getActivityTypeDropDownList().subscribe({
      next: list => this._types.set(toItems(list)),
      error: () => (this.typesRequested = false),
    });
  }

  ensureActivities(activityTypeId: number): void {
    if (this.activitiesRequested.has(activityTypeId)) return;
    this.activitiesRequested.add(activityTypeId);

    this.lookupService.getActivitySubTypeDropDownListByActivityTypeId(activityTypeId).subscribe({
      next: list =>
        this._activitiesByType.update(byType => ({ ...byType, [activityTypeId]: toItems(list) })),
      error: () => this.activitiesRequested.delete(activityTypeId),
    });
  }
}
