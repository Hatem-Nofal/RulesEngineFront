import { mapEnumToOptions } from '@abp/ng.core';

export enum Sewage {
  Healthy = 'healthy',
  Trench = 'trench',
  Other = 'other',
}

export const sewageOptions = mapEnumToOptions(Sewage);
