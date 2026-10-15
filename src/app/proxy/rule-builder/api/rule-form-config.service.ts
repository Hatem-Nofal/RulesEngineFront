import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { LookupDto } from '../../lookups/dtos/models';
import type { CreateFormConfigEditDto, FormConfigListDto, RuleFieldCatalogDto, RuleFormConfigDto } from '../../work-flows/dtos/rule-builders-dtos/models';

@Injectable({
  providedIn: 'root',
})
export class RuleFormConfigService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  
  create = (input: CreateFormConfigEditDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleFormConfigDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/rule-form-config',
      body: input,
    },
      { apiName: this.apiName,...config });
  

  
  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/rule-form-config/${id}`,
    },
      { apiName: this.apiName,...config });
  

  
  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleFormConfigDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/rule-form-config/${id}`,
    },
      { apiName: this.apiName,...config });
  

  
  getByWorkflow = (workflowId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleFormConfigDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/rule-form-config/by-workflow/${workflowId}`,
    },
      { apiName: this.apiName,...config });
  

  
  getConfigs = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, LookupDto[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/rule-form-config/configs',
    },
      { apiName: this.apiName,...config });
  

  
  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<FormConfigListDto>>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/rule-form-config',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
      { apiName: this.apiName,...config });
  

  
  ruleFields = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleFieldCatalogDto[]>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/rule-form-config/rule-fields',
    },
      { apiName: this.apiName,...config });
  

  
  update = (id: string, input: CreateFormConfigEditDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleFormConfigDto>({
      method: 'PUT',
      headers: { Accept: 'application/json' },
      url: `/api/app/rule-form-config/${id}`,
      body: input,
    },
      { apiName: this.apiName,...config });
}
