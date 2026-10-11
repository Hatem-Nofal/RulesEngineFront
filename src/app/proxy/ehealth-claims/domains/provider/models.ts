import type { PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface ProviderDto {
  code?: string;
  type_id: number;
  provider_Name?: string;
  providerType_Name?: string;
  governorate_id: number;
  governorate_name?: string;
}

export interface CreateProviderDto {
  code?: string;
  eng_name?: string;
  ara_name?: string;
  type_id: number;
  providerType_Name?: string;
  governorate_id: number;
  governorate_name?: string;
}

export interface ProviderListDto {
  code?: string;
  type_id: number;
  providerType_Name?: string;
  governorate_id: number;
  governorate_name?: string;
}

export interface ProviderPagedAndFilterDto extends PagedAndSortedResultRequestDto {
}

export interface UpdateProviderDto {
  code?: string;
  eng_name?: string;
  ara_name?: string;
  type_id: number;
  providerType_Name?: string;
  governorate_id: number;
  governorate_name?: string;
}
