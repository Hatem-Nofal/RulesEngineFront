import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkFlowDto } from '@proxy/ehealth-claims/domains/rules';
import { WorkFlowService } from '@proxy/ehealth-claims/domains/work-flow';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';
@Component({
  selector: 'app-workflowform',
  standalone: false,
  templateUrl: './workflowform.html',
  styleUrls: ['./workflowform.scss'],
})
export class Workflowform {
  form!: FormGroup;
  isEditMode = false;
  workflowId: number | null = null;
  isViewMode = false;
  loading = false;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workflowService: WorkFlowService,
    private customConfirmationService: CustomConfirmationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.isViewMode = params['view'] === 'true';
    });

    this.workflowId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.workflowId;

this.form = this.fb.group({
  id: [0],
  name: ['', [Validators.required, Validators.minLength(3)]],
  isDiagnose: [false],
  isMedics: [false],
  isPatientAge: [false],
  isPatientGender: [false],
  isDrugToDrug: [false],
  isMedicsToMedics: [false],
  isHaveQuantity: [false],
  isDrugToDiagnosis: [false],
  isPatientAgeActivities: [false],
  isPatientAgeDiagnosis: [false],
  isPatientGenderDiagnosis: [false],
  isPatientGenderActivities: [false],
  isDrugOverDose: [false],
  isActivityWithSpecificActivity: [false],
  isDrugWithSpecificDiagnosis: [false],
  isDiagnosisWithSpecificDiagnosis: [false],
  isActivityQuantityByAgeRange: [false],
  //isDailyOverDose: [false],
 });

    if (this.isEditMode) {
      this.workflowService.getFilteredWorkFlowByIdById(this.workflowId).subscribe({
        next: res => {
          // If your service returns { data: { ...workflow } }, use res.data instead of res
          const w = res; // or const w = res.data;

          // Map API fields to form fields *exactly*:
      const mapped = {
  id: w?.id ?? 0,
  name: w?.name ?? '',
  isDiagnose: !!w?.isDiagnose,
  isMedics: !!w?.isMedics,
  isPatientAge: !!w?.isPatientAge,
  isPatientGender: !!w?.isPatientGender,
  isDrugToDrug: !!w?.isDrugToDrug,
  isMedicsToMedics: !!w?.isMedicsToMedics,
  isHaveQuantity: !!w?.isHaveQuantity,
  isDrugToDiagnosis: !!w?.isDrugToDiagnosis,

  isPatientAgeActivities: !!w?.isPatientAgeActivities,
  isPatientAgeDiagnosis: !!w?.isPatientAgeDiagnosis,
  isPatientGenderDiagnosis: !!w?.isPatientGenderDiagnosis,
  isPatientGenderActivities: !!w?.isPatientGenderActivities,
  isDrugOverDose: !!w?.isDrugOverDose,
  isActivityWithSpecificActivity: !!w?.isActivityWithSpecificActivity,
  isDrugWithSpecificDiagnosis: !!w?.isDrugWithSpecificDiagnosis,
  isDiagnosisWithSpecificDiagnosis: !!w?.isDiagnosisWithSpecificDiagnosis,
  isActivityQuantityByAgeRange: !!w?.isActivityQuantityByAgeRange,
 };

          // Patch with the mapped shape
          this.form.patchValue(mapped);

          // this.form.patchValue(workflow);
        },
        error: err => console.error('Failed to load workflow', err),
      });

      if (this.isViewMode) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    } else {
      this.form.enable();
    }
  }

  save(): void {
    this.loading = true;
    try {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        if (this.form.errors?.['atLeastOne']) {
          this.customConfirmationService.error(
            'Please select at least one option.',
            'Validation Error',
            5000
          );
        } else {
          this.customConfirmationService.error(
            'Please fix validation errors before saving.',
            'Validation Error',
            5000
          );
        }
        return;
      }

      const workflow: WorkFlowDto = this.form.value;

      if (this.isEditMode) {
        this.workflowService.update(workflow).subscribe({
          next: res => {
            if (res.isSuccess) {
              this.customConfirmationService.success(res.message, 'Success', 5000);
            } else {
              this.customConfirmationService.error(res.message, 'Error', 5000);
            }
          },
          error: () => {
            this.customConfirmationService.error('Unexpected server error', 'Error', 5000);
          },
        });
      } else {
        if (workflow.isHaveQuantity == true) {
          workflow.isMedics = true;
        } else {
          workflow.isMedics = false;
        }
        this.workflowService.create(workflow).subscribe({
          next: res => {
            if (res.isSuccess) {
              this.customConfirmationService.success(res.message, 'Success', 5000);
              this.router.navigate(['/workflows']);
            } else {
              this.loading = false;
              this.customConfirmationService.error(res.message, 'Error', 5000);
            }
          },
          error: () => {
            this.loading = false;
            this.customConfirmationService.error('Unexpected server error', 'Error', 5000);
          },
        });
      }
    } finally {
      this.loading = false;
    }
  }
  private OneSelectedValidator(control: AbstractControl): ValidationErrors | null {
    const group = control.value;
    const flags = [
      group.isDiagnose,
      group.isMedics,
      group.isPatientAge,
      group.isPatientGender,
      group.isDrugToDrug,
      group.isMedicsToMedics,
      group.isDrugToDiagnosis,
    ];

    return flags.some(flag => flag === true) ? null : { atLeastOne: true };
  }
}
