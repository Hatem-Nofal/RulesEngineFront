import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { ClaimDto, ClaimService } from '@proxy/ehealth-claims/domains/claim';
import { catchError, EMPTY } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({ providedIn: 'root' })
export class CodingClaimsAuditResolver implements Resolve<ClaimDto> {
  constructor(private claimService: ClaimService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<ClaimDto> {
    const claimId = route.params['id'];
    return this.claimService.getWithAudit(claimId);
  }
}

@Injectable({ providedIn: 'root' })

export class CodingClaimsViewResolver implements Resolve<ClaimDto> {
  constructor(private claimService: ClaimService, private location: Location) { }

  resolve(route: ActivatedRouteSnapshot): Observable<ClaimDto> {
    const claimId = route.params['id'];
    const urlSegments = route.url.map(segment => segment.path);
    const isEditing = urlSegments.includes('edit');
    return this.claimService.get(claimId, isEditing).pipe(
      catchError((error) => {
        this.location.back();
        return EMPTY;
      })
    );
  }
} 