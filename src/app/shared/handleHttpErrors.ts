// http-error-handler.ts
import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ToasterService } from '@abp/ng.theme.shared';
import { of, EMPTY } from 'rxjs';

export function handleHttpErrors(injector: Injector, httpError: HttpErrorResponse) {
  const toaster = injector.get(ToasterService);
  const router = injector.get(Router);
  const isCanceled =
    httpError.status === 0 &&
    ((httpError.error &&
      (httpError.error.name === 'AbortError' || httpError.error.name === 'CanceledError')) ||
      /abort|cancell?ed/i.test(`${httpError.message} ${httpError.statusText}`));

  const isTimeoutOrOffline =
    httpError.status === 0 &&
    /timed\s*out|ERR_CONNECTION_TIMED_OUT|Unknown Error/i.test(httpError.message);

  if (isCanceled) {
    toaster.info('Request was canceled.', 'Canceled');
    router.navigate(['account/login']);
    return EMPTY;
  }
  if (isTimeoutOrOffline) {
    toaster.error(
      'Cannot connect to the server. Please check your internet or try again later.',
      'Connection Error'
    );
    // Optional: redirect to a safe page
    router.navigate(['home']); // or show a "retry" page
    return EMPTY;
  }
  if (httpError.status === 404 || httpError.status === 403) {
    toaster.warn('You do not have permission to access this page', '404');
    router.navigate(['home']);
    return EMPTY;
  }

  return of(httpError);
}
