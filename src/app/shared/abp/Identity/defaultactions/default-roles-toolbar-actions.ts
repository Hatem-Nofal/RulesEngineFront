import { ToolbarAction } from '@abp/ng.components/extensible';
import { RolesComponent } from '../customecomponents/roles/roles.component';
import { IdentityRoleDto } from '@abp/ng.identity/proxy';
 
export const DEFAULT_ROLES_TOOLBAR_ACTIONS = ToolbarAction.createMany<IdentityRoleDto[]>([
  {
    text: 'AbpIdentity::NewRole',
    action: data => {
      const component = data.getInjected(RolesComponent);
      component.add();
    },
    permission: 'AbpIdentity.Roles.Create',
    icon: 'fa fa-plus',
  },
]);
