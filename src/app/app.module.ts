import {
  ACCOUNT_CONFIG_OPTIONS,
  AccountConfigOptions,
  accountConfigOptionsFactory,
} from '@abp/ng.account';
import { provideAccountConfig } from '@abp/ng.account/config';
import { CoreModule, provideAbpCore, withOptions } from '@abp/ng.core';
import { registerLocale } from '@abp/ng.core/locale';
import { provideFeatureManagementConfig } from '@abp/ng.feature-management';
import { provideIdentityConfig } from '@abp/ng.identity/config';
import { provideAbpOAuth } from '@abp/ng.oauth';
import { provideSettingManagementConfig } from '@abp/ng.setting-management/config';
import { provideTenantManagementConfig } from '@abp/ng.tenant-management/config';
import { ThemeLeptonXModule } from '@abp/ng.theme.lepton-x';
import { AccountLayoutModule } from '@abp/ng.theme.lepton-x/account';
import { SideMenuLayoutModule } from '@abp/ng.theme.lepton-x/layouts';
import {
  HTTP_ERROR_HANDLER,
  InternetConnectionStatusComponent,
  ThemeSharedModule,
  provideAbpThemeShared,
  withHttpErrorConfig,
} from '@abp/ng.theme.shared';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { primeConfig } from 'src/assets/config/primeng.config';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApplicationLayoutModule } from './application-layout/application-layout.module';
import { APP_ROUTE_PROVIDER } from './route.provider';
import { CustomeLoginComponent } from './shared/abp/account/customecomponents/login/customelogin.component';
import { ErrorInterceptor } from './shared/interceptors/error/error.interceptor';
import { SignalRService } from './shared/services/SignalR/signal-r.service';
import { handleHttpErrors } from './shared/handleHttpErrors';

const options = {} as AccountConfigOptions;
export function initializeApp(signalRService: SignalRService): () => Promise<void> {
  return async () => {
    await signalRService.reconnectIfNeeded();
  };
}

@NgModule({
  declarations: [AppComponent, CustomeLoginComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [SignalRService],
      multi: true,
    },

    { provide: ACCOUNT_CONFIG_OPTIONS, useValue: options },
    {
      provide: 'ACCOUNT_OPTIONS',
      useFactory: accountConfigOptionsFactory,
      deps: [ACCOUNT_CONFIG_OPTIONS],
    },

    APP_ROUTE_PROVIDER,
    provideAbpCore(
      withOptions({
        environment,
        registerLocaleFn: registerLocale(),
      })
    ),
    provideAbpOAuth(),
    provideAbpThemeShared(
      withHttpErrorConfig({
        skipHandledErrorCodes: [404],
        errorScreen: {
          component: null as any,
          forWhichErrors: [],
          hideCloseIcon: true,
        },
      })
    ),
    provideAbpThemeShared(),
    provideSettingManagementConfig(),
    provideAccountConfig(),
    provideIdentityConfig(),
    provideTenantManagementConfig(),
    provideFeatureManagementConfig(),
    SignalRService,
    { provide: HTTP_ERROR_HANDLER, useValue: handleHttpErrors  },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    primeConfig.providers,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    ThemeSharedModule,
    InternetConnectionStatusComponent,
    ThemeLeptonXModule.forRoot(),
    SideMenuLayoutModule.forRoot(),
    AccountLayoutModule.forRoot(),
    ApplicationLayoutModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
