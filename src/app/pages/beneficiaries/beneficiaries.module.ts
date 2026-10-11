import { BaseCoreModule, LocalizationModule } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { SharedModule } from "primeng/api";
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { SpeedDialModule } from 'primeng/speeddial';
import { StepperModule } from 'primeng/stepper';
import { TabsModule } from 'primeng/tabs';
import { TabViewModule } from 'primeng/tabview';
import { CustomDatePickerComponent } from 'src/app/shared/components/CVA-Form/custom-date-picker/custom-date-picker.component';
import { CustomDropdownComponent } from 'src/app/shared/components/CVA-Form/custom-dropdown/custom-dropdown.component';
import { CustomInputComponent } from 'src/app/shared/components/CVA-Form/custom-input/custom-input.component';
import { CustomRadioComponent } from 'src/app/shared/components/CVA-Form/custom-Radio/custom-Radio.component';
import { CustomTextareaComponent } from 'src/app/shared/components/CVA-Form/custom-textarea/custom-textarea.component';
import { FormsErrorComponent } from 'src/app/shared/components/CVA-Form/forms-error/forms-error.component';
import { MaxCharactersDirective } from 'src/app/shared/directives/max-charcters/max-characters.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { BeneficiariesRoutingModule } from './beneficiaries-routing-module';
import { BeneficiariesSearchComponent } from './components/beneficiaries-search/beneficiaries-search.component';
import { BeneficiaryFormComponent } from './components/beneficiary-form/beneficiary-form.component';
import { CreateFamilyMembersFormComponent } from './components/beneficiary-form/create-family-members-form/create-family-members-form.component';
import { CreateHOFFormComponent } from './components/beneficiary-form/create-hof-form/create-hof-form.component';
import { CreateBasicFamilyFormComponent } from './components/family-form/create-basic-family-form/create-basic-family-form.component';
import { CreateHousingConditionFormComponent } from './components/family-form/create-housing-condition-form/create-housing-condition-form.component';
import { CreateSocailResearchFormComponent } from './components/family-form/create-socail-research-form/create-socail-research-form.component';
import { FamilyFormComponent } from './components/family-form/family-form.component';
import { FamilyTreeComponent } from './components/family-tree/family-tree.component';
import { BeneficiaryCardInfoComponent } from './components/beneficiary-card-info/beneficiary-card-info.component';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { FamilyFormCardComponent } from './components/family-form/family-form-card/family-form-card.component';
import { DropDownSearchComponent } from "src/app/shared/components/CVA-Form/drop-down-search/drop-down-search.component";
import { SelectModule } from 'primeng/select';

@NgModule({
  declarations: [
    BeneficiariesSearchComponent,
    BeneficiaryFormComponent,
    CreateHOFFormComponent,
    CreateFamilyMembersFormComponent,
    FamilyFormComponent,
    CreateBasicFamilyFormComponent,
    CreateHousingConditionFormComponent,
    CreateSocailResearchFormComponent,
    FamilyTreeComponent,
    BeneficiaryCardInfoComponent,
    FamilyFormCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    MultiSelectModule,
    ButtonModule,
    MessageModule,
    // SpeedDialModule,
    BaseCoreModule,
    // BeneficiariesRoutingModule,
    CustomInputComponent,
    ReactiveFormsModule,
    CustomDropdownComponent,
    LocalizationModule,
    StepperModule,
    BeneficiariesRoutingModule,
    CustomInputComponent,
    DialogModule,
    InputTextModule,
    CustomRadioComponent,
    CustomInputComponent,
    FormsErrorComponent,
    CustomDropdownComponent,
    SpeedDialModule,
    CustomDatePickerComponent,
    CustomTextareaComponent,
    PanelModule,
    TabsModule,
    TabViewModule,
    MenuModule,
    SelectModule,
    AvatarModule,
    MaxCharactersDirective,
    BadgeModule,
    OverlayBadgeModule,
    TagModule,
    DropDownSearchComponent
],
  exports: [],
})
export class BeneficiariesModule {}
