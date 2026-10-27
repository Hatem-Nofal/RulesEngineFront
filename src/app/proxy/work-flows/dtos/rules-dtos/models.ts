import type { RuleNodeDto } from '../rule-builders-dtos/models';
import type { ViolationType } from '../../../common/enums/violation-type.enum';

export interface CreateRuleDto {
  workflowId?: string;
  isActive?: boolean;
  violationMessage?: string | null;
  root?: RuleNodeDto;
  violationType?: ViolationType;
}

export interface RuleDto {
  id?: string | null;
  name?: string;
  workflowId?: string;
  isActive?: boolean;
  expression?: string | null;
  workflowHasCustomeRule?: boolean;
  violationType?: ViolationType;
  violationMessage?: string | null;
  root?: RuleNodeDto;
}

export interface RuleListItemDto {
  id?: string;
  name?: string;
  workflowId?: string;
  workflowName?: string | null;
  isActive?: boolean;
  violationType?: ViolationType;
}
