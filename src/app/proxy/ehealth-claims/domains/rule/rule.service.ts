import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { DiagnosisLookupDto, MedicationLookupDto } from '../claims/models';
import type { ActivityTypeLookUpDto, DiagnosisFilterDto, MedicsFilterDto, RuleDto, RulesFileDto, RulesFilterModel, WorkflowDropDownDto } from '../rules/models';

@Injectable({
  providedIn: 'root',
})
export class RuleService {
  apiName = 'Default';
  

  create = (input: RuleDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleDto>({
      method: 'POST',
      url: '/api/app/rule',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'DELETE',
      responseType: 'text',
      url: `/api/app/rule/${id}`,
    },
    { apiName: this.apiName,...config });
  

  downloadLatestLog = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      responseType: 'blob',
      url: '/DownloadLatestLog',
    },
    { apiName: this.apiName,...config });
  

  exportRulesTemplateByWorkflowId = (workflowId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      responseType: 'blob',
      url: '/export-rules-template',
      params: { workflowId },
    },
    { apiName: this.apiName,...config });
  

  get = (id: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleDto>({
      method: 'GET',
      url: `/api/app/rule/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getActivityTypes = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ActivityTypeLookUpDto[]>({
      method: 'GET',
      url: '/activitytypes',
    },
    { apiName: this.apiName,...config });
  

  getAllRulesFilesByPageNumberAndPageSize = (pageNumber: number, pageSize: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<RulesFileDto>>({
      method: 'GET',
      url: '/GetAllRulesFiles',
      params: { pageNumber, pageSize },
    },
    { apiName: this.apiName,...config });
  

getAllWorkflows = (filter?: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, WorkflowDropDownDto[]>({
      method: 'GET',
      url: '/get-all-workflows',
      params: { filter },
    },
    { apiName: this.apiName, ...config });
  

  getList = (model: RulesFilterModel, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<RuleDto>>({
      method: 'POST',
      url: '/api/app/rule/get-list',
      body: model,
    },
    { apiName: this.apiName,...config });
  

  update = (input: RuleDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleDto>({
      method: 'PUT',
      url: '/api/app/rule',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  diagnosesDropDownByFilterDto = (filterDto: DiagnosisFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DiagnosisLookupDto[]>({
      method: 'POST',
      url: '/api/app/rule/diagnoses-drop-down',
      body: filterDto,
    },
    { apiName: this.apiName,...config });
  

  seeddata = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'GET',
      responseType: 'text',
      url: '/seeddata',
    },
    { apiName: this.apiName,...config });
  

  setDropDownValuesByFilter = (filter: MedicsFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MedicationLookupDto[]>({
      method: 'POST',
      url: '/api/app/rule/set-drop-down-values',
      body: filter,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
