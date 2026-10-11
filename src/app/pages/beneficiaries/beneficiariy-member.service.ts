import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class BeneficiariyMemberService {
  today = new Date();
  EGY_NID_REGEX = /^[2-3][0-9]{13}$/;
  EGY_GOV_CODES = new Set([
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
  constructor(private fb: FormBuilder) {}
  createFamilyForm(): FormGroup {
    return this.fb.group({
      // isEgyptian: ['true', Validators.required],
      nationalId: [
        null,
        [
          Validators.required,
          Validators.pattern(this.EGY_NID_REGEX),
          this.egyptNationalIdValidator(),
        ],
      ],
      firstName: [
        null,
        [
          Validators.required,
          Validators.pattern(/^[\u0600-\u06FF]+$/),
          Validators.min(2),
          Validators.max(22),
        ],
      ],
      fullName: [
        null,
        [
          Validators.required,
          Validators.pattern(/^(?:[\u0621-\u064A]{2,})(?: [\u0621-\u064A]{2,}){2,}$/),
          Validators.min(2),
          Validators.max(80),
        ],
      ],
      gender: [null, Validators.required],
      dateOfBirth: [null, Validators.required],
      governorateBirth: [null, Validators.required],
      governorateName: [null],
      nationalityId: [2, Validators.required],
      familyRole: [null, Validators.required],
      mobileNumber: [null, [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]],

      maritalStatus: [null],
      educationalStatus: [null],
      registrationDate: [this.today],
      previousInssuranceType: [null],
      anotheraddress: [false],
      newAddress: [null, [Validators.min(2), Validators.maxLength(1000)]],
      employmentStatus: [null],
      socialInsurance: [null],
      notes: [null, Validators.maxLength(1000)],
      id: [null],
      parentId: [null],
      code: [null],
      completionStatus: [null],
      isFamilyActive: [null],
      housingGovernorateId: [null, Validators.required],
      districtId: [null],
      primaryCareUnitId: [null, Validators.required],
      housingGovernorate: [null],
      district: [null],
      primaryCareUnit: [null],
      createdBy: [null],
      creationTime: [null],
    });
  }
  parseDdMmYyyy(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts.map(Number);
    return new Date(yyyy, mm - 1, dd);
  }
  mapMemberToForm(member: any): any {
    const governoratList = JSON.parse(localStorage.getItem('governoratList') || '[]');
    const governorateName = governoratList.find(
      (item: any) => member?.governateCode == item.code,
    )?.name;
    return {
      familyRole: member.familyRole ?? null,
      firstName: member.firstName ?? null,
      fullName: member.name ?? null,
      maritalStatus: member.maritalStatus ?? null,
      dateOfBirth: member.birthDate ?? null,
      governorateBirth: member.governateCode ?? null,
      gender: member.gender ?? null,
      nationalityId: member.nationalityId ?? null,
      nationalId: member.nationalId ?? null,
      mobileNumber: member.mobileNumber ?? null,
      educationalStatus: member.educationalStatusId ?? null,
      registrationDate: member.registrationDate
        ? this.parseDdMmYyyy(member.registrationDate)
        : null,
      previousInssuranceType: member.previousInsuranceTypeId ?? null,
      anotheraddress: member.hasAnotherAddress ?? false,
      newAddress: member.newAddress ?? null,
      employmentStatus: member.employmentStatusId ?? null,
      socialInsurance: member.isSocialInsuranceRegistered ?? false,
      notes: member.notes ?? null,
      id: member.id ?? null,
      parentId: member.parentId ?? null,
      code: member?.code ?? null,
      completionStatus: member?.completionStatus,
      isFamilyActive: member?.isFamilyActive,
      housingGovernorateId: member?.housingGovernorateId,
      districtId: member?.districtId,
      primaryCareUnitId: member?.primaryCareUnitId,
      housingGovernorate: member?.housingGovernorate,
      district: member?.district,
      primaryCareUnit: member?.primaryCareUnit,
      governorateName: governorateName,
      createdBy: member?.createdBy ?? null,
      creationTime: member?.creationTime ?? null,
    };
  }
  private egyptNationalIdValidator() {
    return (control: any) => {
      const value = String(control.value || '').trim();
      if (!value) return null;

      if (!this.EGY_NID_REGEX.test(value)) return { nationalIdInvalid: true };

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
    govermentCode?: string;
  } {
    if (!this.EGY_NID_REGEX.test(nid)) return { isValid: false };

    const centuryDigit = nid.charAt(0);
    const yy = Number(nid.substring(1, 3));
    const mm = Number(nid.substring(3, 5));
    const dd = Number(nid.substring(5, 7));
    const gov = nid.substring(7, 9);

    if (!this.EGY_GOV_CODES.has(gov)) return { isValid: false };

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

    const birthIso = `${String(dd).padStart(2, '0')}-${String(mm).padStart(2, '0')}-${year}`;

    return { isValid: true, birthDate: birth, birthIso, age, gender, govermentCode: gov };
  }
}
