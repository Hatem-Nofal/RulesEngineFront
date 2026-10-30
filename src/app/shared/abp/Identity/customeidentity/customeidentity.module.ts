// import { CoreModule, LocalizationModule, LazyModuleFactory } from '@abp/ng.core';
// import { provideAbpThemeShared, ThemeSharedModule, withValidationBluePrint } from '@abp/ng.theme.shared';
// import { ExtensibleModule } from '@abp/ng.components/extensible';
// import { ModuleWithProviders, NgModule, NgModuleFactory, ɵNgModuleFactory, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
// import { NgxValidateCoreModule } from '@ngx-validate/core';

// import { PageModule } from '@abp/ng.components/page';
// import { customeIdentityRoutingModule } from './customeidentity-routing.module';

// import { IdentityExtensionsGuard } from '../guards';
// import { PermissionManagementModule } from '../../permission-management/permission-management.module';
// import { IdentityConfigOptions } from '../models/config-options';

// @NgModule({

//   imports: [
//     CoreModule,
//     customeIdentityRoutingModule,
//     NgbNavModule,
//     ThemeSharedModule,
//     ExtensibleModule,
//     NgbDropdownModule,
//     PermissionManagementModule,
//     NgxValidateCoreModule,
//     PageModule,
//     LocalizationModule
//   ],
//   schemas: [CUSTOM_ELEMENTS_SCHEMA],
// })
// export class CustomeIdentityModule {
//   static forChild(options: IdentityConfigOptions = {}): ModuleWithProviders<CustomeIdentityModule> {
//     return {
//       ngModule: CustomeIdentityModule,
//       providers: [
//         // provideAbpThemeShared(
//         //   withValidationBluePrint({
//         //     invalidPhoneNumber: "::invalidPhoneNumber",
//         //     invalidMembershipValidityTo: "::invalidMembershipValidityTo"
//         //   })
//         // ),

//         {
//           provide: IDENTITY_ENTITY_ACTION_CONTRIBUTORS,
//           useValue: options.entityActionContributors,
//         },
//         {
//           provide: IDENTITY_TOOLBAR_ACTION_CONTRIBUTORS,
//           useValue: options.toolbarActionContributors,
//         },
//         {
//           provide: IDENTITY_ENTITY_PROP_CONTRIBUTORS,
//           useValue: options.entityPropContributors,
//         },
//         {
//           provide: IDENTITY_CREATE_FORM_PROP_CONTRIBUTORS,
//           useValue: options.createFormPropContributors,
//         },
//         {
//           provide: IDENTITY_EDIT_FORM_PROP_CONTRIBUTORS,
//           useValue: options.editFormPropContributors,
//         },
//         IdentityExtensionsGuard,
//       ],
//     };
//   }

//   static forLazy(options: IdentityConfigOptions = {}): ɵNgModuleFactory<CustomeIdentityModule> {
//     return new LazyModuleFactory(CustomeIdentityModule.forChild(options));
//   }


// }
