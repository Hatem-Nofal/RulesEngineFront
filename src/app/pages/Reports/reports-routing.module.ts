import {   Routes } from '@angular/router';
import { StatusReportComponent } from './StatusReport/StatusReport.component';
import { ChartsReportComponent } from './ChartsReport/ChartsReport.component';
import { ClaimsReportComponent } from './ClaimsReport/ClaimsReport.component';
import { ClaimsHourlyReportComponent } from './ClaimsHourlyReport/ClaimsHourlyReport.component';
import { permissionGuard } from '@abp/ng.core';
import { ReportsPermissions } from 'src/app/shared/models/appPermissions';

export const reportsPermissions=ReportsPermissions

export const ReportsRoutings: Routes = [
  {
    path: 'statusReport',
    pathMatch: 'full',
    component: StatusReportComponent,
    data: { breadcrumb: 'Status Report' ,requiredPolicy: reportsPermissions.ReportsBatchStatus},
    canActivate: [permissionGuard],


  },
  {
    path: 'chartReport',
    pathMatch: 'full',
    component: ChartsReportComponent,
    data: { breadcrumb: 'Charts Report' ,requiredPolicy: reportsPermissions.ReportsCharts},
    canActivate: [permissionGuard],
  },
  {
    path: 'dailyClaimsReport',
    pathMatch: 'full',
    component: ClaimsReportComponent,
    data: { breadcrumb: 'Claims Daily Report' ,requiredPolicy: reportsPermissions.ReportsDailyClaims},
    canActivate: [permissionGuard],
  },
  {
    path: 'claimsHourlyReport',
    pathMatch: 'full',
    component: ClaimsHourlyReportComponent,
    data: { breadcrumb: 'Claims Hourly Report' ,requiredPolicy: reportsPermissions.ReportsClaimsHourely},
    canActivate: [permissionGuard],
  }
];


