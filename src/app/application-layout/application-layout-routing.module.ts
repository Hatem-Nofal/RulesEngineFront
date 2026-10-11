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
  {
    path: 'coding-batches',
    canActivate: [authGuard, loginGuard],
    loadChildren: () =>
      import('../pages/Claims-coding/coding-batches/coding-batches.routing').then(
        m => m.CODING_BATCHES_ROUTES,
      ),
  },
  {
    path: 'coding-claims',
    canActivate: [authGuard, loginGuard],
    loadChildren: () =>
      import('../pages/Claims-coding/coding-claims/coding-claims.routing').then(
        m => m.CODING_CLAIMS_ROUTES,
      ),
  },
  {
    path: 'claims-auditing',
    canActivate: [authGuard, loginGuard],
    loadChildren: () =>
      import('../pages/claims-auditing/claims-auditing.routing').then(
        m => m.CLAIMS_AUDITING_ROUTES,
      ),
  },
  {
    path: 'digital-archive',
    canActivate: [authGuard, loginGuard],
    loadChildren: () =>
      import('../pages/digital-archive/digital-archive.routing').then(
        m => m.DIGITAL_ARCHIVE_ROUTES,
      ),
  },
  {
    path: 'medical-rules',
    canActivate: [authGuard, loginGuard],
    loadChildren: () =>
      import('../pages/MedicalRulesRoutingModule').then(m => m.MEDICAL_RULES_ROUTES),
  },
  {
    path: 'beneficiaries',
    canActivate: [authGuard, loginGuard],
       loadChildren: () => import('src/app/pages/beneficiaries/beneficiaries.module').then(m => m.BeneficiariesModule),
         data: { breadcrumb: 'RuleApplication::Menu:Beneficiaries' }
  },
  {
    path: 'families',
    canActivate: [authGuard, loginGuard],
    loadChildren: () =>
      import('../pages/families-list/FamiliesRoutingModule').then(m => m.FAMILIES_ROUTES),
  },
  {
    path: 'my-tasks',
    canActivate: [authGuard, loginGuard],
    loadChildren: () => import('../pages/tasks/tasks.routing').then(m => m.TASKS_ROUTES),
  },

  {
    path: 'reports',
    //canActivate: [authGuard, loginGuard],
    loadChildren: () =>
      import('../pages/Reports/reports-routing.module').then(m => m.ReportsRoutings),
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationLayoutRoutingModule {}
