import type { RuleExpressionResultDto } from './rule-expression-builders/models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { CreateRuleDto, RuleDto, RuleListItemDto } from '../dtos/rules-dtos/models';

@Injectable({
  providedIn: 'root',
})
export class RuleService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  
  bulkUpload = (workflowId: string, fileContent: FormData, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'POST',
      responseType: 'blob',
      headers: { Accept: 'application/octet-stream' },
      url: `/api/app/rule/bulk-upload/${workflowId}`,
      body: fileContent,
    },
      { apiName: this.apiName,...config });
  

  
  create = (input: CreateRuleDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/rule',
      body: input,
    },
      { apiName: this.apiName,...config });
  

  
  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/rule/${id}`,
    },
      { apiName: this.apiName,...config });
  

  
  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/rule/${id}`,
    },
      { apiName: this.apiName,...config });
  

  
  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<RuleListItemDto>>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/rule',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
      { apiName: this.apiName,...config });
  

  
  getRulesSample = (workflowId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      responseType: 'blob',
      headers: { Accept: 'application/octet-stream' },
      url: `/api/app/rule/rules-sample/${workflowId}`,
    },
      { apiName: this.apiName,...config });
  

  
  previewExpressionByInput = (input: RuleDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleExpressionResultDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/rule/preview-expression',
      body: input,
    },
      { apiName: this.apiName,...config });
  

  
  update = (id: string, input: CreateRuleDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleDto>({
      method: 'PUT',
      headers: { Accept: 'application/json' },
      url: `/api/app/rule/${id}`,
      body: input,
    },
      { apiName: this.apiName,...config });
}
