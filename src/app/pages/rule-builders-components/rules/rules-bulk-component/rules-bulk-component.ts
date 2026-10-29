import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LookupService } from '@proxy/lookups';
 import { LookupDto } from '@proxy/lookups/dtos';
import { RuleService } from '@proxy/work-flows/rules';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { finalize } from 'rxjs';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';

@Component({
  selector: 'app-rules-bulk-component',
  imports: [ButtonModule, CardModule, FileUploadModule, FormsModule, MessageModule, SelectModule],
  templateUrl: './rules-bulk-component.html',
  styleUrl: './rules-bulk-component.scss',
})
export class RulesBulkComponent implements OnInit {
  private readonly ruleService = inject(RuleService);
  private readonly lookupService = inject(LookupService);
  private readonly customConfirmationService = inject(CustomConfirmationService);
  private readonly router = inject(Router);

  workflows = signal<LookupDto[]>([]);
  isLoading = signal(false);

  selectedWorkflowId = '';

  ngOnInit() {
    this.loadWorkflows();
  }

  /** Loaded once; the dropdown filters client-side (`[filter]="true"`), so no request per keystroke. */
  private loadWorkflows() {
    this.lookupService.getWorkflowsDropDownList().subscribe({
      next: result => {
        const options: LookupDto[] = [];
        for (const workflow of result ?? []) {
          if (workflow.id) options.push({ id: workflow.id, name: workflow.name });
        }
        this.workflows.set(options);
      },
    });
  }

  getSelectedWorkflowName(): string {
    const wf = this.workflows().find(w => w.id === this.selectedWorkflowId);
    return wf?.name ?? 'Workflow';
  }

  downloadBulkTemplate() {
    if (!this.selectedWorkflowId) return;

    this.isLoading.set(true);
    this.ruleService
      .getRulesSample(this.selectedWorkflowId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((blob: any) => {
        const workflowName = this.getSelectedWorkflowName().replace(/\s+/g, '_');
        this.saveBlob(blob, `${workflowName}_Rules_Template.xlsx`);
      });
  }

  onUpload(event: any) {
    const file: File | undefined = event.files?.[0];
    if (!file || !this.selectedWorkflowId) return;

    // A fresh FormData per upload. The old code kept one FormData in a signal and
    // appended to it every time, so a second upload re-sent the first file as well.
    const formData = new FormData();
    formData.append('file', file, file.name);

    this.isLoading.set(true);
    this.ruleService
      .bulkUpload(this.selectedWorkflowId, formData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (blob: Blob) => {
          this.saveBlob(blob, 'DownloadedFile.xlsx');
          this.router.navigate(['/rules']);
        },
        error: err => {
          if (err.status === 0) {
            this.customConfirmationService.warnConfrim('Bulk Upload is still processed', 'Warn', {
              accept: () => {},
              reject: () => {},
              dismiss: () => {},
            });
            return;
          }

          let errorMessage = 'Upload Failed';
          try {
            // err.message may be a JSON string – parse it
            errorMessage = JSON.parse(err.message)?.message || 'Upload Failed';
          } catch {
            errorMessage = err?.message || 'Upload Failed';
          }
          this.customConfirmationService.error(errorMessage, 'Upload Failed', 5000);
        },
      });
  }

  private saveBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    // Revoke on the next tick so the browser has started the download.
    setTimeout(() => window.URL.revokeObjectURL(url), 0);
  }
}
