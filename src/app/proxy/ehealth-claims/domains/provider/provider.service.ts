import type { CreateProviderDto, ProviderDto, ProviderListDto, ProviderPagedAndFilterDto, UpdateProviderDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  apiName = 'Default';
  

  create = (input: CreateProviderDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProviderDto>({
      method: 'POST',
      url: '/api/app/provider',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/provider/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProviderDto>({
      method: 'GET',
      url: `/api/app/provider/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: ProviderPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProviderListDto>>({
      method: 'GET',
      url: '/api/app/provider',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: number, input: UpdateProviderDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProviderDto>({
      method: 'PUT',
      url: `/api/app/provider/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
