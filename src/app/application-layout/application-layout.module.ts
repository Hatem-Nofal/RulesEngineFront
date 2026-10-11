import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { provideAbpCore, withOptions } from '@abp/ng.core';
import { registerLocale } from '@abp/ng.core/locale';
import { environment } from 'src/environments/environment';
import { SharedModule } from '../shared/shared.module';
import { ApplicationLayoutRoutingModule } from './application-layout-routing.module';
import { ApplicationScreenComponent } from './component/application-screen/application-screen.component';


@NgModule({
  declarations: [
    ApplicationScreenComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ApplicationLayoutRoutingModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    provideAbpCore(
      withOptions({
        environment,
        registerLocaleFn: registerLocale(),
      })
    )
  ]
})
export class ApplicationLayoutModule { }
