import { ToolbarAction } from '@abp/ng.components/extensible';
import { CustomeUsersComponent } from '../customecomponents/users/custome.users.component';
import { IdentityUserDto } from '@abp/ng.identity/proxy';
 
export const DEFAULT_USERS_TOOLBAR_ACTIONS = ToolbarAction.createMany<IdentityUserDto[]>([
  {
    text: 'AbpIdentity::NewUser',
    action: data => {
      const component = data.getInjected(CustomeUsersComponent);
      component.add();
    },
    permission: 'AbpIdentity.Users.Create',
    icon: 'fa fa-plus',
  },
]);
