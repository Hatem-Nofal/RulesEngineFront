import type { BatchValidationJobStatusDto, ClaimParamsByCodeModel, ClaimParamsByCodeModelExtended, ClaimParamsModel, ClaimValidationResponse } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { BatchValidationRequest } from '../rules/models';

@Injectable({
  providedIn: 'root',
})
export class ClaimValidationService {
  apiName = 'Default';
  

  getAllValidationJobs = (pageSize: number, pageNumber: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<BatchValidationJobStatusDto>>({
      method: 'GET',
      url: '/api/app/claim-validation/validation-jobs',
      params: { pageSize, pageNumber },
    },
    { apiName: this.apiName,...config });
  

  specificValidateClaimsByModel = (model: ClaimParamsModel, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimValidationResponse>({
      method: 'POST',
      url: '/api/app/claim-validation/specific-validate-claims',
      body: model,
    },
    { apiName: this.apiName,...config });
  

  uploadJsonByInput = (input: ClaimParamsByCodeModel, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimValidationResponse>({
      method: 'POST',
      url: '/UploadJson',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  validateAllClaims = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'GET',
      responseType: 'text',
      url: '/api/app/claim-validation/validate-all-claims',
    },
    { apiName: this.apiName,...config });
  

  validateBatchByInput = (input: BatchValidationRequest, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: '/validate-batch',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  validateClaimsIntegrationByInput = (input: ClaimParamsByCodeModel, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimValidationResponse>({
      method: 'POST',
      url: '/ValidateClaimsIntegration',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  validateClaimsIntegrationExtendedByInput = (input: ClaimParamsByCodeModelExtended, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimValidationResponse>({
      method: 'POST',
      url: '/ValidateClaimsIntegrationExtended',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
