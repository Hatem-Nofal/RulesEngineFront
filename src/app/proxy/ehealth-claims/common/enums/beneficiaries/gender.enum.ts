import { mapEnumToOptions } from '@abp/ng.core';

export enum Gender {
  Male = 'male',
  Female = 'female',
}

export const genderOptions = mapEnumToOptions(Gender);
