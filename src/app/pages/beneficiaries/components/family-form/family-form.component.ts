import { LocalizationService, PermissionService } from '@abp/ng.core';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import { BeneficiariesService } from '@proxy/ehealth-claims/domains/beneficiaries';
import { FamilyService } from '@proxy/ehealth-claims/domains/family';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';
import {
  CreateFamilyDto,
  FamilyDto,
  UpdateFamilyDto,
} from '@proxy/ehealth-claims/view-models/family';
import { FamilyPermissions } from 'src/app/shared/models/appPermissions';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';

@Component({
  selector: 'app-family-form',
  templateUrl: './family-form.component.html',
  styleUrl: './family-form.component.scss',
})
export class FamilyFormComponent implements OnInit, AfterViewInit {
  @Input() HOFId: number = 43;
  @Input() familyMembersCount: number = 0;
  Validators = Validators;
  familyForm!: FormGroup;
  viewMode: string | undefined = '';
  editFamilyId: number | undefined = 0;
  cards!: any[];
  completionStatus!: string;
  showValidationSummary = false;
  providerList: SelectedDropDownList[] = [];
  familyCode?: string = '';
  updateFamilyInfo!: boolean;
  constructor(
    private fb: FormBuilder,
    private _customConfirmationService: CustomConfirmationService,
    private _familyService: FamilyService,
    private _beneficiariesService: BeneficiariesService,
    private activatedRoute: ActivatedRoute,
    private _localizationService: LocalizationService,
    private _lookupServiceService: LookupAppServicesService,
    private router: Router,
    public permission: PermissionService,
  ) {
    this.updateFamilyInfo = this.permission.getGrantedPolicy(
      FamilyPermissions.FamilyPermissionsUpdate,
    );
  }

  ngAfterViewInit(): void {
    this.getHeadoffamily(this.HOFId);
  }

  ngOnInit(): void {
    if (!this.HOFId) {
      this.HOFId = 43;
    }

    // ─── Set view mode from route ──────────────────────────────

    this.activatedRoute.paramMap.subscribe(params => {
      const action = params.get('action');

      if (action === 'edit') {
        this.viewMode = 'edit';
      } else if (action === 'view') {
        this.viewMode = 'view';
      } else {
        this.viewMode = 'create';
      }
      this.getHeadoffamily(this.HOFId);
    });

    // ─── Build form ───────────────────────────────────────────
    this.familyForm = this.fb.group({
      basicDetails: this.fb.group({
        beneficiaryId: [null],
        id: [null],
        isHofEgyptian: [{ value: null, disabled: true }, Validators.required],
        hofNid: [{ value: null, disabled: true }, Validators.required],
        hofFirstName: [{ value: null, disabled: true }, Validators.required],
        hogFullName: [{ value: null, disabled: true }, Validators.required],
        mobilePhone: [{ value: null, disabled: true }, Validators.required],
        getHeadoffamily: [{ value: null, disabled: true }],
        familyDeathsCount: [null, [Validators.max(50), Validators.min(0)]],
        familyAddress: [null, [Validators.minLength(2), Validators.maxLength(1000)]],
        hasDifferentAddress: [null],
        familyMembersCount: [{ value: 0, disabled: true }],
        newAddress: [
          { value: null, disabled: true },
          [Validators.minLength(2), Validators.maxLength(1000)],
        ],

        housingGovernorateId: [null],
        districtId: [null],
        primaryCareUnitId: [null],
        homePhone: [null, [Validators.minLength(8), Validators.maxLength(8)]],
        workPhone: [null, [Validators.minLength(8), Validators.maxLength(11)]],
        nearestPhone: [null, [Validators.minLength(8), Validators.maxLength(11)]],
      }),
      housingCondition: this.fb.group({
        roomsCountTotal: [null, [Validators.min(0), Validators.max(50)]],
        roomsCountForSleeping: [null, [Validators.min(0), Validators.max(50)]],
        ventilationStatus: [null],
        sewage: [null],
        waterSourceType: [null],
        lightingType: [null],
        hasBirdsOrAnimalsAtHome: [null],
        hasBarn: [null],
        barnLocationType: [null],
        notes: [null, Validators.maxLength(1000)],
      }),
      socialResearch: this.fb.group({
        incomeType: [null],
        averageMonthlyIncome: [null, [Validators.min(1), Validators.max(100000000)]],
        hasChronicDiseases: [null],
        hasDisabilities: [null],
        receivesSocialSecurityPension: [null],
        breadwinnerRelationIfFatherDeceased: [null],
        isEligibleForFreeService: [null],
        notes: [null, Validators.maxLength(1000)],
      }),
    });
  }

onSubmitFamilyForm(): void {
  if (this.familyForm.valid) {
    this.showValidationSummary = true;
    const { basicDetails, housingCondition, socialResearch } = this.familyForm.getRawValue();
    const { id, ...cleanBasicDetails } = basicDetails;

    const payload = {
      ...cleanBasicDetails,
      housingCondition,
      socialResearch,
    };

    if (payload.familyAddress === '') {
      payload.familyAddress = null;
    }

    if (basicDetails.hasDifferentAddress != true) {
      basicDetails.newAddress = null;
      payload.newAddress = null;
    } else if (payload.newAddress === '') {
      payload.newAddress = null;
    }

    if (id) {
      this.updateFamilyForm({ id, ...payload });
      this.familyForm.updateValueAndValidity();
    } else {
      this.createFamilyForm(payload);
    }
  } else {
    this.showValidationSummary = true;
  }
}

  createFamilyForm(payload: CreateFamilyDto) {
    this._familyService.createByInput(payload).subscribe({
      next: res => {
        const message = this._localizationService.instant(
          'RuleApplication::Common:FamilySucessCreate',
        );
        this._customConfirmationService.success(
          message,
          this._localizationService.instant('RuleApplication::Common:Sucess'),
          5000,
        );

        if (res) {
          const familyId = Number(res);
          this.familyForm.get('basicDetails')?.patchValue({ id: familyId }, { emitEvent: false });
          this.editFamilyId = familyId;

          // Navigate to View
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/beneficiaries/view', this.HOFId]);
          });
        }
      },
      error: () => {},
      complete: () => {},
    });
  }

  updateFamilyForm(payload: UpdateFamilyDto) {
    this._familyService.updateByInput(payload).subscribe({
      next: () => {
        const message = this._localizationService.instant(
          'RuleApplication::Common:FamilySucessUpdate',
        );
        this._customConfirmationService.success(
          message,
          this._localizationService.instant('RuleApplication::Common:Sucess'),
          5000,
        );
        //   // Navigate to View
        const routeToView = localStorage.getItem('fromViewFamForm');
        if (routeToView) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/beneficiaries/view', this.HOFId]);
            // localStorage.removeItem('fromViewFamForm')
          });
        }

        this._familyService.getByIdById(payload.id).subscribe({
          next: res => this.patchFamilydata(res),
          error: () => {},
        });
      },
      error: () => {},
    });
  }

  getHeadoffamily(HOFId: number) {
    this._beneficiariesService.getById(HOFId).subscribe({
      next: res => {
        const HOFData = res;
        this.editFamilyId = res.familyId;
        //this.completionStatus = res.completionStatus??'';
        if (res.familyId) {
          if (this.viewMode == 'edit') {
            this.loadFamilyData(res);
          }
          if (this.viewMode == 'view') {
            this.loadFamilyData(res);
          }
        }
        this.familyForm.patchValue({
          basicDetails: {
            id: HOFData?.familyId,
            beneficiaryId: HOFData?.id,
            isHofEgyptian: HOFData?.isEgyptian,
            hofNid: HOFData?.nationalId,
            hofFirstName: HOFData?.firstName,
            hogFullName: HOFData?.name,
            mobilePhone: HOFData?.mobileNumber,
            housingGovernorateId: HOFData?.birthGovernorateId,
            primaryCareUnitId: res.primaryCareUnitId,
          },
        });
      },
      error: () => {
        this._customConfirmationService.error('Failed to load head of family', 'Error', 5000);
      },
    });
  }

  loadFamilyData(res: any) {
    this._familyService.getByIdById(res.familyId).subscribe({
      next: res => {
        if (this.viewMode == 'edit') {
          this.patchFamilydata(res);
        } else if (this.viewMode == 'view') {
          this.setFamilyInfoCards(res);
        }
      },
      error: () => {
        this._customConfirmationService.error('Failed to load family data', 'Error', 5000);
      },
    });
  }

  patchFamilydata(res: FamilyDto) {
    const basicDetails = this.familyForm.get('basicDetails');

    // ─── Enable controls before patching ──────────────────────
    if (res.familyAddress && res.familyAddress.length >= 2) {
      basicDetails?.get('housingGovernorateId')?.enable({ emitEvent: false });
    }
    if (res.housingGovernorateId) {
      basicDetails?.get('housingGovernorateId')?.enable({ emitEvent: false });
    }
    if (res.hasDifferentAddress) {
      basicDetails?.get('newAddress')?.enable({ emitEvent: false });
    }

    this.completionStatus = res.completionStatus ?? '';
    this.familyCode = res.code;
    this.familyForm.patchValue({
      basicDetails: {
        familyDeathsCount: res.familyDeathsCount,
        familyAddress: res.familyAddress,
        hasDifferentAddress: res.hasDifferentAddress,
        newAddress: res.newAddress,
        housingGovernorateId: res.housingGovernorateId,
        districtId: res.districtId,
        homePhone: res.homePhone,
        workPhone: res.workPhone,
        nearestPhone: res.nearestPhone,
        familyMembersCount: this.familyMembersCount,
      },
      housingCondition: res.housingCondition,
      socialResearch: res.socialResearch,
    });
    if (res.housingGovernorateId) {
      basicDetails?.get('districtId')?.enable({ emitEvent: false });
      basicDetails?.get('primaryCareUnitId')?.enable({ emitEvent: false });
      this._lookupServiceService
        .getProviderByGovernateIdByGovId(res.housingGovernorateId)
        .subscribe({
          next: list => {
            this.providerList = list;
            basicDetails?.patchValue(
              {
                primaryCareUnitId:
                  res.primaryCareUnitId != null ? Number(res.primaryCareUnitId) : null,
              },
              { emitEvent: false },
            );
          },
        });
    }
  }
  private relationValue(v: any): string {
    if (v == null || v === '') return '—';
    const key = String(v).charAt(0).toLowerCase() + String(v).slice(1);
    return this._localizationService.instant(`RuleApplication::HOF:${key}`);
  }
  setFamilyInfoCards(res: FamilyDto) {
    this.cards = [];
    const headOfFamily = res?.headOfFamily ?? ({} as typeof res.headOfFamily);
    const housingCondition = res?.housingCondition ?? ({} as typeof res.housingCondition);
    const socialResearch = res?.socialResearch ?? ({} as typeof res.socialResearch);

    this.cards.push(
      {
        header: this._localizationService.instant('RuleApplication::Common:BasicDetails'),
        color: '#4CAF50',
        items: [
          {
            title: this._localizationService.instant('RuleApplication::HOF:HOFNID'),
            value: headOfFamily.nationalId,
            icon: 'bi bi-person-badge',
          },
          {
            title: this._localizationService.instant('RuleApplication::HOF:IsHOFEgyptian'),
            value: this.boolValue(res.isHofEgyptian),
            icon: 'bi bi-flag',
          },
          {
            title: this._localizationService.instant('RuleApplication::HOF:HOFFristName'),
            value: headOfFamily.firstName,
            icon: 'bi bi-person',
          },
          {
            title: this._localizationService.instant('RuleApplication::HOF:HOFFullName'),
            value: headOfFamily.name,
            icon: 'bi bi-person-lines-fill',
          },
          {
            title: this._localizationService.instant('RuleApplication::HOF:HOFmobileNumber'),
            value: headOfFamily.mobileNumber,
            icon: 'bi bi-phone',
          },
          {
            title: this._localizationService.instant('RuleApplication::HOF:HOFHOFfamilyCount'),
            value: res.familyMembersCount,
            icon: 'pi pi-users',
          },
          {
            title: this._localizationService.instant('RuleApplication::HOF:HOFHOFDeathCount'),
            value: res.familyDeathsCount,
            icon: 'bi bi-heartbreak',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:FamilyAddress'),
            value: res.familyAddress,
            icon: 'bi bi-geo-alt',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:AnotherAddress'),
            value: this.boolValue(res.hasDifferentAddress),
            icon: 'bi bi-house-door',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:NewAddress'),
            value: res.newAddress,
            icon: 'bi bi-house-add',
          },
          {
            title: this._localizationService.instant(
              'RuleApplication::Families:HousingGovernorate',
            ),
            value: res.housingGovernorate,
            icon: 'bi bi-map',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:District'),
            value: res.district,
            icon: 'bi bi-building',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:HomePhoneNumber'),
            value: res.homePhone,
            icon: 'bi bi-telephone',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:WorkPhoneNumber'),
            value: res.workPhone,
            icon: 'bi bi-telephone-forward',
          },
          {
            title: this._localizationService.instant(
              'RuleApplication::Families:NearestPhoneNumber',
            ),
            value: res.nearestPhone,
            icon: 'bi bi-telephone-inbound',
          },
        ],
      },
      {
        header: this._localizationService.instant('RuleApplication::Common:HousingCondition'),
        color: '#2196F3',
        items: [
          {
            title: this._localizationService.instant('RuleApplication::Families:TotalRooms'),
            value: housingCondition.roomsCountTotal,
            icon: 'bi bi-house-down',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:Bedrooms'),
            value: housingCondition.roomsCountForSleeping,
            icon: 'bi bi-bed',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:Ventilation'),
            value: this.enumValue(housingCondition.ventilationStatus),
            icon: 'bi bi-wind',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:WaterSource'),
            value: this.enumValue(housingCondition.waterSourceType),
            icon: 'bi bi-droplet',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:Sewage'),
            value: this.enumValue(housingCondition.sewage),
            icon: 'pi pi-trash',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:LightingType'),
            value: this.enumValue(housingCondition.lightingType),
            icon: 'pi pi-lightbulb',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:AnimalsAtHome'),
            value: this.boolValue(housingCondition.hasBirdsOrAnimalsAtHome),
            icon: 'bi bi-bookmark-heart',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:BarnExisted'),
            value: this.boolValue(housingCondition.hasBarn),
            icon: 'pi pi-home',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:BarnLocation'),
            value: this.enumValue(housingCondition.barnLocationType),
            icon: 'pi pi-map-marker',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:HousingNotes'),
            value: housingCondition.notes,
            icon: 'pi pi-pencil',
          },
        ],
      },
      {
        header: this._localizationService.instant('RuleApplication::Common:SocialResearch'),
        color: '#FF9800',
        items: [
          {
            title: this._localizationService.instant('RuleApplication::Families:FamilyIncomeType'),
            value: this.enumValue(socialResearch.incomeType),
            icon: 'bi bi-cash',
          },
          {
            title: this._localizationService.instant(
              'RuleApplication::Families:HofAverageMonthlyIncome',
            ),
            value: socialResearch.averageMonthlyIncome,
            icon: 'pi pi-dollar',
          },
          {
            title: this._localizationService.instant(
              'RuleApplication::Families:HasChronicDiseases',
            ),
            value: this.boolValue(socialResearch.hasChronicDiseases),
            icon: 'bi bi-heart-pulse',
          },
          {
            title: this._localizationService.instant(
              'RuleApplication::Families:HasDisabilityCases',
            ),
            value: this.boolValue(socialResearch.hasDisabilities),
            icon: 'pi pi-flag-fill',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:ReceivesPension'),
            value: this.boolValue(socialResearch.receivesSocialSecurityPension),
            icon: 'pi pi-briefcase',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:HofFatherDeceased'),
            value: this.relationValue(socialResearch.breadwinnerRelationIfFatherDeceased),
            icon: 'pi pi-users',
          },
          {
            title: this._localizationService.instant(
              'RuleApplication::Families:EligibleFreeService',
            ),
            value: this.boolValue(socialResearch.isEligibleForFreeService),
            icon: 'pi pi-check-circle',
          },
          {
            title: this._localizationService.instant('RuleApplication::Families:HousingNotes'),
            value: socialResearch.notes,
            icon: 'pi pi-pencil',
          },
        ],
      },
    );
  }
  private boolValue(v: any): string {
    if (v === true || v === false) {
      return this._localizationService.instant(
        v ? 'RuleApplication::Common:true' : 'RuleApplication::Common:false',
      );
    }
    return v ?? '—';
  }

  private enumValue(v: any, prefix = 'Families'): string {
    if (v == null || v === '') return '—';
    return this._localizationService.instant(`RuleApplication::${prefix}:${v}`);
  }

  private toCamelCase(str: string): string {
    if (!str) return '';
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  private buildMemberValue(member: any, isHof: boolean): string {
    const parts: string[] = [];

    if (member.nationalId) {
      parts.push(
        `${this._localizationService.instant('RuleApplication::Beneficiaries:NationalId')}: ${member.nationalId}`,
      );
    }
    if (member.birthDate) {
      parts.push(
        `${this._localizationService.instant('RuleApplication::Beneficiaries:BirthDate')}: ${member.birthDate}`,
      );
    }

    const role = isHof
      ? this._localizationService.instant('RuleApplication::Families:HOF')
      : (member.familyRole ?? '—');
    parts.push(
      `${this._localizationService.instant('RuleApplication::Beneficiaries:FamilyRole')}: ${role}`,
    );

    const status = member.isActive
      ? this._localizationService.instant('RuleApplication::Beneficiaries:Active')
      : this._localizationService.instant('RuleApplication::Beneficiaries:Inactive');
    parts.push(
      `${this._localizationService.instant('RuleApplication::Beneficiaries:Status')}: ${status}`,
    );

    const completion =
      member.completionStatus === 'Complete'
        ? this._localizationService.instant('RuleApplication::Beneficiaries:Complete')
        : this._localizationService.instant('RuleApplication::Beneficiaries:Incomplete');
    parts.push(
      `${this._localizationService.instant('RuleApplication::Beneficiaries:CompletionStatus')}: ${completion}`,
    );

    return parts.join(' | ');
  }
  onEditRedirect() {
    localStorage.setItem('fromViewFamForm', 'true');
    this.viewMode = 'edit';
    this.router.navigate(['/beneficiaries/edit', this.HOFId]);
  }
}
