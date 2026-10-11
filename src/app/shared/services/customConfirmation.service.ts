import { Confirmation, ConfirmationService } from '@abp/ng.theme.shared';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CustomConfirmationService {
  constructor(private _ConfirmationService: ConfirmationService) {}
  success(message: string, headerMessage: string, timeToHide: number) {
    this._ConfirmationService.success(message, headerMessage, {
      hideYesBtn: true,
      hideCancelBtn: true,
      dismissible: true,
    });
    setTimeout(() => {
      this._ConfirmationService.clear();
    }, timeToHide);
  }
  error(message: string, headerMessage: string, timeToHide: number) {
    this._ConfirmationService.error(message, headerMessage, {
      hideYesBtn: true,
      hideCancelBtn: true,
      dismissible: true,
    });
    setTimeout(() => {
      this._ConfirmationService.clear();
    }, timeToHide);
  }
  clear() {
    this._ConfirmationService.clear();
  }
  warnConfrim(
    message: string,
    headerMessage: string,
    options: {
      accept: () => void;
      reject?: () => void;
      dismiss?:()=>void;
    },
    dismissible: boolean = true
  ) {
    this._ConfirmationService
      .warn(message, headerMessage, {
        hideYesBtn: false,
        hideCancelBtn: false,
        dismissible: dismissible,
      })
      .subscribe(status => {
        if (status === Confirmation.Status.confirm) {
          options.accept();
        } else if (status === Confirmation.Status.reject) {
          options.reject();
        }else if (status === Confirmation.Status.dismiss) {
          options.dismiss();

        }
      });
  }
}
