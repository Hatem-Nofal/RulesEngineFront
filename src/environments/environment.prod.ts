import { Environment } from '@abp/ng.core';

const baseUrl = 'https://emrfrontend-dev.ehealth.com.eg';

const oAuthConfig = {
  issuer: 'https://emrbackend-dev.ehealth.com.eg/',
  redirectUri: baseUrl,
  clientId: 'RuleApplication_App',
  // responseType: 'code',
  scope: 'offline_access RuleApplication',
  requireHttps: true,
};

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'RuleApplication',
  },
  oAuthConfig,
  apis: {
    default: {
      url: 'https://emrbackend-dev.ehealth.com.eg',
      rootNamespace: 'RuleApplication',
    },
    AbpAccountPublic: {
      url: oAuthConfig.issuer,
      rootNamespace: 'AbpAccountPublic',
    },
  },
  remoteEnv: {
    url: '/getEnvConfig',
    mergeStrategy: 'deepmerge'
  }
} as Environment;
