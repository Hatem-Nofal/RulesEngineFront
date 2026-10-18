import { mapEnumToOptions } from '@abp/ng.core';

export enum RejectionLevel {
  Activity = 1,
  Claim = 2,
  AllActivity = 3,
}

export const rejectionLevelOptions = mapEnumToOptions(RejectionLevel);
