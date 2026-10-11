import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { LocalizationService, PermissionService, SessionStateService } from '@abp/ng.core';
import {
  BeneficiaryInactivationReasonEnum,
  FamilyRole,
} from '@proxy/ehealth-claims/common/enums/beneficiaries';
import { BeneficiariesService } from '@proxy/ehealth-claims/domains/beneficiaries';
import { FilesManagerService } from '@proxy/ehealth-claims/files-managers';
import {
  AttachmentDto,
  BeneficiaryDto,
  CreateAndUpdateBeneficiaryRequestDto,
  EmployerDto,
  MoveBeneficiaryRequest,
  SplitBeneficiaryRequest,
} from '@proxy/ehealth-claims/view-models';
import {
  DeActivateBeneficiaryDto,
  SearchTargetFamilyRequest,
  TargetFamilyResultDto,
} from '@proxy/ehealth-claims/view-models/beneficiary';
import { BeneficiariesPermissions, FamilyPermissions } from 'src/app/shared/models/appPermissions';
import { CustomDropDownOption } from 'src/app/shared/models/inputs.model';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';
import { BeneficiariyMemberService } from '../../beneficiariy-member.service';
import {
  SelectedDropDownList,
  SelectedWithProviderDropDownList,
} from '@proxy/ehealth-claims/application/contracts/common/dto';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups/lookup-app-services.service';

const EGY_NID_REGEX = /^(2|3)\d{13}$/;

const EGY_GOV_CODES = new Set([
  '01',
  '02',
  '03',
  '04',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '31',
  '32',
  '33',
  '34',
  '35',
  '88',
]);

const FAMILY_ROLE_OPTIONS: CustomDropDownOption[] = [
  { id: '0', name: 'HeadOfFamily' },
  { id: '1', name: 'Father' },
  { id: '2', name: 'Mother' },
  { id: '3', name: 'Son' },
  { id: '4', name: 'Daughter' },
  { id: '5', name: 'Brother' },
  { id: '6', name: 'Sister' },
];

const MARITAL_STATUS_OPTIONS: CustomDropDownOption[] = [
  { id: '0', name: 'Unknown' },
  { id: '1', name: 'Single' },
  { id: '2', name: 'Married' },
  { id: '3', name: 'Divorced' },
  { id: '4', name: 'Widowed' },
];

const YES_NO_OPTIONS: CustomDropDownOption[] = [
  { id: 'true', name: 'Yes' },
  { id: 'false', name: 'No' },
];

const FAMILY_ROLE_MAP: Record<string, string> = {
  headoffamily: '0',
  'head of family': '0',
  head_of_family: '0',
  father: '1',
  mother: '2',
  son: '3',
  daughter: '4',
  brother: '5',
  sister: '6',
  unknown: '0',
};

const MARITAL_STATUS_MAP: Record<string, string> = {
  unknown: '0',
  single: '1',
  married: '2',
  divorced: '3',
  widowed: '4',
};

const FAMILY_ROLE_REVERSE: Record<string, string> = {
  '0': 'headOfFamily',
  '1': 'father',
  '2': 'mother',
  '3': 'son',
  '4': 'daughter',
  '5': 'brother',
  '6': 'sister',
};

const MARITAL_STATUS_REVERSE: Record<string, string> = {
  '0': 'unknown',
  '1': 'single',
  '2': 'married',
  '3': 'divorced',
  '4': 'widowed',
};

@Component({
  selector: 'app-beneficiary-form',
  standalone: false,
  templateUrl: './beneficiary-form.component.html',
  styleUrl: './beneficiary-form.component.scss',
})
export class BeneficiaryFormComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  hideHOFSection: boolean = false;
  id?: number;
  form!: FormGroup;

  familyRoleOptions = FAMILY_ROLE_OPTIONS;
  maritalStatusOptions = MARITAL_STATUS_OPTIONS;
  yesNoOptions = YES_NO_OPTIONS;
  familyRole = FamilyRole;

  showUpdateDialog = false;
  updateFormData: any = null;
  updateIsHof = false;
  updateError: string | null = null;
  employerOptions: CustomDropDownOption[] = [];
  parentOptions: CustomDropDownOption[] = [];
  familyIsActive: boolean = false;
  familyCompletionStatus: string = '';
  isHeadOfFamily = false;
  familyMembers: any[] = [];
  selectedFiles: File[] = [];
  attachments: AttachmentDto[] = [];
  @Input() familyMembersCount: number = 0;
  loading = false;
  private subs: Subscription[] = [];
  Validators = Validators;
  visibleHOFForm: boolean = false;
  visibleFamilyMemberForm: boolean = false;

  hofFormStatus: boolean = false;
  hofForm!: FormGroup;
  familyMemeberForm!: FormArray;
  familyMemeberFormStatus: boolean = false;
  showHOFData: boolean = false;
  updateHOFForm: any;
  showHOFMoreDetails: boolean = false;
  familyCode: string = '';
  showFamilyMemberMoreDetails: boolean = false;
  updateFamilyMemberForm: any;
  showFamilyMemberData: boolean = false;
  activeIndexFamilyMemebr: number | undefined;
  HOFId!: number;
  visibleFamiltTree: boolean = false;
  allFamilyMembers: any;
  viewAction!: string;
  familyId!: number;

  // ─── Split Dialog State ──────────────────────────────────────
  showSplitDialog = false;
  splitInProgress = false;
  splitError: string | null = null;
  selectedMemberForSplit: any = null;

  // ─── Deactivate Member Dialog State ─────────────────────────
  showDeactivateMemberDialog = false;
  deactivationReason: BeneficiaryInactivationReasonEnum | null = null;
  deactivationNote: string = '';
  deactivationInProgress = false;
  deactivationError: string | null = null;
  deactivationReasons: { label: string; value: BeneficiaryInactivationReasonEnum }[] = [];
  selectedMemberForDeactivate: any = null;
  // ─── Move Dialog State ───────────────────────────────────────
  showMoveDialog = false;
  selectedMemberForMove: any = null;
  moveSearchText = '';
  moveSearchInProgress = false;
  moveSearchError: string | null = null;
  moveTargetFamily: TargetFamilyResultDto | null = null;
  moveRelationOptions: { id: FamilyRole; name: string; disabled?: boolean }[] = [];
  moveSelectedRelation: FamilyRole | null = null;
  movePcuOptions: SelectedDropDownList[] = [];
  moveSelectedPcu: number | null = null;
  moveInProgress = false;
  moveError: string | null = null;
  // permissions
  familyTreePermission!: boolean;
  splitPermission!: boolean;
movePermission!: boolean;
updatePermission!: boolean;
deactivatePermission!: boolean;
  lang!: string;
  updateFamilyInfo!: boolean;
  hasPermission!: boolean;
  activeFamilyInfo!: boolean;
constructor(
  private sessionState: SessionStateService,
  private fb: FormBuilder,
  private beneficiariesService: BeneficiariesService,
  private filesManagerService: FilesManagerService,
  private route: ActivatedRoute,
  private router: Router,
  private customConfirmationService: CustomConfirmationService,
  private translate: LocalizationService,
  private datePipe: DatePipe,
  private beneficiariyMemberService: BeneficiariyMemberService,
  private lookupServiceService: LookupAppServicesService,
  public permission: PermissionService,
) {
  this.lang = sessionState.getLanguage();
  this.HOFId = Number(this.route.snapshot.paramMap.get('id')) ?? undefined;
  this.familyTreePermission = this.permission.getGrantedPolicy(
    BeneficiariesPermissions.BeneficiariesViewFamilyTree,
  );
  // this.viewAction = this.route.snapshot.paramMap.get('action') ?? '';

  const ActionPermissionMap: { [key: string]: FamilyPermissions } = {
    '': FamilyPermissions.FamilyPermissionsCreate,
    edit: FamilyPermissions.FamilyPermissionsUpdate,
    view: FamilyPermissions.FamilyPermissionView,
  };

  this.route.paramMap.subscribe(params => {
   this.viewAction = params.get('action') ?? '';
      this.hasPermission = this.permission.getGrantedPolicy(ActionPermissionMap[this.viewAction]);
      this.activeFamilyInfo = !!(
        (localStorage.getItem('fromViewFamForm') && (this.viewAction == 'view' ||
        this.viewAction == 'edit'))
      );

    const newHOFId = Number(params.get('id')) || undefined;
    if (newHOFId && newHOFId !== this.HOFId) {
      this.HOFId = newHOFId;
      this.resetFamilyState();
      this.showHOFData = true;
      this.visibleHOFForm = false;
      this.showFamilyMemberData = true;
      this.visibleFamilyMemberForm = false;
      this.getAllFamilyMembers();
    }
  });

  this.updateFamilyInfo = this.permission.getGrantedPolicy(
    FamilyPermissions.FamilyPermissionsUpdate,
  );
}

  ngOnInit(): void {
    if (this.HOFId) {
      this.showHOFData = true;
      this.visibleHOFForm = false;
      this.showFamilyMemberData = true;
      this.visibleFamilyMemberForm = false;
      this.getAllFamilyMembers();
    }
    this.lookupServiceService.getProviderDropDownList().subscribe({
      next: (list: SelectedWithProviderDropDownList[]) => {
        this.movePcuOptions = list;
      },
      error: () => {},
    });
    this.deactivationReasons = [
      {
        label: this.translate.instant('RuleApplication::Beneficiaries:InactivationReason:Death'),
        value: BeneficiaryInactivationReasonEnum.Death,
      },
      {
        label: this.translate.instant(
          'RuleApplication::Beneficiaries:InactivationReason:Departure',
        ),
        value: BeneficiaryInactivationReasonEnum.Departure,
      },
      {
        label: this.translate.instant(
          'RuleApplication::Beneficiaries:InactivationReason:CannotBeContactedWithOverduePremium',
        ),
        value: BeneficiaryInactivationReasonEnum.CannotBeContactedWithOverduePremium,
      },
    ];
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
  //HOF
  onFormHOFValid(event: any) {
    this.hofForm = event;
  }
private resetFamilyState(): void {
  this.hideHOFSection = false;
  this.visibleFamiltTree = false;
  this.familyMembers = [];
  this.allFamilyMembers = null;
  this.familyIsActive = false;
  this.familyCompletionStatus = '';
  this.familyCode = '';
  this.familyId = 0;

  this.showUpdateDialog = false;
  this.updateFormData = null;

  this.showSplitDialog = false;
  this.selectedMemberForSplit = null;

  this.showDeactivateMemberDialog = false;
  this.selectedMemberForDeactivate = null;

  this.showMoveDialog = false;
  this.selectedMemberForMove = null;
  this.moveTargetFamily = null;
}
  private formatToDdMmYyyy(date: Date | string | null): string {
    if (!date) return '';

    let d: Date;

    if (date instanceof Date) {
      d = date;
    } else {
      const parts = (date as string).split('-');
      if (parts.length === 3) {
        const dd = parts[0].padStart(2, '0');
        const mm = parts[1].padStart(2, '0');
        const yyyy = parts[2];
        // Always interpret as dd-MM-yyyy
        d = new Date(`${yyyy}-${mm}-${dd}`);
      } else {
        d = new Date(date as string);
      }
    }

    if (!d || isNaN(d.getTime())) return '';

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
  }

  saveHOF(event?: any) {
    this.hofForm = event;
    if (this.hofForm.valid) {
      const formValue = this.hofForm.getRawValue();
      const hofData: CreateAndUpdateBeneficiaryRequestDto = {
        beneficiaryInsertRequestList: [
          {
            familyRole: formValue?.familyRole ?? null,
            firstName: formValue?.firstName ?? null,
            name: formValue?.fullName ?? null,
            maritalStatus: formValue?.maritalStatus ?? null,
            birthDate: formValue?.dateOfBirth ?? null,
            birthGovernorateId: formValue?.governorateBirth ?? null,
            gender: formValue?.gender ?? null,
            nationalId: formValue?.nationalId ?? null,
            nationalityId: formValue?.nationalityId ?? null,
            isEgyptian: this.hofForm?.controls?.nationalityId?.valid ? true : false,
            mobileNumber: formValue?.mobileNumber ?? null,
            educationalStatusId: formValue?.educationalStatus ?? null,
            registrationDate: this.formatToDdMmYyyy(formValue?.registrationDate),
            previousInsuranceTypeId: formValue?.previousInssuranceType ?? null,
            hasAnotherAddress: formValue?.anotheraddress ?? null,
            newAddress: formValue?.newAddress ?? null,
            employmentStatusId: formValue?.employmentStatus ?? null,
            isSocialInsuranceRegistered: formValue?.socialInsurance ?? null,
            notes: formValue?.notes ?? null,
            id: this.HOFId ?? null,
            housingGovernorateId: formValue?.housingGovernorateId ?? null,
            districtId: formValue?.districtId ?? null,
            primaryCareUnitId: formValue?.primaryCareUnitId ?? null,
          },
        ],
      };
      if (this.updateHOFForm) {
        this.updateHOF(hofData);
      } else {
        this.createHOF(hofData);
      }
    }
  }
  // create Head of Family
  createHOF(hofData: any) {
    this.beneficiariesService.create(hofData).subscribe({
      next: res => {
        this.showHOFData = true;
        this.visibleHOFForm = false;
        this.HOFId = res[0];

        // ─── Update URL so reload works ────────────────────────
        this.router.navigate(
          ['/beneficiaries/edit', this.HOFId],
          { replaceUrl: true }, // ← replaceUrl prevents back button going to /create
        );

        this.customConfirmationService.success(
          this.translate.instant('RuleApplication::Common:SuccessSave'),
          this.translate.instant('RuleApplication::Common:Sucess'),
          20000,
        );
        localStorage.removeItem('nationalId');
      },
      error: err => {
        this.showHOFData = false;
        this.customConfirmationService.error(err.message, 'Validation Error', 2000);
      },
    });
  }
  updateHOF(hofData: any) {
    this.beneficiariesService.update(hofData).subscribe({
      next: res => {
        this.customConfirmationService.success(
          this.translate.instant('RuleApplication::Common:SuccessSave'),
          this.translate.instant('RuleApplication::Common:Sucess'),
          20000,
        );
        this.visibleHOFForm = false;
        this.showHOFData = true;
        this.getAllFamilyMembers();
      },
      error: err => {
        this.visibleHOFForm = true;
        this.showHOFData = true;
        const message =
          err?.error?.error?.message || err?.error?.message || err?.message || 'Validation Error';
        this.customConfirmationService.error(message, 'Validation Error', 5000);
      },
    });
  }
  onGetFormStatus(event: boolean) {
    this.hofFormStatus = event;
  }
  showAddHOFForm() {
    this.visibleHOFForm = true;
  }
  canselHOFForm(event: boolean) {
    this.visibleHOFForm = event;
  }

  //familyMembers
  saveFamilyForm(event: any) {
    this.showFamilyMemberData = true;
    this.familyMemeberForm = event;
    const changedControlData: FormArray<any> = new FormArray(
      this.familyMemeberForm.controls.filter(control => control.dirty),
    );
    const isAddnewMember = changedControlData.value.filter((member: any) => member?.id == null);
    if (changedControlData) {
      const formValue =
        isAddnewMember.length > 0 ? isAddnewMember : changedControlData.getRawValue();
      const familyMemebersData: CreateAndUpdateBeneficiaryRequestDto = {
        beneficiaryInsertRequestList: formValue.map((member: any) => ({
          parentId: (this.HOFId || member?.parentId) ?? null,
          familyRole: member?.familyRole ?? null,
          firstName: member?.firstName ?? null,
          name: member?.fullName ?? null,
          maritalStatus: member?.maritalStatus ?? null,
          birthDate: member?.dateOfBirth ?? null,
          birthGovernorateId: member?.governorateBirth ?? null,
          gender: member?.gender ?? null,
          nationalityId: member?.nationalityId ?? null,
          nationalId: member?.nationalId ?? null,
          isEgyptian: !!member?.nationalityId,
          mobileNumber: member?.mobileNumber ?? null,
          educationalStatusId: member?.educationalStatus ?? null,
          registrationDate: this.formatToDdMmYyyy(member?.registrationDate),
          previousInsuranceTypeId: member?.previousInssuranceType ?? null,
          hasAnotherAddress: member?.anotheraddress ?? null,
          newAddress: member?.newAddress ?? null,
          employmentStatusId: member?.employmentStatus ?? null,
          isSocialInsuranceRegistered: member?.socialInsurance ?? null,
          notes: member?.notes ?? null,
          id: member?.id ?? null,
          housingGovernorateId: member?.housingGovernorateId ?? null,
          districtId: member?.districtId ?? null,
          primaryCareUnitId: member?.primaryCareUnitId ?? null,
        })),
      };
      if (isAddnewMember.length > 0) {
        this.createFM(familyMemebersData);
      } else {
        this.updateFM(familyMemebersData);
      }
    }
  }
  createFM(familyMemebersData: any) {
    this.beneficiariesService.create(familyMemebersData).subscribe({
      next: res => {
        this.showFamilyMemberData = true;
        this.visibleFamilyMemberForm = false;
        this.customConfirmationService.success(
          this.translate.instant('RuleApplication::Common:SuccessSave'),
          this.translate.instant('RuleApplication::Common:Sucess'),
          2000,
        );
        this.getAllFamilyMembers();
      },
      error: err => {
        this.showFamilyMemberData = true;
        this.visibleFamilyMemberForm = true;
        const message =
          err?.error?.error?.message || err?.error?.message || err?.message || 'Validation Error';
        this.customConfirmationService.error(message, 'Validation Error', 5000);
      },
    });
  }

  updateFM(familyMemebersData: any) {
    this.beneficiariesService.update(familyMemebersData).subscribe({
      next: res => {
        this.showFamilyMemberData = true;
        this.visibleFamilyMemberForm = false;
        this.customConfirmationService.success(
          this.translate.instant('RuleApplication::Common:SuccessSave'),
          this.translate.instant('RuleApplication::Common:Sucess'),
          2000,
        );
        this.getAllFamilyMembers();
      },
      error: err => {
        this.showFamilyMemberData = true;
        this.visibleFamilyMemberForm = true;
        const message =
          err?.error?.error?.message || err?.error?.message || err?.message || 'Validation Error';
        this.customConfirmationService.error(message, 'Validation Error', 5000);
        this.getAllFamilyMembers();
      },
    });
  }

  updateFamilyMemberByIndex(index: number) {
    this.visibleFamilyMemberForm = true;
    this.updateFamilyMemberForm = this.familyMemeberForm.value;
    this.activeIndexFamilyMemebr = index;
  }
  onGetFamilyFormStatus(event: boolean) {
    this.familyMemeberFormStatus = event;
  }
  saveFamilyMembers() {}
  showAddFamilyMemberForm() {
    this.visibleFamilyMemberForm = true;
  }
  canselFamilyMemeberForm(event: boolean) {
    this.visibleFamilyMemberForm = event;
  }

  addMoreMember() {
    this.showAddFamilyMemberForm();
    this.updateFamilyMemberForm = this.familyMemeberForm.value;

    const newGroup = this.beneficiariyMemberService.createFamilyForm();

    this.updateFamilyMemberForm.push({ ...newGroup, nationalId: null });

    this.activeIndexFamilyMemebr = this.familyMemeberForm.length;
  }

  deleteFamilyMember(index: number) {
    const memberId = this.familyMemeberForm.at(index).value?.id;
    this.customConfirmationService.warnConfrim(
      this.translate.instant('RuleApplication::Common:ConfirmDelete'),
      this.translate.instant('RuleApplication::Common:Deleting'),
      {
        accept: () => {
          this.beneficiariesService.delete(memberId).subscribe({
            next: res => {
              this.customConfirmationService.success(
                this.translate.instant('RuleApplication::Common:SuccessDelete'),
                this.translate.instant('RuleApplication::Common:Sucess'),
                20000,
              );
              this.familyMemeberForm.removeAt(index);
              this.getAllFamilyMembers();
            },
            error: err => {
              this.showHOFData = false;
              this.customConfirmationService.error(err.message, 'Validation Error', 2000);
            },
          });
        },
        reject: () => {},
        dismiss: () => {},
      },
    );
  }

  getAllFamilyMembers() {
    this.hofForm = this.fb.group({});
    this.familyMemeberForm = this.fb.array([]);
    this.beneficiariesService.getFamilyTreeById(this.HOFId).subscribe({
      next: res => {
        this.allFamilyMembers = res;
        this.familyMembers = res;

        const HOF = res.find(member => member.parentId == null);
        const familyMembers = res.filter(member => member.parentId !== null);

        if (HOF?.familyId) {
          this.familyId = HOF.familyId;
        }

        this.hofForm = this.beneficiariyMemberService.createFamilyForm();
        if (HOF) {
          this.hofForm.patchValue(this.beneficiariyMemberService.mapMemberToForm(HOF));
        }
        if (this.familyMemeberForm?.length) {
          this.familyMemeberForm.clear();
        } else {
          this.familyMemeberForm = this.fb.array([]);
        }
        familyMembers.forEach(member => {
          const group = this.beneficiariyMemberService.createFamilyForm();
          group.patchValue(this.beneficiariyMemberService.mapMemberToForm(member));
          this.familyMemeberForm.push(group);
        });
        this.familyIsActive = HOF?.isFamilyActive ?? false;
        this.familyCode = res[0]?.familyCode ?? '';
        this.familyCompletionStatus = HOF?.familyCompletionStatus ?? '';
        this.familyMembersCount = res.length;
        this.updateFamilyMemberForm = this.familyMemeberForm;
      },
      error: err => {
        console.error('Error fetching family members', err);
      },
    });
  }
  showFamilyTree() {
    this.visibleFamiltTree = true;
    this.hideHOFSection = true;
  }
  showFamilyList() {
    this.visibleFamiltTree = false;
    this.hideHOFSection = false;
  }
  onCancelUpdate() {
    this.showUpdateDialog = false;
    this.updateFormData = null;
    this.updateError = null;
  }

  onGetUpdateFormStatus(event: boolean) {}

  saveUpdate(formGroupOrArray: FormGroup | FormArray) {
    if (!formGroupOrArray || !formGroupOrArray.valid) {
      return;
    }

    const rawValue = formGroupOrArray.getRawValue();
    const formValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    this.showUpdateDialog = false;

    if (this.updateIsHof) {
      const hofData: CreateAndUpdateBeneficiaryRequestDto = {
        beneficiaryInsertRequestList: [
          {
            familyRole: formValue?.familyRole ?? null,
            firstName: formValue?.firstName ?? null,
            name: formValue?.fullName ?? null,
            maritalStatus: formValue?.maritalStatus ?? null,
            birthDate: formValue?.dateOfBirth ?? null,
            birthGovernorateId: formValue?.governorateBirth ?? null,
            gender: formValue?.gender ?? null,
            nationalId: formValue?.nationalId ?? null,
            nationalityId: formValue?.nationalityId ?? null,
            isEgyptian: !!formValue?.nationalityId,
            mobileNumber: formValue?.mobileNumber ?? null,
            educationalStatusId: formValue?.educationalStatus ?? null,
            registrationDate: this.formatToDdMmYyyy(formValue?.registrationDate),
            previousInsuranceTypeId: formValue?.previousInssuranceType ?? null,
            hasAnotherAddress: formValue?.anotheraddress ?? null,
            newAddress: formValue?.newAddress ?? null,
            employmentStatusId: formValue?.employmentStatus ?? null,
            isSocialInsuranceRegistered: formValue?.socialInsurance ?? null,
            notes: formValue?.notes ?? null,
            id: this.HOFId ?? null,
            housingGovernorateId: formValue?.housingGovernorateId ?? null,
            districtId: formValue?.districtId ?? null,
            primaryCareUnitId: formValue?.primaryCareUnitId ?? null,
          },
        ],
      };
      this.updateHOF(hofData);
    } else {
      const familyMemebersData: CreateAndUpdateBeneficiaryRequestDto = {
        beneficiaryInsertRequestList: [
          {
            parentId: this.HOFId ?? null,
            familyRole: formValue?.familyRole ?? null,
            firstName: formValue?.firstName ?? null,
            name: formValue?.fullName ?? null,
            maritalStatus: formValue?.maritalStatus ?? null,
            birthDate: formValue?.dateOfBirth ?? null,
            birthGovernorateId: formValue?.governorateBirth ?? null,
            gender: formValue?.gender ?? null,
            nationalityId: formValue?.nationalityId ?? null,
            nationalId: formValue?.nationalId ?? null,
            isEgyptian: !!formValue?.nationalityId,
            mobileNumber: formValue?.mobileNumber ?? null,
            educationalStatusId: formValue?.educationalStatus ?? null,
            registrationDate: this.formatToDdMmYyyy(formValue?.registrationDate),
            previousInsuranceTypeId: formValue?.previousInssuranceType ?? null,
            hasAnotherAddress: formValue?.anotheraddress ?? null,
            newAddress: formValue?.newAddress ?? null,
            employmentStatusId: formValue?.employmentStatus ?? null,
            isSocialInsuranceRegistered: formValue?.socialInsurance ?? null,
            notes: formValue?.notes ?? null,
            id: formValue?.id ?? null,
            housingGovernorateId: formValue?.housingGovernorateId ?? null,
            districtId: formValue?.districtId ?? null,
            primaryCareUnitId: formValue?.primaryCareUnitId ?? null,
          },
        ],
      };
      this.updateFM(familyMemebersData);
    }

    this.updateFormData = null;
  }
  onUpdateMember(member: any) {
    if (!member) {
      return;
    }

    const mapped = this.beneficiariyMemberService.mapMemberToForm(member);
    this.updateIsHof = member.familyRole === this.familyRole.HeadOfFamily;
    this.updateFormData = this.updateIsHof ? mapped : [mapped];

    this.updateError = null;
    this.showUpdateDialog = true;
  }

  onMoveMember(member: any) {
    if (!member?.isActive) {
      return;
    }

    this.selectedMemberForMove = member;
    this.moveSearchText = '';
    this.moveSearchError = null;
    this.moveTargetFamily = null;
    this.moveSelectedRelation = null;
    this.moveSelectedPcu = null;
    this.moveError = null;

    this.moveRelationOptions = Object.values(FamilyRole)
      .filter(role => role !== FamilyRole.HeadOfFamily)
      .map(role => ({
        id: role,
        name: this.translate.instant(`RuleApplication::HOF:${role}`),
        disabled: role === FamilyRole.Self,
      }));

    this.showMoveDialog = true;
  }

onSearchTargetFamily() {
  if (!this.moveSearchText?.trim()) {
    return;
  }

  this.moveSearchInProgress = true;
  this.moveSearchError = null;
  this.moveTargetFamily = null;
  this.moveSelectedPcu = null;
  this.moveSelectedRelation = null;
  this.moveError = null;

  const input: SearchTargetFamilyRequest = { searchText: this.moveSearchText.trim() };

  this.beneficiariesService.searchTargetFamilyForMoveByInput(input).subscribe({
    next: (res: TargetFamilyResultDto) => {
      this.moveSearchInProgress = false;
      this.moveTargetFamily = res;
    },
    error: err => {
      this.moveSearchInProgress = false;
      this.moveSearchError =
        err?.error?.error?.message ||
        err?.message ||
        this.translate.instant('RuleApplication::Beneficiaries:MoveTargetFamilyNotFound');
    },
  });
}

  getSelectedPcuName(): string {
    return this.movePcuOptions.find(p => p.id === this.moveSelectedPcu)?.name ?? '';
  }

  onCancelMove() {
    this.showMoveDialog = false;
    this.selectedMemberForMove = null;
    this.moveTargetFamily = null;
    this.moveError = null;
  }

onConfirmMove() {
  if (
    !this.selectedMemberForMove ||
    !this.moveTargetFamily ||
    !this.moveSelectedRelation ||
    !this.moveSelectedPcu
  ) {
    return;
  }

  this.moveInProgress = true;
  this.moveError = null;

  const input: MoveBeneficiaryRequest = {
    beneficiaryId: this.selectedMemberForMove.id,
    toBeneficiaryId: this.moveTargetFamily.headOfFamilyId,
    relationToHof: this.moveSelectedRelation,
    primaryCareUnitId: this.moveSelectedPcu,
  };

  this.beneficiariesService.moveBeneficiaryByInput(input).subscribe({
    next: () => {
      this.moveInProgress = false;
      this.showMoveDialog = false;

      this.customConfirmationService.success(
        this.translate.instant('RuleApplication::Beneficiaries:MoveSuccessMessage'),
        this.translate.instant('RuleApplication::Common:Sucess'),
        5000,
      );

      this.getAllFamilyMembers();
    },
    error: err => {
      this.moveInProgress = false;
      this.moveError =
        err?.error?.error?.message ||
        err?.error?.message ||
        this.translate.instant('RuleApplication::Beneficiaries:MoveError');
    },
  });
}
  onOpenSplitDialog(member: any) {
    if (!member?.isActive) {
      return;
    }
    this.selectedMemberForSplit = member;
    this.splitError = null;
    this.showSplitDialog = true;
  }

  onCancelSplit() {
    this.showSplitDialog = false;
    this.selectedMemberForSplit = null;
    this.splitError = null;
  }

onConfirmSplit() {
  if (!this.selectedMemberForSplit || this.selectedMemberForSplit.id === undefined) {
    return;
  }

  const beneficiaryId = this.selectedMemberForSplit.id;

  this.splitInProgress = true;
  this.splitError = null;

  const input: SplitBeneficiaryRequest = {
    beneficiaryId: beneficiaryId,
  };

  this.beneficiariesService.splitBeneficiaryByInput(input).subscribe({
   next: (res: any) => {
  this.splitInProgress = false;
  this.showSplitDialog = false;

  this.customConfirmationService.success(
    this.translate.instant('RuleApplication::Beneficiaries:SplitSuccessMessage'),
    this.translate.instant('RuleApplication::Common:Sucess'),
    5000,
  );

  localStorage.setItem('fromViewFamForm', 'true');
  this.router.navigate(['/beneficiaries/edit', res.beneficiaryId]);
},
    error: () => {
      this.splitInProgress = false;
      this.splitError = this.translate.instant('RuleApplication::Beneficiaries:SplitError');
    },
  });
}

  // ─── Deactivate Member ──────────────────────────────────────
  onOpenDeactivateMemberDialog(member: any) {
    if (!member?.isActive) {
      return;
    }
    this.selectedMemberForDeactivate = member;
    this.deactivationReason = null;
    this.deactivationNote = '';
    this.deactivationError = null;
    this.showDeactivateMemberDialog = true;
  }

  onCancelDeactivateMember() {
    this.showDeactivateMemberDialog = false;
    this.selectedMemberForDeactivate = null;
    this.deactivationReason = null;
    this.deactivationNote = '';
    this.deactivationError = null;
  }

  onConfirmDeactivateMember() {
    if (
      !this.deactivationReason ||
      !this.selectedMemberForDeactivate ||
      this.selectedMemberForDeactivate.id === undefined
    ) {
      return;
    }

    const beneficiaryId = this.selectedMemberForDeactivate.id;

    this.deactivationInProgress = true;
    this.deactivationError = null;

    const input: DeActivateBeneficiaryDto = {
      beneficiaryId: beneficiaryId,
      inactivationReason: this.deactivationReason,
      inactivationNote: this.deactivationNote || undefined,
    };

    this.beneficiariesService.deActivateBeneficiary(input).subscribe({
      next: () => {
        this.deactivationInProgress = false;
        this.showDeactivateMemberDialog = false;
        this.selectedMemberForDeactivate = null;
        this.getAllFamilyMembers();
      },
      error: () => {
        this.deactivationInProgress = false;
        this.deactivationError = this.translate.instant(
          'RuleApplication::Beneficiaries:InactivationError',
        );
      },
    });
  }

  private egyptNationalIdValidator() {
    return (control: any) => {
      const value = String(control.value || '').trim();
      if (!value) return null;

      if (!EGY_NID_REGEX.test(value)) return { nationalIdInvalid: true };

      const parsed = this.parseEgyptNationalId(value);
      return parsed.isValid ? null : { nationalIdInvalid: true };
    };
  }

  private parseEgyptNationalId(nid: string): {
    isValid: boolean;
    birthDate?: Date;
    birthIso?: string;
    age?: number;
    gender?: 'Male' | 'Female';
  } {
    if (!EGY_NID_REGEX.test(nid)) return { isValid: false };

    const centuryDigit = nid.charAt(0);
    const yy = Number(nid.substring(1, 3));
    const mm = Number(nid.substring(3, 5));
    const dd = Number(nid.substring(5, 7));
    const gov = nid.substring(7, 9);

    if (!EGY_GOV_CODES.has(gov)) return { isValid: false };

    const year = (centuryDigit === '2' ? 1900 : 2000) + yy;

    const birth = new Date(year, mm - 1, dd);
    if (birth.getFullYear() !== year || birth.getMonth() !== mm - 1 || birth.getDate() !== dd) {
      return { isValid: false };
    }

    const genderDigit = Number(nid.charAt(12));
    if (Number.isNaN(genderDigit)) return { isValid: false };
    const gender = genderDigit % 2 === 0 ? 'Female' : 'Male';

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    if (age < 0 || age > 120) return { isValid: false };

    const birthIso = `${year}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;

    return { isValid: true, birthDate: birth, birthIso, age, gender };
  }

  private isEgyptianFlagTrue(value: any): boolean {
    return value === true || value === 'true' || value === 1 || value === '1';
  }

  private updateValidationBasedOnNationality(isEgyptianValue: any): void {
    const codeControl = this.form.get('code');
    const nationalIdControl = this.form.get('nationalId');

    if (!codeControl || !nationalIdControl) return;

    const isEgyptian = this.isEgyptianFlagTrue(isEgyptianValue);

    if (isEgyptian) {
      nationalIdControl.setValidators([
        Validators.required,
        Validators.pattern(/^(2|3)\d{13}$/),
        this.egyptNationalIdValidator(),
      ]);

      codeControl.clearValidators();
    } else {
      nationalIdControl.clearValidators();

      codeControl.setValidators([Validators.required]);
    }

    nationalIdControl.updateValueAndValidity({ emitEvent: false });
    codeControl.updateValueAndValidity({ emitEvent: false });
  }

  private loadNextCodePreview(): void {
    if (this.id) return;
    this.beneficiariesService.generateNextCode().subscribe({
      next: (res: any) => {
        const code = typeof res === 'string' ? res : (res?.code ?? res);

        if (!this.form.get('code')?.value) {
          this.form.patchValue({ code: code ?? '' }, { emitEvent: false });
        }
      },
      error: () => {},
    });
  }
  private applyDerivedFromNationalId(nid: string): void {
    const parsed = this.parseEgyptNationalId(nid);

    if (!parsed.isValid) {
      this.form.patchValue({ derivedGender: '', derivedAge: '' }, { emitEvent: false });
      this.form.get('birthDate')?.setValue('', { emitEvent: false });
      return;
    }

    this.form.patchValue(
      {
        derivedGender: parsed.gender ?? '',
        derivedAge: parsed.age != null ? String(parsed.age) : '',
      },
      { emitEvent: false },
    );

    this.form.get('birthDate')?.setValue(parsed.birthIso ?? '', { emitEvent: false });
  }

  private loadEmployers(): void {
    this.beneficiariesService.getAllEmployers().subscribe((res: EmployerDto[]) => {
      this.employerOptions = (res ?? []).map(e => ({
        id: String(e.id),
        name: e.nameAr ?? e.nameEn ?? `Employer #${e.id}`,
      }));
    });
  }

  private loadParents(): void {
    this.beneficiariesService
      .getBeneficiaryDropDownByName('')
      .subscribe((res: BeneficiaryDto[]) => {
        this.parentOptions = (res ?? []).map(b => ({
          id: String(b.id),
          name: b.name ?? `#${b.id}`,
        }));
      });
  }

  private loadForEdit(id: number): void {
    this.loading = true;

    this.beneficiariesService.getById(id).subscribe({
      next: dto => {
        const roleKey = dto.familyRole ? String(dto.familyRole).toLowerCase() : 'unknown';
        const mappedRole = FAMILY_ROLE_MAP[roleKey] ?? '0';

        const maritalKey = dto.maritalStatus ? String(dto.maritalStatus).toLowerCase() : 'unknown';
        const mappedMarital = MARITAL_STATUS_MAP[maritalKey] ?? '0';

        this.isHeadOfFamily = mappedRole === '0';

        const isEgyptianValue =
          (dto as any).isEgyptian === true || (dto as any).isEgyptian === 'true' ? 'true' : 'false';

        this.form.patchValue({
          familyRole: mappedRole,
          maritalStatus: mappedMarital,
          name: dto.name ?? '',
          isEgyptian: isEgyptianValue,
          nationalId: dto.nationalId ?? '',
          code: (dto as any).code ?? '',
          deathDate: dto.deathDate ? String(dto.deathDate).substring(0, 10) : null,
          parentId: this.isHeadOfFamily ? '' : dto.parentId ? String(dto.parentId) : '',
          employerId: dto.employerId ? String(dto.employerId) : '',
          insuranceSalary: dto.insuranceSalary ?? null,
          disabilityInfo: dto.disabilityInfo ?? '',
        });

        const nid = String(dto.nationalId || '').trim();
        this.applyDerivedFromNationalId(nid);
        this.updateValidationBasedOnNationality(isEgyptianValue);

        if (!dto.nationalId && dto.birthDate) {
          this.form
            .get('birthDate')
            ?.setValue(String(dto.birthDate).substring(0, 10), { emitEvent: false });
        }
      },
      error: () => {
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const newFiles = Array.from(input.files);
    const exists = new Set(this.selectedFiles.map(f => `${f.name}|${f.size}|${f.lastModified}`));

    newFiles.forEach(f => {
      const key = `${f.name}|${f.size}|${f.lastModified}`;
      if (!exists.has(key)) this.selectedFiles.push(f);
    });

    input.value = '';
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  private clearSelectedFilesUI(): void {
    this.selectedFiles = [];
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
  }

  private loadAttachments(beneficiaryId: number): void {
    this.filesManagerService
      .getBeneficiaryAttachmentsByBeneficiaryId(beneficiaryId)
      .subscribe(res => {
        this.attachments = res ?? [];
      });
  }

  downloadAttachment(att: AttachmentDto): void {
    this.filesManagerService.downloadAttachmentByAttachmentId(String(att.id)).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.filePath || 'attachment';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  private uploadSelectedFiles(beneficiaryId: number, done: () => void): void {
    if (!this.selectedFiles.length) {
      done();
      return;
    }

    let finished = 0;

    this.selectedFiles.forEach(file => {
      const formData = new FormData();
      formData.append('file', file, file.name);

      this.filesManagerService
        .uploadBeneficiaryAttachmentByBeneficiaryIdAndFile(beneficiaryId, formData)
        .subscribe({
          next: () => {
            finished++;
            if (finished === this.selectedFiles.length) done();
          },
          error: () => {
            finished++;
            if (finished === this.selectedFiles.length) done();
          },
        });
    });
  }

  viewFamilyTree(): void {
    if (!this.id) return;
    this.router.navigate(['/beneficiaries/family-tree', this.id]);
  }

  cancel(): void {
    location.reload();
  }
}
