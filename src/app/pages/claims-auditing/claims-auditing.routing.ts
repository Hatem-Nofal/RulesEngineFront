import { authGuard, permissionGuard } from '@abp/ng.core';
import { Routes } from '@angular/router';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';
import { ClaimsProcessingPermissions, MyTasksPermissions } from 'src/app/shared/models/appPermissions';
import { CodingClaimsAuditResolver, CodingClaimsViewResolver } from '../Claims-coding/coding-claims/resolvers/coding-claims-view.resolver';

const claimsProcessingPermissions = ClaimsProcessingPermissions;
const myTasksPermissions = MyTasksPermissions;

export const CLAIMS_AUDITING_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Claims Auditing', navigate:false },
    children: [
      {
        path: 'audit',
        loadComponent: () =>
          import('../Claims-coding/coding-claims/coding-claims.component').then(
            c => c.CodingClaimsComponent
          ),
        canActivate: [authGuard, loginGuard, permissionGuard],

        data: {
          breadcrumb: 'Claims',
          status: 'audit',
          requiredPolicy: claimsProcessingPermissions.ClaimsProcessingClaims,
        },
      },
      {
        path: 'audit/:id',
        loadComponent: () =>
          import(
            '../Claims-coding/coding-claims/components/coding-claims-edit/coding-claims-edit.component'
          ).then(c => c.CodingClaimsEditComponent),
        canActivate: [authGuard, loginGuard, permissionGuard],
        resolve: {
          claimDetails: CodingClaimsAuditResolver,
        },
        data: {
          breadcrumb: 'Audit View',
          requiredPolicy: claimsProcessingPermissions.ClaimsProcessingClaims,
        },
      },
      {
        path: 'view/:id',
        pathMatch: 'full',
        loadComponent: () =>
          import(
            '../Claims-coding/coding-claims/components/coding-claims-edit/coding-claims-edit.component').then(c => c.CodingClaimsEditComponent),
        canActivate: [authGuard, loginGuard, permissionGuard],
        resolve: {
          claimDetails: CodingClaimsViewResolver,
        },
        data: { breadcrumb: 'View', requiredPolicy: claimsProcessingPermissions.ClaimsProcessingClaims, },
      },
      
      {
        path: '',
        redirectTo: 'entry',
        pathMatch: 'full',
      },
    ],
  },
];
