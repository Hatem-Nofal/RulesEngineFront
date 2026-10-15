import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RuleListItemDto } from '@proxy/work-flows/dtos/rules-dtos';
import { RuleService } from '@proxy/work-flows/rules';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-rule-list-component',
  imports: [ButtonModule, RouterLink, TableModule, TagModule],
  templateUrl: './rule-list-component.html',
  styleUrl: './rule-list-component.scss',
})
export class RuleListComponent {
  private service = inject(RuleService);
  rules = signal<RuleListItemDto[]>([]);
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
          this.rules.set(result.items ?? []);
          this.totalRecords.set(result.totalCount ?? 0);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  remove(r: RuleListItemDto) {
    if (!r.id) return;
    if (!confirm(`Delete rule "${r.name}"?`)) return;
    this.first.set(0);
    this.service.delete(r.id).subscribe(() => this.load({ first: 0, rows: this.rows }));
  }
}
