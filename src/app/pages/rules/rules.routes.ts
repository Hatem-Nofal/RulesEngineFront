import { Routes } from '@angular/router';

export const RULES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./rule-list.component').then(m => m.RuleListComponent) },
  { path: 'new', loadComponent: () => import('./rule-edit.component').then(m => m.RuleEditComponent) },
  { path: ':id', loadComponent: () => import('./rule-edit.component').then(m => m.RuleEditComponent) },
];
