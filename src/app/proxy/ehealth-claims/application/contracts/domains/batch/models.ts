import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';
import type { ProviderDto } from '../../../../domains/provider/models';
import type { BatchLogDto } from '../../../../domains/batches/models';

export interface BatchDto extends EntityDto<number> {
  uhia_Batch_code?: string;
  ehealth_Batch_code?: string;
  service_Date?: string;
  reception_Date?: string;
  type_id: number;
  type?: string;
  facilityCode?: string;
  status_id: number;
  provider_id: number;
  serial: number;
  claims_Count?: number;
  draft_Claims?: number;
  new_Claims?: number;
  claims_Amount?: number;
  entered_Net?: number;
  status?: string;
  provider: ProviderDto;
  organization_Id?: string;
  batchLogs: BatchLogDto[];
  eHealth_Claims_Count?: number;
}

export interface BatchListDto extends EntityDto<number> {
  uhia_Batch_code?: string;
  ehealth_Batch_code?: string;
  service_Date?: string;
  reception_Date?: string;
  type_id: number;
  serviceType?: string;
  status_id: number;
  provider_id: number;
  provider?: string;
  serial: number;
  claims_Count?: number;
  claims_Amount?: number;
  batchStatus?: string;
  organizationId?: string;
  organizationUnit?: string;
}

export interface BatchPagedAndFilterDto extends PagedAndSortedResultRequestDto {
  uhia_Batch_code?: string;
  ehealth_Batch_code?: string;
  serviceTypeId?: number;
  service_Date?: string;
  reception_Date?: string;
  type_id?: number;
  status_id?: number;
  provider_id?: number;
  serial?: number;
  claims_Count?: number;
  claims_Amount?: number;
}

export interface CreateBatchDto {
  uhia_Batch_code?: string;
  ehealth_Batch_code?: string;
  service_Date?: string;
  reception_Date?: string;
  type_id: number;
  status_id: number;
  provider_id: number;
  claims_Count?: number;
  claims_Amount?: number;
  serial: number;
  batchesLogging: BatchLogDto[];
}

export interface UpdateBatchDto {
  uhia_Batch_code?: string;
  ehealth_Batch_code?: string;
  service_Date?: string;
  reception_Date?: string;
  type_id: number;
  status_id: number;
  provider_id: number;
  claims_Count?: number;
  claims_Amount?: number;
  batchesLogging: BatchLogDto[];
}
