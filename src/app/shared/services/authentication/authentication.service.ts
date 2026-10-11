import { AuthService, ConfigStateService } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private isAuth = new BehaviorSubject<boolean>(false);
  isAuthenticatedVar = this.isAuth.asObservable();

  private uProfile = new BehaviorSubject<any>({});
  uProfileVar = this.uProfile.asObservable();
  userRoles: string[];

  constructor(private _AuthService: AuthService, private _ConfigStateService: ConfigStateService) {}

  getUData() {
    if (localStorage.getItem('access_token') !== null) {
      let encoded = localStorage.getItem('access_token');
      let decoded = jwtDecode(encoded);
      this.uProfile.next(decoded);
      this.userRoles = this._ConfigStateService.getOne('currentUser').roles;
      this.isAuthForReadDraft()
    }
  }

  isAuthenticatedFn() {
    let auth = this._AuthService.isAuthenticated;
    this.isAuth.next(auth);
  }

  authLogout(): Observable<any> {
    return this._AuthService.logout();
  }
  getUserRoles(): Observable<string[]> {
    return of(this.userRoles);
  }
 // auth for reading drafted data from localStorage 
  isAuthForReadDraft() {
    const userId = this._ConfigStateService.getOne('currentUser').id;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('claimDraft_') && !key.includes(`_${userId}`)) {
        keysToRemove.push(key);
      }
    }
    if (keysToRemove.length > 0) {
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }
  getUserData() {
    return this._ConfigStateService.getOne('currentUser');
  }
}
