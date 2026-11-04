import type { RuleNodeDto } from '../rule-builders-dtos/models';
import type { ViolationType } from '../../../common/enums/violation-type.enum';

export interface CreateRuleDto {
  workflowId?: number;
  isActive?: boolean;
  violationMessage?: string | null;
  root?: RuleNodeDto;
  violationType?: ViolationType;
}

export interface RuleDto {
  id?: number | null;
  name?: string;
  workflowId?: number;
  isActive?: boolean;
  expression?: string | null;
  workflowIsWorkflowLevel?: boolean;
  violationType?: ViolationType;
  violationMessage?: string | null;
  root?: RuleNodeDto;
}

export interface RuleListItemDto {
  id?: number;
  name?: string;
  workflowId?: number;
  workflowName?: string | null;
  isActive?: boolean;
  violationType?: ViolationType;
}
