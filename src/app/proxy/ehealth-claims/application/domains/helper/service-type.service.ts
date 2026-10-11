import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { ServiceTypeDto } from '../../../domains/helper/provider/models';

@Injectable({
  providedIn: 'root',
})
export class ServiceTypeService {
  apiName = 'Default';
  

  getServiceTypes = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ServiceTypeDto[]>({
      method: 'GET',
      url: '/api/app/service-type/service-types',
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
