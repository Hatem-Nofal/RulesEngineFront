import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import type { SelectDropDownVm } from '../../../e-health/claims/data/models/common/models';

export interface BatchECMDto {
  id: number;
  uhia_Batch_code?: string;
  ehealth_Batch_code?: string;
  type_id: number;
  type?: string;
  providerAra_name?: string;
  service_Date?: string;
  claimsNum: number;
  file_Location_Report?: string;
}

export interface BatchECMList {
  batchs: PagedResultDto<BatchECMDto>;
  serviceTypes: SelectDropDownVm[];
}

export interface BatchECMPagedAndFilterDto extends PagedAndSortedResultRequestDto {
  providerId?: number;
  eHealthCode?: string;
  uhiaBatchNo?: string;
  batchType?: number;
  serviceDate?: string;
}

export interface ClaimECMDto {
  id: number;
  patient_nid?: string;
  provider_name?: string;
  batch_Service_Date?: string;
  uhiaClaimCode?: string;
  number?: string;
  ehealth_Batch_code?: string;
  batchECMDto: BatchECMDto;
}

export interface ClaimECMPagedAndFilterDto extends PagedAndSortedResultRequestDto {
  uhiaClaimCode?: string;
  uhiaBatchNo?: string;
  ehealthClaimno?: string;
  patient_nid?: string;
  batchId?: number;
}

export interface ProviderECMDto {
  providers: PagedResultDto<ProvidersListVm>;
}

export interface ProviderECMPagedAndFilterDto extends PagedAndSortedResultRequestDto {
  providerCode?: string;
  providerName?: string;
  governorateId?: number;
  providerTypeId?: number;
}

export interface ProvidersListVm {
  id: number;
  code?: string;
  eng_name?: string;
  ara_name?: string;
  providerType?: string;
  type_id: number;
  governorate_id: number;
  governorate?: string;
  batchesNum: number;
}
