import { authGuard, permissionGuard } from '@abp/ng.core';
import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, Routes } from '@angular/router';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';

import { BeneficiariesPermissions } from 'src/app/shared/models/appPermissions';
import { BeneficiaryFamilyTreeComponent } from '../beneficiary-family-tree/beneficiary-family-tree.component';
import { BeneficiariesListComponent } from './components/beneficiaries-list/beneficiaries-list.component';
import { BeneficiariesSearchComponent } from './components/beneficiaries-search/beneficiaries-search.component';
import { BeneficiaryFormComponent } from './components/beneficiary-form/beneficiary-form.component';
import { ActionGuard } from 'src/app/shared/guards/action-route/action-route.guard';

const routes: Routes = [
  {
    path: '',
    data: { breadcrumb: 'RuleApplication::Menu:Beneficiaries', navigate: false },
    children: [
      {
        path: '',
        component: BeneficiariesListComponent,
        canActivate: [authGuard, loginGuard],
        data: { breadcrumb: 'RuleApplication::Menu:BeneficiariesList' },
      },
      {
        path: 'create',
        component: BeneficiaryFormComponent,
        canActivate: [authGuard, loginGuard],
        data: { breadcrumb: 'RuleApplication::Menu:CreateBeneficiary' },
      },
      {
        path: 'family-tree/:id',
        component: BeneficiaryFamilyTreeComponent,
        canActivate: [authGuard, loginGuard],
        data: { breadcrumb: 'RuleApplication::Menu:FamilyTree' },
      },
      {
        path: 'search',
        component: BeneficiariesSearchComponent,
        canActivate: [authGuard, loginGuard, permissionGuard],
        data: {
          breadcrumb: 'RuleApplication::Menu:SearchBeneficiary',
          requiredPolicy: BeneficiariesPermissions.BeneficiariesSearch,
        },
      },
      {
        path: ':action/:id',
        component: BeneficiaryFormComponent,
        canActivate: [authGuard, loginGuard, ActionGuard],
        data: {
          breadcrumb: (route: ActivatedRouteSnapshot) => {
            const action = route.params['action'];
            return action === 'view'
              ? 'RuleApplication::Beneficiaries:view'
              : 'RuleApplication::Menu:EditBeneficiary';
          },
          allowedActions: ['view', 'edit'],
          requiredPolicy: {
            view:
              BeneficiariesPermissions.BeneficiariesView &&
              BeneficiariesPermissions.BeneficiariesViewFamilyTree,
            edit: BeneficiariesPermissions.BeneficiariesUpdate,
          },
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BeneficiariesRoutingModule {}
