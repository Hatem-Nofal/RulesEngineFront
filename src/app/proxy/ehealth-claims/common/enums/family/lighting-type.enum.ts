import { mapEnumToOptions } from '@abp/ng.core';

export enum LightingType {
  Electricity = 'electricity',
  Other = 'other',
}

export const lightingTypeOptions = mapEnumToOptions(LightingType);
