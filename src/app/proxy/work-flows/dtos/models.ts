import type { RejectionLevel } from '../../common/enums/rejection-level.enum';
import type { PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface SaveWorkflowDto {
  name?: string;
  ruleFormConfigId?: string | null;
  rejectionLevel?: RejectionLevel;
  hasCustomeRule?: boolean;
  ruleExpression?: string;
  violationMessage?: string | null;
}

export interface WorkflowDto {
  id?: string;
  name?: string;
  ruleFormConfigId?: string | null;
  ruleFormConfigName?: string | null;
  ruleCount?: number;
  rejectionLevel?: RejectionLevel;
  hasCustomeRule?: boolean;
  ruleExpression?: string | null;
  violationMessage?: string | null;
}

export interface WorkflowPagedAndFilterDto extends PagedAndSortedResultRequestDto {
  name?: string | null;
  ruleFormConfigId?: string | null;
  rejectionLevel?: RejectionLevel | null;
}

export interface RulePagedAndSortedResultRequestDto extends PagedAndSortedResultRequestDto {
  workflowId?: string | null;
  ruleName?: string | null;
}
