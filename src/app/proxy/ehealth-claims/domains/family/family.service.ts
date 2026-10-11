import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { CreateFamilyDto, FamilyDto, FamilySearchRequestDto, UpdateFamilyDto } from '../../view-models/family/models';

@Injectable({
  providedIn: 'root',
})
export class FamilyService {
  apiName = 'Default';
  

  createByInput = (input: CreateFamilyDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: '/api/app/family',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  deleteById = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'DELETE',
      responseType: 'text',
      url: `/api/app/family/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getAllByDto = (dto: FamilySearchRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<FamilyDto>>({
      method: 'GET',
      url: '/api/app/family',
      params: { pageSize: dto.pageSize, pageNumber: dto.pageNumber, name: dto.name, familyId: dto.familyId, employerId: dto.employerId, nationalId: dto.nationalId },
    },
    { apiName: this.apiName,...config });
  

  getByIdById = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FamilyDto>({
      method: 'GET',
      url: `/api/app/family/${id}/by-id`,
    },
    { apiName: this.apiName,...config });
  

  updateByInput = (input: UpdateFamilyDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'PUT',
      responseType: 'text',
      url: '/api/app/family',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
