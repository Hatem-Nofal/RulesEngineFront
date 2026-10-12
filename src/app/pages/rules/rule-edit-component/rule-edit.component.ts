import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RuleNodeComponent } from './rule-node.component';
import { RuleService } from '@proxy/work-flows/rules';
import { LookupDto } from '@proxy/lookups/dtos';
import { RuleFormConfigDto, RuleNodeDto } from '@proxy/work-flows/dtos/rule-builders-dtos';
import { RuleExpressionResultDto } from '@proxy/work-flows/rules/rule-expression-builders';
import { emptyRoot } from 'src/app/shared/models/constant';
import { RuleFormConfigService } from '@proxy/rule-builder/api/rule-form-config.service';

@Component({
  selector: 'app-rule-edit',
  imports: [FormsModule, RouterLink, RuleNodeComponent],
  templateUrl: './rule-edit.component.html',
  styleUrl: './rule-edit.component.scss',
})
export class RuleEditComponent implements OnInit {
  private service = inject(RuleService);
  private ruleFormConfigService = inject(RuleFormConfigService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ruleId: string | null = null;
  name = '';
  isActive = true;

  workflows = signal<LookupDto[]>([]);
  items = signal<LookupDto[]>([]);
  workflowId = signal<string | null>(null);
  config = signal<RuleFormConfigDto | null>(null);
  root = signal<RuleNodeDto>(emptyRoot());
  loading = signal(false);
  saving = signal(false);
  expression = signal<RuleExpressionResultDto | null>(null);

  ngOnInit() {
    this.service.getWorkflows().subscribe(w => this.workflows.set(w));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') return; // create mode: wait for workflow selection

    // Edit mode: load the rule, then its config WITHOUT resetting the tree
    this.ruleId = id;
    this.loading.set(true);
    this.service.get(id).subscribe({
      next: rule => {
        this.name = rule.name;
        this.isActive = rule.isActive;
        this.workflowId.set(rule.workflowId);
        this.root.set(rule.root);
        this.loadConfig(rule.workflowId);
      },
      error: () => this.loading.set(false),
    });
  }

  onWorkflowChange(id: string | null) {
    this.workflowId.set(id);
    this.config.set(null);
    this.expression.set(null);
    this.root.set(emptyRoot()); // conditions from another config may not fit
    if (id) this.loadConfig(id);
  }

  private loadConfig(workflowId: string) {
    this.loading.set(true);
    this.ruleFormConfigService.getByWorkflow(workflowId).subscribe({
      next: cfg => {
        this.config.set(cfg);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private isValid(node: RuleNodeDto): boolean {
    if (node.nodeType === 1)
      return node.children.length > 0 && node.children.every(c => this.isValid(c));
    const v = node.value;
    const empty = v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
    return !!node.fieldKey && !!node.operator && !empty;
  }

  preview() {
    if (!this.workflowId() || !this.isValid(this.root())) {
      alert('Complete the conditions first.');
      return;
    }
    this.service
      .previewExpressionByInput({
        id: this.ruleId,
        name: this.name.trim() || 'preview',
        workflowId: this.workflowId()!,
        isActive: this.isActive,
        root: this.root(),
      })
      .subscribe(e => this.expression.set(e));
  }

  save() {
    if (!this.name.trim() || !this.workflowId()) {
      alert('Name, workflow and target item are required.');
      return;
    }
    if (!this.isValid(this.root())) {
      alert('Every group needs at least one condition and every condition needs a value.');
      return;
    }

    this.saving.set(true);
    this.service
      .create({
        id: this.ruleId,
        name: this.name.trim(),
        workflowId: this.workflowId()!,
        isActive: this.isActive,
        root: this.root(),
      })
      .subscribe({
        next: () => this.router.navigate(['/rules']),
        error: () => this.saving.set(false), // the interceptor already showed the server message
      });
  }
}
