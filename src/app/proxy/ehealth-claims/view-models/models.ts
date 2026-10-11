import type { FullAuditedEntityDto } from '@abp/ng.core';
import type { FamilyRole } from '../common/enums/beneficiaries/family-role.enum';
import type { MaritalStatus } from '../common/enums/beneficiaries/marital-status.enum';
import type { Gender } from '../common/enums/beneficiaries/gender.enum';
import type { EducationalStatus } from '../common/enums/educational-status.enum';
import type { PreviousInsuranceType } from '../common/enums/previous-insurance-type.enum';
import type { EmploymentStatus } from '../common/enums/employment-status.enum';
import type { CompletionStatus } from '../common/enums/beneficiaries/completion-status.enum';
import type { PremiumStatus } from '../common/enums/premium-status.enum';

export interface BeneficiaryDto extends FullAuditedEntityDto<number> {
  parentId?: number;
  parentName?: string;
  familyId?: number;
  familyRole?: FamilyRole;
  name?: string;
  firstName?: string;
  maritalStatus?: MaritalStatus;
  birthDate?: string;
  birthGovernorateId?: number;
  nationalityId?: number;
  birthGovernorate?: string;
  gender?: Gender;
  nationality?: string;
  deathDate?: string;
  employerId?: number;
  employerName?: string;
  insuranceSalary?: number;
  disabilityInfo?: string;
  nationalId?: string;
  code?: string;
  isEgyptian: boolean;
  mobileNumber?: string;
  educationalStatusId?: EducationalStatus;
  registrationDate?: string;
  previousInsuranceTypeId?: PreviousInsuranceType;
  hasAnotherAddress: boolean;
  newAddress?: string;
  employmentStatusId?: EmploymentStatus;
  isSocialInsuranceRegistered: boolean;
  notes?: string;
  isActive: boolean;
  completionStatus?: CompletionStatus;
  eligibilityFlag: boolean;
  premiumStatus?: PremiumStatus;
  createdBy?: string;
  lastUpdatedBy?: string;
  assignedPCU?: string;
  numberOfFamilyMembers?: number;
  isFamilyActive: boolean;
  familyCompletionStatus?: string;
  housingGovernorateId?: number;
  housingGovernorate?: string;
  districtId?: number;
  district?: string;
  primaryCareUnitId?: number;
  primaryCareUnit?: string;
}

export interface BeneficiaryFamilyTreeRowDto extends FullAuditedEntityDto<number> {
  id: number;
  parentId?: number;
  parentName?: string;
  code?: string;
  depth: number;
  familyRole?: string;
  name?: string;
  firstName?: string;
  maritalStatus?: string;
  gender?: string;
  birthDate?: string;
  deathDate?: string;
  nationalityId?: number;
  nationality?: string;
  employerId?: number;
  employerName?: string;
  insuranceSalary?: number;
  disabilityInfo?: string;
  nationalId?: string;
  familyId?: number;
  isActive: boolean;
  mobileNumber?: string;
  educationalStatusId?: string;
  employmentStatusId?: string;
  registrationDate?: string;
  isSocialInsuranceRegistered?: boolean;
  notes?: string;
  completionStatus?: string;
  eligibilityFlag: boolean;
  premiumStatus?: string;
  governateCode?: string;
  governateName?: string;
  previousInsuranceTypeId?: string;
  birthGovernorate?: string;
  hasAnotherAddress: boolean;
  newAddress?: string;
  isFamilyActive: boolean;
  familyCompletionStatus?: string;
  familyCode?: string;
  housingGovernorateId?: number;
  housingGovernorate?: string;
  districtId?: number;
  district?: string;
  primaryCareUnitId?: number;
  primaryCareUnit?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
}

export interface BeneficiarySearchRequestDto {
  pageSize: number;
  pageNumber: number;
  name?: string;
  familyId?: number;
  employerId?: number;
  nationalId?: string;
  onlyParents?: boolean;
}

export interface CreateAndUpdateBeneficiaryDto {
  id?: number;
  parentId?: number;
  familyId?: number;
  familyRole?: FamilyRole;
  firstName: string;
  name: string;
  maritalStatus?: MaritalStatus;
  birthDate: string;
  birthGovernorateId: number;
  gender?: Gender;
  nationalityId?: number;
  deathDate?: string;
  employerId?: number;
  insuranceSalary?: number;
  disabilityInfo?: string;
  nationalId?: string;
  isEgyptian: boolean;
  mobileNumber?: string;
  educationalStatusId?: EducationalStatus;
  registrationDate?: string;
  previousInsuranceTypeId?: PreviousInsuranceType;
  hasAnotherAddress: boolean;
  newAddress?: string;
  employmentStatusId?: EmploymentStatus;
  isSocialInsuranceRegistered?: boolean;
  notes?: string;
  housingGovernorateId?: number;
  districtId?: number;
  primaryCareUnitId?: number;
  creationTime?: string;
  creatorId?: string;
  lastModifierId?: string;
}

export interface CreateAndUpdateBeneficiaryRequestDto {
  beneficiaryInsertRequestList: CreateAndUpdateBeneficiaryDto[];
}

export interface EmployerDto {
  id: number;
  nameAr?: string;
  nameEn?: string;
}

export interface MoveBeneficiaryRequest {
  beneficiaryId: number;
  toFamilyId?: number;
  relationToHof?: FamilyRole;
  primaryCareUnitId: number;
  toBeneficiaryId: number;
}

export interface SplitBeneficiaryRequest {
  beneficiaryId: number;
}

export interface SplitBeneficiaryResultDto {
  newFamilyId: number;
  newFamilyCode?: string;
  beneficiaryId: number;
}

export interface AttachmentDto {
  id?: string;
  filePath?: string;
}

export interface BeneficiaryDropDownDto {
  id: number;
  name?: string;
  nationalId?: string;
  firstName?: string;
  restOfName?: string;
}
