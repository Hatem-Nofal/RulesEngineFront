import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { BatchDto } from '@proxy/ehealth-claims/application/contracts/domains/batch';
import { BatchService } from '@proxy/ehealth-claims/application/domains/batchs';
 import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CodingBatchesViewResolver implements Resolve<BatchDto> {
  constructor(private batchService: BatchService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<BatchDto> {
    const batchId = route.params['id'];
    return this.batchService.get(batchId);
  }
}