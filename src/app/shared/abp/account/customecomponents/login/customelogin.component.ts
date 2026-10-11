import { eAccountComponents, getRedirectUrl } from '@abp/ng.account';
import { AuthService, ConfigStateService } from '@abp/ng.core';
import { ToasterService } from '@abp/ng.theme.shared';
import { Component, Injector, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AppLocalizationService } from 'src/app/shared/services/localization/app-localization.service';
 import { SignalRService } from 'src/app/shared/services/SignalR/signal-r.service';

const { maxLength, required } = Validators;

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'abp-login',
    templateUrl: './customelogin.component.html',
    styleUrl: './customelogin.component.scss',
    standalone: false
})
export class CustomeLoginComponent implements OnInit {
  protected injector = inject(Injector);
  protected fb = inject(UntypedFormBuilder);
  protected toasterService = inject(ToasterService);
  protected authService = inject(AuthService);
  protected configState = inject(ConfigStateService);

  ltr: boolean;
  todayDate: Date = new Date();
  year: string;
  form!: UntypedFormGroup;
  inProgress?: boolean;
  isSelfRegistrationEnabled = true;

  authWrapperKey = eAccountComponents.AuthWrapper;
  constructor(private _SignalRService: SignalRService,private _AppLocalizationService: AppLocalizationService) { }
  ngOnInit() {
    this.init();
    this.buildForm();
    // this._AppLocalizationService.ltrVar.subscribe(value => this.ltr = value);
    this.year = this.todayDate.getFullYear().toString();
  }

  protected init() {
    this.isSelfRegistrationEnabled =
      (
        (this.configState.getSetting('Abp.Account.IsSelfRegistrationEnabled') as string) || ''
      ).toLowerCase() !== 'false';
  }

  protected buildForm() {
    this.form = this.fb.group({
      username: ['', [required, maxLength(255)]],
      password: ['', [required, maxLength(128)]],
      rememberMe: [false],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.inProgress = true;
    const { username, password, rememberMe } = this.form.value;
    const redirectUrl = getRedirectUrl(this.injector);
    this.authService.login({ username, password, rememberMe, redirectUrl })
      .pipe(
        catchError(err => {
          // this.toasterService.error(
          //   err.error?.error_description || err.error?.error.message ||
          //   'AbpAccount::DefaultErrorMessage', '', { life: 7000 },
          // );
          return throwError(err);
        }),
        finalize(() => (this.inProgress = false)),
      )
      .subscribe(async res => {
         await  this._SignalRService.connect();
         localStorage.setItem('loginTime' , Date.now().toString());
      });
  }

  localizationChange(lang: string) {
    this._AppLocalizationService.onLocalizationChange(lang);
  }

  getLang() {
    this._AppLocalizationService.onGetLanguage()
  }
}
