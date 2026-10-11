import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ECMService } from '@proxy/ehealth-claims/domains/ecm';
import { ExcelGeneratorAppSeviceService } from '@proxy/ehealth-claims/excel-generator';
import { FilesManagerService } from '@proxy/ehealth-claims/files-managers';


@Component({
  selector: 'app-archive-claims-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './archive-claims-details.component.html',
  styleUrls: [
    '../archive-batches-details/archive-batches-details.component.scss',
    './archive-claims-details.component.scss',
  ],
})
export class ArchiveClaimsDetailsComponent {
  claimDetails: any;
  claimId: number;
  claimECMBatche:Blob
  iframeUrl: SafeResourceUrl | null = null;
  url:any
  fileName:any
  fileload=true
  todaysDateTime:string
  constructor(
    private ECMService: ECMService,
    private activatedRoute: ActivatedRoute,
    private excelGeneratorAppService: ExcelGeneratorAppSeviceService,
    private filesManagerService:FilesManagerService,
    private sanitizer: DomSanitizer
  ) {}
  ngOnInit(): void {
    this.claimId = this.activatedRoute.snapshot.params['id'];
    if (this.claimId) {
      this.getclaimDetails(this.claimId);
      this.filesManagerService.getPdfbyIdByClaimId(this.claimId).subscribe({
        next: (response: Blob) => {
          this.claimECMBatche=response
          const url = URL.createObjectURL(response);
          this.url=url;
          this.fileName = url.substring(url.lastIndexOf('/') + 1);
          this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.fileload=false

        },
        error: (error) => {
          console.error('Error fetching file:', error);
        },
      });
    }
  }

  getBatchExcel() {
    this.getTodaysDay();
    this.excelGeneratorAppService.generateIPExcel(this.claimId.toString()).subscribe({
      next: res => {
        const url = URL.createObjectURL(res);
        this.fileName = url.substring(url.lastIndexOf('/') + 1);

        this.downloadFile(res, `${this.fileName}_${this.todaysDateTime}.xlsx`);      },
      error: () => {},
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
  getclaimDetails(id: number) {
    this.ECMService.ecmClaimDetails(id).subscribe({
      next: res => {
        this.claimDetails = res;
      },
    });
  }
  openPdf() {
    //this.downloadFile(this.claimECMBatche,  this. fileName +'.pdf')
    window.open(this.url, '_blank');
  }
  getTodaysDay(){
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
