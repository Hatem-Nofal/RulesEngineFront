import { Component } from '@angular/core';
import { ReplaceableComponentsService } from '@abp/ng.core';
import { eThemeLeptonXComponents } from '@abp/ng.theme.lepton-x';
import { ApplicationScreenComponent } from './application-layout/component/application-screen/application-screen.component';
import { CustomeLoginComponent } from './shared/abp/account/customecomponents/login/customelogin.component';

@Component({
    selector: 'app-root',
    template: `
    <abp-loader-bar></abp-loader-bar>
    <abp-dynamic-layout></abp-dynamic-layout>
  `,
    standalone: false
})
export class AppComponent {
  constructor(private _ReplaceableComponentsService: ReplaceableComponentsService) {
    this._ReplaceableComponentsService.add({
      component: ApplicationScreenComponent,
      key: eThemeLeptonXComponents.ApplicationLayout
    })

    this._ReplaceableComponentsService.add({
      component: CustomeLoginComponent,
      key: eThemeLeptonXComponents.AccountLayout
    })

    // this._ReplaceableComponentsService.add({
    //   component: CustomeUsersComponent,
    //   key: eIdentityComponents.Users
    // })

    // this._ReplaceableComponentsService.add({
    //   component: RolesComponent,
    //   key: eIdentityComponents.Roles
    // })
  }
}
