import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RuleFormConfigService } from '@proxy/rule-builder/api';
import { FormConfigListDto } from '@proxy/work-flows/dtos/rule-builders-dtos';
 

@Component({
  selector: 'app-form-config-list',
  imports: [RouterLink],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Form configs</h5>
        <a routerLink="/form-configs/new" class="btn btn-primary btn-sm">Create form config</a>
      </div>
      <div class="card-body">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Name</th><th>Description</th><th>Strategy</th><th>Fields</th><th>Nested groups</th>
              <th>Active</th><th>Workflows</th><th></th>
            </tr>
          </thead>
          <tbody>
            @for (c of configs(); track c.id) {
              <tr>
                <td><a [routerLink]="['/form-configs', c.id]">{{ c.name }}</a></td>
                <td class="text-muted">{{ c.description }}</td>
                <td>{{ c.strategyKey }}</td>
                <td>{{ c.fieldCount }}</td>
                <td>{{ c.allowNestedGroups ? 'Yes' : 'No' }}</td>
                <td>{{ c.isActive ? 'Yes' : 'No' }}</td>
                <td>{{ c.workflowCount }}</td>
                <td class="text-end">
                  <a [routerLink]="['/form-configs', c.id]" class="btn btn-sm btn-outline-primary me-1">Edit</a>
                  <button class="btn btn-sm btn-outline-danger" (click)="remove(c)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="text-muted">No form configs yet.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class FormConfigListComponent implements OnInit {
  private service = inject(RuleFormConfigService);
  configs = signal<FormConfigListDto[]>([]);

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getList(null,).subscribe(c => this.configs.set(c));
  }

  remove(c: FormConfigListDto) {
    if (!c.id) return;
    if (!confirm(`Delete form config "${c.name}"?`)) return;
    this.service.delete(c.id).subscribe(() => this.load());
  }
}
