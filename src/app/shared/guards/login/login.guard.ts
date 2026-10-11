import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
// import { AuthenticationService } from 'src/app/shared/services/authentication/authentication.service';

export const loginGuard: CanActivateFn = (route, state) => {
  
  // const authLogin = inject(AuthenticationService);
  // if (localStorage.getItem('access_token') !== null) {
  //   authLogin.isAuthenticatedFn();
  //   authLogin.getUData();
  return true;
  // }


};
