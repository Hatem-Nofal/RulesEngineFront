import { Routes } from '@angular/router';

export const FORM_CONFIGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./form-config-list-component/form-config-list-component').then(
        m => m.FormConfigListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./form-config-edit-component/form-config-edit-component').then(
        m => m.FormConfigEditComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./form-config-edit-component/form-config-edit-component').then(
        m => m.FormConfigEditComponent,
      ),
  },
];
