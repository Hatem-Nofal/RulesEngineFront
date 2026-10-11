import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ABP, ConfigStateService } from '@abp/ng.core';
import { getPasswordValidators } from '@abp/ng.theme.shared';
import { ePropType, FormProp, FormPropList } from '@abp/ng.components/extensible';
import { map } from 'rxjs';
import { IdentityUserDto } from '@proxy/volo/abp/identity/models';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups/lookup-app-services.service';
// import { relationToUHIAEnumOptions } from '@proxy/commn/enums';

export const DEFAULT_USERS_CREATE_FORM_PROPS = FormProp.createMany<IdentityUserDto>([
  {
    type: ePropType.String,
    name: 'userName',
    displayName: 'AbpIdentity::UserName',
    id: 'user-name',
    validators: () => [Validators.required, Validators.maxLength(256)],

  },
  {
    type: ePropType.PasswordInputGroup,
    name: 'password',
    displayName: 'AbpIdentity::Password',
    id: 'password',
    autocomplete: 'new-password',
    validators: data => [Validators.required, ...getPasswordValidators({ get: data.getInjected })],
  },
  {
    type: ePropType.String,
    name: 'name',
    displayName: 'AbpIdentity::DisplayName:Name',
    id: 'name',
    validators: () => [Validators.maxLength(64)],
  },
  {
    type: ePropType.String,
    name: 'surname',
    displayName: 'AbpIdentity::DisplayName:Surname',
    id: 'surname',
    validators: () => [Validators.maxLength(64)],
  },
  {
    type: ePropType.Email,
    name: 'email',
    displayName: 'AbpIdentity::EmailAddress',
    id: 'email',
    validators: () => [Validators.required, Validators.maxLength(256), Validators.email],
  },
  {
    type: ePropType.String,
    name: 'phoneNumber',
    displayName: 'AbpIdentity::PhoneNumber',
    id: 'phone-number',
    validators: () => [ validatephoneNumber()],

  },{
    type: ePropType.Enum,
    name: 'OrganizationId',
    displayName: 'Organization',
    id: 'OrganizationId',
     validators: () => [Validators.required],


    options: data => {
      const service = data.getInjected(LookupAppServicesService);


       return service.getOrganizationUnitDropDownList()
        .pipe(
          map(({items}) => items.map(
            item => ({key: item.name, value: item.name })
          )),
        );
    },
    autocomplete: 'on',
    isExtra: true,
     formText: 'Default::Organization',
  },

  // {
  //   type: ePropType.Enum,
  //   name: 'RelationToUHIA',
  //   displayName: 'UserRelationToUHIA',
  //   id: 'RelationToUHIA',
  //   options: data => {
  //     return of(relationToUHIAEnumOptions.map(option => {
  //       return {
  //         key: option.key, // Assuming 'name' is the label for each option
  //         value: option.value,   // Assuming 'id' is the value for each option
  //       } as ABP.Option<any>;
  //     }));
  //   },
  //   isExtra: true,
  //   validators: () => [Validators.required],



  // },
  // {
  //   type: ePropType.Date,
  //   name: 'MembershipValidityFrom',
  //   displayName: 'MembershipValidityFrom',
  //   id: 'MembershipValidityFrom',
  //   defaultValue: new Date(),
  //   validators: () => [Validators.required],
  //   isExtra: true,



  // },
  // {
  //   type: ePropType?.Date,
  //   name: 'MembershipValidityTo',
  //   displayName: 'MembershipValidityTo',
  //   id: 'MembershipValidityTo',
  //   isExtra: true,
  //   validators: () => [validateMembershipValidityTo()],
  //   defaultValue:undefined,

  //   //   asyncValidators: data => {

  //   //     function validateMembershipValidityTo(control: AbstractControl): Observable<ValidationErrors | null> {
  //   //
  //   //     if (control.value === "") return of(null);
  //   //     if (control.value <= control?.parent.controls['MembershipValidityFrom'].value) {
  //   //       return of({ invalidMembershipValidityTo: true })

  //   //     }
  //   //     return of(null);
  //   //   }
  //   //     return [validateMembershipValidityTo];

  //   // }




  // },

  {
    type: ePropType.Boolean,
    name: 'isActive',
    displayName: 'AbpIdentity::DisplayName:IsActive',
    id: 'active-checkbox',
    defaultValue: true,


  },
  {
    type: ePropType.Boolean,
    name: 'lockoutEnabled',
    displayName: 'AbpIdentity::DisplayName:LockoutEnabled',
    id: 'lockout-checkbox',
    defaultValue: true,
  }
]);

export const DEFAULT_USERS_EDIT_FORM_PROPS = DEFAULT_USERS_CREATE_FORM_PROPS.map(prop => {
  if (prop.name === 'password') {
    return {
      ...prop,
      validators: (data: any) => [...getPasswordValidators({ get: data.getInjected })],
    };
  }
  if (prop.name === 'isActive') {
    return {
      ...prop,
      visible: data => {
        const configState = data.getInjected(ConfigStateService);
        const currentUserId = configState.getDeep('currentUser.id');
        return currentUserId !== data.record.id;
      },
    };
  }
  return prop;
});

export function validateMembershipValidityTo(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.pristine) return null;

    if (control.value <= control?.parent.controls['MembershipValidityFrom'].value) {
      return { invalidMembershipValidityTo: true }

    }
    return null;
  };
}

export function validatephoneNumber(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.pristine||control.value==='') return null;

    const phonePattern = /^(010|011|012|015)\d{8}$/;
    const valid = phonePattern.test(control.value);

    return valid ? null : { invalidPhoneNumber: true }
  };
}
