import { mapEnumToOptions } from '@abp/ng.core';

export enum PremiumStatus {
  Premium = 'premium',
}

export const premiumStatusOptions = mapEnumToOptions(PremiumStatus);
