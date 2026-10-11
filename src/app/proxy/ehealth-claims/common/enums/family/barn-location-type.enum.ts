import { mapEnumToOptions } from '@abp/ng.core';

export enum BarnLocationType {
  OutsideHome = 'outsideHome',
  InsideHome = 'insideHome',
}

export const barnLocationTypeOptions = mapEnumToOptions(BarnLocationType);
