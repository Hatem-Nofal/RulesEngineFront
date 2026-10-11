import type { EntityDto } from '@abp/ng.core';

export interface BatchStatusDto extends EntityDto<number> {
  description?: string;
  create_timestamp?: string;
  update_timestamp?: string;
}

export interface ServiceTypeDto {
  code?: string;
}
