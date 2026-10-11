import { AuthService, LocalizationService, SessionStateService } from '@abp/ng.core';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import localeEn from '@angular/common/locales/en';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
@Injectable({
  providedIn: 'root'
})
export class AppLocalizationService {
  private newLang = new BehaviorSubject<string>('');
  newLangVar = this.newLang.asObservable();

  private ltr = new BehaviorSubject<boolean>(false);
  ltrVar = this.ltr.asObservable();
  message: string;
  isAuth = signal(null);

  constructor(
    private _SessionStateService: SessionStateService,
    private translate: LocalizationService,
    private authService: AuthService
  ) {
    // Register both locales
    registerLocaleData(localeAr, 'ar');
    registerLocaleData(localeEn, 'en');

    this.translate.currentLang$.subscribe(lang => {
      this.newLang.next(lang);
      this._SessionStateService.setLanguage(lang);

      // Update the document direction
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    });
  }

  onLocalizationChange(lang: string) {
    this._SessionStateService.setLanguage(lang);
    this.onGetLanguage();
  }

  onGetLanguage() {
    let lang = this._SessionStateService.getLanguage();
    this.newLang.next(lang);
    if (lang === 'en') this.ltr.next(true);
    else if (lang === 'ar') this.ltr.next(false);
  }

  getContentTranslation(text: string) {
    this.translate.get(`::${text}`).subscribe(val => { this.message = val })
    return this.message
  }
  authLogout(): Observable<any> {
    return this.authService.logout();
  }
  isAuthenticatedFn() {
    let auth = this.authService.isAuthenticated;
    this.isAuth.update(() => auth);
  }
}
