import { authGuard, permissionGuard } from '@abp/ng.core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';
import { RulesPermissions, WorkflowsPermissions } from 'src/app/shared/models/appPermissions';

export const routes: Routes = [
  /* *** *** *** *project Modules* *** *** *** */
  {
    path: '',
    canActivate: [authGuard, loginGuard],
    loadChildren: () => import('src/app/pages/home/home.module').then(m => m.HomeModule),
    data: { breadcrumb: 'Home' },
  },

  /* *** *** *** *abp Modules* *** *** *** */
  {
    path: 'account',
    loadChildren: () => import('@abp/ng.account').then(m => m.AccountModule.forLazy()),
  },
  {
    path: 'identity',
    canActivate: [authGuard, loginGuard],
    loadChildren: () =>
      import('../shared/abp/Identity/customeidentity/customeidentity.module').then(m =>
        m.CustomeIdentityModule.forLazy(),
      ),
  },
  {
    path: 'tenant-management',
    canActivate: [authGuard, loginGuard],
    loadChildren: () =>
      import('@abp/ng.tenant-management').then(m => m.TenantManagementModule.forLazy()),
  },
  {
    path: 'setting-management',
    canActivate: [authGuard, loginGuard],
    loadChildren: () =>
      import('@abp/ng.setting-management').then(m => m.SettingManagementModule.forLazy()),
  },
  {
    path: 'rules',
    canActivate: [authGuard, loginGuard],
    // data: { requiredPolicy: RulesPermissions.Rules_View },
    loadChildren: () =>
      import('../pages/rule-builders-components/rules/rules.routes').then(m => m.RULES_ROUTES),
  },
  {
    path: 'workflows',
    canActivate: [authGuard, loginGuard],
    loadChildren: () =>
      import('../pages/rule-builders-components/workflows/workflows.routes').then(
        m => m.WORKFLOWS_ROUTES,
      ),
  },
  {
    path: 'form-configs',
    canActivate: [authGuard, loginGuard],
    // data: { requiredPolicy: WorkflowsPermissions.Workflows_View },
    loadChildren: () =>
      import('../pages/rule-builders-components/form-configs/form-configs.routes').then(
        m => m.FORM_CONFIGS_ROUTES,
      ),
  },
  {
    path: '**',
    redirectTo: '',
    data: { breadcrumb: '404' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationLayoutRoutingModule {}
