import { PermissionService } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ActionGuard implements CanActivate {
  constructor(private router: Router, private permission: PermissionService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const action = route.params['action'];
    const allowedActions: string[] = route.data['allowedActions'] || [];
    const permissionMap: Record<string, string> = route.data['requiredPolicy'] || {};

    //  action string
    if (!allowedActions.includes(action)) {
      this.router.navigate(['/']);
      return false;
    }

    //  permission for this action
    const requiredPermission = permissionMap[action];
    if (requiredPermission && !this.permission.getGrantedPolicy(requiredPermission)) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
