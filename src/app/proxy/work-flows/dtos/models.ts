import type { RejectionLevel } from '../../common/enums/rejection-level.enum';
import type { ViolationType } from '../../common/enums/violation-type.enum';
import type { PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface SaveWorkflowDto {
  name?: string;
  ruleFormConfigId?: number | null;
  rejectionLevel?: RejectionLevel;
  isWorkflowLevel?: boolean;
  ruleExpression?: string;
  violationMessage?: string | null;
  violationType?: ViolationType;
}

export interface WorkflowDto {
  id?: number;
  name?: string;
  ruleFormConfigId?: number | null;
  ruleFormConfigName?: string | null;
  ruleCount?: number;
  rejectionLevel?: RejectionLevel;
  isWorkflowLevel?: boolean;
  ruleExpression?: string | null;
  violationMessage?: string | null;
  violationType?: ViolationType;
}

export interface WorkflowForRuleDto {
  isWorkflowLevel?: boolean;
  ruleExpression?: string | null;
  violationMessage?: string | null;
  violationType?: ViolationType;
}

export interface WorkflowPagedAndFilterDto extends PagedAndSortedResultRequestDto {
  name?: string | null;
  ruleFormConfigId?: number | null;
  rejectionLevel?: RejectionLevel | null;
}

export interface RulePagedAndSortedResultRequestDto extends PagedAndSortedResultRequestDto {
  workflowId?: number | null;
  ruleName?: string | null;
}
