import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Workflow } from './workflow.models';
import { WorkflowService } from './workflow.service';

@Component({
  selector: 'app-workflow-list',
  imports: [RouterLink],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Workflows</h5>
        <a routerLink="/workflows/new" class="btn btn-primary btn-sm">Create workflow</a>
      </div>
      <div class="card-body">
        <table class="table table-hover mb-0">
          <thead>
            <tr><th>Name</th><th>Form config</th><th>Rules</th><th></th></tr>
          </thead>
          <tbody>
            @for (w of workflows(); track w.id) {
              <tr>
                <td><a [routerLink]="['/workflows', w.id]">{{ w.name }}</a></td>
                <td>
                  @if (w.ruleFormConfigName) {
                    {{ w.ruleFormConfigName }}
                  } @else {
                    <span class="text-muted">None</span>
                  }
                </td>
                <td>{{ w.ruleCount }}</td>
                <td class="text-end">
                  <a [routerLink]="['/workflows', w.id]" class="btn btn-sm btn-outline-primary me-1">Edit</a>
                  <button class="btn btn-sm btn-outline-danger" (click)="remove(w)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="text-muted">No workflows yet.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class WorkflowListComponent implements OnInit {
  private service = inject(WorkflowService);
  workflows = signal<Workflow[]>([]);

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getList().subscribe(w => this.workflows.set(w));
  }

  remove(w: Workflow) {
    if (!confirm(`Delete workflow "${w.name}"?`)) return;
    this.service.delete(w.id).subscribe(() => this.load());
  }
}
