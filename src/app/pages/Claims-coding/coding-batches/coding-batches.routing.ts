import { authGuard, permissionGuard } from '@abp/ng.core';
import { Routes } from '@angular/router';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';
import { CodingBatchesEditComponent } from './components/coding-batches-edit/coding-batches-edit.component';
import { CodingBatchesViewResolver } from './resolvers/coding-batches-view.resolver';
import { BatchesCodingPermissions, BatchesProcessingPermissions, ClaimsCodingPermissions } from 'src/app/shared/models/appPermissions';

export const batchesCodingPermissions = BatchesCodingPermissions
export const claimsCodingPermissions = ClaimsCodingPermissions

export const CODING_BATCHES_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Coding Batches' , navigate:false },
    children: [
      {
        path: 'all',
        loadComponent: () =>
          import('./coding-batches.component').then(c => c.CodingBatchesComponent),
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: { breadcrumb: 'All', status: 'all', requiredPolicy: `${BatchesCodingPermissions.BatchesCodingAll}` },
      },
      {
        path: 'draft',
        loadComponent: () =>
          import('./coding-batches.component').then(c => c.CodingBatchesComponent),
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: { breadcrumb: 'Draft', status: 'draft', requiredPolicy: `${BatchesCodingPermissions.BatchesCodingDraft}` },
      },
      {
        path: 'predrafted',
        loadComponent: () =>
          import('./coding-batches.component').then(c => c.CodingBatchesComponent),
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: { breadcrumb: 'Predrafted', status: 'predrafted', requiredPolicy: `${BatchesCodingPermissions.BatchesCodingPreDraft}` },
      },
      {
        path: 'completed',
        pathMatch: 'full',
        loadComponent: () =>
          import('./coding-batches.component').then(c => c.CodingBatchesComponent),
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: { breadcrumb: 'Completed', status: 'completed', requiredPolicy: `${BatchesCodingPermissions.BatchesCodingCompleted}` },
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./coding-batches.component').then(c => c.CodingBatchesComponent),
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: { breadcrumb: 'New', status: 'new', requiredPolicy: `${BatchesCodingPermissions.BatchesCodingNew}` },
      },
      {
        path: 'issued',
        loadComponent: () =>
          import('./coding-batches.component').then(c => c.CodingBatchesComponent),
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: { breadcrumb: 'Issued', status: 'issued', requiredPolicy: `${BatchesCodingPermissions.BatchesCodingIssued}` },
      },
      {
        path: 'view/:id',
        loadComponent: () =>
          import('./components/coding-batches-view/coding-batches-view.component').then(
            c => c.CodingBatchesViewComponent
          ),
        canActivate: [authGuard, loginGuard, permissionGuard],
        resolve: {
          batchesDetails: CodingBatchesViewResolver
        },
        data: { breadcrumb: 'View Batch', requiredPolicy: `${BatchesCodingPermissions.BatchesCodingAllView} || ${BatchesCodingPermissions.BatchesCodingCompletedView} || ${BatchesCodingPermissions.BatchesCodingDraftView} || ${BatchesCodingPermissions.BatchesCodingIssuedView} || ${BatchesCodingPermissions.BatchesCodingNewView} || ${BatchesCodingPermissions.BatchesCodingPreDraftView}` },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./components/coding-batches-create/coding-batches-create.component').then(
            c => c.CodingBatchesCreateComponent
          ),
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: { breadcrumb: 'Create Batch', requiredPolicy: `${BatchesCodingPermissions.BatchesCodingAllCreate} || ${BatchesCodingPermissions.BatchesCodingCompletedCreate} || ${BatchesCodingPermissions.BatchesCodingDraftCreate} || ${BatchesCodingPermissions.BatchesCodingIssuedCreate} || ${BatchesCodingPermissions.BatchesCodingNewCreate} || ${BatchesCodingPermissions.BatchesCodingPreDraftCreate}` },
      },
      {
        path: 'edit/:id',
        component: CodingBatchesEditComponent,
        canActivate: [authGuard, loginGuard, permissionGuard],
        resolve: {
          batchesDetails: CodingBatchesViewResolver,
        },
        data: { breadcrumb: 'Edit Batch', requiredPolicy: `${BatchesCodingPermissions.BatchesCodingAllEdit} || ${BatchesCodingPermissions.BatchesCodingCompletedEdit} || ${BatchesCodingPermissions.BatchesCodingDraftEdit} || ${BatchesCodingPermissions.BatchesCodingIssuedEdit} || ${BatchesCodingPermissions.BatchesCodingNewEdit} || ${BatchesCodingPermissions.BatchesCodingPreDraftEdit}` },
      },
      {
        path: '',
        redirectTo: 'all',
        pathMatch: 'full',
        data: { breadcrumb: 'Coding Batches' },
      },
    ],
  },
];
