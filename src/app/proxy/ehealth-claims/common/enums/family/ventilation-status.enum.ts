import { mapEnumToOptions } from '@abp/ng.core';

export enum VentilationStatus {
  Good = 'good',
  Bad = 'bad',
}

export const ventilationStatusOptions = mapEnumToOptions(VentilationStatus);
