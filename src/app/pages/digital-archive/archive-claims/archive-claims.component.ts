import { PermissionService } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimECMPagedAndFilterDto, ECMService } from '@proxy/ehealth-claims/domains/ecm';
import { FormPageComponent } from 'src/app/shared/components/CVA-Form/form-page/form-page.component';
import { DigitalArchivePermissions } from 'src/app/shared/models/appPermissions';
import { Column, PaginationInfo, TableConfig } from 'src/app/shared/models/table.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-archive-claims',
  standalone: true,
  templateUrl: './archive-claims.component.html',
  styleUrls: [
    '../../Claims-coding/coding-batches/coding-batches.component.scss',
    './archive-claims.component.scss',
  ],
  imports: [CommonModule, SharedModule, FormPageComponent],
})
export class ArchiveClaimsComponent {
  _externalFilter:ClaimECMPagedAndFilterDto;
  digitalArchivePermissions = DigitalArchivePermissions
  paginationInfo: PaginationInfo = {};
  columns: Column[] = [
    {
      field: 'uhiaClaimCode',
      header: 'UHIA Claim Code',
      type: 'text',
    },
    {
      field: 'number',
      header: 'EHealth Claim No',
      type: 'text',
    },
    {
      field: 'patient_nid',
      header: 'Patient National ID',
      type: 'text',
    },
    {
      field: 'provider_name',
      header: 'Provider Name',
      width: '200px',
      type: 'text',
    },
    {
      field: 'batch_Service_Date',
      header: 'Batch Month & Year',
      type: 'date',
      format: 'dd/MM/yyyy',
    },
    {
      field: 'ehealth_Batch_code',
      header: 'EHealth Batch Code',
      type: 'link',
      routerLink: '/digital-archive/batches/view/',
      linkPermission : this.permissionService.getGrantedPolicy(this.digitalArchivePermissions.DigitalArchiveBatchesView)
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
  claimsList: any;

  dynamicControls = [
    {
      name: 'uhiaClaimCode',
      label: 'UHIA Claim Code',
      type: 'text',
      value: '',
      validators: [],
    },
    {
      name: 'ehealthClaimno',
      label: 'EHealth Claim No',
      type: 'text',
      value: '',
      validators: [],
    },
    {
      name: 'patient_nid',
      label: 'Patient National ID',
      type: 'text',
      value: '',
      validators: [],
    },
    {
      name: 'uhiaBatchNo',
      label: 'Batch Code',
      type: 'text',
      value: '',
      validators: [],
    },
  ];
  batchId: number;

  constructor(private ECMSrvice: ECMService, private activatedRoute: ActivatedRoute, private permissionService: PermissionService) { }

  ngOnInit(): void {
    this.getPermissions();
    this.activatedRoute.queryParams.subscribe(params => {
      this.batchId = params['queryKey'] || null;
    });
    // this.getClaimsList();
  }

  handleFormSubmit(event: ClaimECMPagedAndFilterDto) {
    this._externalFilter = event;
    // this.getClaimsList(event);
  }

  getClaimsList(event?: ClaimECMPagedAndFilterDto) {
    const data: ClaimECMPagedAndFilterDto = {
      uhiaClaimCode: event?.uhiaClaimCode || undefined,
      uhiaBatchNo: event?.uhiaBatchNo || undefined,
      ehealthClaimno: event?.ehealthClaimno || undefined,
      patient_nid: event?.patient_nid || undefined,
      batchId: this.batchId || undefined,
      maxResultCount: event?.maxResultCount || 10,
      skipCount: event?.skipCount || 0,
      sorting: event?.sorting || null,
    };
    this.ECMSrvice.getECMClaims(data).subscribe({
      next: res => {
        this.claimsList = res.items;
        this.paginationInfo = { totalItems: res.totalCount };
      },
      error: () => { },
      complete: () => { },
    });
  }
  getPermissions() {
    const permissionsArray = [
      { name: 'details', permission: this.digitalArchivePermissions.DigitalArchiveClaimsView },
    ];
    permissionsArray.forEach((permissionObj) => {
      this.permissionService.getGrantedPolicy$(permissionObj.permission).subscribe((policies) => {

        this.actions[permissionObj.name] = policies;
      });
    });
  }
  getPaginatedData(event: any) {
    this.getClaimsList(event);
  }

}
