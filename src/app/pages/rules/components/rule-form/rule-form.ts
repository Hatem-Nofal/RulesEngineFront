import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicationLookupDto } from '@proxy/ehealth-claims/domains/claims';
import { RuleService } from '@proxy/ehealth-claims/domains/rule';
import { ActivityTypeLookUpDto, MedicationDto, RuleDto, DiagnosisDto, WorkflowDropDownDto } from '@proxy/ehealth-claims/domains/rules/models';
import { WorkFlowService } from '@proxy/ehealth-claims/domains/work-flow';
import { ToastrService } from 'ngx-toastr';
import { MultiSelect } from 'primeng/multiselect';
import { firstValueFrom, Subject } from 'rxjs';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';
interface WorkFlowDto {
  id: number;
  workflowName: string;
  isPatientAge?: boolean;
  isPatientGender?: boolean;
  isDiagnose?: boolean;
  isMedics?: boolean;
  isDrugToDrug?: boolean;
  isMedicsToMedics?: boolean;
  isHaveQuantity?: boolean;
  isDrugToDiagnosis?: boolean;
  isDrugWithSpecificDiagnosis?: boolean;
  isActivityWithSpecificActivity?: boolean;
  isDiagnosisWithSpecificDiagnosis?: boolean;
  isDailyOverDose?: boolean;
  isPatientAgeActivities?: boolean;
  isPatientAgeDiagnosis?: boolean;
  isPatientGenderDiagnosis?: boolean;
  isPatientGenderActivities?: boolean;
  isDrugOverDose?: boolean;
  isActivityQuantityByAgeRange?: boolean;
}

@Component({
  selector: 'app-rule-form',
  standalone: false,
  templateUrl: './rule-form.html',
  styleUrls: ['./rule-form.scss'],
})
export class RuleFormComponent implements OnInit {
  loading = false;
  workflows: WorkFlowDto[] = [];
  selectedWorkflow: string = '';
  activities: ActivityTypeLookUpDto[] = [];
  activities2: ActivityTypeLookUpDto[] = [];
  currentWorkflowFlags: WorkFlowDto | null = null;
  quantity?: number;
  diagnosisOptions: DiagnosisDto[] = [];
  medicationOptions: MedicationDto[] = [];

  diagnosisOptions2: DiagnosisDto[] = [];
  medicationOptions2: MedicationDto[] = [];
  private searchDiagnoses$ = new Subject<string>();
  ageRangeMedicationOptions: MedicationDto[] = [];
  selectedDiagnoses: DiagnosisDto[] = [];
  selectedDiagnoses2: DiagnosisDto[] = [];
  selectedMedications: MedicationDto[] = [];
  selectedMedications2: MedicationDto[] = [];
  selectedActvities: ActivityTypeLookUpDto[] = [];
  selectedActvities2: ActivityTypeLookUpDto[] = [];
  ageOperator: string = '';
  quantityOperator: string = '';
  diagnosisSearch = '';
  medicationSearch = '';
  diagnosisSearch2 = '';
  medicationSearch2 = '';
  medicSearch = '';
  selectedActivity: number = 0;
  selectedActivity2: number = 0;
  selectedMedicationWithQuantity: any = null;
  selecteddiagnosisWithQuantity: any = null;
  diagnosisQuantity: number | null = null;
  patientAge?: number;
  patientGender?: string;
  filteredDiagnosisOptions: any[] = [];
  filteredMedicationOptions: any[] = [];
  rule: RuleDto = {
    id: 0,
    ruleName: '',
    workflowName: '',
    workFlowId: 0,
    enabled: true,
    successEvent: '',
    errorMessage: '',
    errorType: '',
    ruleExpressionType: '',
    diagnoses: [],
    medications: [],
    diagnosisIds: [],
    medicationIds: [],
    procedures: [],
    patientAge: undefined,
    patientGender: '',
    expression: '',
    secondDiagnosisIds: [],
    secondMedicationIds: [],
    ageOperator: undefined,
    quantityOperator: '',
    isHaveQuantity: false,
    quantity: 0,
    isDrugToDiagnosis: false,
    isDrugWithSpecificDiagnosis: false,
    isActivityWithSpecificActivity: false,
    isDiagnosisWithSpecificDiagnosis: false,
    isDailyOverDose: false,
    haveGender: false,
    haveAge: false,
    diagnosisCounts:{} as Record<string, number>,
    medicationCounts:{} as Record<string, number>,
    validationErrors: [],
    validCodes:[]
  };

  ruleForm: FormGroup;
  formSubmitted = false;

  submitted = false;
  // ruleForm: FormGroup;
  errorTypes = [
    { name: 'Error', code: 'error' },
    { name: 'Warning', code: 'warning' },
  ];
  constructor(
    private ruleService: RuleService,
    private route: ActivatedRoute,
    private router: Router,
    private workflowservice: WorkFlowService,
    private customConfirmationService: CustomConfirmationService,
    private fb: FormBuilder,
  ) {
    this.ruleForm = this.fb.group({
      // top fields
      workflowName: [null, Validators.required],
      ruleName: [null, Validators.required],
      enabled: [true],
      errorMessage: [null],
      errorType: [null, Validators.required], // 'Error' | 'Warning'

      // primary activity
      
      selectedActivity: [null, this.showPrimaryActivityCard() ? Validators.required : null],
      selectedMedications: [[], this.showPrimaryActivityCard() ? Validators.required : null],

      // secondary activity
      selectedActivity2: [null, this.showSecondActivityCard() ? Validators.required : null],
      selectedMedications2: [[], this.showSecondActivityCard() ? Validators.required : null],

      // diagnoses
      selectedDiagnoses: [[], this.showSelectedDiagnoses() ? Validators.required : null],
      selectedDiagnoses2: [
        [],
        this.show('isDrugToDrug', 'isDiagnosisWithSpecificDiagnosis') ? Validators.required : null,
      ],
      selecteddiagnosisWithQuantity: [
        null,
        this.showSelecteddiagnosisWithQuantity() ? Validators.required : null,
      ], // single diagnosis id for quantity mode

      // age & gender
      ageOperator: [
        null,
        this.show('isPatientAgeActivities', 'isPatientAgeDiagnosis', 'isDrugOverDose')
          ? Validators.required
          : null,
      ],
      patientAge: [
        null,
        this.show('isPatientAgeActivities', 'isPatientAgeDiagnosis', 'isDrugOverDose')
          ? Validators.required
          : null,
      ],
      patientGender: [
        '',
        this.show('isPatientGenderDiagnosis', 'isPatientGenderActivities')
          ? Validators.required
          : null,
      ],

      // quantity
      quantityOperator: [
        '==',
        this.show('isHaveQuantity', 'isDrugOverDose') ? Validators.required : null,
      ],
      quantity: [null, this.show('isHaveQuantity', 'isDrugOverDose') ? Validators.required : null], // min(1) applied dynamically

      selectedMedicationWithQuantity: [null],
        // dedicated to Activity Quantity by Patient Age Range
  ageRangeSelectedActivity: [null, this.showActivityQuantityByAgeRangeCard() ? Validators.required : null],
  ageRangeSelectedMedications: [[], this.showActivityQuantityByAgeRangeCard() ? Validators.required : null],
  minPatientAge: [null, this.showActivityQuantityByAgeRangeCard() ? Validators.required : null],
  maxPatientAge: [null, this.showActivityQuantityByAgeRangeCard() ? Validators.required : null],
  ageRangeQuantityOperator: ['==', this.showActivityQuantityByAgeRangeCard() ? Validators.required : null],
  ageRangeQuantity: [null, this.showActivityQuantityByAgeRangeCard() ? Validators.required : null],
      
    });
  }
showActivityQuantityByAgeRangeCard(): boolean {
  const f = this.currentWorkflowFlags;
  if (!f) return false;
  return !!f.isActivityQuantityByAgeRange;
}



async ngOnInit() {
  this.loading = true;
  try {
    await Promise.all([
      this.WorkFlowsDropDown(),
      this.ActivityTypesDropDpwn(),
      this.ActivityTypesDropDpwn2(),
    ]);

    // subscribe to control changes to load dependent lists
    this.ruleForm.get('selectedActivity')!.valueChanges.subscribe((id: number | null) => {
      this.loadMedications(id ?? 0);
    });
    this.ruleForm.get('selectedActivity2')!.valueChanges.subscribe((id: number | null) => {
      this.loadMedications2(id ?? 0);
    });
    this.ruleForm.get('workflowName')!.valueChanges.subscribe((name: string | null) => {
      const wf = this.workflows.find(w => w.workflowName === name);
      this.rule.workflowName = name ?? '';
      this.rule.workFlowId = wf?.id ?? 0;
      if (wf?.id) {
        this.onWorkflowSelectedById(wf.id);
      } else {
        this.currentWorkflowFlags = null;
        this.applyDynamicValidators();
      }
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      const rule = await firstValueFrom(this.ruleService.get(id));
      this.rule = rule as RuleDto;

      const [diag1, diag2, meds1, meds2] = await Promise.all([
        firstValueFrom(
          this.ruleService.diagnosesDropDownByFilterDto({
            code: '',
            selectedIds: this.rule?.diagnosisIds,
          }),
        ),
        firstValueFrom(
          this.ruleService.diagnosesDropDownByFilterDto({
            code: '',
            selectedIds: this.rule?.secondDiagnosisIds,
          }),
        ),
        firstValueFrom(
          this.ruleService.setDropDownValuesByFilter({
            activitytypeId: 0,
            code: '',
            selectedIds: this.rule?.medicationIds,
          }),
        ),
        firstValueFrom(
          this.ruleService.setDropDownValuesByFilter({
            activitytypeId: 0,
            code: '',
            selectedIds: this.rule?.secondMedicationIds,
          }),
        ),
      ]);

      this.diagnosisOptions = diag1;
      this.diagnosisOptions2 = diag2;
      this.medicationOptions = meds1;
      this.medicationOptions2 = meds2;

      this.ruleForm.patchValue({
        workflowName: this.rule?.workflowName || null,
        ruleName: this.rule?.ruleName || null,
        enabled: this.rule?.enabled,
        errorMessage: this.rule?.errorMessage || null,
        errorType: this.rule?.errorType.toLowerCase() || null,

        selectedActivity: this.rule?.activityTypeId ?? null,
        selectedActivity2: this.rule?.secondaryActivityTypeId ?? null,

        selectedDiagnoses: this.rule?.diagnosisIds ?? [],
        selectedDiagnoses2: this.rule?.secondDiagnosisIds ?? [],
        selectedMedications: this.rule?.medicationIds ?? [],
        selectedMedications2: this.rule?.secondMedicationIds ?? [],

        ageOperator: this.rule?.ageOperator ?? null,
        patientAge: this.rule?.patientAge ?? null,
        patientGender: this.rule?.patientGender ?? '',

        quantityOperator: this.rule?.quantityOperator ?? null,
        quantity: this.rule?.quantity ?? null,

        selecteddiagnosisWithQuantity: this.rule?.isHaveQuantity
          ? (this.rule?.diagnosisIds?.[0] ?? null)
          : null,
        selectedMedicationWithQuantity: this.rule?.isHaveQuantity
          ? (this.rule?.medicationIds?.[0] ?? null)
          : null,
        ageRangeSelectedActivity: this.rule?.activityTypeId ?? null,
        ageRangeSelectedMedications: this.rule?.medicationIds ?? [],
        minPatientAge: (this.rule as any)?.minPatientAge ?? null,
        maxPatientAge: (this.rule as any)?.maxPatientAge ?? null,
        ageRangeQuantityOperator: this.rule?.quantityOperator ?? '==',
        ageRangeQuantity: this.rule?.quantity ?? null,
      });

      // derive flags and validators
      if (this.rule?.workFlowId && this.rule?.workFlowId > 0) {
        this.onWorkflowSelectedById(this.rule?.workFlowId);
      } else if (this.rule?.workflowName) {
        const wf = this.workflows.find(w => w.workflowName === this.rule?.workflowName);
        if (wf) this.onWorkflowSelectedById(wf.id);
      }

      this.extractAgeAndGenderFromExpression(rule?.expression);

      const skipRegexExtraction =
        this.rule?.isActivityQuantityByAgeRange ||
        this.rule?.workflowName === 'Drug Maximum Quantity' ||
        this.rule?.workflowName === 'Activity Limit';

      if (!skipRegexExtraction) {
        this.extractQuantityAndOperatorFromExpression(rule?.expression);
      } else {
        this.quantityOperator = this.rule.quantityOperator;
        this.quantity = this.rule.quantity;
        this.ruleForm.patchValue(
          {
            quantityOperator: this.rule.quantityOperator ?? '==',
            quantity: this.rule.quantity ?? null,
          },
          { emitEvent: false },
        );
      }
    } else {
      await Promise.all([this.loadDiagnoses(), this.loadDiagnoses2()]);
    }
  } finally {
    this.loading = false;
  }
}
get isDrugMaxQtyOrActivityLimit(): boolean {
  const name = this.currentWorkflowFlags?.workflowName ?? this.rule?.workflowName;
  return name === 'Drug Maximum Quantity' || name === 'Activity Limit';
}
  /** Apply/clear validators based on currentWorkflowFlags */
private applyDynamicValidators() {
  const form = this.ruleForm;
  const flags = this.currentWorkflowFlags;

  const setReq = (ctrlName: string, enabled: boolean, extra: ValidatorFn[] = []) => {
    const control = form.get(ctrlName);
    if (!control) return;
    if (enabled) {
      control.setValidators([Validators.required, ...extra]);
    } else {
      control.clearValidators();
    }
    control.updateValueAndValidity({ emitEvent: false });
  };

  const isAgeRangeRule = !!flags?.isActivityQuantityByAgeRange;

  // Required groups based on flags
  setReq('selectedDiagnoses', !!(flags?.isDiagnose && !flags?.isHaveQuantity));
  setReq('selectedMedications', !!((flags?.isMedics && !flags?.isHaveQuantity) || isAgeRangeRule));
setReq(
  'patientAge',
  !!(flags?.isPatientAgeActivities || flags?.isPatientAgeDiagnosis || flags?.isDrugOverDose) && !this.isDrugMaxQtyOrActivityLimit,
);
setReq(
  'ageOperator',
  !!(flags?.isPatientAgeActivities || flags?.isPatientAgeDiagnosis || flags?.isDrugOverDose) && !this.isDrugMaxQtyOrActivityLimit,
);
  setReq(
    'patientGender',
    !!(flags?.isPatientGenderActivities || flags?.isPatientGenderDiagnosis),
  );
  setReq('quantityOperator', !!(flags?.isHaveQuantity || flags?.isDrugOverDose || isAgeRangeRule));
  setReq('quantity', !!(flags?.isHaveQuantity || flags?.isDrugOverDose || isAgeRangeRule), [Validators.min(1)]);

  // Single diagnosis with quantity mode
  setReq(
    'selecteddiagnosisWithQuantity',
    !!(flags?.isDiagnose && flags?.isHaveQuantity && !flags?.isDrugToDrug),
  );

  // Activity Quantity by Patient Age Range
  setReq('minPatientAge', isAgeRangeRule, [Validators.min(0)]);
  setReq('maxPatientAge', isAgeRangeRule, [Validators.min(0)]);

  form.updateValueAndValidity({ emitEvent: false });
}

  onActivitySelectionChange(event: any): void {
    const activityTypeId: number = event.value;
    this.ruleForm.get('selectedMedications').setValue([]);
    this.ruleForm.get('selectedActivity')!.setValue(activityTypeId);
    this.rule.activityTypeId = activityTypeId;
    this.loadMedications(activityTypeId);
  }
  onSearchActivityTypeSearch(event) {
    this.loadMedications(this.rule.activityTypeId, event.filter);
  }

  onActivitySelectionChange2(event: any): void {
    const activityTypeId: number = event.value;
    this.ruleForm.get('selectedMedications2').setValue([]);
    this.ruleForm.get('selectedActivity2')!.setValue(activityTypeId);
    this.rule.secondaryActivityTypeId = activityTypeId;
    this.loadMedications2(activityTypeId);
  }

  private extractQuantityAndOperatorFromExpression(expression: string): void {
    // Reset local mirrors first
    this.quantityOperator = '';
    this.quantity = undefined;

    if (!expression || typeof expression !== 'string') {
      // Ensure form is cleared if nothing
      this.ruleForm.patchValue(
        {
          quantityOperator: '==',
          quantity: null,
        },
        { emitEvent: false },
      );
      return;
    }

    const decoded = expression
      .replace(/&gt;/gi, '>')
      .replace(/&lt;/gi, '<')
      .replace(/&amp;&amp;/gi, '&&')
      .replace(/&amp;/gi, '&') // generic fallback
      .replace(/\s+/g, ' ')
      .trim();

    const apply = (op: string, qtyStr: string) => {
      const operator = (op || '').trim();
      const qty = Number(qtyStr);
      if (!operator || Number.isNaN(qty)) return false;

      this.quantityOperator = operator;
      this.quantity = qty;

      this.ruleForm.patchValue(
        {
          quantityOperator: this.quantityOperator || '==',
          quantity: this.quantity ?? null,
        },
        { emitEvent: false },
      );

      return true;
    };

    {
      const re = /Count\(\s*\w+\s*=>\s*\w+\s*==\s*"([^"]+)"\s*\)\s*(>=|<=|==|>|<)\s*(\d+)/i;
      const m = decoded.match(re);
      if (m && apply(m[2], m[3])) return;
    }

    {
      const re =
        /ctx\.\w+Counts\.ContainsKey\("([^"]+)"\)\s*&&\s*ctx\.\w+Counts\["\1"\]\s*(>=|<=|==|>|<)\s*(\d+)/i;
      const m = decoded.match(re);
      if (m && apply(m[2], m[3])) return;
    }

    {
      const re = /ctx\.\w+Counts\["([^"]+)"\]\s*(>=|<=|==|>|<)\s*(\d+)/i;
      const m = decoded.match(re);
      if (m && apply(m[2], m[3])) return;
    }

    {
      const re = /(?:Count\([^)]*\)|ctx\.\w+Counts\[[^\]]+\])\s*(>=|<=|==|>|<)\s*(\d+)/i;
      const m = decoded.match(re);
      if (m && apply(m[1], m[2])) return;
    }

    console.warn(
      '[extractQuantityAndOperatorFromExpression] No quantity pattern matched:',
      decoded,
    );
    this.ruleForm.patchValue(
      {
        quantityOperator: '==',
        quantity: null,
      },
      { emitEvent: false },
    );
  }


WorkFlowsDropDown(filter?: string) {
    this.ruleService.getAllWorkflows(filter).subscribe({
      next: workflows => {
        this.workflows = workflows as WorkFlowDto[];
      },
      error: () => {},
    });
}

onWorkflowFilter(event: { filter: string }) {
    this.WorkFlowsDropDown(event.filter);
}
  ActivityTypesDropDpwn() {
    this.ruleService.getActivityTypes().subscribe({
      next: activities => {
        this.activities = activities as ActivityTypeLookUpDto[];
      },
      error: () => {},
    });
  }
  ActivityTypesDropDpwn2() {
    this.ruleService.getActivityTypes().subscribe({
      next: activities => {
        this.activities2 = activities as ActivityTypeLookUpDto[];
      },
      error: () => {},
    });
  }
  onWorkflowChange(event: any) {
    const selectedName = event.value;
    const wf = this.workflows.find(w => w.workflowName === selectedName);

    this.rule.workflowName = selectedName;
    this.rule.workFlowId = wf?.id ?? 0;
    this.clearSelectionsForNewWorkflow();
    if (wf?.id) {
      this.onWorkflowSelectedById(wf.id);
    } else {
      this.currentWorkflowFlags = null;
    }
    this.ruleForm.get('selectedMedications').reset();
    this.ruleForm.get('selectedMedications2').reset();
    this.ruleForm.get('selectedDiagnoses').reset();
    this.ruleForm.get('selectedDiagnoses2').reset();
    this.resetAll();
  }
  @ViewChild('msMedications') msMedications!: MultiSelect;
  @ViewChild('msMedications2') msMedications2!: MultiSelect;
  @ViewChild('msDiagnoses') msDiagnoses!: MultiSelect;
  @ViewChild('msDiagnoses2') msDiagnoses2!: MultiSelect;

  resetAll() {
    this.medicationOptions = [];
    this.medicationOptions2 = [];
    this.diagnosisOptions = [];
    this.diagnosisOptions2 = [];
    // Reset UI filters
    this.msMedications.resetFilter();
    this.msMedications2.resetFilter();
    this.msDiagnoses.resetFilter();
    this.msDiagnoses2.resetFilter();
  }
  private extractAgeAndGenderFromExpression(expression: string): void {
    const ageRegex = /ctx\.PatientAge\s*(==|>=|<=|>|<)\s*(\d+)/;
    const ageMatch = expression.match(ageRegex);

    if (ageMatch) {
      this.rule.ageOperator = ageMatch[1];
      this.ageOperator = ageMatch[1];
      this.rule.patientAge = parseInt(ageMatch[2], 10);
      this.patientAge = this.rule?.patientAge;
    }
    const genderRegex = /ctx\.PatientGender\s*==\s*["']([^"']+)["']/;
    const genderMatch = expression.match(genderRegex);
    if (genderMatch) {
      this.rule.patientGender = genderMatch[1];
      this.patientGender = genderMatch[1];
    }
    this.ruleForm.patchValue({
      ageOperator: this.ageOperator || null,
      patientAge: this.patientAge ?? null,
      patientGender: this.patientGender ?? '',
    });
  }

  onWorkflowSelectedById(workflowId: number) {
    this.workflowservice.getFilteredWorkFlowByIdById(workflowId).subscribe({
      next: wf => {
        this.currentWorkflowFlags = wf as unknown as WorkFlowDto;
     if (!this.currentWorkflowFlags.isActivityQuantityByAgeRange) {
        this.ruleForm.patchValue(
          {
            ageRangeSelectedActivity: null,
            ageRangeSelectedMedications: [],
            minPatientAge: null,
            maxPatientAge: null,
            ageRangeQuantityOperator: '==',
            ageRangeQuantity: null,
          },
          { emitEvent: false },
        );
        this.ageRangeMedicationOptions = [];
      }
        if (!this.currentWorkflowFlags.isDiagnose) {
          this.selectedDiagnoses = [];
          this.selectedDiagnoses2 = [];
          this.selecteddiagnosisWithQuantity = null;
          this.diagnosisQuantity = null;
        }

        if (!this.currentWorkflowFlags.isMedics) {
          this.selectedMedications = [];
          this.selectedMedications2 = [];
          this.selectedMedicationWithQuantity = null;
          this.selecteddiagnosisWithQuantity = null;
        }

        if (
          !this.currentWorkflowFlags.isPatientAgeActivities &&
          !this.currentWorkflowFlags.isPatientAgeDiagnosis &&
          !this.currentWorkflowFlags?.isDrugOverDose == true
        ) {
          this.patientAge = undefined;
          this.ageOperator = null;
        }

        if (
          !this.currentWorkflowFlags.isPatientGenderActivities &&
          !this.currentWorkflowFlags.isPatientGenderDiagnosis &&
          !this.currentWorkflowFlags?.isDrugOverDose == true
        ) {
          this.patientGender = '';
        }

        if (!this.currentWorkflowFlags.isHaveQuantity) {
          this.selecteddiagnosisWithQuantity = null;
          this.diagnosisQuantity = null;
          this.selectedMedicationWithQuantity = null;
          this.selecteddiagnosisWithQuantity = null;
        }
        if (this.currentWorkflowFlags.isDrugWithSpecificDiagnosis) {
          this.rule.isDrugWithSpecificDiagnosis = true;
          this.ageOperator = null;
          this.quantityOperator = null;
        } else {
          this.rule.isDrugWithSpecificDiagnosis = false;
        }
        
      },
      error: () => {
        this.currentWorkflowFlags = null;
        this.selectedDiagnoses = [];
        this.selectedDiagnoses2 = [];
        this.selectedMedications = [];
        this.selectedMedications2 = [];
        this.selecteddiagnosisWithQuantity = null;
        this.diagnosisQuantity = null;
        this.selectedMedicationWithQuantity = null;
        this.selecteddiagnosisWithQuantity = null;
        this.patientAge = undefined;
        this.ageOperator = null;
        this.patientGender = '';

        this.currentWorkflowFlags = null;
        this.applyDynamicValidators();
        this.ruleForm.patchValue({
          selectedDiagnoses: [],
          selectedDiagnoses2: [],
          selectedMedications: [],
          selectedMedications2: [],
          selecteddiagnosisWithQuantity: null,
          quantity: null,
          selectedMedicationWithQuantity: null,
          patientAge: null,
          ageOperator: null,
          patientGender: '',
        });
      },
    });
  }

  loadDiagnoses(term: string = '') {
    this.ruleService
      .diagnosesDropDownByFilterDto({
        code: term,
        selectedIds: [],
      })
      .subscribe({
        next: data => (this.diagnosisOptions = data),
        error: () => {},
      });
  }
  onFilterSelectedDiagnoses(event) {
    this.loadDiagnoses(event.filter);
  }
  loadMedications(activityTypeId: number, code: string = '') {
    this.ruleService
      .setDropDownValuesByFilter({
        activitytypeId: activityTypeId,
        code: code,
        selectedIds: this.rule?.medicationIds,
      })
      .subscribe({
        next: data => {
          this.medicationOptions = [...data];
          this.filteredMedicationOptions = [...data];
        },
        error: err => {
          console.error('Error loading medications:', err);
        },
      });
  }
  onSearchActivityTypeSearch2(event) {
    this.loadMedications2(this.rule.secondaryActivityTypeId, event.filter);
  }
  get selectedDiagnosisCodes(): string {
    if (!this.selectedDiagnoses || this.selectedDiagnoses.length === 0) {
      return '';
    }
    const validDiagnoses = this.selectedDiagnoses.filter((d): d is DiagnosisDto => d != null);
    const codes = validDiagnoses.map(d => d.code).filter((code): code is string => code != null);
    return codes.join(', ');
  }
  get selectedMedicationNames2(): string {
    if (!this.selectedMedications2 || this.selectedMedications2.length === 0) {
      return '';
    }
    const validmedics = this.selectedMedications2.filter((d): d is MedicationDto => d != null);
    const codes = validmedics.map(d => d.code).filter((code): code is string => code != null);
    return codes.join(', ');
  }
  get selectedMedicationNames(): string {
    if (!this.selectedMedications || this.selectedMedications.length === 0) {
      return '';
    }
    const validmedics = this.selectedMedications.filter((d): d is MedicationDto => d != null);
    const codes = validmedics.map(d => d.code).filter((code): code is string => code != null);
    return codes.join(', ');
  }
  onDiagnosisSearchChange2(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const term = inputElement.value;

    this.ruleService
      .diagnosesDropDownByFilterDto({
        code: term,
        selectedIds: this.rule?.diagnosisIds,
      })
      .subscribe({
        next: data => {
          const selected = this.selectedDiagnoses2 ?? [];
          const merged = [...data];

          selected.forEach(sel => {
            if (!merged.some(d => d.id === sel.id)) {
              merged.push(sel);
            }
          });

          this.diagnosisOptions2 = merged;
        },
        error: err => {
          console.error(err);
          this.customConfirmationService.error('Failed to search diagnoses.', 'Error', 5000);
        },
      });
  }

  onMedicsSearchChange2(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const term = inputElement.value;
    var actID;
    if (this.selectedActivity != 0) {
      actID = this.selectedActivity;
    } else {
      actID = 0;
    }
    this.ruleService
      .setDropDownValuesByFilter({
        activitytypeId: actID,
        code: term,
        selectedIds: this.rule?.medicationIds,
      })
      .subscribe({
        next: data => {
          const selected = this.selectedMedications2 ?? [];
          const merged = [...data];

          selected.forEach((sel: MedicationLookupDto) => {
            if (!merged.some(m => m.id === sel.id)) {
              merged.push(sel);
            }
          });

          this.medicationOptions2 = merged;
        },
        error: err => {
          console.error(err);
          this.customConfirmationService.error('Failed to search medications.', 'Error', 5000);
        },
      });
  }

  onMedicsSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const term = inputElement.value;

    const actID = this.selectedActivity || 0;

    this.ruleService
      .setDropDownValuesByFilter({
        activitytypeId: actID,
        code: term,
        selectedIds: this.rule?.medicationIds,
      })
      .subscribe({
        next: data => {
          const selected = this.selectedMedications ?? [];

          const merged = [...selected];

          data.forEach(med => {
            if (!merged.some(sel => sel.id === med.id)) {
              merged.push(med);
            }
          });

          this.medicationOptions = merged;
        },
        error: err => {
          console.error(err);
          this.customConfirmationService.error(
            'Failed to search medications from backend.',
            'Error',
            5000,
          );
        },
      });
  }

  onDiagnosisSearchChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const term = inputElement.value;

    this.ruleService
      .diagnosesDropDownByFilterDto({
        code: term,
        selectedIds: this.rule?.diagnosisIds,
      })
      .subscribe({
        next: data => {
          const selected = this.selectedDiagnoses ?? [];

          const merged: typeof selected = [...selected];

          data.forEach(diag => {
            if (!merged.some(sel => sel.id === diag.id)) {
              merged.push(diag);
            }
          });

          this.diagnosisOptions = merged;
        },
        error: err => {
          console.error(err);
          this.customConfirmationService.error(
            'Failed to search diagnoses from backend.',
            'Error',
            5000,
          );
        },
      });
  }

  removeMedication(index: number) {
    this.rule?.medications.splice(index, 1);
  }
  loadMedications2(activityTypeId: number, code: string = '') {
    this.ruleService
      .setDropDownValuesByFilter({
        activitytypeId: activityTypeId,
        code: code,
        selectedIds: [],
      })
      .subscribe({
        next: data => (this.medicationOptions2 = data),
        error: () => {},
      });
  }
  loadDiagnoses2(term: string = '') {
    this.ruleService
      .diagnosesDropDownByFilterDto({
        code: term,
        selectedIds: [],
      })
      .subscribe({
        next: data => (this.diagnosisOptions2 = data),
        error: () => {},
      });
  }
  onFilterSelectedDiagnoses2(event) {
    this.loadDiagnoses2(event?.filter);
  }
save(): void {
  this.loading = true;
  this.formSubmitted = true;

  if (!this.currentWorkflowFlags) {
    this.customConfirmationService.error('Workflow flags not loaded', 'error', 5000);
    this.loading = false;
    return;
  }

  if (this.ruleForm.invalid) {
    this.customConfirmationService.warnConfrim('Please fill all required fields', 'Validation', {
      accept() {},
    });
    this.loading = false;
    return;
  }

  const v = this.ruleForm.getRawValue() as {
    workflowName: string | null;
    ruleName: string | null;
    enabled: boolean;
    errorMessage: string | null;
    errorType: string | { code?: string; name?: string } | null;

    selectedActivity: number | null;
    selectedMedications: number[];
    selectedActivity2: number | null;
    selectedMedications2: number[];

    selectedDiagnoses: number[];
    selectedDiagnoses2: number[];
    selecteddiagnosisWithQuantity: number | null;

    ageOperator: string;
    patientAge: number | null;
    patientGender: string;

    quantityOperator: string;
    quantity: number | null;

    selectedMedicationWithQuantity: number | null;
    minPatientAge: number | null;
    maxPatientAge: number | null;
  };

  // Flag-driven booleans
  const haveAge = !!(
    this.currentWorkflowFlags.isPatientAgeActivities ||
    this.currentWorkflowFlags.isPatientAgeDiagnosis
  );

  const haveGender = !!(
    this.currentWorkflowFlags.isPatientGenderActivities ||
    this.currentWorkflowFlags.isPatientGenderDiagnosis
  );

  const haveQuantity = !!(
    this.currentWorkflowFlags.isHaveQuantity || this.currentWorkflowFlags.isDrugOverDose
  );
  const isAgeRangeRule = !!this.currentWorkflowFlags.isActivityQuantityByAgeRange;

  if (this.currentWorkflowFlags.isDiagnose && !this.currentWorkflowFlags.isHaveQuantity) {
    if (!v.selectedDiagnoses || v.selectedDiagnoses.length === 0) {
      this.customConfirmationService.error('At least one diagnosis is required', 'error', 5000);
      this.loading = false;
      return;
    }
  }

  if (this.currentWorkflowFlags.isMedics && !this.currentWorkflowFlags.isHaveQuantity) {
    if (!v.selectedMedications || v.selectedMedications.length === 0) {
      this.customConfirmationService.error('At least one medication is required', 'error', 5000);
      this.loading = false;
      return;
    }
  }

  if (haveAge) {
    if (v.patientAge == null || v.patientAge <= 0) {
      this.customConfirmationService.error('Valid patient age is required', 'error', 5000);
      this.loading = false;
      return;
    }
  }

  if (haveGender) {
    if (!v.patientGender) {
      this.customConfirmationService.error('Patient gender is required', 'error', 5000);
      this.loading = false;
      return;
    }
  }

  if (haveQuantity || isAgeRangeRule) {
    if (v.quantity == null || v.quantity < 1) {
      this.customConfirmationService.error('Quantity must be ≥ 1.', 'error', 5000);
      this.loading = false;
      return;
    }
  }

  if (isAgeRangeRule) {
    if (v.minPatientAge == null || v.maxPatientAge == null) {
      this.customConfirmationService.error('Min and Max patient age are required', 'error', 5000);
      this.loading = false;
      return;
    }
  }

  // Resolve workflow id from selected name
  const wf = this.workflows.find((w: WorkflowDropDownDto) => w.workflowName === v.workflowName);
  const workFlowId = wf?.id ?? 0;

  // Coerce errorType to a plain string (backend expects "Error" / "Warning")
  const errorTypeStr =
    typeof v.errorType === 'string'
      ? v.errorType
      : (v.errorType?.code ?? v.errorType?.name ?? '');

  const byId = new Map<number, any>();
  [...(this.medicationOptions || []), ...(this.medicationOptions2 || [])].forEach(m => {
    if (m?.id != null) byId.set(m.id, m);
  });

  const medicationsObjects: any[] = [
    ...(v.selectedMedications ?? []).map(id => byId.get(id)).filter(Boolean),
    ...(v.selectedMedications2 ?? []).map(id => byId.get(id)).filter(Boolean),
  ];

  // Quantity-mode single diagnosis/medication
  const diagnosisIdsFinal =
    this.currentWorkflowFlags.isDiagnose &&
    this.currentWorkflowFlags.isHaveQuantity &&
    !this.currentWorkflowFlags.isDrugToDrug
      ? v.selecteddiagnosisWithQuantity != null
        ? [v.selecteddiagnosisWithQuantity]
        : []
      : (v.selectedDiagnoses ?? []);

  const medicationIdsFinal =
    haveQuantity && v.selectedMedicationWithQuantity != null
      ? [v.selectedMedicationWithQuantity]
      : (v.selectedMedications ?? []);

  // Final DTO
  const dto: RuleDto = {
    id: this.rule?.id ?? 0,

    ruleName: v.ruleName ?? '',
    workflowName: v.workflowName ?? '',
    workFlowId,
    enabled: !!v.enabled,
    successEvent: this.rule?.successEvent ?? '',
    errorMessage: v.errorMessage ?? '',
    errorType: errorTypeStr,
    ruleExpressionType: this.rule?.ruleExpressionType ?? '',

    diagnoses: [],
    medications: medicationsObjects,
    diagnosisIds: diagnosisIdsFinal,
    medicationIds: medicationIdsFinal,
    procedures: this.rule?.procedures ?? [],

    patientGender: haveGender ? (v.patientGender ?? '') : '',
    patientAge: haveAge ? (v.patientAge ?? undefined) : undefined,
    expression: this.rule?.expression ?? '',
    secondDiagnosisIds: v.selectedDiagnoses2 ?? [],
    secondMedicationIds: v.selectedMedications2 ?? [],

    ageOperator: v.ageOperator,
    quantityOperator: (haveQuantity || isAgeRangeRule) ? v.quantityOperator : undefined,
    isHaveQuantity: haveQuantity,
    quantity: (haveQuantity || isAgeRangeRule) ? (v.quantity ?? 0) : 0,

    isDrugToDiagnosis: !!this.currentWorkflowFlags.isDrugToDiagnosis,
    isDrugWithSpecificDiagnosis: !!this.currentWorkflowFlags.isDrugWithSpecificDiagnosis,
    isActivityWithSpecificActivity: !!this.currentWorkflowFlags.isActivityWithSpecificActivity,
    isDiagnosisWithSpecificDiagnosis:
      !!this.currentWorkflowFlags.isDiagnosisWithSpecificDiagnosis,
    isDailyOverDose: !!this.currentWorkflowFlags.isDrugOverDose,
    isDrugOverDose: !!this.currentWorkflowFlags.isDrugOverDose,
    haveGender: haveGender,
    haveAge: haveAge,

    activityTypeId: v.selectedActivity ?? undefined,
    secondaryActivityTypeId: v.selectedActivity2 ?? undefined,

    diagnosisCounts: this.rule?.diagnosisCounts ?? {},
    medicationCounts: this.rule?.medicationCounts ?? {},
    validationErrors: [],
    validCodes: [],
    isActivityQuantityByAgeRange: isAgeRangeRule,
    ...(isAgeRangeRule ? { minPatientAge: v.minPatientAge ?? undefined, maxPatientAge: v.maxPatientAge ?? undefined } : {}),
  };

  const req$ = dto.id === 0 ? this.ruleService.create(dto) : this.ruleService.update(dto);

  req$.subscribe({
    next: () => {
      this.loading = false;
      this.customConfirmationService.success(
        dto.id === 0 ? '✅ Rule Created Successfully!' : '✅ Rule Updated Successfully!',
        dto.id === 0 ? 'Created' : 'Updated',
        5000,
      );
      this.router.navigate(['/medical-rules/rules']);
    },
    error: () => {
      this.loading = false;
      this.customConfirmationService.error(
        dto.id === 0 ? '❌ Failed to create rule.' : '❌ Failed to update rule.',
        'Error',
        5000,
      );
    },
  });
}

  private clearSelectionsForNewWorkflow(): void {
    this.ruleForm.patchValue(
      {
        ruleName: null,
        enabled: true,
        errorMessage: null,
        errorType: null,
        selectedActivity: null,
        selectedActivity2: null,
        selectedMedications: [],
        selectedMedications2: [],
        selectedDiagnoses: [],
        selectedDiagnoses2: [],
        selecteddiagnosisWithQuantity: null,
        selectedMedicationWithQuantity: null,
        // quantity & operators (optional reset; keep if new workflow shouldn’t inherit)
        quantity: null,
        quantityOperator: '',
        // age/gender (optional reset; depends on your UX)
        ageOperator: null,
        patientAge: null,
        patientGender: '',
        ageRangeSelectedActivity: null,
      ageRangeSelectedMedications: [],
      minPatientAge: null,
      maxPatientAge: null,
      ageRangeQuantityOperator: '==',
      ageRangeQuantity: null,
      },
      { emitEvent: false },
    ); // prevent cascading valueChanges until flags are set
    this.ruleForm.markAsUntouched();
  }

  showPrimaryActivityCard(): boolean {
  const f = this.currentWorkflowFlags;
  if (!f) return false;
  return !!(
    f.isMedics ||
    f.isDrugToDiagnosis ||
    f.isMedicsToMedics ||
    f.isPatientAgeActivities ||
    f.isPatientGenderActivities ||
    f.isDrugOverDose ||
    f.isDrugWithSpecificDiagnosis ||
    f.isActivityWithSpecificActivity ||
    f.isActivityQuantityByAgeRange
  );
}
  showSecondActivityCard() {
    const f = this.currentWorkflowFlags;
    if (!f) return false;
    return !!((f?.isMedicsToMedics && !f?.isHaveQuantity) || f?.isActivityWithSpecificActivity);
  }
  showSelectedDiagnoses() {
    const f = this.currentWorkflowFlags;
    if (!f) return false;
    return !!(
      (f?.isDiagnose && !f?.isHaveQuantity) ||
      f?.isDrugToDiagnosis ||
      f?.isPatientAgeDiagnosis ||
      f?.isPatientGenderDiagnosis ||
      f?.isDrugToDrug ||
      f?.isDrugWithSpecificDiagnosis ||
      f?.isDiagnosisWithSpecificDiagnosis
    );
  }
  showSelecteddiagnosisWithQuantity() {
    const f = this.currentWorkflowFlags;
    if (!f) return false;
    return !!(f?.isDiagnose && f?.isHaveQuantity && !f?.isDrugToDrug);
  }
  show(...flags) {
    const f = this.currentWorkflowFlags;
    if (!f) return false;
    return flags.some(k => !!f[k]);
  }
}
