import type { RejectionLevel } from '../../common/enums/rejection-level.enum';
import type { PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface SaveWorkflowDto {
  name?: string;
  ruleFormConfigId?: string;
  rejectionLevel?: RejectionLevel;
}

export interface WorkflowDto {
  id?: string;
  name?: string;
  ruleFormConfigId?: string | null;
  ruleFormConfigName?: string | null;
  ruleCount?: number;
  rejectionLevel?: RejectionLevel;
}

export interface WorkflowPagedAndFilterDto extends PagedAndSortedResultRequestDto {
  name?: string | null;
  ruleFormConfigName?: string | null;
  rejectionLevel?: RejectionLevel | null;
}
