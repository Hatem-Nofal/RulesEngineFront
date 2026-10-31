import type { ActivityViolationsDto, ClaimNumberViolationsDto, DashboardFilterDto, RuleViolationsDto, ViolationsDetailsDto, WorkflowViolationsDto } from './dtos/models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  getActivityViolationsCountsByInput = (input: DashboardFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ActivityViolationsDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/dashboard/activity-violations-counts',
      params: { workFlowName: input.workFlowName, fromDate: input.fromDate, toDate: input.toDate, activity: input.activity },
    },
    { apiName: this.apiName,...config });
  

  getClaimNumberViolationsCountsByInput = (input: DashboardFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimNumberViolationsDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/dashboard/claim-number-violations-counts',
      params: { workFlowName: input.workFlowName, fromDate: input.fromDate, toDate: input.toDate, activity: input.activity },
    },
    { apiName: this.apiName,...config });
  

  getRuleViolationsCountsByInput = (input: DashboardFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, RuleViolationsDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/dashboard/rule-violations-counts',
      params: { workFlowName: input.workFlowName, fromDate: input.fromDate, toDate: input.toDate, activity: input.activity },
    },
    { apiName: this.apiName,...config });
  

  getViolationsDetailsByInput = (input: DashboardFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ViolationsDetailsDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/dashboard/violations-details',
      params: { workFlowName: input.workFlowName, fromDate: input.fromDate, toDate: input.toDate, activity: input.activity },
    },
    { apiName: this.apiName,...config });
  

  getWorkflowViolationsCountsByInput = (input: DashboardFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, WorkflowViolationsDto>({
      method: 'GET',
      headers: { Accept: 'application/json' },
      url: '/api/app/dashboard/workflow-violations-counts',
      params: { workFlowName: input.workFlowName, fromDate: input.fromDate, toDate: input.toDate, activity: input.activity },
    },
    { apiName: this.apiName,...config });
}