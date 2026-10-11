import { mapEnumToOptions } from '@abp/ng.core';

export enum EducationalStatus {
  UnderAge = 'underAge',
  Primary = 'primary',
  Preparatory = 'preparatory',
  Secondary = 'secondary',
  HigherQualification = 'higherQualification',
  AboveIntermediate = 'aboveIntermediate',
  Illiterate = 'illiterate',
  Other = 'other',
}

export const educationalStatusOptions = mapEnumToOptions(EducationalStatus);
