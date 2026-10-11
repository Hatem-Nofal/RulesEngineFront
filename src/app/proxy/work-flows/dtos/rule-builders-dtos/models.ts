import type { RuleNodeType } from '../../../common/enums/rule-node-type.enum';
import type { LogicalOperator } from '../../../common/enums/logical-operator.enum';
import type { RuleOperator } from '../../../common/enums/rule-operator.enum';

export interface FormConfigEditDto {
  id?: string | null;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  allowNestedGroups?: boolean;
  fields?: FormConfigFieldInputDto[];
}

export interface FormConfigFieldInputDto {
  fieldId?: string;
  allowedOperators?: number[] | null;
}

export interface FormConfigListDto {
  id?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  allowNestedGroups?: boolean;
  strategyKey?: string | null;
  fieldCount?: number;
  workflowCount?: number;
}

export interface RuleFormConfigDto {
  id?: string;
  name?: string;
  allowNestedGroups?: boolean;
  strategyKey?: string | null;
  fields?: RuleFormFieldDto[];
}

export interface RuleFormFieldDto {
  id?: string;
  key?: string;
  label?: string;
  dataType?: string;
  options?: string[] | null;
  allowedOperators?: number[] | null;
}

export interface RuleNodeDto {
  id?: string | null;
  nodeType?: RuleNodeType;
  logicalOperator?: LogicalOperator | null;
  fieldKey?: string | null;
  operator?: RuleOperator | null;
  value?: any | null;
  children?: RuleNodeDto[];
}
