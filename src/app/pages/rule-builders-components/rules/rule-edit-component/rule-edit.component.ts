import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RuleNodeComponent } from '../rule-node-component/rule-node-component';
import { RuleService } from '@proxy/work-flows/rules';
import { WorkFlowService } from '@proxy/work-flows';
import { RuleFormConfigDto, RuleNodeDto } from '@proxy/work-flows/dtos/rule-builders-dtos';
import { RuleExpressionResultDto } from '@proxy/work-flows/rules/rule-expression-builders';
import { emptyRoot } from 'src/app/shared/models/constant';
import { RuleFormConfigService } from '@proxy/rule-builder/api/rule-form-config.service';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { LookupDto } from '@proxy/lookups/dtos/models';
import { LookupService } from '@proxy/ehealth-claims/lookups';
import { SelectedDropDownListByGuid } from '@proxy/common/dtos';

@Component({
  selector: 'app-rule-edit',
  imports: [
    ButtonModule,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    RouterLink,
    RuleNodeComponent,
    SelectModule,
  ],
  templateUrl: './rule-edit.component.html',
  styleUrl: './rule-edit.component.scss',
})
export class RuleEditComponent implements OnInit {
  private service = inject(RuleService);
  private lookupService = inject(LookupService);
  private ruleFormConfigService = inject(RuleFormConfigService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ruleId: string | null = null;
  name = '';
  isActive = true;
  isMultiple = false;

  workflows = signal<SelectedDropDownListByGuid[]>([]);
  items = signal<LookupDto[]>([]);
  workflowId = signal<string | null>(null);
  config = signal<RuleFormConfigDto | null>(null);
  root = signal<RuleNodeDto>(emptyRoot());
  loading = signal(false);
  saving = signal(false);
  expression = signal<RuleExpressionResultDto | null>(null);
  lookups = signal<Record<string, LookupDto[]>>({});
  hasCustomeRule = signal<boolean>(false);
  ruleExpression = signal<string>('');

  ngOnInit() {
    this.lookupService.getWorkflowsDropDownList().subscribe({
      next: result => {
        const options: SelectedDropDownListByGuid[] = [];
        for (const workflow of result ?? []) {
          if (workflow.id) options.push({ id: workflow.id, name: workflow.name });
        }
        this.workflows.set(options);
      },
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') return;

    this.ruleId = id;
    this.loading.set(true);
    this.service.get(id).subscribe({
      next: rule => {
        let ruleExpressionResultDto: RuleExpressionResultDto = {
          expression: rule.expression ?? '',
        };
        this.name = rule.name ?? '';
        this.isActive = rule.isActive ?? true;
        this.isMultiple = rule.isMultiple ?? false;
        this.workflowId.set(rule.workflowId ?? null);
        this.hasCustomeRule.set(rule.workflowHasCustomeRule ?? false);
        this.ruleExpression.set(rule.expression ?? '')
        this.expression.set(ruleExpressionResultDto);
        this.root.set(rule.root ?? emptyRoot());
        if (rule.workflowId&&!this.hasCustomeRule()) this.loadConfig(rule.workflowId);
        else this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onWorkflowChange(id: string | null) {
    this.workflowId.set(id);
    this.config.set(null);
    this.expression.set(null);
    this.root.set(emptyRoot()); // conditions from another config may not fit
    if (id&&!this.hasCustomeRule()) this.loadConfig(id);
  }

  private loadConfig(workflowId: string) {
    this.loading.set(true);
    this.ruleFormConfigService.getByWorkflow(workflowId).subscribe({
      next: cfg => {
        this.config.set(cfg);
        this.loading.set(false);
      },
      error: () => {
        this.config.set(null);
        this.loading.set(false);
      },
    });
  }

  private isValid(node: RuleNodeDto): boolean {
    if (node.nodeType === 1) {
      const children = node.children ?? [];
      return children.length > 0 && children.every(child => this.isValid(child));
    }
    const v = node.value;
    const empty = v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
    return !!node.fieldKey && !!node.operator && !empty;
  }

  preview() {
    if (!this.workflowId() || !this.isValid(this.root())) {
      alert('Complete the conditions first.');
      return;
    }
    if (!this.hasCustomeRule()) {
      this.service
        .previewExpressionByInput({
          id: this.ruleId,
          name: this.name.trim() || 'preview',
          workflowId: this.workflowId()!,
          isActive: this.isActive,
          isMultiple: this.isMultiple,
          root: this.root(),
        })
        .subscribe(e => this.expression.set(e));
    }
  }

  save() {
    if (!this.name.trim() || !this.workflowId()) {
      alert('Name and workflow are required.');
      return;
    }
    if (!this.isValid(this.root())) {
      alert('Every group needs at least one condition and every condition needs a value.');
      return;
    }

    this.saving.set(true);
    const input = {
      id: this.ruleId,
      name: this.name.trim(),
      workflowId: this.workflowId()!,
      isActive: this.isActive,
      isMultiple: this.isMultiple,
      root: this.root(),
    };
    const request = this.ruleId
      ? this.service.update(this.ruleId, input)
      : this.service.create(input);

    request.subscribe({
      next: () => this.router.navigate(['/rules']),
      error: () => this.saving.set(false),
    });
  }
}
