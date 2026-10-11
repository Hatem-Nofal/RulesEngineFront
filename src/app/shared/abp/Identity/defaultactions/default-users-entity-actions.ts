import { EntityAction } from '@abp/ng.components/extensible';
 import { ConfigStateService, CurrentUserDto } from '@abp/ng.core';
import { CustomeUsersComponent } from '../customecomponents/users/custome.users.component';
import { IdentityUserDto } from '@abp/ng.identity/proxy';
 
export const DEFAULT_USERS_ENTITY_ACTIONS = EntityAction.createMany<IdentityUserDto>([
  {
    text: 'AbpIdentity::Edit',
    action: data => {
      const component = data.getInjected(CustomeUsersComponent);
      component.edit(data.record.id || '');
    },
    permission: 'AbpIdentity.Users.Update',
  },
  {
    text: 'AbpIdentity::Permissions',
    action: data => {
      const component = data.getInjected(CustomeUsersComponent);
      component.openPermissionsModal(data.record.id || '', data.record.userName);
    },
    permission: 'AbpIdentity.Users.ManagePermissions',
  },
  {
    text: 'AbpIdentity::Delete',
    action: data => {
      const component = data.getInjected(CustomeUsersComponent);
      component.delete(data.record.id || '', data.record.name || data.record.userName || '');
    },
    visible: data => {
      const userName = data?.record.userName;
      const configStateService = data?.getInjected(ConfigStateService);
      const currentUser = configStateService?.getOne('currentUser') as CurrentUserDto;
      return userName !== currentUser.userName;
    },
    permission: 'AbpIdentity.Users.Delete',
  },
]);
