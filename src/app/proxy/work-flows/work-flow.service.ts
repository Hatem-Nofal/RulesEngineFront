import type { SaveWorkflowDto, WorkflowDto, WorkflowPagedAndFilterDto } from './dtos/models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WorkFlowService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  
  create = (input: SaveWorkflowDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, WorkflowDto>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/work-flow',
      body: input,
    },
      { apiName: this.apiName,...config });
  

  
  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/work-flow/${id}`,
    },
      { apiName: this.apiName,...config });
  

  
  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, WorkflowDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/work-flow/${id}`,
    },
      { apiName: this.apiName,...config });
  

  
  getList = (input: WorkflowPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<WorkflowDto>>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/work-flow',
      params: { name: input.name, ruleFormConfigName: input.ruleFormConfigName, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
      { apiName: this.apiName,...config });
  

  
  update = (id: string, input: SaveWorkflowDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, WorkflowDto>({
      method: 'PUT',
      headers: { Accept: 'application/json' },
      url: `/api/app/work-flow/${id}`,
      body: input,
    },
      { apiName: this.apiName,...config });
}
