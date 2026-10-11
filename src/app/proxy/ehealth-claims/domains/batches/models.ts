import type { EntityDto } from '@abp/ng.core';

export interface BatchLogDto extends EntityDto<number> {
  user_Id?: string;
  actionUser?: string;
  status_id: number;
  batchStatus?: string;
  create_timestamp?: string;
  batch_id: number;
  abpCreatedBy_Id?: string;
}
