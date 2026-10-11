import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';

import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';
import { BaseCoreModule } from "@abp/ng.core";
import { ClaimsPermissions } from 'src/app/shared/models/appPermissions';
import { ClaimValidationResultDto, ClaimValidationService } from '@proxy/ehealth-claims/domains/claims';
import { RuleService } from '@proxy/ehealth-claims/domains/rule';
import { WorkflowDropDownDto } from '@proxy/ehealth-claims/domains/rules';

interface ClaimActivityRequestDto {
  activityId: number;
  systemCode?: string;
  gross?: number;
  net?: number;
  mediumDesc?: string;
  patient_share?: number;
  minUnitPrice?: number;
  maxUnitPrice?: number;
  quantity?: number;
  tags: string[];
  activityCode?: string;
}

interface ClaimValidationByCodeRequestExtended {
  activityId: number;
  patientnid?: string;
  patientAge?: number;
  diagnosisCodes: string[];
  activityCodes: string[];
  claimedNet?: number;
  enteredNet?: number;
  claimedGross?: number;
  enteredGross?: number;
  claimStartDate?: string;
  claimEndDate?: string;
  batchType?: string;
  batchServiceMonth?: number;
  batchServiceYear?: number;
  claimTags: string[];
  claimNumber?: string;
  activities: ClaimActivityRequestDto[];
}

interface ClaimParamsByCodeModelExtended {
  workflows: number[];
  workflownames: string[];
  claimValidationRequests: ClaimValidationByCodeRequestExtended[];
}

@Component({
  selector: 'app-validate-json-claim',
  imports: [
    TextareaModule,
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    SelectModule,
    MultiSelectModule,
    ButtonModule,
    MessageModule,
    BaseCoreModule
  ],
  templateUrl: './validate-json-claim.component.html',
  styleUrl: './validate-json-claim.component.scss',
  standalone: true
})
export class ValidateJsonClaimComponent implements OnInit {
  claimsPermissions = ClaimsPermissions;

  workflows: WorkflowDropDownDto[] = [];
  selectedWorkflowIds: number[] = [];

  failureList: ClaimValidationResultDto[] = [];

  loading: boolean = false;

jsonText: string = JSON.stringify(
  [
    {
      patientnid: '29308102701163',
      claimNumber: 'CLM-EXAMPLE-001',
      activityCodes: ['0045-123004-07601'],
      diagnosisCodes: ['GA31.0Z'],
      claimedNet: 500.00,
      enteredNet: 500.50,
      claimedGross: 550.00,
      enteredGross: 550.75,
      claimStartDate: '2026-02-03T00:00:00',
      claimEndDate: '2026-02-05T00:00:00',
      batchType: 'OP',
      batchServiceMonth: 2,
      batchServiceYear: 2026,
      claimTags: [],
      activities: [
        {
          activityId: 1,
          systemCode: 'SYS-001',
          activityCode: '0045-123004-07601',
          mediumDesc: 'General Consultation',
          gross: 100.00,
          net: 90.00,
          patient_share: 10.00,
          quantity: 1,
          minUnitPrice: 80.00,
          maxUnitPrice: 120.00,
          tags: ['aaa', 'aaa']
        }
      ]
    }
  ] as Partial<ClaimValidationByCodeRequestExtended>[],
  null,
  2
);
  errorMessage: string | null = null;

  constructor(
    private ruleService: RuleService,
    private claimValidationService: ClaimValidationService,
    private customConfirmationService: CustomConfirmationService
  ) {}

  ngOnInit() {
    this.loadDropdownData();
  }

  loadDropdownData() {
    this.ruleService.getAllWorkflows().subscribe(data => (this.workflows = data));
  }

  validateJson() {
    try {
      const obj = JSON.parse(this.jsonText || '[]');
      const items = Array.isArray(obj) ? obj : [obj];

      for (const item of items) {
        if (!('patientnid' in item) || !('activityCodes' in item) || !('diagnosisCodes' in item)) {
          this.errorMessage = 'Missing required properties: patientnid, activityCodes, diagnosisCodes';
          return;
        }

        if (
          !item.patientnid ||
          item.patientnid.trim() === '' ||
          !Array.isArray(item.activityCodes) ||
          item.activityCodes.length === 0 ||
          item.activityCodes.some((code: string) => !code || code.trim() === '') ||
          !Array.isArray(item.diagnosisCodes) ||
          item.diagnosisCodes.length === 0 ||
          item.diagnosisCodes.some((code: string) => !code || code.trim() === '')
        ) {
          this.errorMessage = 'Properties must not be empty: patientnid, activityCodes, diagnosisCodes';
          return;
        }
      }

      this.errorMessage = null;
      this.callValidateJsonApi();
    } catch {
      this.errorMessage = 'Invalid JSON format';
    }
  }

  callValidateJsonApi() {
    this.errorMessage = null;
    this.failureList = [];
    this.loading = true;

    let parsed: any;

    try {
      parsed = JSON.parse(this.jsonText?.trim() || '[]');
    } catch {
      this.loading = false;
      this.errorMessage = 'Invalid JSON format. Please check the JSON and try again.';
      this.customConfirmationService.error(this.errorMessage, 'Error', 5000);
      return;
    }

    // Ensure array
    const claimValidationRequests: ClaimValidationByCodeRequestExtended[] = Array.isArray(parsed) ? parsed : [parsed];

    const payload: ClaimParamsByCodeModelExtended = {
      workflows: this.selectedWorkflowIds ?? [],
      workflownames: [],
      claimValidationRequests,
    };

    this.claimValidationService.validateClaimsIntegrationExtendedByInput(payload).subscribe({
      next: (res: any) => {
        const failed: ClaimValidationResultDto[] = res?.failed ?? [];
        this.failureList = failed;

        if (res?.success) {
          this.customConfirmationService.success('No Violations Found', 'Success', 5000);
        }

        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;

        const errorsArr =
          err?.error?.data?.errors ||
          err?.error?.errors ||
          err?.error?.message ||
          err?.message;

        const message = Array.isArray(errorsArr) ? errorsArr.join('\n') : (errorsArr ?? 'Unknown error');

        this.errorMessage = message;
        this.customConfirmationService.error(message, 'Error', 5000);
      },
    });
  }

  trackByRow(index: number, item: ClaimValidationResultDto): string | number {
    const anyItem = item as any;

    if (anyItem && anyItem.id != null) {
      return anyItem.id;
    }

    const claimId = (anyItem?.claimId ?? '');
    const rule = (anyItem?.rule ?? '');
    const wf = (anyItem?.workFlowName ?? '');

    if (!claimId && !rule && !wf) {
      return index;
    }

    return `${claimId}|${wf}|${rule}`;
  }
}