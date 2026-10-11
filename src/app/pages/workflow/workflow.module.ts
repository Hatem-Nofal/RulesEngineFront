import { BaseCoreModule, permissionGuard } from '@abp/ng.core';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';
import { WorkFlowListComponent } from './components/workflow-list/workflow-list';
import { Workflowform } from './components/workflowform/workflowform';
import { WorkflowsPermissions } from 'src/app/shared/models/appPermissions';
import { ToastrModule } from 'ngx-toastr';
const workflowsPermissions = WorkflowsPermissions;
const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: WorkFlowListComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'create',
    component: Workflowform,
    canActivate: [loginGuard, permissionGuard],
    data: {
      requiredPolicy: workflowsPermissions.Workflows_Create,
    },
  },
  {
    path: 'edit/:id',
    component: Workflowform,
    canActivate: [loginGuard , permissionGuard],
    data: {
      requiredPolicy: workflowsPermissions.Workflows_Edit,
    },
  },
];
@NgModule({
  declarations: [WorkFlowListComponent, Workflowform],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    FormsModule,
    ToastrModule,
    ButtonModule,
    PaginatorModule,
    InputTextModule,
    CheckboxModule,
    CardModule,
    ReactiveFormsModule,
    BaseThemeSharedModule,
    BaseCoreModule,
  ],
})
export class WorkflowModule {}
