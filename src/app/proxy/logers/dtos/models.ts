import type { PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface RulesEngineExecutionLogFiltersDto extends PagedAndSortedResultRequestDto {
  workFlowName?: string | null;
  ruleName?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  activity?: string | null;
  claimNumber?: string | null;
}

export interface RulesEngineExecutionLogListDto {
  workFlowName?: string;
  rule?: string | null;
  errorType?: string | null;
  errorMessage?: string | null;
  claimNumber?: string | null;
  expression?: string;
  activity?: string;
  creationTime?: string;
  isViolated?: boolean;
}
