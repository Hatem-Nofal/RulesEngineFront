import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from '@abp/ng.core';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';
import { ClaimsPermissions, RulesPermissions, WorkflowsPermissions } from '../shared/models/appPermissions';

const claimsPermissions =ClaimsPermissions;
const rulesPermissions =RulesPermissions;
const workFlowsPermissions =WorkflowsPermissions;
export const MEDICAL_RULES_ROUTES: Routes = [
  {
    path: 'rules',
    loadChildren: () => import('./rules/rules.module').then(m => m.RulesModule),
    canActivate: [authGuard, loginGuard, permissionGuard],
    data: { title: 'Rules', requiredPolicy: rulesPermissions.Rules_View }
  },
  {
    path: 'workflows',
    loadChildren: () => import('./workflow/workflow.module').then(m => m.WorkflowModule),
    canActivate: [authGuard, loginGuard, permissionGuard],
    data: { title: 'Workflows', requiredPolicy: workFlowsPermissions.Workflows_View }
  },
  {
    path: 'validatebatch',
    loadComponent: () =>
      import('./batchvlaidaion/batchvlaidaion.component').then(m => m.BatchvlaidaionComponent),
    canActivate: [authGuard, loginGuard, permissionGuard],
    data: { title: 'Batch Validation', requiredPolicy: claimsPermissions.Claims_ValidateBatch }
  },
  {
    path: 'validateclaim',
    loadComponent: () =>
      import('./validate-claim/validate-claim.component').then(m => m.ValidateClaimComponent),
    canActivate: [authGuard, loginGuard, permissionGuard],
    data: { title: 'Claim Validation', requiredPolicy: claimsPermissions.Claims_ValidateClaim }
  },
  {
    path: 'validatejsonclaim',
    loadComponent: () =>
      import('./validate-json-claim/validate-json-claim.component').then(m => m.ValidateJsonClaimComponent),
    canActivate: [authGuard, loginGuard, permissionGuard],
    data: { title: 'Claim Json Validation', requiredPolicy: claimsPermissions.Claims_ValidateClaimJson }
  },
  {
    path: 'BatchValidationProgress',
    loadComponent: () =>
      import('./claimvalidationresultprogress/claimvalidationresultprogress.component')
        .then(m => m.ClaimValidationResultProgressComponent),
    canActivate: [authGuard, loginGuard, permissionGuard],
    data: { title: 'Batch Validation Progress', requiredPolicy: claimsPermissions.Claims_ValidateClaimJson }
  },
  {
    path: 'filestatus',
    loadComponent: () =>
      import('./file-status/file-status.component').then(m => m.FileStatusComponent),
    canActivate: [authGuard, loginGuard, permissionGuard],
    data: { title: 'Files Upload Status', requiredPolicy: rulesPermissions.Rules_FileUploadStatus }
  },
];