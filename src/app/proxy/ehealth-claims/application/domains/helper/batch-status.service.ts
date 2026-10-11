import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { BatchStatusDto } from '../../../domains/helper/provider/models';

@Injectable({
  providedIn: 'root',
})
export class BatchStatusService {
  apiName = 'Default';
  

  getBatchStatus = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, BatchStatusDto[]>({
      method: 'GET',
      url: '/api/app/batch-status/batch-status',
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
