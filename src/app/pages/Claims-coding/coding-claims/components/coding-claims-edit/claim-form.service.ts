import { DatePipe } from '@angular/common';
import { Injectable, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { dateCompareValidator } from 'src/app/shared/validators/minDate-validator';
import { CodingClaimEditService } from './coding-claim-edit.service';
import { ClaimDto } from '@proxy/ehealth-claims/domains/claim/models';
import { DiagnosisDto } from '@proxy/ehealth-claims/domains/claim/diagnosis';

@Injectable({
  providedIn: 'root',
})
export class ClaimFormService {
  private destroy$ = new Subject<void>();
  claimForm: FormGroup;

  activityPriceValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const isDeleted = control.get('isDeleted')?.value;

    // Skip validation if the activity is marked as deleted
    if (isDeleted) {
      return null;
    }
    const gross = Number(control.get('gross')?.value);
    const net = Number(control.get('net')?.value);
    const patientShare = Number(control.get('patientShare')?.value);
    if (isNaN(gross) || isNaN(net) || isNaN(patientShare)) {
      return null;
    }
    const total = +(net + patientShare).toFixed(3);
    const roundedGross = +gross.toFixed(3);
    // Skip validation if all are empty
    if (!gross && !net && !patientShare) return null;

    // Match the same logic as revalidateAllActivities
    if (roundedGross < total) {
      return {
        customError: 'Gross must equal Net + Patient Share (Gross = Net + Patient Share)',
      };
    }
    return null;
  };

  netAmountValidator(net: number): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const approved = Number(formGroup.get('approvedAmount')?.value || 0);
      const rejected = Number(formGroup.get('rejectedAmount')?.value || 0);
      const total = Number((approved + rejected).toFixed(3));
      if (net === null || net === undefined || isNaN(net)) {
        return null;
      }
      if (total > net) {
        return {
          customError:
            'Approved Amount And Rejected Amount Must Equal Net Amount (Net = Approved Amount + Rejected Amount)',
        };
      }

      return null;
    };
  }
  reasonValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const rejected = Number(formGroup.get('rejectedAmount')?.value || 0);

      if (formGroup.get('activityRejectionReasons')?.value.length == 0 && rejected > 0) {
        return {
          customError: 'Please Add Rejection Reasons',
        };
      }
      return null;
    };
  }

  minDateValidator(minDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inputDate = new Date(control.value);
      if (!control.value) return null;
      if (inputDate < minDate) {
        return {
          customError: 'Date must be on or after January 1, 2018',
        };
      }
      return null;
    };
  }

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private codingClaimEditService: CodingClaimEditService
  ) {}
  public initializeForm(claimData: ClaimDto): void {
    const startDate = new Date(claimData?.visit_Start_Date || new Date());
    const date = new Date(claimData?.visit_Start_Date);
    this.codingClaimEditService.setVisitStartDate(date);
    this.claimForm = this.fb.group(
      {
        id: new FormControl({ value: claimData?.id || null, disabled: false }),
        concurrencyStamp: new FormControl({
          value: claimData?.concurrencyStamp || '',
          disabled: true,
        }),
        number: new FormControl(claimData?.number || ''),
        serial: new FormControl(
          { value: claimData?.serial || 0, disabled: true },
          Validators.required
        ), // If needed
        patientNid: new FormControl(claimData?.patient_nid || '', [
          Validators.required,
          Validators.minLength(14),
        ]),
        originalPatientNid: new FormControl({
          value: claimData?.patient_nid_orig || '',
          disabled: true,
        }),
        visitStartDate: new FormControl(claimData?.visit_Start_Date || '', [
          Validators.required,
          this.minDateValidator(new Date('2018-01-01')),
        ]),
        visitEndDate: new FormControl(
          {
            value: claimData?.visit_End_Date || '',
            disabled: claimData?.serviceTypeId !== 2,
          },
          claimData?.serviceTypeId == 2
            ? [Validators.required, this.minDateValidator(new Date('2018-01-01'))]
            : [this.minDateValidator(new Date('2018-01-01'))]
        ),
        batch_id: new FormControl(
          { value: claimData?.batch_id || 0, disabled: true },
          Validators.required
        ),
        entered_Net: new FormControl({ value: claimData?.entered_Net || 0, disabled: true }),
        paymentStatus_id: new FormControl({
          value: claimData?.paymentStatus_id || 0,
          disabled: true,
        }),
        status_id: new FormControl(
          { value: claimData?.status_id || 0, disabled: true },
          Validators.required
        ),
        total_Gross: new FormControl({ value: claimData?.total_Gross || 0, disabled: true }),
        total_Net: new FormControl({ value: claimData?.total_Net || 0, disabled: true }),
        total_patient_share: new FormControl({
          value: claimData?.total_patient_share || 0,
          disabled: true,
        }),
        medicalDiagnosis: this.fb.array([], [this.atLeastOnePrincipalDiagnosisValidator()]), // enabled by default
        medicalActivities: this.fb.array([], [this.atLeastOneActivityValidator()]), // enabled by default
        claimsTags: new FormControl(claimData?.claimsTags || []), // enabled by default
        createdBy_Id: new FormControl({
          value: claimData?.createdBy_Id || '',
          disabled: true,
        }),
        firstUpdate_timestamp: new FormControl({
          value: claimData?.firstUpdate_timestamp || '',
          disabled: true,
        }),
        firstModifiedBy_Id: new FormControl({
          value: claimData?.firstModifiedBy_Id || '',
          disabled: true,
        }),
        assignedTo_Id: new FormControl({
          value: claimData?.assignedTo_Id || '',
          disabled: true,
        }),
        modifiedBy_Id: new FormControl({
          value: claimData?.modifiedBy_Id || '',
          disabled: true,
        }),
        patient_nid_orig: new FormControl({
          value: claimData?.patient_nid_orig || '',
          disabled: true,
        }),
        handle_id: new FormControl({ value: claimData?.handle_id || '', disabled: true }),
        nid_Valid_Flag: new FormControl({
          value: claimData?.nid_Valid_Flag || '',
          disabled: true,
        }),
        audit_Rej_Amt: new FormControl({
          value: claimData?.audit_Rej_Amt || 0,
          disabled: true,
        }),
        audit_Appr_Amt: new FormControl({
          value: claimData?.audit_Appr_Amt || 0,
          disabled: true,
        }),
        encounterStartTypeName: new FormControl({
          value: claimData?.encounterStartTypeName || 'Elective',
          disabled: true,
        }),
        encounterEndTypeName: new FormControl({
          value: claimData?.encounterEndTypeName || 'Discharged with approval',
          disabled: true,
        }),
        mod_flag: new FormControl({ value: claimData?.mod_flag || '', disabled: true }),

        physicianId: new FormControl(
          {
            value: claimData?.physicianId == 0 ? 1 : claimData?.physicianId || 1,
            disabled: true,
          },
          Validators.required
        ),
        encounterId: new FormControl(
          {
            value: claimData?.['encounterId'] || claimData?.number || '',
            disabled: false,
          },
          Validators.required
        ),
        start_time: new FormControl(
          { value: claimData?.visit_Start_Date || '', disabled: true },
          Validators.required
        ),
        end_time: new FormControl(
          { value: claimData?.visit_End_Date || '', disabled: true },
          Validators.required
        ),
        isDraft: new FormControl({ value: false, disabled: false }, Validators.required),
      },
      {
        validators: [
          claimData?.serviceTypeId == 2
            ? dateCompareValidator('visitStartDate', 'visitEndDate', 'Start Date', 'End Date')
            : null,
        ].filter(Boolean), // for filter null or undefined values
      }
    );
  }
  onStartDateChange() {
    this.claimForm.get('visitStartDate').valueChanges.subscribe(res => {
      this.codingClaimEditService.setVisitStartDate(res);
    });
  }
  // Medical Diagnosis
  addMedicalDiagnosis(
    hasPrincipal: boolean,
    item?: DiagnosisDto,
    isTouched: boolean = false
  ): void {
    // Always set the diagnosis type:
    // If no active diagnosis yet → Principal, otherwise → Secondary
    const activeCount = this.medicalDiagnosis.controls.filter(
      c => !c.get('isDeleted')?.value
    ).length;
    const diagnosisType = activeCount === 0 ? 'Principal' : 'Secondary';
    const diagnosisGroup = this.fb.group({
      diagnosisType: new FormControl(item?.diagnosisType || diagnosisType, Validators.required),
      diagnosisId: new FormControl(
        item?.diagnosis_id || item?.['diagnosisId'] || null,
        Validators.required
      ),
      diagnosisName: new FormControl({ value: item?.diagnosisName || '', disabled: false }),
      isDeleted: new FormControl(item?.isDeleted || false),
      id: new FormControl(item?.id ?? null),
      isDirty: new FormControl(item?.['isDirty'] || isTouched),
    });
    this.medicalDiagnosis.push(diagnosisGroup);
    this.medicalDiagnosis.updateValueAndValidity({ emitEvent: true });
  }
  removeMedicalDiagnosis(index: number): void {
    const control = this.medicalDiagnosis.at(index);
    if (!control) return;
    const diagnosisId = control.get('diagnosisId')?.value;
    // Soft delete (hide but keep in array)
    if (diagnosisId === null || diagnosisId === undefined) {
      this.medicalDiagnosis.removeAt(index);
    } else {
      // Soft delete (hide but keep in array)
      control.get('isDeleted')?.setValue(true);
      control.markAsDirty();
      control.updateValueAndValidity({ emitEvent: false });
    }
    // Trigger revalidation
    this.medicalDiagnosis.updateValueAndValidity({ emitEvent: true });
    // If all are deleted → trigger the "noPrincipalDiagnosis" error
    const hasActive = this.medicalDiagnosis.controls.some(c => !c.get('isDeleted')?.value);
    if (!hasActive) {
      this.medicalDiagnosis.setErrors({ noPrincipalDiagnosis: true });
    } else {
      this.medicalDiagnosis.setErrors(null);
    }
  }
  updateMedicalDiagnosis(index: number, value: any): void {
    const control = this.medicalDiagnosis.at(index);
    if (!control) return;
    control.patchValue({
      diagnosisName: value?.name,
    });
    control.updateValueAndValidity({ emitEvent: false });
  }
  // Medical Activity
  addMedicalActivity(
    item: any = null,
    visitStartDateMin: any = null,
    activateAudit: boolean = false,
    id: number = 2,
    isTouched: boolean = false
  ) {
    const activityGroup = this.fb.group(
      {
        id: new FormControl({ value: item?.id || 0, disabled: false }),
        activityTypeId: new FormControl(
          { value: item?.activity_type_id || item?.activityTypeId || id || null, disabled: false },
          Validators.required
        ),
        startTime: new FormControl(item?.start_Time || item?.startTime || visitStartDateMin || '', [
          Validators.required,
          this.minDateValidator(new Date('2018-01-01')),
        ]),
        subTypeId: new FormControl(
          item?.sub_type_id || item?.subTypeId || null,
          Validators.required
        ),
        quantity: new FormControl(item?.quantity, [Validators.min(0), Validators.required]),
        gross: new FormControl(item?.gross, [Validators.min(0), Validators.required]),
        net: new FormControl(this.parseNetValue(item?.net), [
          Validators.min(0),
          Validators.required,
        ]),
        patientShare: new FormControl(item?.patient_share ?? item?.patientShare, [
          Validators.min(0),
          Validators.required,
        ]),
        subActivitiesName: new FormControl(item?.subActivitiesName || ''),
        acivityPrice: new FormControl({ value: item?.price || item?.acivityPrice, disabled: true }),
        price: new FormControl({ value: item?.price || item?.acivityPrice, disabled: true }),
        activityTags: new FormControl(item?.activityTags || []),
        isDeleted: [item?.isDeleted || false],
        isDirty: new FormControl(item?.isDirty || isTouched),

        // for Audit
        approvedAmount: new FormControl({
          value: item?.approvedAmount,
          disabled: activateAudit,
        }),
        rejectedAmount: new FormControl({
          value: item?.rejectedAmount,
          disabled: activateAudit,
        }),
        activityRejectionReasons: new FormControl({
          value: item?.activityRejectionReasons,
          disabled: activateAudit,
        }),
        auditActivityTags: new FormControl({
          value: item?.auditActivityTags,
          disabled: activateAudit,
        }),
      },
      { validators: [this.activityPriceValidator] }
    );
    // if (item) {
    //   activityGroup.get('startTime').setValidators(
    //     dateCompareValidator(
    //       () => new Date(this.claimForm.get('visitStartDate')?.value),
    //       () => new Date(activityGroup.get('startTime')?.value),
    //       'Claim Start Time',
    //       'Activity Start Time'
    //     )
    //   );
    //   this.claimForm
    //     .get('visitStartDate')
    //     .valueChanges.pipe(takeUntil(this.destroy$))
    //     .subscribe(v => {
    //       activityGroup.get('startTime')?.updateValueAndValidity();
    //     });
    // } else {
    //   const visitdate = new Date(visitStartDateMin);
    //   activityGroup
    //     .get('startTime')
    //     .setValidators(this.buildStartTimeValidator(visitdate, activityGroup.get('startTime')));
    // }
    this.medicalActivities.push(activityGroup);
  }
  removeMedicalActivity(index: number): void {
    const control = this.medicalActivities.at(index);
    const activityId = control.get('id')?.value;
    if (!control) return;
    // Mark deleted
    if (activityId === 0) {
      this.medicalDiagnosis.removeAt(index);
    } else {
      this.medicalActivities.at(index).patchValue({ isDeleted: true });

      this.medicalActivities.at(index);
      this.medicalActivities.at(index).clearValidators(); // remove sync validators
      this.medicalActivities.at(index);
      this.medicalActivities.at(index).clearAsyncValidators(); // remove async validators if any
      this.medicalActivities.at(index);
      this.medicalActivities.at(index).setErrors(null); // clear existing error state
      this.medicalActivities.at(index);
      this.medicalActivities.at(index).updateValueAndValidity(); // re-run validation
      this.medicalActivities.at(index);
      this.medicalActivities.at(index).disable();
      // control.get('isDeleted')?.setValue(true);
      this.medicalActivities.at(index);
      this.medicalActivities.at(index).markAsDirty();
      // Clear validators so form remains valid
      // Object.keys((control as FormGroup).controls).forEach(key => {
      //   const child = (control as FormGroup).get(key);
      //   child?.clearValidators();
      //   child?.updateValueAndValidity({ emitEvent: false });
      // });
      // this.medicalActivities.updateValueAndValidity({ emitEvent: false });
    }
  }
  setActivityError(index: number, message: string) {
    const control = this.medicalActivities.at(index) as FormGroup;
    if (!control) return;
    // Make sure it's enabled
    if (control.disabled) control.enable({ emitEvent: false });
    // Preserve existing errors and mark it as manual
    const currentErrors = control.errors || {};
    const newErrors = { ...currentErrors, customError: message, _manualError: true };
    // Force Angular to keep this error even after validation
    (control as any)._pendingDirty = true;
    control.setErrors(newErrors, { emitEvent: true });
    // Explicitly mark touched/dirty so UI knows
    control.markAsTouched({ onlySelf: true });
    control.markAsDirty({ onlySelf: true });
    // Mark parent invalid too
    this.medicalActivities.setErrors({ hasInvalidActivity: true });
    this.medicalActivities.updateValueAndValidity({ emitEvent: true });
  }
  clearActivityError(index: number) {
    const control = this.medicalActivities.at(index) as FormGroup;
    if (!control) return;
    const currentErrors = { ...(control.errors || {}) };
    delete currentErrors['customError'];
    delete currentErrors['_manualError'];
    const hasOtherErrors = Object.keys(currentErrors).length > 0;
    control.setErrors(hasOtherErrors ? currentErrors : null, { emitEvent: true });
    control.updateValueAndValidity({ emitEvent: true });
    // Recalculate array-level validity
    const stillInvalid = this.medicalActivities.controls.some(c => c.errors);
    this.medicalActivities.setErrors(stillInvalid ? { hasInvalidActivity: true } : null);
  }
  onMedicalActivityChanges() {
    // this.medicalActivities.controls.forEach((activityGroup: AbstractControl) => {
    //   const patientShare = Number(activityGroup.get('patientShare').value);
    //   const net = Number(activityGroup.get('net').value);
    //   const gross = Number(activityGroup.get('gross').value);
    //   const total = +(net + patientShare).toFixed(3);
    //   // const startTimeControl = activityGroup.get('startTime');
    //   if (gross > total) {
    //     activityGroup.setErrors({
    //       customError: 'Gross must equal Net + Patient Share (Gross = Net + Patient Share).',
    //     });
    //     activityGroup.updateValueAndValidity();
    //   }
    // });
  }

  //  validations
  // updateStartTimeValidation(visitStartDateMin) {
  //   const visitDate = new Date(visitStartDateMin());
  //   this.medicalActivities?.controls.forEach((activityGroup: FormGroup) => {
  //     const startTimeControl = activityGroup.get('startTime');
  //     if (startTimeControl) {
  //       startTimeControl.setValidators(this.buildStartTimeValidator(visitDate, startTimeControl));
  //       startTimeControl.updateValueAndValidity();
  //     }
  //   });
  // }
  // buildStartTimeValidator(visitDate: Date, control: AbstractControl): ValidatorFn[] {
  //   return [
  //     Validators.required,
  //     dateCompareValidator(
  //       visitDate,
  //       () => new Date(control.value),
  //       'Claim Start Time',
  //       'Activity Start Time'
  //     ),
  //   ];
  // }
  updateMedicalActivity(activity, value) {
    // const control = this.medicalActivities.at(index);
    activity.get('subActivitiesName')?.enable();
    activity.get('acivityPrice')?.enable();
    activity.get('price')?.enable();

    activity.patchValue({
      subActivitiesName: value?.name,
      acivityPrice: value?.price,
      price: value?.price,
    });
  }

  auditForm: FormArray = this.fb.array([]);
  initializeAuditFormFromActivities(activities: FormArray) {
    this.auditForm.clear();
    activities.controls.forEach((activity: AbstractControl) => {
      const auditGroup = this.fb.group(
        {
          activityTypeId: new FormControl(activity.get('activityTypeId')?.value),
          net: new FormControl(this.parseNetValue(activity.get('net')?.value)),
          activityId: new FormControl(Number(activity.get('id')?.value)),
          approvedAmount: new FormControl(activity.get('approvedAmount')?.value || 0),
          rejectedAmount: new FormControl(activity.get('rejectedAmount')?.value || 0),
          activityRejectionReasons: new FormControl(
            activity.get('activityRejectionReasons')?.value || []
          ),
          activityTags: new FormControl(activity.get('auditActivityTags')?.value || []),
        },
        { validator: [this.netAmountValidator(activity.get('net')?.value), this.reasonValidator()] }
      );
      this.auditForm.push(auditGroup);
    });
  }
  getAuditForm(): FormArray {
    return this.auditForm;
  }
  calculateAuditTotals() {
    let totalApproved = 0;
    let totalRejected = 0;
    this.auditForm.controls.forEach(control => {
      totalApproved += Number(control.get('approvedAmount')?.value || 0);
      totalRejected += Number(control.get('rejectedAmount')?.value || 0);
    });
    return { totalApproved, totalRejected };
  }

  private selectedActivityItemsSignal = signal<any[]>([]);

  // Setter: Add item to the signal
  setActivityItem(items: any, reset: boolean = false) {
    const current = this.selectedActivityItemsSignal();
    reset
      ? this.selectedActivityItemsSignal.set(items)
      : this.selectedActivityItemsSignal.set([...current, items]);
  }

  // Getter: Read the signal
  getActivityItems() {
    return this.selectedActivityItemsSignal();
  }
  private selectedDiagnousisItemsSignal = signal<any[]>([]);

  // Setter: Add item to the signal
  setDiagnousisItem(items: any, reset: boolean = false) {
    const current = this.selectedDiagnousisItemsSignal();
    reset
      ? this.selectedDiagnousisItemsSignal.set(items)
      : this.selectedDiagnousisItemsSignal.set([...current, items]);
  }

  // Getter: Read the signal
  getDiagnousisItems() {
    return this.selectedDiagnousisItemsSignal();
  }

  // helpers
  getForm() {
    return this.claimForm;
  }
  getFormValue() {
    return this.claimForm.getRawValue();
  }
  setFormValue(form: FormGroup, data: ClaimDto) {
    form.patchValue({ data });
  }
  getMedicalDiagnosis(): FormArray {
    return this.medicalDiagnosis;
  }
  getMdicalActivities(): FormArray {
    return this.medicalActivities;
  }
  get medicalDiagnosis(): FormArray {
    return this.claimForm.get('medicalDiagnosis') as FormArray;
  }
  get medicalActivities(): FormArray {
    return this.claimForm.get('medicalActivities') as FormArray;
  }
  private atLeastOnePrincipalDiagnosisValidator(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const arr = (formArray as FormArray).controls.filter(c => !c.get('isDeleted')?.value);
      if (arr.length === 0) return { noPrincipalDiagnosis: true };
      const hasPrincipal = arr.some(c => c.get('diagnosisType')?.value === 'Principal');
      return hasPrincipal ? null : { noPrincipalDiagnosis: true };
    };
  }
  private atLeastOneActivityValidator(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const arr = (formArray as FormArray).controls.filter(c => !c.get('isDeleted')?.value);
      return arr.length > 0 ? null : { noActivity: true };
    };
  }

  parseNetValue(value: any): number | null {
    return value !== null && value !== undefined ? Number(value) : null;
  }
}
