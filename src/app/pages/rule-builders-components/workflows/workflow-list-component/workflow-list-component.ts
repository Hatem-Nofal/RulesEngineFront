import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkFlowService } from '@proxy/work-flows';
import { WorkflowDto } from '@proxy/work-flows/dtos';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-workflow-list-component',
  imports: [ButtonModule, RouterLink, TableModule, TagModule],
  templateUrl: './workflow-list-component.html',
  styleUrl: './workflow-list-component.scss',
})
export class WorkflowListComponent {
  private service = inject(WorkFlowService);
  workflows = signal<WorkflowDto[]>([]);
  totalRecords = signal(0);
  loading = signal(false);
  first = signal(0);
  rows = 10;

  load(event: TableLazyLoadEvent = {}) {
    const first = event.first ?? 0;
    this.first.set(first);
    this.loading.set(true);
    const sortField = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField;
    this.service
      .getList({
        skipCount: first,
        maxResultCount: event.rows ?? this.rows,
        sorting: sortField
          ? `${sortField} ${event.sortOrder === -1 ? 'DESC' : 'ASC'}`
          : undefined,
      })
      .subscribe({
        next: result => {
          this.workflows.set(result.items ?? []);
          this.totalRecords.set(result.totalCount ?? 0);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  remove(w: WorkflowDto) {
    if (!w.id) return;
    if (!confirm(`Delete workflow "${w.name}"?`)) return;
    this.first.set(0);
    this.service.delete(w.id).subscribe(() => this.load({ first: 0, rows: this.rows }));
  }
}
