import { mapEnumToOptions } from '@abp/ng.core';

export enum CompletionStatus {
  Incomplete = 'incomplete',
  Complete = 'complete',
}

export const completionStatusOptions = mapEnumToOptions(CompletionStatus);
