import { PermissionService } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BatchECMPagedAndFilterDto, ECMService } from '@proxy/ehealth-claims/domains/ecm';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';
import { FormPageComponent } from 'src/app/shared/components/CVA-Form/form-page/form-page.component';
import { DigitalArchivePermissions } from 'src/app/shared/models/appPermissions';
import { Column, PaginationInfo, TableConfig } from 'src/app/shared/models/table.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-archive-batches',
  standalone: true,
  templateUrl: './archive-batches.component.html',
  styleUrls: [
    '../../Claims-coding/coding-batches/coding-batches.component.scss',
    './archive-batches.component.scss',
  ],
  imports: [CommonModule, SharedModule, FormPageComponent],
})
export class ArchiveBatchesComponent implements OnInit {
    _externalFilter:BatchECMPagedAndFilterDto;
    
  digitalArchivePermissions = DigitalArchivePermissions

  paginationInfo: PaginationInfo = {};
  columns: Column[] = [
    {
      field: 'uhia_Batch_code',
      header: 'UHIA Batch No',
      type: 'text',
    },
    {
      field: 'ehealth_Batch_code',
      header: 'EHealth Batch Code',
      type: 'text',
    },
    {
      field: 'type',
      header: 'Batch Type',
      type: 'text',
    },
    {
      field: 'service_Date',
      header: 'Batch Date',
      type: 'date',
      format: 'dd/MM/yyyy',
    },
    {
      field: 'claimsNum',
      header: 'Claims Count',
      type: 'count',
    },
    {
      field: 'providerAra_name',
      header: 'Provider AR Name',
      type: 'text',
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
  actions = {};

  batchesList: any;

  dynamicControls = [
    {
      name: 'uhiaBatchNo',
      label: 'UHIA Batch No',
      type: 'text',
      value: '',
      validators: [],
    },
    {
      name: 'eHealthCode',
      label: 'EHealth Batch Code',
      type: 'text',
      value: '',
      validators: [],
    },
    {
      name: 'batchType',
      label: 'batch Type',
      type: 'dropdown',
      value: '',
      validators: [],
      options: [],
    },
    {
      name: 'serviceDate',
      label: 'Month',
      type: 'month',
      value: '',
      validators: [],
    },
  ];

  providerTypeDropdownList: any;
  providerId: number;

  constructor(
    private ECMSrvice: ECMService,
    private lookupServiceService: LookupAppServicesService,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.getPermissions();
    this.getProviderTypeDropdownList();
    this.activatedRoute.queryParams.subscribe(params => {
      this.providerId = params['queryKey'] || null;
    });
    // this.getBtachList();
  }

  handleFormSubmit(event: BatchECMPagedAndFilterDto) {
    this._externalFilter = event;
    // this.getBtachList(event);
  }

  getBtachList(event?: BatchECMPagedAndFilterDto) {
    const data: BatchECMPagedAndFilterDto = {
      providerId: this.providerId || undefined,
      eHealthCode: event?.eHealthCode || undefined,
      uhiaBatchNo: event?.uhiaBatchNo || undefined,
      batchType: event?.batchType || undefined,
      serviceDate: event?.serviceDate || undefined,
      maxResultCount: event?.maxResultCount || 10,
      skipCount: event?.skipCount || 0,
      sorting: event?.sorting || null,
    };
    this.ECMSrvice.getECMBatches(data).subscribe({
      next: res => {
        this.batchesList = res.batchs.items;
        this.paginationInfo = { totalItems: res.batchs.totalCount };
      },
      error: () => { },
      complete: () => { },
    });
  }

  getProviderTypeDropdownList() {
    this.lookupServiceService.getServiceTypeDropDownList().subscribe({
      next: res => {
        this.providerTypeDropdownList = res;
        this.updateDropdownOptions('batchType', this.providerTypeDropdownList);
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
      { name: 'details', permission: this.digitalArchivePermissions.DigitalArchiveBatchesView },
      { name: 'viewClaims', permission: this.digitalArchivePermissions.DigitalArchiveClaims },
    ];
    permissionsArray.forEach((permissionObj) => {
      this.permissionService.getGrantedPolicy$(permissionObj.permission).subscribe((policies) => {
        this.actions[permissionObj.name] = policies;
      });
    });
  }
  getPaginatedData(event: any) {
    this.getBtachList(event);
  }
}
