import type { VentilationStatus } from '../../common/enums/family/ventilation-status.enum';
import type { Sewage } from '../../common/enums/family/sewage.enum';
import type { WaterSourceType } from '../../common/enums/family/water-source-type.enum';
import type { LightingType } from '../../common/enums/family/lighting-type.enum';
import type { BarnLocationType } from '../../common/enums/family/barn-location-type.enum';
import type { IncomeType } from '../../common/enums/family/income-type.enum';
import type { BreadwinnerRelationIfFatherDeceased } from '../../common/enums/family/breadwinner-relation-if-father-deceased.enum';
import type { FullAuditedEntityDto } from '@abp/ng.core';
import type { CompletionStatus } from '../../common/enums/beneficiaries/completion-status.enum';
import type { BeneficiaryDto } from '../models';

export interface CreateFamilyDto {
  beneficiaryId: number;
  isHofEgyptian: boolean;
  familyAddress?: string;
  hasDifferentAddress?: boolean;
  newAddress?: string;
  housingGovernorateId?: number;
  districtId?: number;
  primaryCareUnitId?: number;
  mobilePhone: string;
  homePhone?: string;
  workPhone?: string;
  nearestPhone?: string;
  familyMembersCount?: number;
  familyDeathsCount?: number;
  housingCondition: CreateFamilyHousingConditionDto;
  socialResearch: CreateFamilySocialResearchDto;
  creatorId?: string;
  lastModifierId?: string;
}

export interface CreateFamilyHousingConditionDto {
  roomsCountTotal?: number;
  roomsCountForSleeping?: number;
  ventilationStatus?: VentilationStatus;
  sewage?: Sewage;
  waterSourceType?: WaterSourceType;
  lightingType?: LightingType;
  hasBirdsOrAnimalsAtHome?: boolean;
  hasBarn?: boolean;
  barnLocationType?: BarnLocationType;
  notes?: string;
}

export interface CreateFamilySocialResearchDto {
  incomeType?: IncomeType;
  averageMonthlyIncome?: number;
  hasChronicDiseases?: boolean;
  hasDisabilities?: boolean;
  receivesSocialSecurityPension?: boolean;
  breadwinnerRelationIfFatherDeceased?: BreadwinnerRelationIfFatherDeceased;
  isEligibleForFreeService?: boolean;
  notes?: string;
}

export interface FamilyDto extends FullAuditedEntityDto<number> {
  code?: string;
  beneficiaryId: number;
  isHofEgyptian: boolean;
  familyAddress?: string;
  hasDifferentAddress?: boolean;
  newAddress?: string;
  housingGovernorateId?: number;
  housingGovernorate?: string;
  districtId?: number;
  district?: string;
  primaryCareUnitId?: number;
  primaryCareUnit?: string;
  mobilePhone?: string;
  homePhone?: string;
  workPhone?: string;
  nearestPhone?: string;
  familyMembersCount?: number;
  familyDeathsCount?: number;
  womenCount?: number;
  isActive: boolean;
  completionStatus?: CompletionStatus;
  headOfFamily: BeneficiaryDto;
  housingCondition: FamilyHousingConditionDto;
  socialResearch: FamilySocialResearchDto;
  children: BeneficiaryDto[];
  createdBy?: string;
  lastUpdatedBy?: string;
}

export interface FamilyHousingConditionDto {
  familyId: number;
  roomsCountTotal?: number;
  roomsCountForSleeping?: number;
  ventilationStatus?: VentilationStatus;
  waterSourceType?: WaterSourceType;
  sewage?: Sewage;
  lightingType?: LightingType;
  hasBirdsOrAnimalsAtHome?: boolean;
  hasBarn?: boolean;
  barnLocationType?: BarnLocationType;
  notes?: string;
  isActive: boolean;
  creatorBy?: string;
  lastModifiedBy?: string;
}

export interface FamilySearchRequestDto {
  pageSize: number;
  pageNumber: number;
  name?: string;
  familyId?: number;
  employerId?: number;
  nationalId?: string;
}

export interface FamilySocialResearchDto {
  familyId: number;
  incomeType?: IncomeType;
  averageMonthlyIncome?: number;
  hasChronicDiseases?: boolean;
  hasDisabilities?: boolean;
  receivesSocialSecurityPension?: boolean;
  breadwinnerRelationIfFatherDeceased?: BreadwinnerRelationIfFatherDeceased;
  isEligibleForFreeService?: boolean;
  notes?: string;
  isActive: boolean;
  creatorBy?: string;
  lastModifiedBy?: string;
}

export interface UpdateFamilyDto extends CreateFamilyDto {
  id: number;
}
