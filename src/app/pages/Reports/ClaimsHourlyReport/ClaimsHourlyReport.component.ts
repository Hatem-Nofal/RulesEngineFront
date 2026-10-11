import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectedDropDownListByGuid } from '@proxy/ehealth-claims/common/dto';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';
import { ClaimsHourelyDto, ReportsService } from '@proxy/ehealth-claims/reports';
import { SharedModule } from 'src/app/shared/shared.module';
@Component({
  selector: 'app-claims-hourly-report',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './ClaimsHourlyReport.component.html',
  styleUrl: './ClaimsHourlyReport.component.scss',
})
export class ClaimsHourlyReportComponent implements OnInit {
  organizationUnitId = '00000000-0000-0000-0000-000000000000';
  organizationUnitDropDownList: SelectedDropDownListByGuid[] = [];
  claimsHourelyDto: ClaimsHourelyDto;
  // isDataLoad = false;

  constructor(
    private lookupAppServicesService: LookupAppServicesService,
    private reportsService: ReportsService
  ) { }

  ngOnInit(): void {
    this.generateReport();
    this.getOrganizationUnitDropDownList();
  }
  generateReport() {
    this.reportsService.claimsHourelyByOrganizationId(this.organizationUnitId).subscribe({
      next: res => {
        this.claimsHourelyDto = res;
        // this.isDataLoad = true;
      },
      error: err => {
        console.error(err);
      },
    });
  }
  getOrganizationUnitDropDownList() {
    this.lookupAppServicesService.getOrganizationUnitDropDownList().subscribe({
      next: res => {
        this.organizationUnitDropDownList = res.items;
         this.organizationUnitId = this.organizationUnitDropDownList.length === 1 
      ? this.organizationUnitDropDownList[0].id 
      : '00000000-0000-0000-0000-000000000000'; 
      },
      error: err => {
        console.error(err);
      },
    });
  }
}
