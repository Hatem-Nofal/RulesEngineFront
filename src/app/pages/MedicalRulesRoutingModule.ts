import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from '@abp/ng.core';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';
import { ClaimsPermissions, RulesPermissions, WorkflowsPermissions } from '../shared/models/appPermissions';

const claimsPermissions =ClaimsPermissions;
const rulesPermissions =RulesPermissions;
const workFlowsPermissions =WorkflowsPermissions;
export const MEDICAL_RULES_ROUTES: Routes = [
  
   { path: 'rules',    canActivate: [authGuard, loginGuard, permissionGuard],
 loadChildren: () => import('./rules/rules.routes').then(m => m.RULES_ROUTES) },
  { path: 'workflows',     canActivate: [authGuard, loginGuard, permissionGuard],
loadChildren: () => import('./workflows/workflows.routes').then(m => m.WORKFLOWS_ROUTES) },
  {
    path: 'form-configs',
      canActivate: [authGuard, loginGuard, permissionGuard],
  loadChildren: () => import('./form-configs/form-configs.routes').then(m => m.FORM_CONFIGS_ROUTES),
  }
  
  
];