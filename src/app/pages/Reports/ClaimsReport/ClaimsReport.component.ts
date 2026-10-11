import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectedDropDownListByGuid } from '@proxy/ehealth-claims/common/dto';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';
import { ClaimReportDto, ReportsService } from '@proxy/ehealth-claims/reports';
import { TableModule } from 'primeng/table';
import { Column, PaginationInfo, TableConfig } from 'src/app/shared/models/table.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-claims-report',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, TableModule],
  templateUrl: './ClaimsReport.component.html',
  styleUrl: './ClaimsReport.component.scss',
})
export class ClaimsReportComponent implements OnInit {
  organizationUnitDropDownList: SelectedDropDownListByGuid[] = [];
  organizationUnitId:string;
  selectedDateFrom: string = new Date().toISOString().split('T')[0];
  selectedDateTo: string = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
  claimReportDto: ClaimReportDto;
  columns: Column[] = [
    {
      field: 'index',
      header: '#no',
      type: 'number',
    },
    {
      field: 'email',
      header: 'Name',

      type: 'text',
    },
    {
      field: 'totalClaims',
      header: 'Claims',

      type: 'number',
    },
    {
      field: 'op',
      header: 'OP',
      type: 'number',
    },
    {
      field: 'ip',
      header: 'IP',
      type: 'number',
    },
    {
      field: 'er',
      header: 'ER',
      type: 'number',
    },
  ];
  tableConfig: TableConfig = {
    selectable: false,
    filterable: true,
    globalFilterFields: ['email', 'totalClaims'],
    rowsPerPage: 10,
    showPaginator: true,
    responsive: true,
    scrollable: true,
    resizableColumns: true,
    sortMode: 'single',
    defaultSortField: 'totalClaims',
    defaultSortOrder: -1,
    actions: false,
  };
  paginationInfo: PaginationInfo = {};
  actions = {
    edit: false,
    details: false,
    assignTo: false,
    audit: false,
  };
  claimsReportData: any;

  constructor(
    private lookupAppServicesService: LookupAppServicesService,
    private reportsService: ReportsService
  ) { }
  GenerateReport() {
    this.reportsService
      .dailyClaimsBySelectedDateFromAndSelectedDateToAndOrganizationId(
        this.selectedDateFrom,
        this.selectedDateTo,
        this.organizationUnitId
      )
      .subscribe(res => {
        this.claimReportDto = res;
      });
  }
  ngOnInit(): void {
    this.lookupAppServicesService.getOrganizationUnitDropDownList().subscribe(res => {
      this.organizationUnitDropDownList = res.items;

       this.organizationUnitId = this.organizationUnitDropDownList.length === 1 
      ? this.organizationUnitDropDownList[0].id 
      : '00000000-0000-0000-0000-000000000000'; 
    });

  
  }
  onInputSelectedDateFrom(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDateFrom = input.value;
  }
   onInputSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.organizationUnitId = input.value;
  }
  onInputSelectedDateTo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDateTo = input.value;
  }
  // Blur event handler
}
