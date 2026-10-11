import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { BatchDto, BatchListDto, BatchPagedAndFilterDto, CreateBatchDto, UpdateBatchDto } from '../../contracts/domains/batch/models';

@Injectable({
  providedIn: 'root',
})
export class BatchService {
  apiName = 'Default';
  

  create = (input: CreateBatchDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BatchDto>({
      method: 'POST',
      url: '/api/app/batch',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/batch/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BatchDto>({
      method: 'GET',
      url: `/api/app/batch/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getCompletedList = (input: BatchPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<BatchListDto>>({
      method: 'GET',
      url: '/api/app/batch/completed-list',
      params: { uhia_Batch_code: input.uhia_Batch_code, ehealth_Batch_code: input.ehealth_Batch_code, serviceTypeId: input.serviceTypeId, service_Date: input.service_Date, reception_Date: input.reception_Date, type_id: input.type_id, status_id: input.status_id, provider_id: input.provider_id, serial: input.serial, claims_Count: input.claims_Count, claims_Amount: input.claims_Amount, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getDraftList = (input: BatchPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<BatchListDto>>({
      method: 'GET',
      url: '/api/app/batch/draft-list',
      params: { uhia_Batch_code: input.uhia_Batch_code, ehealth_Batch_code: input.ehealth_Batch_code, serviceTypeId: input.serviceTypeId, service_Date: input.service_Date, reception_Date: input.reception_Date, type_id: input.type_id, status_id: input.status_id, provider_id: input.provider_id, serial: input.serial, claims_Count: input.claims_Count, claims_Amount: input.claims_Amount, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getIssuedList = (input: BatchPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<BatchListDto>>({
      method: 'GET',
      url: '/api/app/batch/issued-list',
      params: { uhia_Batch_code: input.uhia_Batch_code, ehealth_Batch_code: input.ehealth_Batch_code, serviceTypeId: input.serviceTypeId, service_Date: input.service_Date, reception_Date: input.reception_Date, type_id: input.type_id, status_id: input.status_id, provider_id: input.provider_id, serial: input.serial, claims_Count: input.claims_Count, claims_Amount: input.claims_Amount, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getList = (input: BatchPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<BatchListDto>>({
      method: 'GET',
      url: '/api/app/batch',
      params: { uhia_Batch_code: input.uhia_Batch_code, ehealth_Batch_code: input.ehealth_Batch_code, serviceTypeId: input.serviceTypeId, service_Date: input.service_Date, reception_Date: input.reception_Date, type_id: input.type_id, status_id: input.status_id, provider_id: input.provider_id, serial: input.serial, claims_Count: input.claims_Count, claims_Amount: input.claims_Amount, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getNewList = (input: BatchPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<BatchListDto>>({
      method: 'GET',
      url: '/api/app/batch/new-list',
      params: { uhia_Batch_code: input.uhia_Batch_code, ehealth_Batch_code: input.ehealth_Batch_code, serviceTypeId: input.serviceTypeId, service_Date: input.service_Date, reception_Date: input.reception_Date, type_id: input.type_id, status_id: input.status_id, provider_id: input.provider_id, serial: input.serial, claims_Count: input.claims_Count, claims_Amount: input.claims_Amount, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getPendingList = (input: BatchPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<BatchListDto>>({
      method: 'GET',
      url: '/api/app/batch/pending-list',
      params: { uhia_Batch_code: input.uhia_Batch_code, ehealth_Batch_code: input.ehealth_Batch_code, serviceTypeId: input.serviceTypeId, service_Date: input.service_Date, reception_Date: input.reception_Date, type_id: input.type_id, status_id: input.status_id, provider_id: input.provider_id, serial: input.serial, claims_Count: input.claims_Count, claims_Amount: input.claims_Amount, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getPreDraftList = (input: BatchPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<BatchListDto>>({
      method: 'GET',
      url: '/api/app/batch/pre-draft-list',
      params: { uhia_Batch_code: input.uhia_Batch_code, ehealth_Batch_code: input.ehealth_Batch_code, serviceTypeId: input.serviceTypeId, service_Date: input.service_Date, reception_Date: input.reception_Date, type_id: input.type_id, status_id: input.status_id, provider_id: input.provider_id, serial: input.serial, claims_Count: input.claims_Count, claims_Amount: input.claims_Amount, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: number, input: UpdateBatchDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BatchDto>({
      method: 'PUT',
      url: `/api/app/batch/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });
  

  updateBatchOrganization = (batchId: number, newOrganizationId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BatchDto>({
      method: 'PUT',
      url: '/api/app/batch/batch-organization',
      params: { batchId, newOrganizationId },
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
