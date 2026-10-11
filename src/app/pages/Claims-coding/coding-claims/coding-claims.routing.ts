import { authGuard, permissionGuard } from '@abp/ng.core';
import { Routes } from '@angular/router';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';
import { CodingClaimsViewResolver } from './resolvers/coding-claims-view.resolver';
import { ClaimsCodingPermissions } from 'src/app/shared/models/appPermissions';


export const CODING_CLAIMS_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Coding Claims' , navigate:false},
    children: [
      {
        path: 'all',
        loadComponent: () => import('./coding-claims.component').then(c => c.CodingClaimsComponent),
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: { breadcrumb: 'All', status: 'all', requiredPolicy: `${ClaimsCodingPermissions.ClaimsCodingAll}` },
      },
      {
        path: 'drafted',
        loadComponent: () => import('./coding-claims.component').then(c => c.CodingClaimsComponent),
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: { breadcrumb: 'Draft', status: 'drafted', requiredPolicy: `${ClaimsCodingPermissions.ClaimsCodingDraft}` },
      },
      {
        path: 'new',
        loadComponent: () => import('./coding-claims.component').then(c => c.CodingClaimsComponent),
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: { breadcrumb: 'New', status: 'new', requiredPolicy: `${ClaimsCodingPermissions.ClaimsCodingNew}` },
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./components/coding-claims-edit/coding-claims-edit.component').then(
            c => c.CodingClaimsEditComponent
          ),
        canActivate: [authGuard, loginGuard, permissionGuard],
        resolve: { claimDetails: CodingClaimsViewResolver },
        data: { breadcrumb: 'Edit', requiredPolicy: `${ClaimsCodingPermissions.ClaimsCodingDraftEdit} || ${ClaimsCodingPermissions.ClaimsCodingAllEdit}` },
      },
      {
        path: 'view/:id',
        pathMatch: 'full',
        loadComponent: () =>
          import('./components/coding-claims-edit/coding-claims-edit.component').then(
            c => c.CodingClaimsEditComponent
          ),
        canActivate: [authGuard, loginGuard, permissionGuard],
        resolve: { claimDetails: CodingClaimsViewResolver },
        data: { breadcrumb: 'View', requiredPolicy: `${ClaimsCodingPermissions.ClaimsCodingDraftView} || ${ClaimsCodingPermissions.ClaimsCodingNewView} || ${ClaimsCodingPermissions.ClaimsCodingAllView}` },
      },
      {
        path: '',
        redirectTo: 'all',
        pathMatch: 'full',
        data: { breadcrumb: 'Coding Claims' },
      },
    ],
  },
];
