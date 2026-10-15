import { LocalizationService, PermissionService } from '@abp/ng.core';
import { Component, computed, OnInit } from '@angular/core';
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
    const canViewRules = this.permissionService.getGrantedPolicy(this.rulesPermissions.Rules_View);
    const canViewWorkflows = this.permissionService.getGrantedPolicy(
      this.workFlowsPermissions.Workflows_View,
    );

    this.items = [
      {
        label: 'Rule Management',
        icon: 'bi bi-file-earmark-code me-1',
        items: [
          {
            label: 'Rules',
            icon: 'bi bi-box me-1',
            routerLink: '/rules',
           },
          {
            label: 'Workflows',
            icon: 'bi bi-box me-1',
            routerLink: '/workflows',
           },
          {
            label: 'Form configs',
            icon: 'bi bi-box me-1',
            routerLink: '/form-configs',
           },
        ],
       },

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
