import { PermissionService } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import { BatchPagedAndFilterDto, BatchListDto } from '@proxy/ehealth-claims/application/contracts/domains/batch';
import { BatchService } from '@proxy/ehealth-claims/application/domains/batchs';
import { SelectedDropDownListByGuid } from '@proxy/ehealth-claims/common/dto';
import { ExcelGeneratorAppSeviceService } from '@proxy/ehealth-claims/excel-generator';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';
import { DialogModule } from 'primeng/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { CustomRadioComponent } from 'src/app/shared/components/CVA-Form/custom-Radio/custom-Radio.component';
import { FormPageComponent } from 'src/app/shared/components/CVA-Form/form-page/form-page.component';
import { BatchesCodingPermissions, ClaimsCodingPermissions } from 'src/app/shared/models/appPermissions';
import { CustomDropDown } from 'src/app/shared/models/inputs.model';
import { Column, PaginationInfo, TableConfig } from 'src/app/shared/models/table.model';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';
import { SharedModule } from 'src/app/shared/shared.module';
@Component({
  selector: 'app-coding-batches',
  templateUrl: './coding-batches.component.html',
  styleUrl: './coding-batches.component.scss',
  standalone: true,
  imports: [CommonModule, SharedModule, FormPageComponent, DialogModule, CustomRadioComponent],
})
export class CodingBatchesComponent implements OnInit {
_externalFilter:BatchPagedAndFilterDto
  selectedOption: string;
  paginationInfo: PaginationInfo = {};
  batchesCodingPermissions = BatchesCodingPermissions;
  claimsodingPermissions = ClaimsCodingPermissions;

  columns: Column[] = [
    {
      field: 'uhiA_Batch_code',
      header: 'UHIA Batch code',
      type: 'text',
    },
    {
      field: 'ehealth_Batch_code',
      header: 'Ehealth Batch code',
    },
    {
      field: 'service_Date',
      header: 'Service Date',
      type: 'date',
      format: 'MMMM/yyyy',
    },
    // {
    //   field: 'reception_Date',
    //   header: 'Reception Date',
    //   width: '120px',
    //   type: 'date',
    //   format: 'dd/MM/yyyy',
    // },
    {
      field: 'serial',
      header: 'Serial',
      type: 'text',
    },
    {
      field: 'claims_Count',
      header: 'Claims Count',
      type: 'count',
      format: '1.2-2',
    },
    {
      field: 'serviceType',
      header: 'Service Type',
      type: 'text',
    },
    {
      field: 'organizationUnit',
      header: 'Organiztion Name',
      type: 'text',
    },
    {
      field: 'provider',
      header: 'Provider',
      type: 'text',
    },
    {
      field: 'batchStatus',
      header: 'Batch Status',
      type: 'status',
      severity: (value: string) => {
        switch (value) {
          case 'Completed':
            return 'success';
          case 'Pending':
            return 'warning';
          case 'Issued':
            return 'danger';
          case 'Draft':
            return 'dark';
          case 'New':
            return 'primary';
          default:
            return 'info';
        }
      },
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

  batchesData: BatchListDto[] = [];
  statusName = '';
  // filter dropdown
  filterOptions: CustomDropDown = { options: [] };
  dynamicControls = [
    {
      name: 'uhia_Batch_code',
      label: 'UHIA Batch code',
      type: 'text',
      value: '',
      validators: [],
    },
    {
      name: 'ehealth_Batch_code',
      label: 'Ehealth Batch code',
      type: 'text',
      value: '',
      validators: [],
    },
    {
      name: 'provider_id',
      label: 'Provider:',
      type: 'dropdown',
      value: '',
      validators: [],
    },
    {
      name: 'serviceTypeId',
      label: 'Service Type:',
      type: 'dropdown',
      value: '',
      validators: [],
    },
  ];
  statusList: SelectedDropDownList[];
  providerList: SelectedDropDownList[];
  assignesoptions: SelectedDropDownListByGuid[];
  openAssignToDailog: boolean;
  assignToValue: string;
  batchId: number;
  todaysDateTime: string;
  showCreateButton:boolean =false;
  bacthExcelPermission:boolean
  constructor(
    private batchService: BatchService,
    private activatedRoute: ActivatedRoute,
    private lookupService: LookupAppServicesService,
    private customConfirmationService: CustomConfirmationService,
    private permisionService: PermissionService,
    private ExcelGeneratorAppService: ExcelGeneratorAppSeviceService
  ) {}

  ngOnInit(): void {
    this.statusName = this.activatedRoute.snapshot.data['status'];
    if (this.statusName) {
      // this.getBatchesList(this.statusName);
      this.getPermissions(this.statusName);
      this.getAssigneeOptions();
      this.getProviderList();
      this.getTypeDropdownList();
     this.bacthExcelPermission=this.permisionService.getGrantedPolicy(BatchesCodingPermissions.BatchesCodingExportsBatchExcel);
    }
  }
  getProviderList() {
    this.lookupService.getProviderDropDownList().subscribe({
      next: res => {
        const providerControl = this.dynamicControls.find(
          control => control.name === 'provider_id'
        );
        if (providerControl) {
          providerControl['options'] = res;
        }
      },
    });
  }
  getTypeDropdownList() {
    this.lookupService.getServiceTypeDropDownList().subscribe({
      next: res => {
        const providerControl = this.dynamicControls.find(
          control => control.name === 'serviceTypeId'
        );
        if (providerControl) {
          providerControl['options'] = res;
        }
      },
    });
  }
  getBatchStatus() {
    this.lookupService.getBatchStatusDropDownList().subscribe({
      next: res => {
        this.statusList = res;
      },
    });
  }
  handleFormSubmit(event: BatchPagedAndFilterDto) {
       this._externalFilter = event;
    // this.getBatchesList(this.statusName, event);
  }

  getBatchesList(statusName: string = '', event?: BatchPagedAndFilterDto) {
    const data: BatchPagedAndFilterDto = {
      type_id: null,
      provider_id: event?.provider_id || undefined,
      uhia_Batch_code: event?.uhia_Batch_code || undefined,
      ehealth_Batch_code: event?.ehealth_Batch_code || undefined,
      serviceTypeId: event?.serviceTypeId || undefined,
      maxResultCount: event?.maxResultCount || 10,
      skipCount: event?.skipCount || 0,
      sorting: event?.sorting || null,
    };

    let apiCall: Observable<any>;
    switch ((statusName || '').toLowerCase()) {
      case 'draft':
        apiCall = this.batchService.getDraftList(data);
        break;
      case 'predrafted':
        apiCall = this.batchService.getPreDraftList(data);
        break;
      case 'issued':
        apiCall = this.batchService.getIssuedList(data);
        break;
      case 'completed':
        apiCall = this.batchService.getCompletedList(data);
        break;
      case 'new':
        apiCall = this.batchService.getNewList(data);
        break;
      default:
        apiCall = this.batchService.getList(data);
        break;
    }
    apiCall.subscribe({
      next: res => {
        this.batchesData = res.items;
        this.paginationInfo = { totalItems: res.totalCount };
      },
      error: () => {},
      complete: () => {},
    });
  }
  getAssigneeOptions() {
    this.lookupService.getOrganizationUnitDropDownList().subscribe({
      next: res => {
        this.assignesoptions = res.items;
      },
      error: () => {},
      complete: () => {},
    });
  }
  openAssignTo(event) {
    this.openAssignToDailog = event?.show;
    this.batchId = event?.id;
    this.assignToValue = event?.orgId;
  }
  submitAssignee() {
    this.batchService.updateBatchOrganization(this.batchId, this.assignToValue).subscribe({
      next: res => {
        this.openAssignToDailog = false;
        this.customConfirmationService.success('Batch Assigned Sucessfully', 'Sucess', 5000);
         this.getBatchesList(this.statusName);
      },
      error: () => {},
      complete: () => {},
    });
  }
  getPermissions(statusName: string) {

    let permissionsArray: { name: string; permission: string }[] = [];

    switch (statusName) {
      case 'all':
        permissionsArray = [
          { name: 'edit', permission: this.batchesCodingPermissions.BatchesCodingAllEdit },
          { name: 'details', permission: this.batchesCodingPermissions.BatchesCodingAllView },
          { name: 'viewBatchClaims', permission: this.claimsodingPermissions.ClaimsCodingAll },

          
        ];
        this.showCreateButton = this.permisionService.getGrantedPolicy(this.batchesCodingPermissions.BatchesCodingAllCreate);
        break;
      case 'draft':
        permissionsArray = [
          { name: 'edit', permission: this.batchesCodingPermissions.BatchesCodingDraftEdit },
          { name: 'details', permission: this.batchesCodingPermissions.BatchesCodingDraftView },
          { name: 'viewBatchClaims', permission: this.claimsodingPermissions.ClaimsCodingAll },

        ];
        this.showCreateButton = this.permisionService.getGrantedPolicy(this.batchesCodingPermissions.BatchesCodingDraftCreate);

        break;
      case 'predrafted':
        permissionsArray = [
          { name: 'edit', permission: this.batchesCodingPermissions.BatchesCodingPreDraftEdit },
          { name: 'details', permission: this.batchesCodingPermissions.BatchesCodingPreDraftView },
          { name: 'viewBatchClaims', permission: this.claimsodingPermissions.ClaimsCodingAll },

        ];
        this.showCreateButton = this.permisionService.getGrantedPolicy(this.batchesCodingPermissions.BatchesCodingPreDraftCreate);

        break;
        case 'issued':
          permissionsArray = [
            { name: 'edit', permission: this.batchesCodingPermissions.BatchesCodingIssuedEdit },
            { name: 'details', permission: this.batchesCodingPermissions.BatchesCodingIssuedView },
            { name: 'viewBatchClaims', permission: this.claimsodingPermissions.ClaimsCodingAll },

          ];
        this.showCreateButton = this.permisionService.getGrantedPolicy(this.batchesCodingPermissions.BatchesCodingIssuedCreate);
          break;
      case 'completed':
        permissionsArray = [
          { name: 'edit', permission: this.batchesCodingPermissions.BatchesCodingCompletedEdit },
          { name: 'details', permission: this.batchesCodingPermissions.BatchesCodingCompletedView },
          { name: 'viewBatchClaims', permission: this.claimsodingPermissions.ClaimsCodingAll },
          { name: 'assignTo', permission: this.batchesCodingPermissions.BatchesCodingCompletedAssignTo },

        ];
        this.showCreateButton = this.permisionService.getGrantedPolicy(this.batchesCodingPermissions.BatchesCodingCompletedCreate);

        break;
      case 'new':
          permissionsArray = [
            { name: 'edit', permission: this.batchesCodingPermissions.BatchesCodingNewEdit },
            { name: 'details', permission: this.batchesCodingPermissions.BatchesCodingNewView },
            { name: 'viewBatchClaims', permission: this.claimsodingPermissions.ClaimsCodingAll },
            { name: 'assignTo', permission: this.batchesCodingPermissions.BatchesCodingNewAssignTo },
          ];
        this.showCreateButton = this.permisionService.getGrantedPolicy(this.batchesCodingPermissions.BatchesCodingNewCreate);

          break;
    }

    permissionsArray.forEach(permissionObj => {
      this.permisionService.getGrantedPolicy$(permissionObj.permission).subscribe(policies => {
        this.actions[permissionObj.name] = policies;
      });
    });
  }
  getPaginatedData(event: any) {
    this.getBatchesList(this.statusName, event);
  }

  // generating excel
  getExcel() {
    this.getTodaysDay();
    this.ExcelGeneratorAppService.generateBachesExcel().subscribe({
      next: res => {
        this.downloadFile(res, `Batches_Excel_${this.todaysDateTime}.xlsx`);
      },
      error: () => {},
      complete: () => {},
    });
  }

  getTodaysDay() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    this.todaysDateTime = `${day}-${month}-${year} T${hours}:${minutes}:${seconds}`;
  }

  downloadFile(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
