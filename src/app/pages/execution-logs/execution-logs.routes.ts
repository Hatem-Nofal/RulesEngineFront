import { Routes } from '@angular/router';

export const EXECUTION_LOGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./execution-log-list.component').then((module) => module.ExecutionLogListComponent),
    data: { breadcrumb: 'Execution Logs' },
  },
];
