import { mapEnumToOptions } from '@abp/ng.core';

export enum MaritalStatus {
  UnderAge = 'underAge',
  Single = 'single',
  Married = 'married',
  Divorced = 'divorced',
  Widowed = 'widowed',
}

export const maritalStatusOptions = mapEnumToOptions(MaritalStatus);
