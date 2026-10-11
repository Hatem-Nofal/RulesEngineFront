import { mapEnumToOptions } from '@abp/ng.core';

export enum RuleNodeType {
  Group = 1,
  Condition = 2,
}

export const ruleNodeTypeOptions = mapEnumToOptions(RuleNodeType);
