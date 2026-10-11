import type { BeneficiaryInactivationReasonEnum } from '../../common/enums/beneficiaries/beneficiary-inactivation-reason-enum.enum';

export interface DeActivateBeneficiaryDto {
  beneficiaryId: number;
  inactivationReason: BeneficiaryInactivationReasonEnum;
  inactivationNote?: string;
}

export interface SearchTargetFamilyRequest {
  searchText?: string;
}

export interface TargetFamilyResultDto {
  familyId: number;
  familyCode?: string;
  isActive: boolean;
  headOfFamilyId: number;
  headOfFamilyName?: string;
  headOfFamilyNationalId?: string;
}
