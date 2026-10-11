import type { RuleNodeDto } from '../rule-builders-dtos/models';

export interface RuleDto {
  id?: string | null;
  name?: string;
  workflowId?: string;
  isActive?: boolean;
  root?: RuleNodeDto;
}

export interface RuleListItemDto {
  id?: string;
  name?: string;
  workflowId?: string;
  workflowName?: string | null;
  isActive?: boolean;
}
