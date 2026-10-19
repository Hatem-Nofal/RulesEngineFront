import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LookupDto } from '@proxy/lookups/dtos';
import { RuleFormConfigService } from '@proxy/rule-builder/api';
import { WorkFlowService } from '@proxy/work-flows';
import { SaveWorkflowDto } from '@proxy/work-flows/dtos';
import { RejectionLevel, rejectionLevelOptions } from '@proxy/common/enums/rejection-level.enum';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BaseCoreModule } from '@abp/ng.core';

@Component({
  selector: 'app-workflow-edit-component',
  imports: [ButtonModule, FormsModule, InputTextModule, RouterLink, SelectModule, BaseCoreModule],
  templateUrl: './workflow-edit-component.html',
  styleUrl: './workflow-edit-component.scss',
})
export class WorkflowEditComponent implements OnInit {
  private service = inject(WorkFlowService);
  private formConfigService = inject(RuleFormConfigService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  workflowId: string | null = null;
  ruleExpression?: string | null = null;
  name = '';
  configId: string | null = null;
  rejectionLevel = RejectionLevel.Activity;

  configs = signal<LookupDto[]>([]);
  hasCustomeRule = signal<boolean>(false);
  rejectionLevels = rejectionLevelOptions;
  ruleCount = signal(0);
  saving = signal(false);
  loading = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.formConfigService.getConfigs().subscribe({
      next: configs => this.configs.set(configs),
      error: () => this.loading.set(false),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') {
      this.loading.set(false);
      return;
    }

    this.workflowId = id;
    this.service.get(id).subscribe({
      next: workflow => {
        this.name = workflow.name ?? '';
        this.configId = workflow.ruleFormConfigId ?? null;
        this.rejectionLevel = workflow.rejectionLevel ?? RejectionLevel.Activity;
        this.ruleCount.set(workflow.ruleCount ?? 0);
        this.hasCustomeRule.set(workflow.hasCustomeRule ?? false);
        this.ruleExpression = workflow.ruleExpression;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save() {
    if (!this.name.trim()) {
      alert('Name is required.');
      return;
    }

    this.saving.set(true);
    const dto: SaveWorkflowDto = {
      name: this.name.trim(),
      rejectionLevel: this.rejectionLevel,
      hasCustomeRule: this.hasCustomeRule(),
      ruleExpression: this.ruleExpression ?? '',
    };
    if (this.configId) dto.ruleFormConfigId = this.configId;
    const request = this.workflowId
      ? this.service.update(this.workflowId, dto)
      : this.service.create(dto);

    request.subscribe({
      next: () => this.router.navigate(['/workflows']),
      error: () => this.saving.set(false), // the interceptor already showed the server message
    });
  }
}
