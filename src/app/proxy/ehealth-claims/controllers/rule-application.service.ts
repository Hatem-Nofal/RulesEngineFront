import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { ImportRulesDto } from '../domains/rules/models';

@Injectable({
  providedIn: 'root',
})
export class RuleApplicationService {
  apiName = 'Default';
  

  importRulesFromExcelByInput = (input: ImportRulesDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string>({
      method: 'POST',
      responseType: 'text',
      url: '/import-rules',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
