import type { PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface SaveWorkflowDto {
  name?: string;
  ruleFormConfigId?: string;
}

export interface WorkflowDto {
  id?: string;
  name?: string;
  ruleFormConfigId?: string | null;
  ruleFormConfigName?: string | null;
  ruleCount?: number;
}

export interface WorkflowPagedAndFilterDto extends PagedAndSortedResultRequestDto {
  name?: string;
  ruleFormConfigName?: string | null;
}
