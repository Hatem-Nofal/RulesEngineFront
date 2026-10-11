import { Injectable } from '@angular/core';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups/lookup-app-services.service';
import { Observable } from 'rxjs/internal/Observable';
import { shareReplay } from 'rxjs/internal/operators/shareReplay';
import { take } from 'rxjs/internal/operators/take';

@Injectable({
  providedIn: 'root'
})
export class LookupsCodingEditService {

  private rejectionReasons$!: Observable<any>;
  private auditTags$!: Observable<any>;
  private activityTags$!: Observable<any>;
  private activityType$!: Observable<any>;

  constructor(private lookupAppServicesService: LookupAppServicesService) { }

  getActivityRegectionReasonDropDownList(): Observable<any> {
    if (!this.rejectionReasons$) {
      this.rejectionReasons$ = this.lookupAppServicesService.getActivityRegectionReasonDropDownList()
        .pipe(
          take(1),
          shareReplay(1)
        );
    }
    return this.rejectionReasons$;
  }
  getClaimAuditDropDownList() {
    if (!this.auditTags$) {
      this.auditTags$ = this.lookupAppServicesService.getClaimAuditDropDownList()
        .pipe(
          take(1),
          shareReplay(1)
        );
    }
    return this.auditTags$;
  }
  getActivityTagsDropDownList() {
    if (!this.activityTags$) {

      this.activityTags$ = this.lookupAppServicesService.getActivityTagsDropDownList()
        .pipe(
          take(1),
          shareReplay(1)
        );
    }
    return this.activityTags$;
  }
  getActivityTypeDropDownList() {
    if (!this.activityTags$) {
      this.activityType$ = this.lookupAppServicesService.getActivityTypeDropDownList()
        .pipe(
          take(1),
          shareReplay(1)
        );
    }
    return this.activityType$;
  }

}
