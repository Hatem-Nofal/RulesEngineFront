import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { SelectedDropDownList, SelectedDropDownListByGuid } from '../../common/dtos/models';

@Injectable({
  providedIn: 'root',
})
export class LookupService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  
  getActivitySubTypeDropDownListByActivityTypeId = (activityTypeId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/lookup/activity-sub-type-drop-down-list/${activityTypeId}`,
    },
      { apiName: this.apiName,...config });
  

  
  getActivitySubTypeDropDownListPagedByActivityTypeIdAndSearchTerm = (activityTypeId: number, searchTerm: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/lookup/activity-sub-type-drop-down-list-paged/${activityTypeId}`,
      params: { searchTerm },
    },
      { apiName: this.apiName,...config });
  

  
  getActivityTypeDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup/activity-type-drop-down-list',
    },
      { apiName: this.apiName,...config });
  

  
  getBatchTypesDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup/batch-types-drop-down-list',
    },
      { apiName: this.apiName,...config });
  

  
  getDiagnosisDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup/diagnosis-drop-down-list',
    },
      { apiName: this.apiName,...config });
  

  
  getDiagnosisDropDownListPagedBySearchTerm = (searchTerm: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup/diagnosis-drop-down-list-paged',
      params: { searchTerm },
    },
      { apiName: this.apiName,...config });
  

  
  getDuplicateTherapyGroupsDropDownListBySearchTerm = (searchTerm: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup/duplicate-therapy-groups-drop-down-list',
      params: { searchTerm },
    },
      { apiName: this.apiName,...config });
  

  
  getGenericDrugsDropDownListBySearchTerm = (searchTerm: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup/generic-drugs-drop-down-list',
      params: { searchTerm },
    },
      { apiName: this.apiName,...config });
  

  
  getMorbidityGroupsDropDownListBySearchTerm = (searchTerm: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup/morbidity-groups-drop-down-list',
      params: { searchTerm },
    },
      { apiName: this.apiName,...config });
  

  
  getSpecialitiesIdDropDownListBySearchTerm = (searchTerm: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup/specialities-id-drop-down-list',
      params: { searchTerm },
    },
      { apiName: this.apiName,...config });
  

  
  getWorkflowsDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownListByGuid[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup/workflows-drop-down-list',
    },
      { apiName: this.apiName,...config });
}
