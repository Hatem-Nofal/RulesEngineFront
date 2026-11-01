import { NgModule } from '@angular/core';

import { FormPageComponent } from 'src/app/shared/components/CVA-Form/form-page/form-page.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeRoutingModule } from './home-routing.module';
import { CustomDropdownComponent } from 'src/app/shared/components/CVA-Form/custom-dropdown/custom-dropdown.component';


@NgModule({
  declarations: [
    HomeComponent,
    DashboardComponent,
  ],
  imports: [
    HomeRoutingModule,
    SharedModule,
    FormPageComponent,
    CustomDropdownComponent
  ]
})
export class HomeModule { }
