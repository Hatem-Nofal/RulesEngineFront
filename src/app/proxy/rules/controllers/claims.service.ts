import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { BatchExportRequest, BatchesDropDownDto, ClaimValidationResponse, ClaimsDropDownDto, SingleClaimValidationRequest } from '../../ehealth-claims/domains/claims/models';

@Injectable({
  providedIn: 'root',
})
export class ClaimsService {
  apiName = 'Default';
  

  exportResultsByRequest = (request: BatchExportRequest, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'POST',
      responseType: 'blob',
      url: '/api/claims/export-results',
      body: request,
    },
    { apiName: this.apiName,...config });
  

  getBatchesDropDownByPageSizeAndPageNumberAndSearch = (pageSize: number = 50, pageNumber: number = 1, search?: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BatchesDropDownDto>({
      method: 'GET',
      url: '/api/claims/batches/dropdown',
      params: { pageSize, pageNumber, search },
    },
    { apiName: this.apiName,...config });
  

  getClaimsDropDownByPageSizeAndPageNumberAndBatchidAndSearch = (pageSize: number = 50, pageNumber: number = 1, batchid?: number, search?: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimsDropDownDto>({
      method: 'GET',
      url: '/api/claims/GetClaimsDropDown',
      params: { pageSize, pageNumber, batchid, search },
    },
    { apiName: this.apiName,...config });
  

  validateSingleClaimAgainstWorkflowsByRequest = (request: SingleClaimValidationRequest, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimValidationResponse>({
      method: 'POST',
      url: '/api/claims/ValidateSingleClaim',
      body: request,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
