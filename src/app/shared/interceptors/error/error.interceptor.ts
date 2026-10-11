import { LocalizationService } from '@abp/ng.core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError } from 'rxjs/internal/operators/catchError';
import { CustomConfirmationService } from '../../services/customConfirmation.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { EMPTY } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private _LocalizationService: LocalizationService,
    private _ConfirmationService: CustomConfirmationService,
    private _AuthenticationService: AuthenticationService,
  ) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(err => {
        let isHandel = false;
        let confirmationHeader;
        this._LocalizationService.get('::error').subscribe(val => (confirmationHeader = val));
        if (err.status == 401 || err.status == 403 || err.status == 404) {
          this._AuthenticationService.authLogout();
          if (err.status == 404) {
            return EMPTY; //skip default error handling
          }
        }
        if (req.method === 'PUT' || req.method === 'POST') {
          let parsedMessage: any;
          if (typeof err.error === 'string') {
            try {
              parsedMessage = JSON.parse(err.error);
            } catch {
              parsedMessage = { message: err.error }; // fallback if not valid JSON
            }
            this._ConfirmationService.error(
              parsedMessage?.message?.name || parsedMessage?.message || 'Unknown error',
              confirmationHeader,
              5000,
            );
            isHandel = true;
          }
          if (err.error.message) {
            this._ConfirmationService.error(
              err.error.message.name || err.error.message,
              confirmationHeader,
              5000,
            );
            isHandel = true;
          } else if (err.error.error_description) {
            let message = '';
            if (err.error.error === 'invalid_grant') {
              this._LocalizationService.get('::login:invalid').subscribe(val => (message = val));
              this._ConfirmationService.error(message, confirmationHeader, 5000);
              isHandel = true;
            } else {
              this._ConfirmationService.error(
                err.error.error_description,
                confirmationHeader,
                5000,
              );
              isHandel = true;
            }
          }
        }
        let errorcode = err.error.code ? err.error.code : err.status;
        const apiError = {
          code: errorcode,
          message: err.error.message || err.error,
        };
        if (!isHandel) {
          if (err.error.message?.name) {
            this._ConfirmationService.error(err.error.message?.name, confirmationHeader, 10000);
          }
          isHandel = true;
        }
        // Return the error in a format similar to an API response

        return throwError(() => apiError);
      }),
    );
  }
}
