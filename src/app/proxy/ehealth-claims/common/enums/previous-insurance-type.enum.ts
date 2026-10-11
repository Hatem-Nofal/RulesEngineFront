import { mapEnumToOptions } from '@abp/ng.core';

export enum PreviousInsuranceType {
  GovernmentInsurance = 'governmentInsurance',
  PrivateInsurance = 'privateInsurance',
  NoInsurance = 'noInsurance',
}

export const previousInsuranceTypeOptions = mapEnumToOptions(PreviousInsuranceType);
