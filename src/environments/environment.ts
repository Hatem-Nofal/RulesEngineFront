import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: 'RuleApplication',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44366/',
    redirectUri: baseUrl,
    clientId: 'RuleApplication_App',
    responseType: 'id_token token',
    scope: 'openid profile offline_access RuleApplication',
    requireHttps: false,
  },
  apis: {
    default: {
      url: 'https://localhost:44354',
      rootNamespace: 'RuleApplication',
    },
  },
} as Environment;