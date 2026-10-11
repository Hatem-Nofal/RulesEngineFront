import { mapEnumToOptions } from '@abp/ng.core';

export enum PatientIdFlag {
  Correct = 'correct',
  Missing = 'missing',
  LessThan14 = 'lessThan14',
  MoreThan14 = 'moreThan14',
}

export const patientIdFlagOptions = mapEnumToOptions(PatientIdFlag);
