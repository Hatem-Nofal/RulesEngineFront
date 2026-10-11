import { mapEnumToOptions } from '@abp/ng.core';

export enum BeneficiaryInactivationReasonEnum {
  Death = 'death',
  Departure = 'departure',
  CannotBeContactedWithOverduePremium = 'cannotBeContactedWithOverduePremium',
}

export const beneficiaryInactivationReasonEnumOptions = mapEnumToOptions(BeneficiaryInactivationReasonEnum);
