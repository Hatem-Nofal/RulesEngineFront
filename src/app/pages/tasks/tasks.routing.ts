import { authGuard, permissionGuard } from '@abp/ng.core';
import { Routes } from '@angular/router';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';
import { MyTasksPermissions } from 'src/app/shared/models/appPermissions';
import { CodingClaimsAuditResolver, CodingClaimsViewResolver } from '../Claims-coding/coding-claims/resolvers/coding-claims-view.resolver';
const myTasksPermissions = MyTasksPermissions
export const TASKS_ROUTES: Routes = [
  {
    path: 'entry',
    loadComponent: () => import('./tasks.component').then(c => c.TasksComponent),
    data: { breadcrumb: 'My Tasks Entry', requiredPolicy: myTasksPermissions.MyTasksEntry },
    canActivate: [authGuard, loginGuard, permissionGuard],
  },
  {
    path: 'audit',
    loadComponent: () => import('./tasks.component').then(c => c.TasksComponent),
    data: { breadcrumb: 'My Tasks Audit', requiredPolicy: myTasksPermissions.MyTasksAudit },
    canActivate: [authGuard, loginGuard, permissionGuard],
  },
  {
    path: 'audit/:id',
    loadComponent: () =>
      import('../Claims-coding/coding-claims/components/coding-claims-edit/coding-claims-edit.component').then(
        c => c.CodingClaimsEditComponent
      ),
    canActivate: [authGuard, loginGuard, permissionGuard],
    resolve: { claimDetails: CodingClaimsAuditResolver },
    data: { breadcrumb: 'Audit', requiredPolicy: myTasksPermissions.MyTasksAuditAudit },
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('../Claims-coding/coding-claims/components/coding-claims-edit/coding-claims-edit.component').then(
        c => c.CodingClaimsEditComponent
      ),
    canActivate: [authGuard, loginGuard, permissionGuard],
    resolve: { claimDetails: CodingClaimsViewResolver },
    data: { breadcrumb: 'Edit', requiredPolicy: myTasksPermissions.MyTasksEntryEdit },
  },
  {
    path: 'view/:id',
    pathMatch: 'full',
    loadComponent: () =>
      import('../Claims-coding/coding-claims/components/coding-claims-edit/coding-claims-edit.component').then(
        c => c.CodingClaimsEditComponent
      ),
    canActivate: [authGuard, loginGuard, permissionGuard],
    resolve: { claimDetails: CodingClaimsViewResolver },
    data: { breadcrumb: 'View', requiredPolicy: `${myTasksPermissions.MyTasksEntryView} || ${myTasksPermissions.MyTasksAuditView}` },  },
  {
    path: '',
    redirectTo: 'entry',
    pathMatch: 'full',
  },
];
