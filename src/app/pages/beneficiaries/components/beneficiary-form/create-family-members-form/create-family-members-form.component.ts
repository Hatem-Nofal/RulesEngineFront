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
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { BeneficiariesService } from '@proxy/ehealth-claims/domains/beneficiaries';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups/lookup-app-services.service';
import { forkJoin } from 'rxjs';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';
import { BeneficiariyMemberService } from '../../../beneficiariy-member.service';

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
  selector: 'app-create-family-members-form',
  standalone: false,
  templateUrl: './create-family-members-form.component.html',
  styleUrl: './create-family-members-form.component.scss',
})
export class CreateFamilyMembersFormComponent implements OnInit, OnChanges {
  familyForm: FormArray;
  Validators = Validators;
  genderOptions: { id: string; name: string }[];
  anotheraddressOptions: { id: boolean; name: string }[];
  nationalityList: any[] = [];
  districtList: SelectedDropDownList[] = [];
  governoratList: SelectedDropDownList[] = [];
  providerList: SelectedDropDownList[] = [];
  relationToHOFList: { id: FamilyRole; name: string }[] = [];
  maritalStatusList: { id: MaritalStatus; name: string }[] = [];
  educationalStatusList: { id: EducationalStatus; name: string }[] = [];
  previousInssuranceTypeList: { id: PreviousInsuranceType; name: string }[] = [];
  employmentStatusList: { id: EmploymentStatus; name: string }[] = [];
  optionNationality: { id: boolean; name: string }[];
  @Output() familyMemberFormGroup = new EventEmitter<FormArray>();
  @Output() familyMemberformStatus = new EventEmitter<boolean>();
  @Output() canselFamilyMemeberForm = new EventEmitter<boolean>();
  @Input() updateForm!: any;
  @Input() activeIndex!: number | undefined;
  today = new Date();
  minDate = new Date('01-01-2018');
  defualtNationality: number = 2;
  gender = Gender;
  @Input() hofNationalId: string = '';
  constructor(
    private fb: FormBuilder,
    private beneficiariesService: BeneficiariesService,
    private customConfirmationService: CustomConfirmationService,
    private translate: LocalizationService,
    private lookupServiceService: LookupAppServicesService,
    private beneficiariyMemberService: BeneficiariyMemberService,
  ) {
    this.genderOptions = [
      { id: Gender.Male, name: this.translate.instant('RuleApplication::Male') },
      { id: Gender.Female, name: this.translate.instant('RuleApplication::Female') },
    ];
    this.optionNationality = [
      { id: true, name: this.translate.instant('RuleApplication::Yes') },
      { id: false, name: this.translate.instant('RuleApplication::No') },
    ];
    this.anotheraddressOptions = [
      { id: true, name: this.translate.instant('RuleApplication::Yes') },
      { id: false, name: this.translate.instant('RuleApplication::No') },
    ];
    this.familyForm = this.fb.array([this.beneficiariyMemberService.createFamilyForm()]);
  }
  ngOnInit(): void {
    this.setDropDownLists();
    this.getGovernorateDropdownList();
    this.getNationalityDropdownList();

    this.familyForm.statusChanges.subscribe(() => {
      this.familyMemberformStatus.emit(this.familyForm.valid);
    });

    this.subscribeToNationalId(this.familyForm.at(0) as FormGroup, 0);
    this.subscribeToStripSpaces(this.familyForm.at(0) as FormGroup);
    this.subscribeToAnotherAddress(this.familyForm.at(0) as FormGroup);
    this.trimLastSpace();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.updateForm?.currentValue) {
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
  onNationalIdBlur(event: Event, id: string, index: number) {
    if (!event || !id) return;

    const member = this.familyForm.at(index) as FormGroup;
    const control = member.get('nationalId');

    if (!control?.valid) return;

    if (control.errors?.['nidExists']) {
      const { nidExists, ...rest } = control.errors;
      control.setErrors(Object.keys(rest).length ? rest : null);
    }
    if (this.hofNationalId && this.hofNationalId === id) {
      control.setErrors({ ...control.errors, nidExists: true });
      control.markAsTouched();
      this.customConfirmationService.error(
        this.translate.instant('RuleApplication::Families:NIDErrorForSameFamily'),
        this.translate.instant('RuleApplication::Common:Error'),
        2000,
      );
      return;
    }

    const duplicateMember = this.familyForm.controls.some((group, i) => {
      if (i === index) return false;
      return (group as FormGroup).get('nationalId')?.value === id;
    });

    if (duplicateMember) {
      control.setErrors({ ...control.errors, nidExists: true });
      control.markAsTouched();
      this.customConfirmationService.error(
        this.translate.instant('RuleApplication::Families:NIDErrorForSameFamily'),
        this.translate.instant('RuleApplication::Common:Error'),
        2000,
      );
      return;
    }

    this.beneficiariesService.searchByNationalIdById(id).subscribe({
      next: result => {
        if (result) {
          control.setErrors({ ...control.errors, nidExists: true });
          control.markAsTouched();
          this.customConfirmationService.error(
            this.translate.instant('RuleApplication::Families:NIDError'),
            this.translate.instant('RuleApplication::Common:Error'),
            2000,
          );
        } else {
          if (control.errors?.['nidExists']) {
            const { nidExists, ...rest } = control.errors;
            control.setErrors(Object.keys(rest).length ? rest : null);
          }
        }
      },
      error: () => {},
    });
  }

  private subscribeToAnotherAddress(group: FormGroup): void {
    const flagControl = group.get('anotheraddress');
    const newAddressControl = group.get('newAddress');

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
  patchData() {
    if (this.updateForm.length > 0) {
      this.familyForm.clear();

      this.updateForm?.forEach((member: any, index: number) => {
        const group = this.beneficiariyMemberService.createFamilyForm();
        group.patchValue(member);
        this.familyForm.push(group);
        this.subscribeToNationalId(this.familyForm.at(index) as FormGroup, index);
        this.subscribeToAnotherAddress(this.familyForm.at(index) as FormGroup);

        this.setNationality(index);
        if (index == this.activeIndex) {
          this.setFormChanges();
        }
        this.familyForm.at(index).patchValue(
          {
            nationalId: member?.nationalId,
            anotheraddress: member?.anotheraddress ?? false,
            nationalityId: this.defualtNationality,
            housingGovernorateId: member.housingGovernorateId,
            primaryCareUnitId:member?.primaryCareUnitId
          },
          { emitEvent: true },
        );

        this.familyForm.at(index).get('nationalId')?.value
          ? this.familyForm.at(index).get('nationalId')?.disable({ emitEvent: false })
          : this.familyForm.at(index).get('nationalId')?.enable({ emitEvent: false });

        if (this.familyForm.at(index).get('nationalId')?.value) {
          this.familyForm.at(index).get('firstName')?.disable({ emitEvent: false });
          this.familyForm.at(index).get('fullName')?.disable({ emitEvent: false });
          this.familyForm.at(index).get('registrationDate')?.disable({ emitEvent: false });
        }
      });
    }
  }
  addPerson(): void {
    this.activeIndex = undefined;
    const newMember = this.beneficiariyMemberService.createFamilyForm();
    this.familyForm.push(newMember);
    this.subscribeToNationalId(newMember, this.familyForm.length - 1);
    this.subscribeToStripSpaces(newMember);
    this.subscribeToAnotherAddress(newMember);
    this.trimLastSpace();
  }

  deletePerson(index: number): void {
    this.familyForm.removeAt(index);
  }

 getGovernorateDropdownList() {
  const cached = localStorage.getItem('governoratList');
  let governoratList: SelectedDropDownList[] | null = null;

  if (cached) {
    try {
      governoratList = JSON.parse(cached);
    } catch {
      governoratList = null;
    }
  }

  if (governoratList) {
    this.governoratList = governoratList;
  } else {
    this.lookupServiceService.getGovernateDropDownList().subscribe({
      next: res => {
        this.governoratList = res;
      },
      error: () => {},
      complete: () => {},
    });
  }
}
  getNationalityDropdownList() {
    this.lookupServiceService.getNationalityDropDownListBySelectedId().subscribe({
      next: res => {
        this.nationalityList = res; ///.map(item=>({...item,id:item?.name}));
        this.defualtNationality = this.nationalityList.find(value => value.name == 'مصري').id;
      },
      error: () => {},
      complete: () => {},
    });
  }
  setDropDownLists() {
    this.relationToHOFList = Object.values(FamilyRole)
      .filter(role => role !== FamilyRole.HeadOfFamily) // ← remove HeadOfFamily
      .map(role => ({
        id: role,
        name: this.translate.instant(`RuleApplication::HOF:${role}`),
        disabled: role === FamilyRole.Self, // ← keep Self disabled
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
  setNationality(index: number) {
    this.familyForm.at(index).get('nationalityId')?.setValue(this.defualtNationality);
  }
  private subscribeToStripSpaces(group: FormGroup): void {
    ['firstName', 'nationalId'].forEach(field => {
      group.get(field)?.valueChanges.subscribe(value => {
        if (value && /\s/.test(value)) {
          group.get(field)?.setValue(value.replace(/\s/g, ''), { emitEvent: false });
        }
      });
    });
    this.familyForm.updateValueAndValidity();
    group.get('fullName')?.valueChanges.subscribe(value => {
      if (value && /^\s/.test(value)) {
        group.get('fullName')?.setValue(value.replace(/^\s+/, ''), { emitEvent: false });
      }
    });
    this.familyForm.updateValueAndValidity();
  }
  saveFamilyMembers() {
    this.familyForm.controls.forEach(group => {
      const g = group as FormGroup;

      g.markAllAsTouched();

      if (g.get('anotheraddress')?.value !== true) {
        g.get('newAddress')?.clearValidators();
        g.get('newAddress')?.setValue(null, { emitEvent: false });
        g.get('newAddress')?.updateValueAndValidity({ emitEvent: false });
      }

      g.updateValueAndValidity({ emitEvent: false });
    });

    if (!this.familyForm.valid) {
      this.familyForm.updateValueAndValidity();
      this.customConfirmationService.error(
        this.translate.instant('RuleApplication::Common:FillRequiredFields'),
        this.translate.instant('RuleApplication::Common:Error'),
        3000,
      );
      return;
    }

    this.customConfirmationService.warnConfrim(
      this.translate.instant('RuleApplication::Families:SaveHOF'),
      this.translate.instant('RuleApplication::Common:Alert'),
      {
        accept: () => {
          this.familyMemberFormGroup.emit(this.familyForm);
        },
        reject: () => {},
        dismiss: () => {},
      },
    );
  }
  trimLeading(control: AbstractControl | null, event: Event): void {
    const input = (event.target as HTMLInputElement).value.replace(/^\s+/, '');
    control?.setValue(input, { emitEvent: false });
  }

  trimValue(control: AbstractControl | null): void {
    const trimmed = control?.value?.trim();
    control?.setValue(trimmed, { emitEvent: false });
  }
  cansel() {
    this.canselFamilyMemeberForm.emit(false);
  }
  // NID Validations

  // private egyptNationalIdValidator() {
  //   return (control: any) => {
  //     const value = String(control.value || '').trim();
  //     if (!value) return null;

  //     if (!EGY_NID_REGEX.test(value)) return { nationalIdInvalid: true };

  //     const parsed = this.parseEgyptNationalId(value);
  //     return parsed.isValid ? null : { nationalIdInvalid: true };
  //   };
  // }

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
  private applyDerivedFromNationalId(nid: string, index: number): void {
    const parsed = this.parseEgyptNationalId(nid);
    const memberGroup = this.familyForm.at(index) as FormGroup;
    const nationalIdControl = memberGroup.get('nationalId');

    if (!parsed.isValid) {
      memberGroup.patchValue({ gender: '', dateOfBirth: '' }, { emitEvent: false });
      memberGroup.get('dateOfBirth')?.setValue('', { emitEvent: false });
      nationalIdControl?.setErrors({ invalidNationalId: true });
      nationalIdControl?.markAsTouched();
      return;
    }

    const govMatch = this.governoratList?.find(g => g.code === parsed.govermentCode);
    const governorateId = govMatch ? govMatch.id : '';
    const governorateName = govMatch ? govMatch?.name : '';

    // ─── Validate all derived values are present ──────────────
    const gender = parsed.gender ?? '';
    const dateOfBirth = parsed.birthIso ?? '';
    const hasAllValues = !!gender && !!dateOfBirth && !!governorateId && !!governorateName;

    if (!hasAllValues) {
      // ─── Clear fields and mark invalid ──────────────────────
      memberGroup.patchValue(
        { gender: '', dateOfBirth: '', governorateBirth: '', governorateName: '' },
        { emitEvent: false },
      );
      memberGroup.get('dateOfBirth')?.setValue('', { emitEvent: false });
      nationalIdControl?.setErrors({ invalidNationalId: true });
      nationalIdControl?.markAsTouched();
      return;
    }

    nationalIdControl?.setErrors(null);

    memberGroup.patchValue(
      {
        gender,
        dateOfBirth: parsed.age != null ? String(parsed.age) : '',
        governorateBirth: governorateId,
        governorateName,
      },
      { emitEvent: false },
    );

    memberGroup.get('dateOfBirth')?.setValue(dateOfBirth, { emitEvent: false });
    this.setNationality(index);
  }
  private subscribeToNationalId(group: FormGroup, index: number): void {
    group.get('nationalId')?.valueChanges.subscribe(nid => {
      const control = group.get('nationalId');
      if (control?.errors?.['nidExists']) {
        const { nidExists, ...rest } = control.errors;
        control.setErrors(Object.keys(rest).length ? rest : null);
      }

      if (nid) {
        this.applyDerivedFromNationalId(nid, index);
      }
    });
  }
  trimLastSpace() {
    const familyFormArray = this.familyForm as FormArray;
    familyFormArray.controls.forEach((group: AbstractControl, index: number) => {
      const fullNameControl = group.get('fullName');
      if (fullNameControl) {
        fullNameControl.valueChanges.subscribe((res: string) => {
          if (typeof res === 'string' && res.endsWith(' ')) {
            // Ends with character + space only
            if (/.\s$/.test(res)) {
              const trimmed = res.slice(0, -1); // remove last space
              fullNameControl.setValue(trimmed, { emitEvent: false });
            }
          }
        });
      }
    });
  }
  setFormChanges() {
    if (this.activeIndex === undefined || this.activeIndex === null) {
      return;
    }

    const group = this.familyForm.at(this.activeIndex) as FormGroup;
    if (!group) return;

    const control = group.get('housingGovernorateId');
    if (!control) return;
    control?.valueChanges?.subscribe(value => {
      const district = group.get('districtId');
      const primaryCareUnit = group.get('primaryCareUnitId');
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
