import { authGuard } from '@abp/ng.core';
import { Routes } from '@angular/router';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';

export const FAMILIES_ROUTES: Routes = [
  {
    path: '',
    data: { breadcrumb: 'families', navigate: false },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./families-list.component').then(c => c.FamiliesListComponent),
        canActivate: [authGuard, loginGuard],
      },
      {
        path: 'create',
        loadComponent: () =>
          import('../family-form/family-form.component').then(c => c.FamilyFormComponent),
        canActivate: [authGuard, loginGuard],
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('../family-form/family-form.component').then(c => c.FamilyFormComponent),
        canActivate: [authGuard, loginGuard],
      },
    ],
  },
];