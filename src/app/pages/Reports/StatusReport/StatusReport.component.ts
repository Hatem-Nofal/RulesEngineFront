
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { BatchReportDto, ReportsService } from '@proxy/ehealth-claims/reports';

@Component({
  selector: 'app-batches-report-',
  standalone: true,
  imports: [CardModule , CommonModule],
  templateUrl: `./StatusReport.component.html`,
  styleUrl: './StatusReport.component.scss',
})
export class StatusReportComponent implements OnInit {

  batchReportDto:BatchReportDto

  constructor(private reportsService:ReportsService){}

  ngOnInit(): void {
    this.reportsService.batchStatus().subscribe(res=>{
      this.batchReportDto=res
    })
  }
}
