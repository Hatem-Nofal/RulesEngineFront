import { mapEnumToOptions } from '@abp/ng.core';

export enum BreadwinnerRelationIfFatherDeceased {
  Wife = 'wife',
  Son = 'son',
  Daughter = 'daughter',
  Father = 'father',
  Mother = 'mother',
  Brother = 'brother',
  Sister = 'sister',
  Other = 'other',
}

export const breadwinnerRelationIfFatherDeceasedOptions = mapEnumToOptions(BreadwinnerRelationIfFatherDeceased);
