 import { Routes } from '@angular/router';

export const RULES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./rule-list-component/rule-list-component').then(m => m.RuleListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./rule-edit-component/rule-edit.component').then(m => m.RuleEditComponent),
  }  ,
   {
    path: 'rules-bulk',
    loadComponent: () =>
      import('./rules-bulk-component/rules-bulk-component').then(m => m.RulesBulkComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./rule-edit-component/rule-edit.component').then(m => m.RuleEditComponent),
  }


];
