import type { ActivityViolationsCountDto, ClaimNumberViolationsCountDto, RuleViolationsCountDto, WorkflowViolationsCountDto } from './dtos/models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  geetActivityViolationsCounts = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ActivityViolationsCountDto[]>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/dashboard/geet-activity-violations-counts',
    },
    { apiName: this.apiName,...config });
  

  geetClaimNumberViolationsCounts = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimNumberViolationsCountDto[]>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/dashboard/geet-claim-number-violations-counts',
    },
    { apiName: this.apiName,...config });
  

  geetRuleViolationsCounts = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleViolationsCountDto[]>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/dashboard/geet-rule-violations-counts',
    },
    { apiName: this.apiName,...config });
  

  geetWorkflowViolationsCounts = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, WorkflowViolationsCountDto[]>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/dashboard/geet-workflow-violations-counts',
    },
    { apiName: this.apiName,...config });
}