import { Environment } from '@abp/ng.core';

const baseUrl = 'https://localhost:4200';

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'EhealthClaims',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44354/',
    redirectUri: baseUrl,
    clientId: 'EhealthClaims_App',
    // responseType: 'code',
    responseType: 'id_token token',
    scope: 'openid profile offline_access EhealthClaims',
    requireHttps: false,
  },
  apis: {
    default: {
      url: 'https://localhost:44354',
      rootNamespace: 'EhealthClaims',
    },
  },
} as Environment;
