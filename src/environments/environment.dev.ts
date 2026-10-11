import { Environment } from '@abp/ng.core';

const baseUrl = 'https://localhost:4200';

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'RulesEngines',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44354/',
    redirectUri: baseUrl,
    clientId: 'RulesEngines_App',
    // responseType: 'code',
    responseType: 'id_token token',
    scope: 'openid profile offline_access RulesEngines',
    requireHttps: false,
  },
  apis: {
    default: {
      url: 'https://localhost:44354',
      rootNamespace: 'RulesEngines',
    },
  },
} as Environment;
