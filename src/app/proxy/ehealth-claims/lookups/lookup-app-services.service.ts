import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { SelectedDropDownList, SelectedWithPriceDropDownList, SelectedWithProviderDropDownList } from '../application/contracts/common/dto/models';
import type { SelectedDropDownListByGuid } from '../common/dto/models';
import type { BeneficiaryDropDownDto } from '../view-models/models';

@Injectable({
  providedIn: 'root',
})
export class LookupAppServicesService {
  apiName = 'Default';
  

  getActivityRegectionReasonDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/activity-regection-reason-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getActivitySubTypeByActivityIdAndsearchTermDropDownListByActivityIdAndSearchTermAndBatchId = (activityId: number, searchTerm: string, batchId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedWithPriceDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/activity-sub-type-by-activity-id-andsearch-term-drop-down-list',
      params: { activityId, searchTerm, batchId },
    },
    { apiName: this.apiName,...config });
  

  getActivitySubTypeByActivityIdDropDownListByActivityIdAndSubTypeId = (activityId: number, subTypeId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedWithPriceDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/activity-sub-type-by-activity-id-drop-down-list',
      params: { activityId, subTypeId },
    },
    { apiName: this.apiName,...config });
  

  getActivityTagsDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/activity-tags-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getActivityTypeDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/activity-type-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getAreaDropDownListByGovId = (GovId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/Lookup/GetAreaDropDownList',
      params: { govId: GovId },
    },
    { apiName: this.apiName,...config });
  

  getBatchForOrganizationAuditDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/batch-for-organization-audit-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getBatchForOrganizationEntryDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/batch-for-organization-entry-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getBatchStatusDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/batch-status-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getBeneficiariesDropDownByName = (name: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, BeneficiaryDropDownDto[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/beneficiaries-drop-down',
      params: { name },
    },
    { apiName: this.apiName,...config });
  

  getClaimAuditDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/claim-audit-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getClaimLoggingDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/claim-logging-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getClaimTagsDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/claim-tags-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getClinicansDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/clinicans-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getDiagnosisByIdDropDownListByDiagnosisId = (diagnosisId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: `/api/app/lookup-app-services/diagnosis-by-id-drop-down-list/${diagnosisId}`,
    },
    { apiName: this.apiName,...config });
  

  getDiagnosisDropDownListBySearchTerm = (searchTerm: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/GetDiagnosisDropDownList',
      params: { searchTerm },
    },
    { apiName: this.apiName,...config });
  

  getGovernateDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/governate-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getNationalityDropDownListBySelectedId = (selectedId?: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/nationality-drop-down-list',
      params: { selectedId },
    },
    { apiName: this.apiName,...config });
  

  getOrganizationUnitDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<SelectedDropDownListByGuid>>({
      method: 'GET',
      url: '/api/app/lookup-app-services/organization-unit-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getProviderByGovernateIdByGovId = (GovId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedWithProviderDropDownList[]>({
      method: 'GET',
      url: '/api/Lookup/GetProviderByGovernateId',
      params: { govId: GovId },
    },
    { apiName: this.apiName,...config });
  

  getProviderDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedWithProviderDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/provider-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getProviderTypeDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/provider-type-drop-down-list',
    },
    { apiName: this.apiName,...config });
  

  getServiceTypeDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      url: '/api/app/lookup-app-services/service-type-drop-down-list',
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
