import { LookupService } from './../../../../proxy/ehealth-claims/lookups/lookup.service';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LookupDto } from '@proxy/lookups/dtos';
import { WorkFlowService } from '@proxy/work-flows';
import { RuleService } from '@proxy/work-flows/rules';

import { SelectModule } from 'primeng/select';

import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
 import { SelectedDropDownListByGuid } from '@proxy/common/dtos';
@Component({
  selector: 'app-rules-bulk',
  templateUrl: './rules-bulk.component.html',
  styleUrl: './rules-bulk.component.scss',
  imports: [CardModule, SelectModule, FormsModule, CommonModule],
  standalone:true
})
export class RulesBulkComponent implements OnInit {
  pageNumber = 1;
  workflows = signal<LookupDto[]>([]);
  fileContent = signal<FormData>(new FormData());

  selectedWorkflowId: string = '';

  isLoading = false;
  isValidated = false;
  invalidFileTypeMessageSummary: string = '';
  invalidFileSizeMessageDetail: string = '';
  invalidFileTypeMessageDetail: string = '';
  invalidFileSizeMessageSummary: string = '';
  invalidFileLimitMessageDetail: string = '';
  constructor(
    private ruleService: RuleService,
    private _lookupService: LookupService,
    private ruleApplicationService: RuleService,
    private customConfirmationService: CustomConfirmationService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadDropdownData();
  }

  loadDropdownData(filter?: string) {
    this._lookupService.getWorkflowsDropDownList().subscribe({
      next: result => {
        const options: SelectedDropDownListByGuid[] = [];
        for (const workflow of result ?? []) {
          if (workflow.id) options.push({ id: workflow.id, name: workflow.name });
        }
        this.workflows.set(options);
      },
    });
  }
  getSelectedWorkflowName(): string {
    const wf = this.workflows().find(w => w.id === this.selectedWorkflowId);
    return wf ? (wf.name ?? '') : 'Workflow';
  }
  onWorkflowFilter(event: { filter: string }) {
    this.loadDropdownData(event.filter);
  }
  downloadBulkTemplate() {
    this.ruleService.getRulesSample(this.selectedWorkflowId).subscribe((blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const workflowName = this.getSelectedWorkflowName().replace(/\s+/g, '_');
      a.download = `${workflowName}_Rules_Template.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
  onUpload(event: any) {
    const file: File = event.files[0];
    if (!file) return;

    this.fileContent().append('file', file, file.name);

    this.ruleApplicationService.bulkUpload(this.selectedWorkflowId, this.fileContent()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'DownloadedFile.xlsx'; // Change filename
        link.click();

        window.URL.revokeObjectURL(url);
        this.router.navigate(['/rules']);
      },
      error: err => {
        if (err.status === 0) {
          this.customConfirmationService.warnConfrim('Bulk Upload is still processed', 'Warn', {
            accept: () => {},
            reject: () => {},
            dismiss: () => {},
          });
        } else {
          let errorMessage = 'Upload Failed';
          try {
            // ─── err.message is JSON string — parse it ─────────────
            const parsed = JSON.parse(err.message);
            errorMessage = parsed?.message || 'Upload Failed';
          } catch {
            errorMessage = err?.message || 'Upload Failed';
          }

          this.customConfirmationService.error(errorMessage, 'Upload Failed', 5000);
        }
      },
    });
  }
}
