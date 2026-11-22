import { Environment } from "@abp/ng.core";

const baseUrl = "https://refrontend-dev.ehealth.com.eg";

const oAuthConfig = {
  issuer: "https://rebackend-dev.ehealth.com.eg/",
  redirectUri: baseUrl,
  clientId: "RulesEngine_App",
  // responseType: 'code',
  scope: "offline_access RulesEngine",
  requireHttps: true,
};

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: "RulesEngines",
  },
  oAuthConfig,
  apis: {
    default: {
      url: "https://rebackend-dev.ehealth.com.eg",
      rootNamespace: "RulesEngines",
    },
    AbpAccountPublic: {
      url: oAuthConfig.issuer,
      rootNamespace: "AbpAccountPublic",
    },
  },
  remoteEnv: {
    url: "/getEnvConfig",
    mergeStrategy: "deepmerge",
  },
} as Environment;
