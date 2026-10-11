import { Injectable, NgZone, signal } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import { ClaimDto } from '@proxy/ehealth-claims/domains/claim';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';

import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { AuthenticationService } from 'src/app/shared/services/authentication/authentication.service';
export  const ACTIVITY_ICON_MAP: Record<number, string> = {
      1: 'assets/images/icons/tooth.png',
      2: 'assets/images/icons/medicine-9-svgrepo-com.png',
      3: 'assets/images/icons/doctor-bag-svgrepo-com.png',
      4: 'assets/images/icons/health-care-love-svgrepo-com.png',
      6: 'assets/images/icons/cart-shopping-svgrepo-com (1).png',
      0: 'assets/images/icons/no-filter-svgrepo-com.png', // "All" fallback
    };
@Injectable({
  providedIn: 'root',
})
export class CodingClaimEditService {
  private destroy$ = new Subject<void>();
  private _visitStartDate = signal<Date | null>(null);
  private userId = this.authenticationService.getUserData()?.id;

  getActivityTypeDropdown(): Observable<SelectedDropDownList[]> {
    return this.lookupsCodingEditService.getActivityTypeDropDownList();
  }

  constructor(
    private ngZone: NgZone,
    private authenticationService: AuthenticationService,
    private lookupAppServicesService: LookupAppServicesService,
    private lookupsCodingEditService: LookupAppServicesService
  ) {}

  //set visit startdate for validations
  setVisitStartDate(date: Date) {
    this._visitStartDate.set(date);
  }

  get visitStartDate() {
    return this._visitStartDate;
  }

  private totalsSubject = new BehaviorSubject<{
    totalQuantity: number;
    totalGross: number;
    totalNet: number;
    totalPatientShare: number;
    totalApproved: number;
    totalRejected: number;
  }>({
    totalQuantity: 0,
    totalGross: 0,
    totalNet: 0,
    totalPatientShare: 0,
    totalApproved: 0,
    totalRejected: 0
  });
  
  

  totals$ = this.totalsSubject.asObservable();

  updateTotals(controls: AbstractControl[]): void {
    const activeCount = controls.filter(
      c => !c.get('isDeleted')?.value
    )
    const totals = this.calculateTotals(activeCount);
    this.totalsSubject.next(totals);
  }
  calculateTotals(controls: AbstractControl[]) {
  let totalQuantity = 0;
  let totalGross = 0;
  let totalNet = 0;
  let totalPatientShare = 0;
  let totalApproved = 0;
  let totalRejected = 0;

  controls.forEach(activity => {
    totalQuantity += Number(activity.get('quantity')?.value || 0);
    totalGross += Number(activity.get('gross')?.value || 0);
    totalNet += Number(activity.get('net')?.value || 0);
    totalPatientShare += Number(activity.get('patientShare')?.value || 0);
    totalApproved += Number(activity.get('approvedAmount')?.value || 0);
    totalRejected += Number(activity.get('rejectedAmount')?.value || 0);
  });

  // based on decimal as calcu;ator
  const formate = (value: number, numberOfdecimals: number): number => {
    return Math.round(value * numberOfdecimals) / numberOfdecimals;;
  };

  return {
    totalQuantity: formate(totalQuantity, 1000),
    totalGross: formate(totalGross, 1000),
    totalNet: formate(totalNet, 1000),
    totalPatientShare: formate(totalPatientShare, 1000),
    totalApproved: formate(totalApproved, 1000),
    totalRejected: formate(totalRejected, 1000)
  };
}
  // set default value for claim data
  getDefaultClaimData(): ClaimDto {
    return {
      number: '',
      serial: 0,
      patient_nid: '',
      facilityCode: '',
      ehealth_Batch_code: '',
      uhia_Batch_code: '',
      page_Count: 0,
      visit_Start_Date: '',
      visit_End_Date: '',
      create_timestamp: '',
      update_timestamp: '',
      start_Service_id: 0,
      end_Service_id: 0,
      scan_Date: '',
      batch_id: 0,
      entered_Net: 0,
      paymentStatus_id: 0,
      status_id: 0,
      medicalDiagnosis: [],
      medicalActivities: [],
      claimsTags: [],
      claimsLoggings: [],
      createdBy_Id: '',
      firstUpdate_timestamp: '',
      firstModifiedBy_Id: '',
      assignedTo_Id: '',
      modifiedBy_Id: '',
      patient_nid_orig: '',
      handle_id: '',
      nid_Valid_Flag: null,
      total_Gross: 0,
      total_Net: 0,
      total_patient_share: 0,
      audit_Rej_Amt: 0,
      audit_Appr_Amt: 0,
      encounterStartTypeId: 0,
      encounterStartTypeName: '',
      encounterEndTypeName: '',
      encounterEndTypeId: 0,
      mod_flag: '',
      diagnosis_id: 0,
      modifiedBy: '',
      serviceType: '',
      serviceTypeId: 0,
      providerName: '',
      service_Date: '',
      physicianId: 1,
      total_Approved: 0,
      total_Rejected: 0,
    };
  }

  // to avoid diffrence between formcontrol names and data
  mapFormToApiFormat(form: FormGroup, claimData: ClaimDto) {
    const formValue = form.getRawValue();
    return {
      id: formValue?.id,
      number: formValue?.number,
      serial: formValue?.serial,
      medicalDiagnosis: form.get('medicalDiagnosis')?.getRawValue() || [],
      medicalActivities: form.get('medicalActivities')?.getRawValue() || [],
      patient_nid: formValue?.patientNid,
      patient_nid_orig: formValue?.originalPatientNid,
      visit_Start_Date: formValue?.visitStartDate,
      visit_End_Date: formValue?.visitEndDate,
      batch_id: formValue?.batch_id,
      entered_Net: formValue?.entered_Net,
      paymentStatus_id: formValue?.paymentStatus_id,
      status_id: formValue?.status_id,
      total_Gross: formValue?.total_Gross,
      total_Net: formValue?.total_Net,
      total_patient_share: formValue?.total_patient_share,
      claimsTags: formValue?.claimsTags,
      createdBy_Id: formValue?.createdBy_Id,
      firstUpdate_timestamp: formValue?.firstUpdate_timestamp,
      firstModifiedBy_Id: formValue?.firstModifiedBy_Id,
      assignedTo_Id: formValue?.assignedTo_Id,
      modifiedBy_Id: formValue?.modifiedBy_Id,
      handle_id: formValue?.handle_id,
      nid_Valid_Flag: formValue?.nid_Valid_Flag,
      audit_Rej_Amt: formValue?.audit_Rej_Amt,
      audit_Appr_Amt: formValue?.audit_Appr_Amt,
      encounterStartTypeName: formValue?.encounterStartTypeName,
      encounterEndTypeName: formValue?.encounterEndTypeName,
      mod_flag: formValue?.mod_flag,
      physicianId: formValue?.physicianId,
      encounterId: formValue?.encounterId,
      serviceTypeId: claimData?.serviceTypeId,
      isDraft: formValue?.isDraft,
    };
  }

  // set data as drafted in localStorage
  autoSaveDraft(form: FormGroup, claimId: string | number, claimData: ClaimDto) {
    this.hasAnyClaimDraft(claimId);
    form?.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.ngZone.runOutsideAngular(() => {
          if (form.dirty) {
            const claimDetails = { ...claimData, ...this.mapFormToApiFormat(form, claimData) };
            const cliamData = {
              data: claimDetails,
              claimId: claimId,
            };
            localStorage.setItem(`claimDraft_${claimId}_${this.userId}`, JSON.stringify(cliamData));
          }
        });
      });
  }
  hasAnyClaimDraft(claimId: string | number) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('claimDraft_') && !key.includes(`${claimId}_${this.userId}`)) {
        keysToRemove.push(key);
      }
    }
    if (keysToRemove.length > 0) {
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }
  detailsGroupCalculations(controls: AbstractControl[]): Observable<
    {
      type: string;
      count: number;
      net: number;
      approved: number;
      rejected: number;
    }[]
  > {
    return this.getActivityTypeDropdown().pipe(
      map(dropdownList => {
        const groupedTotals = new Map<
          number,
          { count: number; net: number; approved: number; rejected: number }
        >();

        controls.forEach(activity => {
          const typeId = Number(activity.get('activityTypeId')?.value || 0);
          const net = Number(activity.get('net')?.value || 0);
          const approved = Number(activity.get('approvedAmount')?.value || 0);
          const rejected = Number(activity.get('rejectedAmount')?.value || 0);

          if (!groupedTotals.has(typeId)) {
            groupedTotals.set(typeId, { count: 1, net, approved, rejected });
          } else {
            const existing = groupedTotals.get(typeId)!;
            groupedTotals.set(typeId, {
              count: existing.count + 1,
              net: existing.net + net,
              approved: existing.approved + approved,
              rejected: existing.rejected + rejected,
            });
          }
        });

        return Array.from(groupedTotals.entries()).map(([typeId, data]) => {
          const typeName = dropdownList.find(t => t.id === typeId)?.name || 'Unknown';
          return {
            type: typeName,
            count: data.count,
            net: data.net,
            approved: data.approved,
            rejected: data.rejected,
          };
        });
      })
    );
  }

  setActivityFilters(): Observable<{
    filteredActivityTypes: { id: number; name: string; icon: string }[];
    activityTypeMap: { [id: number]: { id: number; icon: string; name: string } };
  }> {
   
    return this.getActivityTypeDropdown().pipe(
      map(dropdownItems => {
         const filteredActivityTypes = dropdownItems.map(item => ({
         id: item.id,
         name: item.name,
         icon: this.getActivityIcon(item.id),
       }));
       filteredActivityTypes.push({
         id: 0,
         name: 'All',
         icon: this.getActivityIcon(0),
       });
       const activityTypeMap = filteredActivityTypes.reduce((acc, type) => {
         acc[type.id] = type;
         return acc;
       }, {} as { [id: number]: { id: number; name: string; icon: string } });
       return { filteredActivityTypes, activityTypeMap };
      })
    );
  }

  searchDiagnosis(searchText: string): Observable<any[]> {
    if (searchText.length < 2) {
      return of([]);
    }
    return of(searchText).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(text => {
        return this.lookupAppServicesService.getDiagnosisDropDownListBySearchTerm(text);
      }),
      catchError(() => of([]))
    );
  }

  loadDraft(claimId: string | number) {
    const draft = localStorage.getItem(`claimDraft_${claimId}_${this.userId}`);
    return draft ? JSON.parse(draft) : null;
  }
  clearDraft(claimId: string | number) {
    localStorage.removeItem(`claimDraft_${claimId}_${this.userId}`);
  }
  destroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  getActivityIcon(activityId: number): string {
 return ACTIVITY_ICON_MAP[activityId] ?? 'assets/images/icons/default.png';
}
}
