import { PermissionService } from '@abp/ng.core';
import { Column, TableConfig } from 'src/app/shared/models/table.model';

export abstract class CodingClaimsConfig {
  constructor(protected permissionService: PermissionService) {}
  columns: Column[] = [
    {
      field: 'number',
      header: 'Number',
      type: 'link',
      linkPermission: false, 
      routerLink: '/coding-claims/edit',
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
      header: 'Page Count',
      type: 'count',
    },
    {
      field: 'visit_Start_Date',
      header: 'Visit Start Date',
      type: 'date',
      format: 'dd/MM/yyyy',
    },
    {
      field: 'modifiedBy',
      header: 'Modified by',
    },
    // {
    //   field: 'scan_Date',
    //   header: 'Scan Date',
    //   width: '150px',
    //   type: 'date',
    //   format: 'dd/MM/yyyy',
    // },
    {
      field: 'ehealth_Batch_code',
      header: 'Batch',
      type: 'text',
    },
  ];
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
      label: 'Patient Id:',
      type: 'text',
      value: '',
      validators: [],
    },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    filterable: true,
    globalFilterFields: ['status'],
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
}
