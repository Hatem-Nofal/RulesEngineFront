import { PermissionService } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BatchECMDto } from '@proxy/ehealth-claims/domains/ecm';
import { ExcelGeneratorAppSeviceService } from '@proxy/ehealth-claims/excel-generator';
import { FilesManagerService } from '@proxy/ehealth-claims/files-managers';
import { ECMService } from '@proxy/ehealth-claims/domains/ecm';

import {
  BatchesCodingPermissions,
  DigitalArchivePermissions,
} from 'src/app/shared/models/appPermissions';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';

@Component({
  selector: 'app-archive-batches-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './archive-batches-details.component.html',
  styleUrl: './archive-batches-details.component.scss',
})
export class ArchiveBatchesDetailsComponent {
  batchDetails: BatchECMDto;
  batchId: number;
  iframeUrl: SafeResourceUrl | null = null;
  PdfECMBatche: Blob;
  fileName: any;
  url: any;
  fileload = true;
  todaysDateTime: string;
  bacthExcelPermission: boolean;
  constructor(
    private ECMService: ECMService,
    private activatedRoute: ActivatedRoute,
    private excelGeneratorAppService: ExcelGeneratorAppSeviceService,
    private filesManagerService: FilesManagerService,
    private sanitizer: DomSanitizer,
    private permission: PermissionService,
    private customConfirmationService: CustomConfirmationService
  ) {}
  ngOnInit(): void {
    this.bacthExcelPermission = this.permission.getGrantedPolicy(
      DigitalArchivePermissions.DigitalArchiveBatchesExcel
    );

    this.batchId = this.activatedRoute.snapshot.params['id'];
    if (this.batchId) {
      this.getBatchDetails(this.batchId);
      this.filesManagerService.getPdfECMBatchebyIdByBatcheId(this.batchId).subscribe({
        next: (response: Blob) => {
          this.PdfECMBatche = response;
          const url = URL.createObjectURL(response);
          this.url = url;

          this.fileName = url.substring(url.lastIndexOf('/') + 1);
          this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.fileload = false;
        },
        error: async error => {
          console.error('Error fetching file:', error);
          
          let message = 'An unexpected error occurred.';
            if (error.message instanceof Blob) {
              const text = await error.message.text(); // convert Blob to text
              const json = JSON.parse(text); // parse JSON
              message = json.message?.name || json.message|| 'An unexpected error occurred.';
            } else if (error.message?.name || error.message) {
              message = error.message?.name || error.message;
            }          

          this.customConfirmationService.error(message, 'Error', 10000);
        },
      });
    }
  }

  getBatchExcel() {
    // this.getTodaysDay();
    this.excelGeneratorAppService.getExcelECMBatchebyIdByBatcheId(this.batchId).subscribe({
      next: res => {
        const url = URL.createObjectURL(res);
        // this.fileName = url.substring(url.lastIndexOf('/') + 1);
        this.fileName = this.batchDetails.file_Location_Report.split('/')[1];

        this.downloadFile(res, `${this.fileName}.xlsx`);
      },
      error: async error => {
          // console.error('Error fetching file:', error);
          let message = 'An unexpected error occurred.';
            if (error.message instanceof Blob) {
              const text = await error.message.text(); // convert Blob to text
              const json = JSON.parse(text); // parse JSON
              message = json.message?.name || json.message|| 'An unexpected error occurred.';
            } else if (error.message?.name || error.message) {
              message = error.message?.name || error.message;
            }            
          this.customConfirmationService.error(message, 'Error', 10000);
        },
      complete: () => {},
    });
  }
  downloadFile(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url); // Clean up
  }
  getBatchDetails(id: number) {
    this.ECMService.getECMBatchDetails(id).subscribe({
      next: res => {
        this.batchDetails = res;
      },
    });
  }

  openPdf() {
    //this.downloadFile(this.claimECMBatche,  this. fileName +'.pdf')
    window.open(this.url, '_blank');
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
