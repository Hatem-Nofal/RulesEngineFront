import { PermissionService } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClaimPagedAndFilterDto, ClaimService } from '@proxy/ehealth-claims/domains/claim';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';
import { Observable } from 'rxjs';
import { FormPageComponent } from 'src/app/shared/components/CVA-Form/form-page/form-page.component';
import { MyTasksPermissions } from 'src/app/shared/models/appPermissions';
import { Column, PaginationInfo, TableConfig } from 'src/app/shared/models/table.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-tasks',
  standalone: true,
  templateUrl: './tasks.component.html',
  styleUrls: [
    '../Claims-coding/coding-batches/coding-batches.component.scss',
    './tasks.component.scss',
  ],
  imports: [CommonModule, SharedModule, FormPageComponent],
})
export class TasksComponent implements OnInit {
   _externalFilter: ClaimPagedAndFilterDto;
  myTasksPermissions = MyTasksPermissions
  paginationInfo: PaginationInfo = {};
  columns: Column[] = [
    {
      field: 'number',
      header: 'Number',
      type: 'link',
      linkPermission: false, 
      routerLink: '/my-tasks/edit',
    },

    {
      field: 'status_name',
      header: 'Status',
      type: 'status',
      severity: (value: string) => {
        switch (value) {
          case 'New':
            return 'success';
          case 'Draft':

        }
      },
    },
    {
      field: 'serial',
      header: 'Serial',
      type: 'text',
    },
    {
      field: 'patient_nid',
      header: 'Patient NID',
      type: 'text',
    },
    {
      field: 'page_Count',
      header: 'Pages No.',
      type: 'count',
      format: '1.0-0',
    },
    {
      field: 'visit_Start_Date',
      header: 'Visit Start Date',
      type: 'date',
      format: 'dd/MM/yyyy',
    },
    {
      field: 'modifiedBy',
      header: 'Modified By',
      type: 'text',
    },
    {
      field: 'ehealth_Batch_code',
      header: 'Batch',
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
    defaultSortField: 'FirstUpdate_timestamp',
    defaultSortOrder: -1,
    actions: true,
  };
  actions = {};

  taskList: any;

  dynamicControls = [
    {
      name: 'number',
      label: 'Claim Number',
      type: 'text',
      value: '',
      validators: [],
    },
    {
      name: 'patient_nid',
      label: 'Patient NID',
      type: 'text',
      value: '',
      validators: [],
    },

    // {
    //   name: 'batch_name',
    //   label: 'Batch Name',
    //   type: 'text',
    //   value: '',
    // },
    {
      name: 'batch_id',
      label: 'Batch Name',
      type: 'filterDropdown',
      option: []
    },
  ];

  bacthDropdownList: any;
  currentPage: string;

  constructor(private claimsService: ClaimService,
    private router: Router,
    private permisionService: PermissionService,
    private lookupServiceService: LookupAppServicesService
  ) { }

  ngOnInit(): void {
    this.getPermissions();
    if (this.router.url.includes('entry')) {
      this.currentPage = 'entry'
      // this.getTasksList(this.currentPage);
    } else if (this.router.url.includes('audit')) {
      this.currentPage = "audit"
      // this.getTasksList(this.currentPage)
    }

    this.getBatchDropdownList();

  }

  handleFormSubmit(event: ClaimPagedAndFilterDto) {
    this._externalFilter = event
    // this.getTasksList(this.currentPage, event);
  }

  getTasksList(currentPage: string, event?: ClaimPagedAndFilterDto) {

    const data: ClaimPagedAndFilterDto = {
      number: event?.number || undefined,
      patient_nid: event?.patient_nid || undefined,
      batch_name: event?.batch_name || undefined,
      batch_id: event?.batch_id || undefined,
      maxResultCount: event?.maxResultCount || 10,
      skipCount: event?.skipCount || 0,
      sorting: event?.sorting || null
    };

    let apiCall: Observable<any>;
    switch ((currentPage || '').toLowerCase()) {
      case 'entry':
        apiCall = this.claimsService.getMyTasksByInput(data)
        break;
      case 'audit':
        apiCall = this.claimsService.getMyTasksAuditByInput(data)
        break;
    }
    apiCall.subscribe({
      next: res => {
        this.taskList = res.items;
        this.paginationInfo = { totalItems: res.totalCount };
      },
      error: () => { },
      complete: () => { },
    });
  }

  getBatchDropdownList() {
    let lookup = this.currentPage === "entry" ? this.lookupServiceService.getBatchForOrganizationEntryDropDownList() : this.lookupServiceService.getBatchForOrganizationAuditDropDownList()

   lookup.subscribe({
      next: res => {
        const batchControl = this.dynamicControls.find(control => control.name === 'batch_id');
        if (batchControl) {
          batchControl['options'] = res;
        }
      },
    });
  }
  getPaginatedData(event: any) {
    this.getTasksList(this.currentPage, event);
  }
  getPermissions() {

    const permissionsArray = this.router.url.includes('audit') ? [
      { name: 'audit', permission: this.myTasksPermissions.MyTasksAuditAudit },
      { name: 'details', permission: this.myTasksPermissions.MyTasksAuditView },

    ] : [
      { name: 'edit', permission: this.myTasksPermissions.MyTasksEntryEdit },
      { name: 'details', permission: this.myTasksPermissions.MyTasksEntryView },
    ];

    permissionsArray.forEach((permissionObj) => {
      this.permisionService.getGrantedPolicy$(permissionObj.permission).subscribe((policies) => {
        this.actions[permissionObj.name] = policies;
        if (permissionObj.name === 'edit' && policies) {
          this.columns.forEach(col => {
            if (col.type === 'link') {
              col.linkPermission = policies;
              col.routerLink = policies? '/my-tasks/edit/' : '';
            }
          });
        }
      });
    });
  }
}
