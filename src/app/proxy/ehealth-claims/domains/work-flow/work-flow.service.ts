import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { WorkFlowDto } from '../rules/models';
import type { ApiResponseDto } from '../../../rules/models/response/models';

@Injectable({
  providedIn: 'root',
})
export class WorkFlowService {
  apiName = 'Default';
  

  create = (input: WorkFlowDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ApiResponseDto>({
      method: 'POST',
      url: '/api/app/work-flow',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ApiResponseDto>({
      method: 'DELETE',
      url: `/api/app/work-flow/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, WorkFlowDto>({
      method: 'GET',
      url: `/api/app/work-flow/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getFilteredWorkFlowByIdById = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, WorkFlowDto>({
      method: 'GET',
      url: `/api/app/work-flow/${id}/filtered-work-flow-by-id`,
    },
    { apiName: this.apiName,...config });
  

  getList = (pageNumber: number, pageSize: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<WorkFlowDto>>({
      method: 'GET',
      url: '/api/app/work-flow',
      params: { pageNumber, pageSize },
    },
    { apiName: this.apiName,...config });
  

  update = (input: WorkFlowDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ApiResponseDto>({
      method: 'PUT',
      url: '/api/app/work-flow',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
