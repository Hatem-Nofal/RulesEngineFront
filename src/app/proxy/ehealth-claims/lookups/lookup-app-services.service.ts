import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';
import type { SelectedDropDownList } from '../../common/dtos/models';

@Injectable({
  providedIn: 'root',
})
export class LookupAppServicesService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  
  getActivitySubTypeDropDownListByActivityTypeId = (activityTypeId: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: `/api/app/lookup-app-services/activity-sub-type-drop-down-list/${activityTypeId}`,
    },
      { apiName: this.apiName,...config });
  

  
  getActivityTypeDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup-app-services/activity-type-drop-down-list',
    },
      { apiName: this.apiName,...config });
  

  
  getDiagnosisDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup-app-services/diagnosis-drop-down-list',
    },
      { apiName: this.apiName,...config });
  

  
  getSpecialitiesIdDropDownList = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, SelectedDropDownList[]>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/lookup-app-services/specialities-id-drop-down-list',
    },
      { apiName: this.apiName,...config });
}
