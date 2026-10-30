import { Environment } from "@abp/ng.core";

const baseUrl = "http://localhost:4200";

const oAuthConfig = {
  issuer: "https://localhost:44396/",
  redirectUri: baseUrl,
  clientId: "RulesEngine_App",
  responseType: "id_token token",
  scope: "offline_access RulesEngine",
  requireHttps: false,
};

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: "RulesEngine",
  },
  oAuthConfig,
  apis: {
    default: {
      url: "https://localhost:44396",
      rootNamespace: "RulesEngine",
    },
    AbpAccountPublic: {
      url: oAuthConfig.issuer,
      rootNamespace: "AbpAccountPublic",
    },
  },
} as Environment;
