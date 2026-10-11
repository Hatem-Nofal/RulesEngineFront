import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DeActivateBeneficiaryDto, SearchTargetFamilyRequest, TargetFamilyResultDto } from '../../view-models/beneficiary/models';
import type { BeneficiaryDto, BeneficiaryFamilyTreeRowDto, BeneficiarySearchRequestDto, CreateAndUpdateBeneficiaryRequestDto, EmployerDto, MoveBeneficiaryRequest, SplitBeneficiaryRequest, SplitBeneficiaryResultDto } from '../../view-models/models';

@Injectable({
  providedIn: 'root',
})
export class BeneficiariesService {
  apiName = 'Default';
  

  create = (request: CreateAndUpdateBeneficiaryRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, number[]>({
      method: 'POST',
      url: '/api/app/beneficiaries',
      body: request,
    },
    { apiName: this.apiName,...config });
  

  deActivateBeneficiary = (input: DeActivateBeneficiaryDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, boolean>({
      method: 'POST',
      url: '/api/app/beneficiaries/de-activate-beneficiary',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'DELETE',
      responseType: 'text',
      url: `/api/app/beneficiaries/${id}`,
    },
    { apiName: this.apiName,...config });
  

  generateNextCode = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: '/api/app/beneficiaries/generate-next-code',
    },
    { apiName: this.apiName,...config });
  

  getAll = (dto: BeneficiarySearchRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<BeneficiaryDto>>({
      method: 'GET',
      url: '/api/app/beneficiaries',
      params: { pageSize: dto.pageSize, pageNumber: dto.pageNumber, name: dto.name, familyId: dto.familyId, employerId: dto.employerId, nationalId: dto.nationalId, onlyParents: dto.onlyParents },
    },
    { apiName: this.apiName,...config });
  

  getAllEmployers = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, EmployerDto[]>({
      method: 'GET',
      url: '/api/app/beneficiaries/employers',
    },
    { apiName: this.apiName,...config });
  

  getBeneficiaryDropDownByName = (name: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BeneficiaryDto[]>({
      method: 'GET',
      url: '/api/app/beneficiaries/beneficiary-drop-down',
      params: { name },
    },
    { apiName: this.apiName,...config });
  

  getById = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BeneficiaryDto>({
      method: 'GET',
      url: `/api/app/beneficiaries/${id}/by-id`,
    },
    { apiName: this.apiName,...config });
  

  getFamilyTreeById = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BeneficiaryFamilyTreeRowDto[]>({
      method: 'GET',
      url: `/api/app/beneficiaries/${id}/family-tree`,
    },
    { apiName: this.apiName,...config });
  

  moveBeneficiaryByInput = (input: MoveBeneficiaryRequest, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/beneficiaries/move-beneficiary',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  searchByNationalIdById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BeneficiaryDto>({
      method: 'POST',
      url: `/api/app/beneficiaries/${id}/search-by-national-id`,
    },
    { apiName: this.apiName,...config });
  

  searchTargetFamilyForMoveByInput = (input: SearchTargetFamilyRequest, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TargetFamilyResultDto>({
      method: 'POST',
      url: '/api/app/beneficiaries/search-target-family-for-move',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  splitBeneficiaryByInput = (input: SplitBeneficiaryRequest, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SplitBeneficiaryResultDto>({
      method: 'POST',
      url: '/api/app/beneficiaries/split-beneficiary',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  update = (request: CreateAndUpdateBeneficiaryRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, number[]>({
      method: 'PUT',
      url: '/api/app/beneficiaries',
      body: request,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
