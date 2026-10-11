import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Lookup } from '../rules/rule.models';
import { WorkflowService } from './workflow.service';

@Component({
  selector: 'app-workflow-edit',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ workflowId ? 'Edit workflow' : 'Create workflow' }}</h5>
        <a routerLink="/workflows" class="btn btn-sm btn-outline-secondary">Back</a>
      </div>

      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Name</label>
            <input class="form-control" [(ngModel)]="name" maxlength="200" placeholder="Workflow name" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Form config</label>
            <select class="form-select" [(ngModel)]="configId">
              <option [ngValue]="null">None (rules cannot be created)</option>
              @for (c of configs(); track c.id) {
                <option [ngValue]="c.id">{{ c.name }}</option>
              }
            </select>
            <div class="form-text">Controls which fields and operators the rule builder offers for this workflow.</div>
          </div>
        </div>

        @if (ruleCount() > 0) {
          <div class="alert alert-warning mt-3 mb-0">
            {{ ruleCount() }} rule(s) use this workflow. If you change the form config, existing rules may use
            fields it no longer offers.
          </div>
        }

        <button type="button" class="btn btn-primary mt-3" [disabled]="saving()" (click)="save()">Save</button>
      </div>
    </div>
  `,
})
export class WorkflowEditComponent implements OnInit {
  private service = inject(WorkflowService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  workflowId: string | null = null;
  name = '';
  configId: string | null = null;

  configs = signal<Lookup[]>([]);
  ruleCount = signal(0);
  saving = signal(false);

  ngOnInit() {
    this.service.getConfigs().subscribe(c => this.configs.set(c));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') return;

    this.workflowId = id;
    this.service.get(id).subscribe(w => {
      this.name = w.name;
      this.configId = w.ruleFormConfigId;
      this.ruleCount.set(w.ruleCount);
    });
  }

  save() {
    if (!this.name.trim()) {
      alert('Name is required.');
      return;
    }

    this.saving.set(true);
    const dto = { name: this.name.trim(), ruleFormConfigId: this.configId };
    const request: Observable<unknown> = this.workflowId ? this.service.update(this.workflowId, dto) : this.service.create(dto);

    request.subscribe({
      next: () => this.router.navigate(['/workflows']),
      error: () => this.saving.set(false), // the interceptor already showed the server message
    });
  }
}
