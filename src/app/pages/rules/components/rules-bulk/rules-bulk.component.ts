import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RuleApplicationService } from '@proxy/ehealth-claims/controllers';
import { RuleService } from '@proxy/ehealth-claims/domains/rule';
import { WorkflowDropDownDto, ImportRulesDto, WorkFlowDto } from '@proxy/ehealth-claims/domains/rules';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';
@Component({
  selector: 'app-rules-bulk',
  templateUrl: './rules-bulk.component.html',
  styleUrl: './rules-bulk.component.scss',
  standalone: false,
})
export class RulesBulkComponent implements OnInit {
  pageNumber = 1;
  workflows: WorkflowDropDownDto[] = [];

  selectedWorkflowId: number;

  isLoading = false;
  isValidated = false;
  invalidFileTypeMessageSummary: string;
  invalidFileSizeMessageDetail: string;
  invalidFileTypeMessageDetail: string;
  invalidFileSizeMessageSummary: string;
  invalidFileLimitMessageDetail: string;
  constructor(
    private ruleService: RuleService,
    private ruleApplicationService: RuleApplicationService,
    private customConfirmationService: CustomConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDropdownData();
  }

  loadDropdownData(filter?: string) {
 this.ruleService.getAllWorkflows(filter).subscribe({
      next: workflows => {
        this.workflows = workflows as WorkFlowDto[];
      },
      error: () => {},
    });  }
  getSelectedWorkflowName(): string {
    const wf = this.workflows.find(w => w.id === this.selectedWorkflowId);
    return wf ? wf.workflowName : 'Workflow';
  }
onWorkflowFilter(event: { filter: string }) {
    this.loadDropdownData(event.filter);
}
  downloadBulkTemplate() {
    this.ruleService
      .exportRulesTemplateByWorkflowId(this.selectedWorkflowId)
      .subscribe((blob: any) => {
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
  const reader = new FileReader();

  reader.onload = () => {
    const base64File = (reader.result as string).split(',')[1];

    const dto: ImportRulesDto = {
      workflowId: this.selectedWorkflowId,
      fileBase64: base64File,
      fileName: file.name,
    };

    this.ruleApplicationService.importRulesFromExcelByInput(dto).subscribe({
      next: res => {
        this.customConfirmationService.success(res, 'Uploaded Successfully', 5000);
        this.router.navigate['rules/list'];
      },
error: err => {
  if (err.status === 0) {
    this.customConfirmationService.warnConfrim(
      'Bulk Upload is still processed',
      'Warn',
      {
        accept: () => {},
        reject: () => {},
        dismiss: () => {},
      }
    );
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
  };

  reader.readAsDataURL(file);
}
}
