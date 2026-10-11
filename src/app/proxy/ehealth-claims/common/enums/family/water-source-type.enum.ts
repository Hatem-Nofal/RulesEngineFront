import { mapEnumToOptions } from '@abp/ng.core';

export enum WaterSourceType {
  Public = 'public',
  Other = 'other',
}

export const waterSourceTypeOptions = mapEnumToOptions(WaterSourceType);
