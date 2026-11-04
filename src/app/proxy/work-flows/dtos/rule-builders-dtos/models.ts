import type { RuleNodeType } from '../../../common/enums/rule-node-type.enum';
import type { LogicalOperator } from '../../../common/enums/logical-operator.enum';
import type { RuleOperator } from '../../../common/enums/rule-operator.enum';
import type { EntityDto } from '@abp/ng.core';

export interface RuleNodeDto {
  id?: number;
  nodeType?: RuleNodeType;
  logicalOperator?: LogicalOperator | null;
  logicalJoinOperator?: LogicalOperator | null;
  fieldKey?: string | null;
  operator?: RuleOperator | null;
  value?: any | null;
  isMultiple?: boolean;
  activityTypeId?: number | null;
  children?: RuleNodeDto[];
}

export interface CreateFormConfigEditDto {
  id?: number | null;
  name?: string;
  description?: string | null;
  isActive?: boolean;
  allowNestedGroups?: boolean;
  fields?: FormConfigFieldInputDto[];
}

export interface FormConfigFieldInputDto {
  fieldId?: number;
  allowedOperators?: number[] | null;
  isMultiple?: boolean;
  isDefault?: boolean;
  isDeleted?: boolean;
}

export interface FormConfigListDto extends EntityDto<number> {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  allowNestedGroups?: boolean;
  strategyKey?: string | null;
  fieldCount?: number;
  workflowCount?: number;
}

export interface RuleFieldCatalogDto {
  id?: number;
  key?: string;
  label?: string;
  dataType?: string;
  options?: string[] | null;
}

export interface RuleFormConfigDto {
  id?: number;
  name?: string;
  allowNestedGroups?: boolean;
  strategyKey?: string | null;
  fields?: RuleFormFieldDto[];
}

export interface RuleFormFieldDto {
  id?: number;
  key?: string;
  label?: string;
  dataType?: string;
  options?: string[] | null;
  allowedOperators?: number[] | null;
  isMultiple?: boolean;
  isDefault?: boolean;
  isDeleted?: boolean;
}
