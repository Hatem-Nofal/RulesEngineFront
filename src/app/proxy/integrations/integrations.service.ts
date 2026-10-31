import type { ClaimValidation, ClaimValidationResponse } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IntegrationsService {
  private restService = inject(RestService);
  apiName = 'Default';
  

  validateClaimsIntegrationExtendedByInput = (input: ClaimValidation, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ClaimValidationResponse>({
      method: 'POST',
      headers: { Accept: 'application/json' },
      url: '/api/app/integrations/validate-claims-integration-extended',
      body: input,
    },
    { apiName: this.apiName,...config });
}