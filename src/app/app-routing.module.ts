import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./application-layout/application-layout.module').then(m => m.ApplicationLayoutModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,  {
    onSameUrlNavigation: 'reload'  // 👈 forces reload on same route
  })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
