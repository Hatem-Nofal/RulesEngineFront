import { ListResultDto, ListService, PagedResultDto } from '@abp/ng.core';
import {
  GetIdentityUsersInput,
  IdentityRoleDto,
  IdentityUserDto,
  IdentityUserService,
} from '@abp/ng.identity/proxy';
import { ePermissionManagementComponents } from '@abp/ng.permission-management';
import {
  Confirmation,
  ConfirmationService,
  eFormComponets,
  ToasterService,
} from '@abp/ng.theme.shared';
import {
  EXTENSIONS_IDENTIFIER,
  FormPropData,
  generateFormFromProps,
} from '@abp/ng.components/extensible';
import {
  Component,
  inject,
  Injector,
  OnInit,
  TemplateRef,
  TrackByFunction,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { eIdentityComponents } from '@abp/ng.identity';
import { SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import { CustomUserService } from '@proxy/ehealth-claims/domains/custom-app-services';
import { OrganizationDto } from '@proxy/ehealth-claims/domains/organization';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';


@Component({
    selector: 'abp-users',
    templateUrl: './custome.users.component.html',
    providers: [
        ListService,
        {
            provide: EXTENSIONS_IDENTIFIER,
            useValue: eIdentityComponents.Users,
        },
    ],
    standalone: false
})
export class CustomeUsersComponent implements OnInit {
  protected readonly list = inject(ListService<GetIdentityUsersInput>);
  protected readonly confirmationService = inject(ConfirmationService);
  protected readonly service = inject(IdentityUserService);
  protected readonly customUserService = inject(CustomUserService);

  protected readonly lookupAppServicesService = inject(LookupAppServicesService);

  protected readonly toasterService = inject(ToasterService);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly injector = inject(Injector);
  organizationUnitDropDownList:ListResultDto<SelectedDropDownList>
  data: PagedResultDto<IdentityUserDto> = { items: [], totalCount: 0 };

  @ViewChild('modalContent', { static: false })
  modalContent!: TemplateRef<any>;

  form!: UntypedFormGroup;

  selected?: IdentityUserDto;

  selectedUserRoles?: IdentityRoleDto[];
  selectedOrganizationDto?: OrganizationDto[];
  organizations?: OrganizationDto[];

  roles?: IdentityRoleDto[];

  visiblePermissions = false;

  providerKey?: string;

  isModalVisible?: boolean;

  modalBusy = false;

  permissionManagementKey = ePermissionManagementComponents.PermissionManagement;

  entityDisplayName: string;

  inputKey = eFormComponets.FormCheckboxComponent;
  errormessage = 'roleNamesRequired'
  trackByFn: TrackByFunction<AbstractControl> = (index, item) => Object.keys(item)[0] || index;

  onVisiblePermissionChange = (event: boolean) => {

    this.visiblePermissions = event;
  };

  get roleGroups(): UntypedFormGroup[] {
    return ((this.form.get('roleNames') as UntypedFormArray)?.controls as UntypedFormGroup[]) || [];
  }

  get organizationUnitsGroups(): UntypedFormGroup[] {
    return ((this.form.get('organizationUnits') as UntypedFormArray)?.controls as UntypedFormGroup[]) || [];
  }
  ngOnInit() {
    this.hookToQuery();
    //this.getOrganizationUnitDropDownList();
  }

  buildForm() {
     const data = new FormPropData(this.injector, this.selected);
    this.form = generateFormFromProps(data);
    this.service.getAssignableRoles().subscribe(({ items }) => {
      this.roles = items;
      if (this.roles) {
        this.form.addControl(
          'roleNames',
          this.fb.array(
            this.roles.map(role =>
              this.fb.group({
                [role.name as string]: [
                  this.selected?.id
                    ? !!this.selectedUserRoles?.find(userRole => userRole.id === role.id)
                    : role.isDefault,
                ],
              })
            ),
            validateroleNames()
          )
        );
      }
    });

    // this.lookupAppServicesService.getOrganizationUnitDropDownList().subscribe(res=>{
    //   this.organizationUnitDropDownList=res;
    //   if (this.organizationUnitDropDownList) {
    //     this.form.addControl(
    //       'organizationUnits',
    //       this.fb.array(
    //         this.organizationUnitDropDownList.items.map(organizationUnit =>
    //           this.fb.group({
    //             [organizationUnit.name as string]: [
    //               this.selected?.id
    //                 ? !!this.selectedOrganizationDto?.find(userOrganization => userOrganization.id === organizationUnit.id)
    //                 : organizationUnit.id,
    //             ],
    //           })
    //         ),
    //         validateorganizationNames()
    //       )
    //     );
    //   }
    // })
  }

  openModal() {
    this.buildForm();
    this.isModalVisible = true;
  }

  add() {
    this.selected = {} as IdentityUserDto;
    this.selectedUserRoles = [] as IdentityRoleDto[];
    this.openModal();
  }

  edit(id: string) {
    this.service
      .get(id)
      .pipe(
        tap(user => (this.selected = user)),
        switchMap(() => this.service.getRoles(id)),
      )
      .subscribe(userRole => {
        this.selectedUserRoles = userRole.items || [];
        this.openModal();
      });
  }

  save() {
    if (!this.form.valid || this.modalBusy) return;
    this.modalBusy = true;

    const { roleNames = [] } = this.form.value;
    const mappedRoleNames =
      roleNames
        .filter((role: { [key: string]: any }) => !!role[Object.keys(role)[0]])
        .map((role: { [key: string]: any }) => Object.keys(role)[0]) || [];

    const { id } = this.selected || {};

    (id
      ? this.service.update(id, {
        ...this.selected,
        ...this.form.value,
        roleNames: mappedRoleNames,
      })
      : this.service.create({ ...this.form.value, roleNames: mappedRoleNames })
    )
      .pipe(finalize(() => (this.modalBusy = false)))
      .subscribe(() => {
        this.isModalVisible = false;
        this.toasterService.success('AbpUi::SavedSuccessfully');
        this.list.get();
      });
  }

  delete(id: string, userName: string) {
    this.confirmationService
      .warn('AbpIdentity::UserDeletionConfirmationMessage', 'AbpIdentity::AreYouSure', {
        messageLocalizationParams: [userName],
      })
      .subscribe((status: Confirmation.Status) => {
        if (status === Confirmation.Status.confirm) {
          this.service.delete(id).subscribe(() => {
            this.toasterService.success('AbpUi::DeletedSuccessfully');
            this.list.get();
          });
        }
      });
  }

  sort(data: any) {
    const { prop, dir } = data.sorts[0];
    this.list.sortKey = prop;
    this.list.sortOrder = dir;
  }

  private hookToQuery() {
    this.list.hookToQuery(query => this.service.getList(query)).subscribe(res => (this.data = res));
  }

  openPermissionsModal(providerKey: string, entityDisplayName?: string) {
    this.providerKey = providerKey;
    this.entityDisplayName = entityDisplayName;
    setTimeout(() => {
      this.visiblePermissions = true;
    }, 0);
  }

  onCheckboxRoleGroupsSelect(role: any): void {
    this.resetFormGroups(this.roleGroups, (formGroup) => formGroup.get(role.name)?.value ===true);

    // Add logic here to handle role selection changes
  }
  onCheckboxOrganizationUnitsGroupsSelect(role: any): void {
    this.resetFormGroups(this.organizationUnitsGroups, (formGroup) => formGroup.get(role.name)?.value ===true);

    // Add logic here to handle role selection changes
  }

  resetFormGroups(formGroups: UntypedFormGroup[], condition: (formGroup: UntypedFormGroup) => boolean): void {
    formGroups.forEach((formGroup) => {
      if (!condition(formGroup)) {
        formGroup.reset();
      }
    });
  }


}
export function validateroleNames(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
     const hasTrue = control.value.some((obj) =>
      Object.values(obj).includes(true)
    );

    return hasTrue ? null : { required: true }

  };
}
export function validateorganizationNames(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
     const hasTrue = control.value.some((obj) =>
      Object.values(obj).includes(true)
    );

    return hasTrue ? null : { required: true }

  };
}

