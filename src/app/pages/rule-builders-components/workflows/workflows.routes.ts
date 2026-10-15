import { Routes } from '@angular/router';

export const WORKFLOWS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./workflow-list-component/workflow-list-component').then(
        m => m.WorkflowListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./workflow-edit-component/workflow-edit-component').then(
        m => m.WorkflowEditComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./workflow-edit-component/workflow-edit-component').then(
        m => m.WorkflowEditComponent,
      ),
  },
];
