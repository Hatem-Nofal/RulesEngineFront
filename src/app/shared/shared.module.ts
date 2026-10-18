import { CoreModule, LocalizationModule } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ExtensibleModule } from '@abp/ng.components/extensible';
import { PageModule } from '@abp/ng.components/page';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { NgModule } from '@angular/core';
import { NgbDropdownModule, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxValidateCoreModule } from '@ngx-validate/core';
import { PermissionManagementModule } from './abp/permission-management/permission-management.module';

/* shared components*/
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

/* shared directives */
import { AlphaNumbericDirective } from './directives/alpha-numeric/alpha-numberic.directive';
import { ArabicLetterDirective } from './directives/arabic-letter/arabic-letter.directive';
import { NumberDirective } from './directives/number/number.directive';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PrimengTableHelper } from 'src/assets/config/primeng-table-helper';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { CustomRadioComponent } from './components/CVA-Form/custom-Radio/custom-Radio.component';
import { SharedTableComponent } from './components/shared-table/shared-table.component';
import { TrimInputsDirective } from './directives/trim-inputs/trim-inputs.directive';
import { CustomConfirmationService } from './services/customConfirmation.service';
import { ServerConnectSignalService } from './services/serverconnect-signal.service';
import { OnlySingleSpaceDirective } from './directives/only-single-space/only-single-space.directive';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    SharedTableComponent,
    BreadcrumbComponent,

    AlphaNumbericDirective,
    NumberDirective,
    ArabicLetterDirective,
    TrimInputsDirective,
    OnlySingleSpaceDirective,
  ],
  imports: [
    CoreModule,
    ThemeSharedModule,
    NgbDropdownModule,
    NgxValidateCoreModule,
    PageModule,
    ExtensibleModule,
    PermissionManagementModule,
    NgbNavModule,
    PanelMenuModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    TagModule,
    PaginatorModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule,
    DialogModule,
    CustomRadioComponent,
    NgbPopoverModule,
    CardModule
  ],
  exports: [
    CoreModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ThemeSharedModule,
    LocalizationModule,
    NgbDropdownModule,
    NgxValidateCoreModule,
    NgbPopoverModule,
    CardModule,
    /* shared components*/
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    SharedTableComponent,
    BreadcrumbComponent,

    /* shared directives */
    AlphaNumbericDirective,
    NumberDirective,
    ArabicLetterDirective,
    TrimInputsDirective,
    OnlySingleSpaceDirective,
  ],
  providers: [PrimengTableHelper, CustomConfirmationService, ServerConnectSignalService],
})
export class SharedModule {}
