import { LocalizationService, PermissionService } from '@abp/ng.core';
import { Component, computed, OnInit } from '@angular/core';
import { SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto/models';
import { MenuItem } from 'primeng/api';
import {
  AbpIdentityPermissions,
  AbpTenantManagementPermissions,
  BatchesCodingPermissions,
  BatchesProcessingPermissions,
  BeneficiariesPermissions,
  ClaimsCodingPermissions,
  ClaimsPermissions,
  ClaimsProcessingPermissions,
  DigitalArchivePermissions,
  MyTasksPermissions,
  ReportsPermissions,
  RulesPermissions,
  SettingManagementPermissions,
  WorkflowsPermissions,
} from '../../models/appPermissions';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: false,
})
export class SidebarComponent implements OnInit {
  items: MenuItem[] = [];
  themeIcon: string = 'bi bi-moon-fill';
  themeName: String = 'Dark Mode';
  isSidebarCollapsedSignal = computed(() => this.layoutService.isSidebarVisible());
  batchStatusList: SelectedDropDownList[] = [];
  myTasksPermissions = MyTasksPermissions;
  abpIdentity = AbpIdentityPermissions;
  settingManagement = SettingManagementPermissions;
  digitalArchivePermissions = DigitalArchivePermissions;
  abpTenantManagement = AbpTenantManagementPermissions;
  reportsPermissions = ReportsPermissions;
  claimsCodingPermissions = ClaimsCodingPermissions;
  batchesCodingPermissions = BatchesCodingPermissions;
  claimsProcessingPermissions = ClaimsProcessingPermissions;
  batchesProcessingPermissions = BatchesProcessingPermissions;
  rulesPermissions = RulesPermissions;
  workFlowsPermissions = WorkflowsPermissions;
  claimsPermissions = ClaimsPermissions;
  beneficiariesPermissions = BeneficiariesPermissions;


  constructor(
    private layoutService: LayoutService,
    private permissionService: PermissionService,
     private localization: LocalizationService,
  ) {}
  ngOnInit(): void {
    this.items = [
      {
        label: 'Claims Coding',
        icon: 'bi bi-file-earmark-code me-1',
        visible:
          this.permissionService.getGrantedPolicy(this.claimsCodingPermissions.ClaimsCodingAll) ||
          this.permissionService.getGrantedPolicy(this.claimsCodingPermissions.ClaimsCodingDraft) ||
          this.permissionService.getGrantedPolicy(this.claimsCodingPermissions.ClaimsCodingNew) ||
          this.permissionService.getGrantedPolicy(this.batchesCodingPermissions.BatchesCodingAll) ||
          this.permissionService.getGrantedPolicy(
            this.batchesCodingPermissions.BatchesCodingPreDraft,
          ) ||
          this.permissionService.getGrantedPolicy(
            this.batchesCodingPermissions.BatchesCodingDraft,
          ) ||
          this.permissionService.getGrantedPolicy(this.batchesCodingPermissions.BatchesCodingNew) ||
          this.permissionService.getGrantedPolicy(
            this.batchesCodingPermissions.BatchesCodingIssued,
          ) ||
          this.permissionService.getGrantedPolicy(
            this.batchesCodingPermissions.BatchesCodingCompleted,
          ),

        items: [
          {
            label: 'Batches',
            icon: 'bi bi-box me-1',
            items: [
              {
                label: 'All',
                icon: 'bi bi-box-seam me-1',
                routerLink: 'coding-batches/all',
                visible: this.permissionService.getGrantedPolicy(
                  this.batchesCodingPermissions.BatchesCodingAll,
                ),
              },
              {
                label: 'Pre-Draft',
                icon: 'bi bi-journal me-1',
                routerLink: 'coding-batches/predrafted',
                visible: this.permissionService.getGrantedPolicy(
                  this.batchesCodingPermissions.BatchesCodingPreDraft,
                ),
              },
              {
                label: 'Draft',
                icon: 'bi bi-journal-check me-1',
                routerLink: 'coding-batches/draft',
                visible: this.permissionService.getGrantedPolicy(
                  this.batchesCodingPermissions.BatchesCodingDraft,
                ),
              },
              {
                label: 'New',
                icon: 'bi bi-file-earmark-medical me-1',
                routerLink: 'coding-batches/new',
                visible: this.permissionService.getGrantedPolicy(
                  this.batchesCodingPermissions.BatchesCodingNew,
                ),
              },
              {
                label: 'Completed',
                icon: 'bi bi-patch-check me-1',
                routerLink: 'coding-batches/completed',
                visible: this.permissionService.getGrantedPolicy(
                  this.batchesCodingPermissions.BatchesCodingCompleted,
                ),
              },
              {
                label: 'Issued',
                icon: 'bi bi-box-seam me-1',
                routerLink: 'coding-batches/issued',
                visible: this.permissionService.getGrantedPolicy(
                  this.batchesCodingPermissions.BatchesCodingIssued,
                ),
              },
            ],
            visible:
              this.permissionService.getGrantedPolicy(
                this.batchesCodingPermissions.BatchesCodingPreDraft,
              ) ||
              this.permissionService.getGrantedPolicy(
                this.batchesCodingPermissions.BatchesCodingDraft,
              ) ||
              this.permissionService.getGrantedPolicy(
                this.batchesCodingPermissions.BatchesCodingNew,
              ) ||
              this.permissionService.getGrantedPolicy(
                this.batchesCodingPermissions.BatchesCodingCompleted,
              ) ||
              this.permissionService.getGrantedPolicy(
                this.batchesCodingPermissions.BatchesCodingIssued,
              ) ||
              this.permissionService.getGrantedPolicy(
                this.batchesCodingPermissions.BatchesCodingAll,
              ),
          },
          {
            label: 'Claims',
            icon: 'bi bi-file-earmark-medical me-1',
            items: [
              {
                label: 'All',
                icon: 'bi bi-files me-1',
                routerLink: 'coding-claims/all',
                visible: this.permissionService.getGrantedPolicy(
                  this.claimsCodingPermissions.ClaimsCodingAll,
                ),
              },
              {
                label: 'Draft',
                icon: 'bi bi-journal-check me-1',
                routerLink: 'coding-claims/drafted',
                visible: this.permissionService.getGrantedPolicy(
                  this.claimsCodingPermissions.ClaimsCodingDraft,
                ),
              },
              {
                label: 'New',
                icon: 'bi bi-file-earmark-medical me-1',
                routerLink: 'coding-claims/new',
                visible: this.permissionService.getGrantedPolicy(
                  this.claimsCodingPermissions.ClaimsCodingNew,
                ),
              },
            ],
            visible:
              this.permissionService.getGrantedPolicy(
                this.claimsCodingPermissions.ClaimsCodingDraft,
              ) ||
              this.permissionService.getGrantedPolicy(
                this.claimsCodingPermissions.ClaimsCodingNew,
              ) ||
              this.permissionService.getGrantedPolicy(this.claimsCodingPermissions.ClaimsCodingAll),
          },
        ],
      },
      {
        label: 'Claims Auditing',
        icon: 'bi bi-arrow-repeat me-1',
        items: [
          // { label: 'Batches', icon: 'bi bi-box me-1' ,visible:this.permissionService.getGrantedPolicy(this.batchesProcessingPermissions.ClaimsProcessingBatches)},
          {
            label: 'Claims',
            icon: 'bi bi-file-earmark-medical me-1',
            routerLink: 'claims-auditing/audit',
            visible: this.permissionService.getGrantedPolicy(
              this.claimsProcessingPermissions.ClaimsProcessingClaims,
            ),
          },
        ],
        visible:
          this.permissionService.getGrantedPolicy(
            this.claimsProcessingPermissions.ClaimsProcessingClaims,
          ) ||
          this.permissionService.getGrantedPolicy(
            this.batchesProcessingPermissions.ClaimsProcessingBatches,
          ),
      },
      {
        label: 'Reports',
        icon: 'pi pi-chart-bar me-1',
        items: [
          {
            label: 'Status',
            icon: 'bi bi-file-binary me-1',
            routerLink: 'reports/statusReport',
            visible: this.permissionService.getGrantedPolicy(
              this.reportsPermissions.ReportsBatchStatus,
            ),
          },
          {
            label: 'Charts',
            icon: 'bi bi-graph-up me-1',
            routerLink: 'reports/chartReport',
            visible: this.permissionService.getGrantedPolicy(this.reportsPermissions.ReportsCharts),
          },
          {
            label: 'Daily Claims',
            icon: 'bi bi-clipboard-data me-1',
            routerLink: 'reports/dailyClaimsReport',
            visible: this.permissionService.getGrantedPolicy(
              this.reportsPermissions.ReportsDailyClaims,
            ),
          },
          {
            label: 'Hourly Claims',
            icon: 'bi bi-clock me-1',
            routerLink: 'reports/claimsHourlyReport',
            visible: this.permissionService.getGrantedPolicy(
              this.reportsPermissions.ReportsClaimsHourely,
            ),
          },
        ],
        visible:
          this.permissionService.getGrantedPolicy(this.reportsPermissions.ReportsBatchStatus) ||
          this.permissionService.getGrantedPolicy(this.reportsPermissions.ReportsDailyClaims) ||
          this.permissionService.getGrantedPolicy(this.reportsPermissions.ReportsCharts) ||
          this.permissionService.getGrantedPolicy(this.reportsPermissions.ReportsClaimsHourely),
      },
      {
        label: 'My Tasks',
        icon: 'bi bi-list-task me-1',
        items: [
          {
            label: 'Entry',
            icon: 'bi bi-ui-checks me-1',
            routerLink: 'my-tasks/entry',
            visible: this.permissionService.getGrantedPolicy(this.myTasksPermissions.MyTasksEntry),
          },
          {
            label: 'Audit',
            icon: 'bi bi-ui-checks-grid me-1',
            routerLink: 'my-tasks/audit',
            visible: this.permissionService.getGrantedPolicy(this.myTasksPermissions.MyTasksAudit),
          },
        ],
        visible:
          this.permissionService.getGrantedPolicy(this.myTasksPermissions.MyTasksAudit) ||
          this.permissionService.getGrantedPolicy(this.myTasksPermissions.MyTasksEntry),
      },
      {
        label: 'Digital Archive',
        icon: 'bi bi-archive me-1',
        items: [
          {
            label: 'Providers',
            icon: 'bi bi-person-bounding-box me-1',
            routerLink: '/digital-archive/providers',
            visible: this.permissionService.getGrantedPolicy(
              this.digitalArchivePermissions.DigitalArchiveProviders,
            ),
          },
          {
            label: 'Batches',
            icon: 'bi bi-box me-1',
            routerLink: '/digital-archive/batches',
            visible: this.permissionService.getGrantedPolicy(
              this.digitalArchivePermissions.DigitalArchiveBatches,
            ),
          },
          {
            label: 'Claims',
            icon: 'bi bi-file-earmark-medical me-1',
            routerLink: '/digital-archive/claims',
            visible: this.permissionService.getGrantedPolicy(
              this.digitalArchivePermissions.DigitalArchiveClaims,
            ),
          },
        ],
        visible:
          this.permissionService.getGrantedPolicy(
            this.digitalArchivePermissions.DigitalArchiveProviders,
          ) ||
          this.permissionService.getGrantedPolicy(
            this.digitalArchivePermissions.DigitalArchiveBatches,
          ) ||
          this.permissionService.getGrantedPolicy(
            this.digitalArchivePermissions.DigitalArchiveClaims,
          ),
      },
      {
        label: 'Medical Rules',
        icon: 'pi pi-shield me-1',
        items: [
          {
            label: 'Rules',
            icon: 'pi pi-cog me-1',
            routerLink: '/medical-rules/rules/list',
            visible: this.permissionService.getGrantedPolicy(this.rulesPermissions.Rules_View),
          },
          {
            label: 'Create Rule',
            icon: 'pi pi-plus me-1',
            routerLink: '/medical-rules/rules/create',
            visible: this.permissionService.getGrantedPolicy(this.rulesPermissions.Rules_Create),
          },
          {
            label: 'Bulk Rules',
            icon: 'pi pi-upload me-1',
            routerLink: '/medical-rules/rules/bulk',
            visible: this.permissionService.getGrantedPolicy(
              this.rulesPermissions.Rules_CreateBulk,
            ),
          },
          {
            label: 'Workflows',
            icon: 'pi pi-sitemap me-1',
            routerLink: '/medical-rules/workflows',
            visible: this.permissionService.getGrantedPolicy(
              this.workFlowsPermissions.Workflows_View,
            ),
          },
          {
            label: 'Batch Validation',
            icon: 'pi pi-check-square me-1',
            routerLink: '/medical-rules/validatebatch',
            visible: this.permissionService.getGrantedPolicy(
              this.claimsPermissions.Claims_ValidateBatch,
            ),
          },
          {
            label: 'Claim Validation',
            icon: 'pi pi-verified me-1',
            routerLink: '/medical-rules/validateclaim',
            visible: this.permissionService.getGrantedPolicy(
              this.claimsPermissions.Claims_ValidateClaim,
            ),
          },
          {
            label: 'Claim Json Validation',
            icon: 'pi pi-code me-1',
            routerLink: '/medical-rules/validatejsonclaim',
            visible: this.permissionService.getGrantedPolicy(
              this.claimsPermissions.Claims_ValidateClaimJson,
            ),
          },
          {
            label: 'Batch Validation Progress',
            icon: 'pi pi-spinner me-1',
            routerLink: '/medical-rules/BatchValidationProgress',
            visible: this.permissionService.getGrantedPolicy(
              this.claimsPermissions.Claims_ValidateClaimJson,
            ),
          },
          {
            label: 'Files Upload Status',
            icon: 'pi pi-file me-1',
            routerLink: '/medical-rules/filestatus',
            visible: this.permissionService.getGrantedPolicy(
              this.rulesPermissions.Rules_FileUploadStatus,
            ),
          },
        ],
        visible:
          this.permissionService.getGrantedPolicy(this.rulesPermissions.Rules_View) ||
          this.permissionService.getGrantedPolicy(this.rulesPermissions.Rules_Create) ||
          this.permissionService.getGrantedPolicy(this.rulesPermissions.Rules_CreateBulk) ||
          this.permissionService.getGrantedPolicy(this.workFlowsPermissions.Workflows_View) ||
          this.permissionService.getGrantedPolicy(this.claimsPermissions.Claims_ValidateBatch) ||
          this.permissionService.getGrantedPolicy(this.claimsPermissions.Claims_ValidateClaim) ||
          this.permissionService.getGrantedPolicy(
            this.claimsPermissions.Claims_ValidateClaimJson,
          ) ||
          this.permissionService.getGrantedPolicy(this.rulesPermissions.Rules_FileUploadStatus),
      },
 {
  label: this.localization.instant('RuleApplication::Menu:Beneficiaries'), 
  icon: 'pi pi-users me-1',
  visible: this.permissionService.getGrantedPolicy(
    this.beneficiariesPermissions.BeneficiariesSearch,
  ),
  items: [
    {
      label: this.localization.instant('RuleApplication::Menu:SearchBeneficiary'), 
      icon: 'pi pi-search me-1',
      routerLink: '/beneficiaries/search',
      visible: this.permissionService.getGrantedPolicy(
        this.beneficiariesPermissions.BeneficiariesSearch,
      ),
    },
  ],
},
      // {
      //   label: 'Families',
      //   icon: 'pi pi-home me-1',
      //   items: [
      //     {
      //       label: 'List',
      //       icon: 'pi pi-list me-1',
      //       routerLink: '/families',
      //     },
      //     {
      //       label: 'Create',
      //       icon: 'pi pi-plus me-1',
      //       routerLink: '/families/create',
      //     },
      //   ],
      // },
      {
        label: 'Setting',
        icon: 'pi pi-cog me-1',
        items: [
          { label: 'Profile', icon: 'pi pi-user-edit me-1', routerLink: '/account/manage' },
          { label: 'User Setting', icon: 'pi pi-cog me-1', routerLink: '/setting-management' },
        ],
        visible:
          this.permissionService.getGrantedPolicy(
            this.settingManagement.SettingManagementEmailing,
          ) ||
          this.permissionService.getGrantedPolicy(
            this.settingManagement.SettingManagementEmailingTest,
          ) ||
          this.permissionService.getGrantedPolicy(this.settingManagement.SettingManagementTimeZone),
      },
      {
        label: 'Management',
        icon: 'pi pi-users me-1',
        items: [
          {
            label: 'Users',
            icon: 'pi pi-id-card me-1',
            routerLink: '/identity/users',
            visible: this.permissionService.getGrantedPolicy(this.abpIdentity.AbpIdentityUsers),
          },
          {
            label: 'Roles',
            icon: 'pi pi-lock me-1',
            routerLink: '/identity/roles',
            visible: this.permissionService.getGrantedPolicy(this.abpIdentity.AbpIdentityRoles),
          },
        ],
        visible:
          this.permissionService.getGrantedPolicy(this.abpIdentity.AbpIdentityRoles) ||
          this.permissionService.getGrantedPolicy(this.abpIdentity.AbpIdentityUsers),
      },
    ];
  }

  toggleSidebar() {
    this.layoutService.toggleSidebar();
  }
  changeTheme(event: any) {
    if (event.target.checked) {
      this.layoutService.changeTheme('light');
      this.themeIcon = 'bi bi-moon-fill';
      this.themeName = 'Dark Mode';
    } else {
      this.layoutService.changeTheme('dark');
      this.themeIcon = ' bi bi-sun-fill';
      this.themeName = 'Light Mode';
    }
  }
}
