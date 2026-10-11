import { mapEnumToOptions } from '@abp/ng.core';

export enum FamilyRole {
  HeadOfFamily = 'headOfFamily',
  Father = 'father',
  Mother = 'mother',
  Son = 'son',
  Daughter = 'daughter',
  Brother = 'brother',
  Sister = 'sister',
  Husband = 'husband',
  Wife = 'wife',
  Self = 'self',
}

export const familyRoleOptions = mapEnumToOptions(FamilyRole);
