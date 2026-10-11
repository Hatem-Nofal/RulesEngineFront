import { mapEnumToOptions } from '@abp/ng.core';

export enum LogicalOperator {
  And = 1,
  Or = 2,
}

export const logicalOperatorOptions = mapEnumToOptions(LogicalOperator);
