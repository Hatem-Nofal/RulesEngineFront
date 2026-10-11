import type { BatchECMDto, BatchECMList, BatchECMPagedAndFilterDto, ClaimECMDto, ClaimECMPagedAndFilterDto, ProviderECMDto, ProviderECMPagedAndFilterDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ECMService {
  apiName = 'Default';
  

  ecmClaimDetails = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimECMDto>({
      method: 'GET',
      url: `/api/app/e-cM/${id}/e-cMClaim-details`,
    },
    { apiName: this.apiName,...config });
  

  getECMBatchDetails = (batchId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BatchECMDto>({
      method: 'GET',
      url: `/api/app/e-cM/e-cMBatch-details/${batchId}`,
    },
    { apiName: this.apiName,...config });
  

  getECMBatches = (batchECMPagedAndFilterDto: BatchECMPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BatchECMList>({
      method: 'GET',
      url: '/api/app/e-cM/e-cMBatches',
      params: { providerId: batchECMPagedAndFilterDto.providerId, eHealthCode: batchECMPagedAndFilterDto.eHealthCode, uhiaBatchNo: batchECMPagedAndFilterDto.uhiaBatchNo, batchType: batchECMPagedAndFilterDto.batchType, serviceDate: batchECMPagedAndFilterDto.serviceDate, sorting: batchECMPagedAndFilterDto.sorting, skipCount: batchECMPagedAndFilterDto.skipCount, maxResultCount: batchECMPagedAndFilterDto.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getECMClaims = (claimECMPagedAndFilterDto: ClaimECMPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ClaimECMDto>>({
      method: 'GET',
      url: '/api/app/e-cM/e-cMClaims',
      params: { uhiaClaimCode: claimECMPagedAndFilterDto.uhiaClaimCode, uhiaBatchNo: claimECMPagedAndFilterDto.uhiaBatchNo, ehealthClaimno: claimECMPagedAndFilterDto.ehealthClaimno, patient_nid: claimECMPagedAndFilterDto.patient_nid, batchId: claimECMPagedAndFilterDto.batchId, sorting: claimECMPagedAndFilterDto.sorting, skipCount: claimECMPagedAndFilterDto.skipCount, maxResultCount: claimECMPagedAndFilterDto.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getECMProviders = (providerECMPagedAndFilterDto: ProviderECMPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProviderECMDto>({
      method: 'GET',
      url: '/api/app/e-cM/e-cMProviders',
      params: { providerCode: providerECMPagedAndFilterDto.providerCode, providerName: providerECMPagedAndFilterDto.providerName, governorateId: providerECMPagedAndFilterDto.governorateId, providerTypeId: providerECMPagedAndFilterDto.providerTypeId, sorting: providerECMPagedAndFilterDto.sorting, skipCount: providerECMPagedAndFilterDto.skipCount, maxResultCount: providerECMPagedAndFilterDto.maxResultCount },
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
