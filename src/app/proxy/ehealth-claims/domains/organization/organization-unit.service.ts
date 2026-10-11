import type { CreateOrganizationDto, OrganizationDto, OrganizationListDto, OrganizationPagedAndFilterDto, UpdateOrganizationDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrganizationUnitService {
  apiName = 'Default';
  

  create = (input: CreateOrganizationDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrganizationDto>({
      method: 'POST',
      url: '/api/app/organization-unit',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/organization-unit/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrganizationDto>({
      method: 'GET',
      url: `/api/app/organization-unit/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: OrganizationPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<OrganizationListDto>>({
      method: 'GET',
      url: '/api/app/organization-unit',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: UpdateOrganizationDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrganizationDto>({
      method: 'PUT',
      url: `/api/app/organization-unit/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
