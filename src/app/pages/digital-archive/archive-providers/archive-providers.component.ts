import { PermissionService } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProviderECMPagedAndFilterDto, ECMService } from '@proxy/ehealth-claims/domains/ecm';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';
import { FormPageComponent } from 'src/app/shared/components/CVA-Form/form-page/form-page.component';
import { DigitalArchivePermissions } from 'src/app/shared/models/appPermissions';
import { Column, PaginationInfo, TableConfig } from 'src/app/shared/models/table.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-archive-providers',
  standalone: true,
  templateUrl: './archive-providers.component.html',
  styleUrls: [
    '../../Claims-coding/coding-batches/coding-batches.component.scss',
    './archive-providers.component.scss',
  ],
  imports: [CommonModule, SharedModule, FormPageComponent],
})
export class ArchiveProvidersComponent implements OnInit {
  digitalArchivePermissions = DigitalArchivePermissions
_externalFilter:ProviderECMPagedAndFilterDto
  paginationInfo: PaginationInfo = {};
  columns: Column[] = [
    {
      field: 'code',
      header: 'Provider Code',
      type: 'text',
    },
    {
      field: 'eng_name',
      header: 'Provider Name (EN)',
      type: 'text',
    },
    {
      field: 'ara_name',
      header: 'Provider Name (AR)',
      type: 'text',
    },
    {
      field: 'governorate',
      header: 'Governorate',
      type: 'text',
    },
    {
      field: 'providerType',
      header: 'Provider Type',
      type: 'text',
    },
    {
      field: 'providerSource_Name',
      header: 'Provider Source',
      type: 'text',
    },
    {
      field: 'batchesNum',
      header: 'Batches Count',
      type: 'count',
    },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    filterable: true,
    globalFilterFields: ['batchNumber', 'status'],
    rowsPerPage: 10,
    showPaginator: true,
    responsive: true,
    scrollable: true,
    resizableColumns: true,
    sortMode: 'single',
    // defaultSortField: 'createdDate',
    defaultSortOrder: -1,
    actions: true,
  };
  actions = {
  };

  providerData: any;
  governonateDropdownList: any;
  providerTypeDropdownList: any;

  dynamicControls = [
    {
      name: 'providerCode',
      label: 'Provider Code',
      type: 'text',
      value: '',
      validators: [],
    },
    {
      name: 'providerName',
      label: 'Provider Name',
      type: 'text',
      value: '',
      validators: [],
    },
    {
      name: 'governorateId',
      label: 'Governorate',
      type: 'dropdown',
      value: '',
      validators: [],
      options: [],
    },
    {
      name: 'providerTypeId',
      label: 'Provider Type',
      type: 'dropdown',
      value: '',
      validators: [],
      options: [],
    },
  ];
  providerId: number;

  constructor(
    private lookupServiceService: LookupAppServicesService,
    private ECMSrvice: ECMService,
    private permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.getPermissions();
    this.getProvderTypeDropdownList();
    this.getGovernorateDropdownList();
    // this.getProviderList();  
  }

  handleFormSubmit(event: ProviderECMPagedAndFilterDto) {
    this._externalFilter = event
    // this.getProviderList(event);
  }

  getProviderList(event?: ProviderECMPagedAndFilterDto) {
    const data: ProviderECMPagedAndFilterDto = {
      providerCode: event?.providerCode || '',
      providerName: event?.providerName || '',
      governorateId: event?.governorateId,
      providerTypeId: event?.providerTypeId,
      maxResultCount: event?.maxResultCount || 10,
      skipCount: event?.skipCount || 0,
      sorting: event?.sorting || null,
    };
    this.ECMSrvice.getECMProviders(data).subscribe({
      next: res => {
        this.providerData = res.providers.items;
        this.paginationInfo = { totalItems: res.providers.totalCount };
      },
      error: () => { },
      complete: () => { },
    });
  }
  getGovernorateDropdownList() {
    this.lookupServiceService.getGovernateDropDownList().subscribe({
      next: res => {
        this.governonateDropdownList = res;
        this.updateDropdownOptions('governorateId', this.governonateDropdownList);
      },
      error: () => { },
      complete: () => { },
    });
  }
  getProvderTypeDropdownList() {
    this.lookupServiceService.getProviderTypeDropDownList().subscribe({
      next: res => {
        this.providerTypeDropdownList = res;
        this.updateDropdownOptions('providerTypeId', this.providerTypeDropdownList);
      },
      error: () => { },
      complete: () => { },
    });
  }
  updateDropdownOptions(controlName: string, options: any[]) {
    this.dynamicControls = this.dynamicControls.map(control => {
      if (control.name === controlName) {
        return { ...control, options };
      }
      return control;
    });
  }
  getPermissions() {
    const permissionsArray = [
      { name: 'viewbatches', permission: this.digitalArchivePermissions.DigitalArchiveBatches },
    ];
    permissionsArray.forEach((permissionObj) => {
      this.permissionService.getGrantedPolicy$(permissionObj.permission).subscribe((policies) => {
        this.actions[permissionObj.name] = policies;
      });
    });
  }
  getPaginatedData(event: any) {
    this.getProviderList(event);
  }
}
