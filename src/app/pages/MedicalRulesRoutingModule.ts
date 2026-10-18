import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from '@abp/ng.core';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';
import { RulesPermissions, WorkflowsPermissions } from '../shared/models/appPermissions';

const rulesPermissions = RulesPermissions;
const workFlowsPermissions = WorkflowsPermissions;
export const MEDICAL_RULES_ROUTES: Routes = [
  {
    path: 'rules',
    canActivate: [authGuard, loginGuard],
    // data: { requiredPolicy: rulesPermissions.Rules_View },
    loadChildren: () =>
      import('./rule-builders-components/rules/rules.routes').then(m => m.RULES_ROUTES),
  },

  {
    path: 'workflows',
    canActivate: [authGuard, loginGuard],
    // data: { requiredPolicy: workFlowsPermissions.Workflows_View },
    loadChildren: () =>
      import('./rule-builders-components/workflows/workflows.routes').then(
        m => m.WORKFLOWS_ROUTES,
      ),
  },
  {
    path: 'form-configs',
    canActivate: [authGuard, loginGuard],
    // data: { requiredPolicy: workFlowsPermissions.Workflows_View },
    loadChildren: () =>
      import('./rule-builders-components/form-configs/form-configs.routes').then(
        m => m.FORM_CONFIGS_ROUTES,
      ),
  },
];
