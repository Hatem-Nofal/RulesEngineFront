import type { EntityDto } from '@abp/ng.core';

export interface DiagnosisDto extends EntityDto<number> {
  diagnosis_id: number;
  diagnosisType?: string;
  diagnosisName?: string;
  isDeleted: boolean;
}
