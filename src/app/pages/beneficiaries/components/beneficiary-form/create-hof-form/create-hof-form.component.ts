import { LocalizationService } from '@abp/ng.core';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import {
  EducationalStatus,
  EmploymentStatus,
  PreviousInsuranceType,
} from '@proxy/ehealth-claims/common/enums';
import {
  FamilyRole,
  Gender,
  MaritalStatus,
} from '@proxy/ehealth-claims/common/enums/beneficiaries';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';
import { forkJoin } from 'rxjs';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';

const EGY_NID_REGEX = /^[2-3][0-9]{13}$/;

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
@Component({
  selector: 'app-create-hof-form',
  standalone: false,
  templateUrl: './create-hof-form.component.html',
  styleUrl: './create-hof-form.component.scss',
})
export class CreateHOFFormComponent implements OnInit, OnChanges {
  HOFForm: FormGroup;
  Validators = Validators;
  genderOptions: { id: string; name: string }[];
  anotheraddressOptions: { id: boolean; name: string }[];
  nationalityList: any[] = [];
  districtList: SelectedDropDownList[] = [];
  governoratList: any[] = [];
  providerList: SelectedDropDownList[] = [];
  relationToHOFList: { id: FamilyRole; name: string }[] = [];
  maritalStatusList: { id: MaritalStatus; name: string }[] = [];
  educationalStatusList: { id: EducationalStatus; name: string }[] = [];
  previousInssuranceTypeList: { id: PreviousInsuranceType; name: string }[] = [];
  employmentStatusList: { id: EmploymentStatus; name: string }[] = [];
  socialInsurance: { id: boolean; name: string }[];
  @Input() relation!: string;
  @Input() updateForm!: any;
  @Output() HOFFormFormGroup = new EventEmitter<FormGroup>();
  @Output() HOFformStatus = new EventEmitter<boolean>();
  @Output() canselHOFForm = new EventEmitter<boolean>();
  today = new Date();
  minDate = new Date('01-01-2018');
  defualtNationality: number = 2;
  constructor(
    private fb: FormBuilder,
    private customConfirmationService: CustomConfirmationService,
    private translate: LocalizationService,
    private lookupServiceService: LookupAppServicesService,
  ) {
    this.genderOptions = [
      { id: Gender.Male, name: this.translate.instant('RuleApplication::Male') },
      { id: Gender.Female, name: this.translate.instant('RuleApplication::Female') },
    ];
    this.socialInsurance = [
      { id: true, name: this.translate.instant('RuleApplication::Yes') },
      { id: false, name: this.translate.instant('RuleApplication::No') },
    ];
    this.anotheraddressOptions = [
      { id: true, name: this.translate.instant('RuleApplication::Yes') },
      { id: false, name: this.translate.instant('RuleApplication::No') },
    ];

    this.HOFForm = this.fb.group({
      // isEgyptian: ['true', Validators.required],
      nationalId: [
        '',
        [Validators.required, Validators.pattern(EGY_NID_REGEX), this.egyptNationalIdValidator()],
      ],
      firstName: [
        null,
        [
          Validators.required,
          Validators.pattern(/^[\u0621-\u064A]+$/),
          Validators.minLength(2),
          Validators.maxLength(22),
        ],
      ],
      fullName: [
        null,
        [
          Validators.required,
          Validators.pattern(/^(?:[\u0621-\u064A]{2,})(?: [\u0621-\u064A]{2,}){2,}$/),
          Validators.minLength(2),
          Validators.maxLength(80),
        ],
      ],
      gender: [null, Validators.required],
      dateOfBirth: [null, Validators.required],
      governorateBirth: [null, Validators.required],
      governorateName: [null],
      nationalityId: [2, Validators.required],
      familyRole: [FamilyRole.Self, Validators.required],
      mobileNumber: [
        null,
        [
          Validators.required,
          Validators.maxLength(11),
          Validators.pattern(/^(010|011|012|015)\d{8}$/),
        ],
      ],
      maritalStatus: [null],
      educationalStatus: [null],
      registrationDate: [this.today],
      previousInssuranceType: [null],
      anotheraddress: [false],
      newAddress: [null, [Validators.min(2), Validators.maxLength(1000)]],
      employmentStatus: [null],
      socialInsurance: [null],
      notes: [null, Validators.maxLength(1000)],
      code: [null],
      completionStatus: [null],
      isFamilyActive: [null],
      housingGovernorateId: [null, Validators.required],
      districtId: [null],
      primaryCareUnitId: [null, Validators.required],
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.updateForm.currentValue) {
      forkJoin({
        governorates: this.lookupServiceService.getGovernateDropDownList(),
        nationalities: this.lookupServiceService.getNationalityDropDownListBySelectedId(),
      }).subscribe({
        next: () => {
          this.patchData();
        },
      });
    }
  }
  ngOnInit(): void {
    this.trimLastSpace();
    this.setDefaultValues();
    this.HOFForm.statusChanges.subscribe(() => {
      this.HOFformStatus.emit(this.HOFForm.valid);
    });
    this.subscribeToAnotherAddress();
    this.setFormChanges();
  }

  setDefaultValues() {
    this.setDropDownLists();
    forkJoin({
      governorates: this.lookupServiceService.getGovernateDropDownList(),
      nationalities: this.lookupServiceService.getNationalityDropDownListBySelectedId(),
    }).subscribe(({ governorates, nationalities }) => {
      this.governoratList = governorates;
      localStorage.setItem('governoratList', JSON.stringify(this.governoratList));
      this.nationalityList = nationalities;
      this.defualtNationality = this.nationalityList.find(value => value.name == 'مصري').id;
      this.HOFForm.controls.nationalId.valueChanges.subscribe(nid => {
        this.applyDerivedFromNationalId(nid);
      });
      const storedId = localStorage.getItem('nationalId');
      if (storedId) {
        this.HOFForm.get('nationalId')?.setValue(storedId, { emitEvent: true });
      }
    });
  }
  setDropDownLists() {
    this.relationToHOFList = Object.values(FamilyRole)
      .filter(role => role === FamilyRole.Self)
      .map(role => ({
        id: role,
        name: this.translate.instant(`RuleApplication::HOF:${role}`),
      }));

    this.maritalStatusList = Object.values(MaritalStatus).map(status => ({
      id: status,
      name: this.translate.instant(`RuleApplication::HOF:${status}`),
    }));

    this.educationalStatusList = Object.values(EducationalStatus).map(status => ({
      id: status,
      name: this.translate.instant(`RuleApplication::HOF:${status}`),
    }));

    this.previousInssuranceTypeList = Object.values(PreviousInsuranceType).map(type => ({
      id: type,
      name: this.translate.instant(`RuleApplication::HOF:${type}`),
    }));

    this.employmentStatusList = Object.values(EmploymentStatus).map(status => ({
      id: status,
      name: this.translate.instant(`RuleApplication::HOF:${status}`),
    }));
  }
  // will handel if diffrent nationalty is enterned
  setNationality() {
    this.HOFForm.get('nationalityId')?.setValue(this.defualtNationality);
  }
  patchData() {
    if (this.updateForm) {
      this.HOFForm.patchValue(this.updateForm);
      if (this.governoratList.length == 0)
        this.governoratList = JSON.parse(localStorage.getItem('governoratList') || '');
      this.HOFForm.controls.nationalId.valueChanges.subscribe(nid => {
        this.applyDerivedFromNationalId(nid);
      });
      this.setNationality();
      this.HOFForm.patchValue({ nationalId: this.updateForm.nationalId });
      this.HOFForm.patchValue(
        { housingGovernorateId: this.updateForm.housingGovernorateId },
        { emitEvent: false },
      );
    }
  }
  private subscribeToAnotherAddress(): void {
    const flagControl = this.HOFForm.get('anotheraddress');
    const newAddressControl = this.HOFForm.get('newAddress');

    flagControl?.valueChanges.subscribe(value => {
      if (value === true) {
        newAddressControl?.enable({ emitEvent: false });
        newAddressControl?.setValidators([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(1000),
        ]);
      } else {
        newAddressControl?.clearValidators();
        newAddressControl?.disable({ emitEvent: false });
      }
      newAddressControl?.updateValueAndValidity({ emitEvent: false });
    });

    if (flagControl?.value === true) {
      newAddressControl?.enable({ emitEvent: false });
      newAddressControl?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(1000),
      ]);
      newAddressControl?.updateValueAndValidity({ emitEvent: false });
    }
  }
  saveHOF() {
    if (this.HOFForm.get('anotheraddress')?.value !== true) {
      this.HOFForm.get('newAddress')?.setValue(null, { emitEvent: false });
      this.HOFForm.get('newAddress')?.clearValidators();
      this.HOFForm.get('newAddress')?.updateValueAndValidity({ emitEvent: false });
    }
    this.HOFForm.markAllAsTouched();
    this.HOFForm.updateValueAndValidity();
    if (!this.HOFForm.valid) {
      this.customConfirmationService.error(
        this.translate.instant('RuleApplication::Common:FillRequiredFields'),
        this.translate.instant('RuleApplication::Common:Error'),
        3000,
      );
      return;
    }
    this.HOFForm.updateValueAndValidity();
    this.customConfirmationService.warnConfrim(
      this.translate.instant('RuleApplication::Families:SaveHOF'),
      this.translate.instant('RuleApplication::Common:Alert'),
      {
        accept: () => {
          this.HOFFormFormGroup.emit(this.HOFForm);
        },
        reject: () => {},
        dismiss: () => {},
      },
    );
    this.HOFForm.updateValueAndValidity();
  }
  cansel() {
    this.canselHOFForm.emit(false);
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
    gender?: Gender.Female | Gender.Male;
    govermentCode?: string;
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
    const gender = genderDigit % 2 === 0 ? Gender.Female : Gender.Male;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    if (age < 0 || age > 120) return { isValid: false };

    const birthIso = `${String(dd).padStart(2, '0')}-${String(mm).padStart(2, '0')}-${year}`;

    return { isValid: true, birthDate: birth, birthIso, age, gender, govermentCode: gov };
  }
  private applyDerivedFromNationalId(nid: string): void {
    const parsed = this.parseEgyptNationalId(nid);
    const nationalIdControl = this.HOFForm.get('nationalId');

    if (!parsed.isValid) {
      this.HOFForm.patchValue(
        { gender: '', dateOfBirth: '', governorateBirth: '', governorateName: '' },
        { emitEvent: false },
      );
      this.HOFForm.get('dateOfBirth')?.setValue('', { emitEvent: false });
      nationalIdControl?.setErrors({ invalidNationalId: true });
      nationalIdControl?.markAsTouched();
      return;
    }

    const govMatch = this.governoratList?.find(g => g.code === parsed.govermentCode);
    const governorateId = govMatch ? govMatch.id : '';
    const governorateName = govMatch ? govMatch?.name : '';

    const gender = parsed.gender ?? '';
    const dateOfBirth = parsed.birthIso ?? '';
    const hasAllValues = !!gender && !!dateOfBirth && !!governorateId && !!governorateName;

    if (!hasAllValues) {
      this.HOFForm.patchValue(
        { gender: '', dateOfBirth: '', governorateBirth: '', governorateName: '' },
        { emitEvent: false },
      );
      nationalIdControl?.setErrors({ invalidNationalId: true });
      nationalIdControl?.markAsTouched();
      return;
    }

    nationalIdControl?.setErrors(null);

    this.HOFForm.patchValue(
      {
        gender,
        dateOfBirth: parsed.age != null ? String(parsed.age) : '',
        governorateBirth: governorateId,
        governorateName,
      },
      { emitEvent: false },
    );

    this.HOFForm.get('dateOfBirth')?.setValue(dateOfBirth, { emitEvent: false });
    this.setNationality();
  }
  trimLastSpace() {
    this.HOFForm.get('fullName')?.valueChanges.subscribe(res => {
      if (typeof res === 'string' && res.endsWith(' ')) {
        if (/.\s$/.test(res)) {
          const trimmed = res.slice(0, -1); // remove the last space
          this.HOFForm.get('fullName')?.setValue(trimmed, { emitEvent: false });
        }
      }
    });
  }
  setFormChanges() {
    this.HOFForm.get('housingGovernorateId')?.valueChanges?.subscribe(value => {
      const district = this.HOFForm.get('districtId');
      const primaryCareUnit = this.HOFForm.get('primaryCareUnitId');
      primaryCareUnit?.setValue(null);
      primaryCareUnit?.setValue(null);

      if (value) {
        district?.enable();
        primaryCareUnit?.enable();
        // keep required validator always
        primaryCareUnit?.setValidators([Validators.required]);
        primaryCareUnit?.updateValueAndValidity();

        this.getDistrictByGovernateId(value);
        this.getProviderByGovernateId(value);
      } else {
        district?.reset();
        district?.disable();
        // reset value but keep required validator
        primaryCareUnit?.setValidators([Validators.required]);
        primaryCareUnit?.updateValueAndValidity();
        console.log(primaryCareUnit);
      }
    });
  }
  getDistrictByGovernateId(id: number) {
    this.lookupServiceService.getAreaDropDownListByGovId(id).subscribe({
      next: res => {
        this.districtList = res;
      },
    });
  }
  getProviderByGovernateId(id: number) {
    this.lookupServiceService.getProviderByGovernateIdByGovId(id).subscribe({
      next: res => {
        this.providerList = res;
      },
    });
  }
}
