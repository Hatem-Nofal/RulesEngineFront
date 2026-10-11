import { BaseCoreModule, permissionGuard } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { RuleFormComponent } from './components/rule-form/rule-form';
import { RuleListComponent } from './components/rule-list/rule-list';
import { RulesBulkComponent } from './components/rules-bulk/rules-bulk.component';
import { RulesPermissions } from 'src/app/shared/models/appPermissions';
import { loginGuard } from 'src/app/shared/guards/login/login.guard';
import { FileStatusComponent } from '../file-status/file-status.component';
import { BatchvlaidaionComponent } from '../batchvlaidaion/batchvlaidaion.component';
const rulesPermissions = RulesPermissions;
const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: RuleListComponent,
    canActivate: [loginGuard, permissionGuard],
    data: {
      requiredPolicy: rulesPermissions.Rules_View,
    },
  },
  {
    path: 'create',
    component: RuleFormComponent,
    canActivate: [loginGuard, permissionGuard],
    data: {
      requiredPolicy: rulesPermissions.Rules_Create,
    },
  },
  {
    path: 'edit/:id',
    component: RuleFormComponent,
    canActivate: [loginGuard, permissionGuard],
    data: {
      requiredPolicy: rulesPermissions.Rules_Edit,
    },
  },
  {
    path: 'bulk',
    component: RulesBulkComponent,
    canActivate: [loginGuard, permissionGuard],
    data: {
      requiredPolicy: rulesPermissions.Rules_CreateBulk,
    },
  },
];

@NgModule({
  declarations: [RulesBulkComponent, RuleListComponent, RuleFormComponent, FileStatusComponent, BatchvlaidaionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    TableModule,
    ToastrModule,
    ButtonModule,
    PaginatorModule,
    InputTextModule,
    CheckboxModule,
    SelectModule,
    CardModule,
    MessageModule,
    MultiSelect,
    FileUploadModule,
    MessageModule,
    MultiSelectModule,
    ReactiveFormsModule,
    InputNumberModule,
    BaseCoreModule,
  ],
})
export class RulesModule {}
