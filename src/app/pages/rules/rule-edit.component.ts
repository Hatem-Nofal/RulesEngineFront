import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RuleNodeComponent } from './rule-node.component';
import { emptyRoot, Lookup, RuleExpression, RuleFormConfig, RuleNode } from './rule.models';
import { RuleService } from './rule.service';

@Component({
  selector: 'app-rule-edit',
  imports: [FormsModule, RouterLink, RuleNodeComponent],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ ruleId ? 'Edit rule' : 'Create rule' }}</h5>
        <a routerLink="/rules" class="btn btn-sm btn-outline-secondary">Back</a>
      </div>

      <div class="card-body">
        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label">Name</label>
            <input class="form-control" [(ngModel)]="name" placeholder="Rule name" />
          </div>

          <div class="col-md-4">
            <label class="form-label">Workflow</label>
            <select class="form-select" [ngModel]="workflowId()" (ngModelChange)="onWorkflowChange($event)"
                    [disabled]="!!ruleId">
              <option [ngValue]="null">Select workflow…</option>
              @for (w of workflows(); track w.id) {
                <option [ngValue]="w.id">{{ w.name }}</option>
              }
            </select>
          </div>

        

          <div class="col-12">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="active" [(ngModel)]="isActive" />
              <label class="form-check-label" for="active">Active</label>
            </div>
          </div>
        </div>

        @if (loading()) {
          <p>Loading form…</p>
        }

        @if (config(); as cfg) {
          <h6 class="text-muted">Form: {{ cfg.name }}</h6>
          <app-rule-node [(node)]="root" [fields]="cfg.fields" [items]="items()"
                         [allowGroups]="cfg.allowNestedGroups" [isRoot]="true" />
          <button type="button" class="btn btn-primary mt-3" [disabled]="saving()" (click)="save()">Save</button>
          <button type="button" class="btn btn-outline-secondary mt-3 ms-2" (click)="preview()">Preview expression</button>

          @if (expression(); as ex) {
            <div class="mt-3">
              <div class="text-muted small">Expression (strategy: {{ ex.strategyKey }})</div>
              <pre class="border rounded p-2 bg-light mb-0">{{ ex.expression }}</pre>
            </div>
          }
        } @else if (workflowId() && !loading()) {
          <div class="alert alert-warning">No form config is assigned to this workflow.</div>
        }
      </div>
    </div>
  `,
})
export class RuleEditComponent implements OnInit {
  private service = inject(RuleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ruleId: string | null = null;
  name = '';
   isActive = true;

  workflows = signal<Lookup[]>([]);
  items = signal<Lookup[]>([]);
  workflowId = signal<string | null>(null);
  config = signal<RuleFormConfig | null>(null);
  root = signal<RuleNode>(emptyRoot());
  loading = signal(false);
  saving = signal(false);
  expression = signal<RuleExpression | null>(null);

  ngOnInit() {
    this.service.getWorkflows().subscribe(w => this.workflows.set(w));
    this.service.getItems().subscribe(i => this.items.set(i));

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
    this.service.getConfigByWorkflow(workflowId).subscribe({
      next: cfg => {
        this.config.set(cfg);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private isValid(node: RuleNode): boolean {
    if (node.nodeType === 1) return node.children.length > 0 && node.children.every(c => this.isValid(c));
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
      .previewExpression({
        id: this.ruleId,
        name: this.name.trim() || 'preview',
        workflowId: this.workflowId()!,
         isActive: this.isActive,
        root: this.root(),
      })
      .subscribe(e => this.expression.set(e));
  }

  save() {
    if (!this.name.trim() || !this.workflowId()  ) {
      alert('Name, workflow and target item are required.');
      return;
    }
    if (!this.isValid(this.root())) {
      alert('Every group needs at least one condition and every condition needs a value.');
      return;
    }

    this.saving.set(true);
    this.service
      .save({
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
