import type { EntityDto } from '@abp/ng.core';
import type { RuleNodeType } from '../../../common/enums/rule-node-type.enum';
import type { LogicalOperator } from '../../../common/enums/logical-operator.enum';
import type { RuleOperator } from '../../../common/enums/rule-operator.enum';

export interface CreateFormConfigEditDto {
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
  isMultiple?: boolean;
  isDefault?: boolean;
}

export interface FormConfigListDto extends EntityDto<string> {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  allowNestedGroups?: boolean;
  strategyKey?: string | null;
  fieldCount?: number;
  workflowCount?: number;
}

export interface RuleFieldCatalogDto {
  id?: string;
  key?: string;
  label?: string;
  dataType?: string;
  options?: string[] | null;
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
  isMultiple?: boolean;
  isDefault?: boolean;
}

export interface RuleNodeDto {
  id?: string;
  nodeType?: RuleNodeType;
  logicalOperator?: LogicalOperator | null;
  logicalJoinOperator?: LogicalOperator | null;
  fieldKey?: string | null;
  operator?: RuleOperator | null;
  value?: any | null;
  isMultiple?: boolean;
  children?: RuleNodeDto[];
}
