import { mapEnumToOptions } from '@abp/ng.core';

export enum ViolationType {
  Error = 1,
  Warning = 2,
}

export const violationTypeOptions = mapEnumToOptions(ViolationType);
