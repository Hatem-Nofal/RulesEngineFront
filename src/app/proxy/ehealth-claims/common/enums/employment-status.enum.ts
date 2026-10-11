import { mapEnumToOptions } from '@abp/ng.core';

export enum EmploymentStatus {
  GovernmentSector = 'governmentSector',
  PrivateSector = 'privateSector',
  BusinessSector = 'businessSector',
  Freelance = 'freelance',
  Retired = 'retired',
  Unemployed = 'unemployed',
  Student = 'student',
  UniversityStudent = 'universityStudent',
}

export const employmentStatusOptions = mapEnumToOptions(EmploymentStatus);
