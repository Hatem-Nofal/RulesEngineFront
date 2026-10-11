import { authGuard } from '@abp/ng.core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';

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
    path: '**',
    redirectTo: '',
    data: { breadcrumb: '404' },
  },
  { path: 'rules', loadChildren: () => import('../pages/rules/rules.routes').then(m => m.RULES_ROUTES) },
  { path: 'workflows', loadChildren: () => import('../pages/workflows/workflows.routes').then(m => m.WORKFLOWS_ROUTES) },
  {
    path: 'form-configs',
    loadChildren: () => import('../pages/form-configs/form-configs.routes').then(m => m.FORM_CONFIGS_ROUTES),
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationLayoutRoutingModule {}
