import { mapEnumToOptions } from '@abp/ng.core';

export enum IncomeType {
  Fixed = 'fixed',
  Variable = 'variable',
}

export const incomeTypeOptions = mapEnumToOptions(IncomeType);
