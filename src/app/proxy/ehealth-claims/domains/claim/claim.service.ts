import type { DiagnosisDto } from './diagnosis/models';
import type { MedicalActivityDto } from './medical-activities/models';
import type { ClaimDto, ClaimListDto, ClaimPagedAndFilterDto, ClaimWithAuditDto, EditClaimDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { UpdateActivityWithAuditDto } from '../../application/contracts/domains/activity/models';

@Injectable({
  providedIn: 'root',
})
export class ClaimService {
  apiName = 'Default';
  

  claimCheckByClaimId = (claimId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: `/api/app/claim/claim-check/${claimId}`,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/claim/${id}`,
    },
    { apiName: this.apiName,...config });
  

  editAuditClaimByInput = (input: UpdateActivityWithAuditDto[], config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/claim/edit-audit-claim',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  editClaimByInput = (input: EditClaimDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/claim/edit-claim',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, isEdit: boolean, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimDto>({
      method: 'GET',
      url: `/api/app/claim/${id}`,
      params: { isEdit },
    },
    { apiName: this.apiName,...config });
  

  getClaimActivitiesByIdAndIsEdit = (id: number, isEdit: boolean, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MedicalActivityDto[]>({
      method: 'GET',
      url: `/api/app/claim/${id}/claim-activities`,
      params: { isEdit },
    },
    { apiName: this.apiName,...config });
  

  getClaimDiagnosisByIdAndIsEdit = (id: number, isEdit: boolean, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DiagnosisDto[]>({
      method: 'GET',
      url: `/api/app/claim/${id}/claim-diagnosis`,
      params: { isEdit },
    },
    { apiName: this.apiName,...config });
  

  getDraftList = (input: ClaimPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ClaimListDto>>({
      method: 'GET',
      url: '/api/app/claim/draft-list',
      params: { number: input.number, patient_nid: input.patient_nid, batch_name: input.batch_name, batch_id: input.batch_id, firstUpdate_timestamp: input.firstUpdate_timestamp, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getList = (input: ClaimPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ClaimListDto>>({
      method: 'GET',
      url: '/api/app/claim',
      params: { number: input.number, patient_nid: input.patient_nid, batch_name: input.batch_name, batch_id: input.batch_id, firstUpdate_timestamp: input.firstUpdate_timestamp, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getMyTasksAuditByInput = (input: ClaimPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ClaimListDto>>({
      method: 'GET',
      url: '/api/app/claim/my-tasks-audit',
      params: { number: input.number, patient_nid: input.patient_nid, batch_name: input.batch_name, batch_id: input.batch_id, firstUpdate_timestamp: input.firstUpdate_timestamp, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getMyTasksByInput = (input: ClaimPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ClaimListDto>>({
      method: 'GET',
      url: '/api/app/claim/my-tasks',
      params: { number: input.number, patient_nid: input.patient_nid, batch_name: input.batch_name, batch_id: input.batch_id, firstUpdate_timestamp: input.firstUpdate_timestamp, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getNewList = (input: ClaimPagedAndFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ClaimListDto>>({
      method: 'GET',
      url: '/api/app/claim/new-list',
      params: { number: input.number, patient_nid: input.patient_nid, batch_name: input.batch_name, batch_id: input.batch_id, firstUpdate_timestamp: input.firstUpdate_timestamp, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getWithAudit = (claimId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimWithAuditDto>({
      method: 'GET',
      url: `/api/app/claim/with-audit/${claimId}`,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
