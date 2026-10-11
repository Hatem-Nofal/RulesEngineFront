import { authGuard, permissionGuard } from '@abp/ng.core';
import { Routes } from '@angular/router';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';
import { DigitalArchivePermissions } from 'src/app/shared/models/appPermissions';

const digitalArchivePermissions = DigitalArchivePermissions;
export const DIGITAL_ARCHIVE_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Digital Archive' ,navigate:false },
    children: [
      {
        path: 'providers',
        loadComponent: () =>
          import('./archive-providers/archive-providers.component').then(
            c => c.ArchiveProvidersComponent
          ),
        canActivate: [authGuard, loginGuard, permissionGuard],

        data: {
          breadcrumb: 'Providers',
          requiredPolicy: digitalArchivePermissions.DigitalArchiveProviders,
        },
      },
      {
        path: 'batches',
        loadComponent: () =>
          import('./archive-batches/archive-batches.component').then(
            c => c.ArchiveBatchesComponent
          ),
        canActivate: [authGuard, loginGuard, permissionGuard],

        data: {
          breadcrumb: 'Batches',
          requiredPolicy: digitalArchivePermissions.DigitalArchiveBatches,
        },
      },
      {
        path: 'batches/view/:id',
        loadComponent: () =>
          import('./archive-batches-details/archive-batches-details.component').then(
            c => c.ArchiveBatchesDetailsComponent
          ),
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: {
          breadcrumb: 'Batch View',
          requiredPolicy: digitalArchivePermissions.DigitalArchiveBatchesView,
        },
      },
      {
        path: 'claims',
        loadComponent: () =>
          import('./archive-claims/archive-claims.component').then(c => c.ArchiveClaimsComponent),
        data: {
          breadcrumb: 'Claims',
          requiredPolicy: digitalArchivePermissions.DigitalArchiveClaims,
        },
        canActivate: [authGuard, loginGuard, permissionGuard],
      },
      {
        path: 'claims/view/:id',
        loadComponent: () =>
          import('./archive-claims-details/archive-claims-details.component').then(
            c => c.ArchiveClaimsDetailsComponent
          ),
        data: {
          breadcrumb: 'Claim View',
          requiredPolicy: digitalArchivePermissions.DigitalArchiveClaimsView,
        },
        canActivate: [authGuard, loginGuard, permissionGuard],
      },
      {
        path: '',
        redirectTo: 'providers',
        pathMatch: 'full',
      },
    ],
  },
];
