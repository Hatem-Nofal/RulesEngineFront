import type { BatchReportDto, ChartDto, ClaimReportDto, ClaimsHourelyDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  apiName = 'Default';
  

  batchStatus = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, BatchReportDto>({
      method: 'POST',
      url: '/api/app/reports/batch-status',
    },
    { apiName: this.apiName,...config });
  

  charts = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ChartDto>({
      method: 'POST',
      url: '/api/app/reports/charts',
    },
    { apiName: this.apiName,...config });
  

  claimsHourelyByOrganizationId = (organizationId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimsHourelyDto>({
      method: 'POST',
      url: `/api/app/reports/claims-hourely/${organizationId}`,
    },
    { apiName: this.apiName,...config });
  

  dailyClaimsBySelectedDateFromAndSelectedDateToAndOrganizationId = (selectedDateFrom: string, selectedDateTo: string, organizationId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimReportDto>({
      method: 'POST',
      url: `/api/app/reports/daily-claims/${organizationId}`,
      params: { selectedDateFrom, selectedDateTo },
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
