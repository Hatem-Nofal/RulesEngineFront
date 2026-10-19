import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';
import { CardModule } from 'primeng/card';
import { SelectedDropDownListByGuid } from '@proxy/common/dtos';
import { LookupService } from '@proxy/ehealth-claims/lookups';
import { LookupDto } from '@proxy/lookups/dtos';
import { RuleService } from '@proxy/work-flows/rules';
import { BaseCoreModule } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToasterService } from '@abp/ng.theme.shared';

@Component({
  selector: 'app-rules-bulk-component',
  imports: [
    CardModule,
    SelectModule,
    FormsModule,
    CommonModule,
    FormsModule,
    TableModule,

    ButtonModule,
    PaginatorModule,
    InputTextModule,
    CheckboxModule,
    SelectModule,
    CardModule,
    MessageModule,
    FileUploadModule,
    MessageModule,
    MultiSelectModule,
    ReactiveFormsModule,
    InputNumberModule,
    BaseCoreModule,
  ],
  templateUrl: './rules-bulk-component.html',
  styleUrl: './rules-bulk-component.scss',
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
    private toaster: ToasterService,
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

    this.fileContent().append('fileContent', file, file.name);
            let workfowlname=this.workflows().find(x=>x.id==this.selectedWorkflowId)?.name

    this.ruleApplicationService.bulkUpload(this.selectedWorkflowId, this.fileContent()).subscribe({
      next: (blob: Blob) => {
        if (blob.size > 0) {
          this.toaster.error('Bulk Upload Failed');

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = workfowlname+'_Errors.xlsx'; // Change filename
          link.click();

          window.URL.revokeObjectURL(url);
        } else {
          this.toaster.success('Bulk Upload success');
        }

       // this.router.navigate(['/rules']);
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
          if (err.message && err.message.size && err.message.size > 0) {
            const url = window.URL.createObjectURL(err.message);
            const link = document.createElement('a');
            link.href = url;
            link.download =workfowlname+'_Errors.xlsx'; // Change filename
            link.click();

            window.URL.revokeObjectURL(url);
          }
          this.customConfirmationService.error(errorMessage, 'Upload Failed', 5000);
        }
      },
    });
  }
}
