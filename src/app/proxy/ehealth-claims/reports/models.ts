import type { OrganizationDto } from '../domains/organization/models';

export interface BatchReportDto {
  totalProvider: number;
  totalBatches: number;
  draftBatches: number;
  newBatches: number;
  totalClaims: number;
  newClaims: number;
  draftClaims: number;
  predraftClaims: number;
}

export interface ChartDto {
  chartRecords: ChartRecordDto[];
  batchesData: number[];
  claimsData: number[];
}

export interface ChartRecordDto {
  day?: string;
  recordCount: number;
}

export interface ClaimReportDto {
  mediacalClaims: ClaimSummary[];
  totalOPs: number;
  totalIPs: number;
  totalERs: number;
  total: number;
}

export interface ClaimSummary {
  email?: string;
  totalClaims: number;
  typeCounts: Record<number, number>;
}

export interface ClaimsHourelyDto {
  todayhourlyRecords: HourlyRecordDto[];
  yesterdayhourlyRecords: HourlyRecordDto[];
  beforeyesterdayhourlyRecords: HourlyRecordDto[];
  todayDate?: string;
  yesterdayDate?: string;
  beforeyesterdayDate?: string;
  selectedOrganization: OrganizationDto;
}

export interface HourlyRecordDto {
  hourOfDay: number;
  recordCount: number;
}
