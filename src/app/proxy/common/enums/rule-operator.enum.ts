import { mapEnumToOptions } from '@abp/ng.core';

export enum RuleOperator {
  Equal = 1,
  NotEqual = 2,
  GreaterThan = 3,
  GreaterThanOrEqual = 4,
  LessThan = 5,
  LessThanOrEqual = 6,
  Contains = 7,
  NotContains = 8,
}

export const ruleOperatorOptions = mapEnumToOptions(RuleOperator);
