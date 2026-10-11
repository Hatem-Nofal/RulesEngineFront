import { PermissionService } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BatchDto } from '@proxy/ehealth-claims/application/contracts/domains/batch';
import { BatchService } from '@proxy/ehealth-claims/application/domains/batchs';
import { ExcelGeneratorAppSeviceService } from '@proxy/ehealth-claims/excel-generator';
import { SharedModule } from 'primeng/api';
import { PermissionManagementModule } from 'src/app/shared/abp/permission-management/permission-management.module';
import { BatchesCodingPermissions } from 'src/app/shared/models/appPermissions';

@Component({
  selector: 'app-coding-batches-view',
  templateUrl: './coding-batches-view.component.html',
  styleUrl: './coding-batches-view.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, PermissionManagementModule],
})
export class CodingBatchesViewComponent implements OnInit {
  batchDetails: BatchDto;
  batchId: string;
  todaysDateTime: string;
  batchesCodingPermissions: BatchesCodingPermissions;
  BatchesCodingExportsIPPermission = BatchesCodingPermissions.BatchesCodingExportsIP;
  BatchesCodingExportsOperationalPPermission =
    BatchesCodingPermissions.BatchesCodingExportsOperational;
  BatchesCodingExportsReconciliationPPermission =
    BatchesCodingPermissions.BatchesCodingExportsReconciliation;
  BatchesCodingExportsWithDescriptionPPermission =
    BatchesCodingPermissions.BatchesCodingExportsWithDescription;
  BatchesCodingExportsBatchExcelDetailsPPermission =
    BatchesCodingPermissions.BatchesCodingExportsBatchExcelDetails;
  constructor(
    private batchService: BatchService,
    private ExcelGeneratorAppService: ExcelGeneratorAppSeviceService,
    private activatedRoute: ActivatedRoute,
    public permission: PermissionService
  ) {}

  showHistory: boolean = false;
  ngOnInit(): void {
    this.batchId = this.activatedRoute.snapshot.params['id'];
    this.activatedRoute.data.subscribe(data => {
      this.batchDetails = data['batchesDetails'];
    });
  }
  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  downloadFile(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url); // Clean up
  }
  getExcel(facility_code: string, uhia_Batch_code: string, ehealth_Batch_code: string) {
    this.getTodaysDay();
    this.ExcelGeneratorAppService.generateExcel(this.batchId).subscribe({
      next: res => {
        this.downloadFile(
          res,
          `${facility_code}_${uhia_Batch_code}_${ehealth_Batch_code}_${this.todaysDateTime}.xlsx`
        );
      },
      error: () => {},
      complete: () => {},
    });
  }

  getIPExcel(facility_code: string, uhia_Batch_code: string, ehealth_Batch_code: string) {
    this.getTodaysDay();
    this.ExcelGeneratorAppService.generateIPExcel(this.batchId).subscribe({
      next: res => {
        this.downloadFile(
          res,
          `${facility_code}_${uhia_Batch_code}_${ehealth_Batch_code}_${this.todaysDateTime}.xlsx`
        );
      },
      error: () => {},
      complete: () => {},
    });
  }
  getOperationExcel(ehealth_Batch_code: string) {
    this.getTodaysDay();
    this.ExcelGeneratorAppService.generateOPExcel(this.batchId).subscribe({
      next: res => {
        this.downloadFile(res, `Operation Excel_${ehealth_Batch_code}_${this.todaysDateTime}.xlsx`);
      },
      error: () => {},
      complete: () => {},
    });
  }
  getReconciliationExcel(ehealth_Batch_code: string) {
    this.getTodaysDay();
    this.ExcelGeneratorAppService.generateReconciliationExcel(this.batchId).subscribe({
      next: res => {
        this.downloadFile(
          res,
          `Reconcilation Excel_${ehealth_Batch_code}_${this.todaysDateTime}.xlsx`
        );
      },
      error: () => {},
      complete: () => {},
    });
  }
  getWithDescExcel(providerName: string, uhia_Batch_code: string, ehealth_Batch_code: string) {
    this.getTodaysDay();
    this.ExcelGeneratorAppService.generateExcelwithDescByBatchCode(
      this.batchDetails?.ehealth_Batch_code
    ).subscribe({
      next: res => {
        this.downloadFile(
          res,
          `${providerName}_${uhia_Batch_code}_${ehealth_Batch_code}_${this.todaysDateTime}.xlsx`
        );
      },
      error: () => {},
      complete: () => {},
    });
  }
  edit() {
    this.activatedRoute;
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
}
