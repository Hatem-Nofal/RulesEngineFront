import { mapEnumToOptions } from '@abp/ng.core';

export enum RejectionLevel {
  Activity = 0,
  Claim = 1,
}

export const rejectionLevelOptions = mapEnumToOptions(RejectionLevel);
