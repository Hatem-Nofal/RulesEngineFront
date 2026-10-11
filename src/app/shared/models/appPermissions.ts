
export enum ClaimsCodingPermissions {
  ClaimsCoding ='Claims.Coding',
  ClaimsCodingAll ='Claims.Coding.All',
  ClaimsCodingAllEdit ='Claims.Coding.All.Edit',
  ClaimsCodingAllView ='Claims.Coding.All.View',
  ClaimsCodingDraft ='Claims.Coding.Draft',
  ClaimsCodingDraftEdit ='Claims.Coding.Draft.Edit',
  ClaimsCodingDraftView ='Claims.Coding.Draft.View',
  ClaimsCodingNew ='Claims.Coding.New',
  ClaimsCodingNewُEdit ='Claims.Coding.New.Edit',
  ClaimsCodingNewView ='Claims.Coding.New.View'
}

export enum BatchesCodingPermissions {
  BatchesCoding = 'Batches.Coding',
  BatchesCodingAll = 'Batches.Coding.All',
  BatchesCodingAllEdit = 'Batches.Coding.All.Edit',
  BatchesCodingAllCreate = 'Batches.Coding.All.Create',
  BatchesCodingAllView = 'Batches.Coding.All.View',
  BatchesCodingDraft = 'Batches.Coding.Draft',
  BatchesCodingDraftEdit = 'Batches.Coding.Draft.Edit',
  BatchesCodingDraftCreate = 'Batches.Coding.Draft.Create',
  BatchesCodingDraftView = 'Batches.Coding.Draft.View',
  BatchesCodingNew = 'Batches.Coding.New',
  BatchesCodingNewEdit = 'Batches.Coding.New.Edit',
  BatchesCodingNewCreate = 'Batches.Coding.New.Create',
  BatchesCodingNewView = 'Batches.Coding.New.View',
  BatchesCodingNewAssignTo = 'Batches.Coding.New.AssignTo',
  BatchesCodingCompleted = 'Batches.Coding.Completed',
  BatchesCodingCompletedEdit = 'Batches.Coding.Completed.Edit',
  BatchesCodingCompletedCreate = 'Batches.Coding.Completed.Create',
  BatchesCodingCompletedView = 'Batches.Coding.Completed.View',
  BatchesCodingCompletedAssignTo = 'Batches.Coding.Completed.AssignTo',
  BatchesCodingPreDraft = 'Batches.Coding.PreDraft',
  BatchesCodingPreDraftEdit = 'Batches.Coding.PreDraft.Edit',
  BatchesCodingPreDraftCreate = 'Batches.Coding.PreDraft.Create',
  BatchesCodingPreDraftView = 'Batches.Coding.PreDraft.View',
  BatchesCodingIssued = 'Batches.Coding.Issued',
  BatchesCodingIssuedEdit = 'Batches.Coding.Issued.Edit',
  BatchesCodingIssuedCreate = 'Batches.Coding.Issued.Create',
  BatchesCodingIssuedView = 'Batches.Coding.Issued.View',

  //batch exports 
  BatchesCodingExports= "Batches.Coding.Exports",
  BatchesCodingExportsOP ="Batches.Coding.Exports.OP",
  BatchesCodingExportsIP="Batches.Coding.Exports.IP",
  BatchesCodingExportsOperational="Batches.Coding.Exports.Operational",
  BatchesCodingExportsReconciliation = "Batches.Coding.Exports.Reconciliation",
  BatchesCodingExportsWithDescription = "Batches.Coding.Exports.WithDescription",
  BatchesCodingExportsBatchExcel = "Batches.Coding.Exports.BatchExcel",
  BatchesCodingExportsBatchExcelDetails = "Batches.Coding.Exports.BatchExcelDetails"

}

export enum ClaimsProcessingPermissions {
  ClaimsProcessingClaims = 'ClaimsProcessing.Claims'
}

export enum BatchesProcessingPermissions {
  ClaimsProcessingBatches = 'ClaimsProcessing.Batches'
}

export enum MyTasksPermissions {
  MyTasks = 'MyTasks',
  MyTasksEntry = 'MyTasks.Entry',
  MyTasksEntryEdit = 'MyTasks.Entry.Edit',
  MyTasksEntryView = 'MyTasks.Entry.View',
  MyTasksAudit = 'MyTasks.Audit',
  MyTasksAuditAudit = 'MyTasks.Audit.Audit',
  MyTasksAuditView = 'MyTasks.Audit.View'
}

export enum DigitalArchivePermissions {
  DigitalArchiveProviders = 'DigitalArchive.Providers',
  DigitalArchiveProvidersBtachesView = 'DigitalArchive.Providers.BatchesView',
  DigitalArchiveBatches = 'DigitalArchive.Batches',
  DigitalArchiveBatchesView = 'DigitalArchive.Batches.View',
  DigitalArchiveBatchesExcel = 'DigitalArchive.Batches.BatchExcel',

  DigitalArchiveBatchClaimsView = 'DigitalArchive.Batches.ClaimsView',
  DigitalArchiveClaims = 'DigitalArchive.Claims',
  DigitalArchiveClaimsView = 'DigitalArchive.Claims.View',


}

export enum ReportsPermissions {
  ReportsDailyClaims = 'Reports.DailyClaims',
  ReportsBatchStatus = 'Reports.BatchStatus',
  ReportsClaimsHourely = 'Reports.ClaimsHourely',
  ReportsCharts = 'Reports.Charts'
}

export enum BeneficiariesPermissions {
  BeneficiariesSearch = 'Beneficiaries.Search',
  BeneficiariesCreate = 'Beneficiaries.Create',
  BeneficiariesUpdate = 'Beneficiaries.Update',

  BeneficiariesDelete = 'Beneficiaries.Delete',

  BeneficiariesView = 'Beneficiaries.View',
  BeneficiariesViewFamilyTree = 'Beneficiaries.ViewFamilyTree',
  BeneficiariesMove = 'Beneficiaries.Move',
  BeneficiariesDeActivate = 'Beneficiaries.DeActivate',
  BeneficiariesSplit = 'Beneficiaries.Split',
}
export enum FamilyPermissions {
  FamilyPermissionsCreate = 'Family.Create',
  FamilyPermissionsUpdate = 'Family.Update',
  FamilyPermissionsDelete = 'Family.Delete',
  FamilyPermissionView = 'Family.View',
  FamilyPermissionViewFamilyTree = 'Family.ViewFamilyTree',
  FamilyPermissionMove = 'Family.Move',
  FamilyPermissionSplit = 'Family.Split',
}
export enum FeatureManagementPermissions {
  FeatureManagement = 'FeatureManagement',
  FeatureManagementManageHostFeatures = 'FeatureManagement.ManageHostFeatures'
}

export enum SettingManagementPermissions {
  SettingManagementEmailing = 'SettingManagement.Emailing',
  SettingManagementEmailingTest = 'SettingManagement.Emailing.Test',
  SettingManagementTimeZone = 'SettingManagement.TimeZone'
}

export enum AbpTenantManagementPermissions {
  AbpTenantManagementTenants = 'AbpTenantManagement.Tenants',
  AbpTenantManagementTenantsCreate = 'AbpTenantManagement.Tenants.Create',
  AbpTenantManagementTenantsUpdate = 'AbpTenantManagement.Tenants.Update',
  AbpTenantManagementTenantsDelete = 'AbpTenantManagement.Tenants.Delete',
  AbpTenantManagementTenantsManageFeatures = 'AbpTenantManagement.Tenants.ManageFeatures',
  AbpTenantManagementTenantsManageConnectionStrings = 'AbpTenantManagement.Tenants.ManageConnectionStrings'
}

export enum AbpIdentityPermissions {
  AbpIdentity = 'AbpIdentity',
  AbpIdentityRoles = 'AbpIdentity.Roles',
  AbpIdentityRolesCreate = 'AbpIdentity.Roles.Create',
  AbpIdentityRolesUpdate = 'AbpIdentity.Roles.Update',
  AbpIdentityRolesDelete = 'AbpIdentity.Roles.Delete',
  AbpIdentityRolesManagePermissions = 'AbpIdentity.Roles.ManagePermissions',
  AbpIdentityUsers = 'AbpIdentity.Users',
  AbpIdentityUsersCreate = 'AbpIdentity.Users.Create',
  AbpIdentityUsersUpdate = 'AbpIdentity.Users.Update',
  AbpIdentityUsersUpdateManageRoles = 'AbpIdentity.Users.Update.ManageRoles',
  AbpIdentityUsersDelete = 'AbpIdentity.Users.Delete',
  AbpIdentityUsersManagePermissions = 'AbpIdentity.Users.ManagePermissions'
}

export enum RulesPermissions {
  Rules_View = 'Rules.View',
  Rules_Create = 'Rules.Create',
  Rules_Edit = 'Rules.Update',
  Rules_Delete = 'Rules.Delete',
  Rules_CreateBulk = 'Rules.CreateBulk',
  Rules_FileUploadStatus = 'Rules.RulesFiles',
}

export enum ClaimsPermissions {
  Claims_ValidateClaim = 'Claims.ValidateSingleClaim',
  Claims_ValidateBatch = 'Claims.ValidateBatch',
  Claims_ValidateClaimJson = 'Claims.UploadJson',
  Claims_ValidateDownloadBatchExcel = 'Claims.ExportResults',
}

export enum WorkflowsPermissions {
  Workflows_View = 'Workflows.View',
  Workflows_Create = 'Workflows.Create',
  Workflows_Edit = 'Workflows.Update',
  Workflows_Delete = 'Workflows.Delete',
}

