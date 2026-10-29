import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
 import { FormConfigListDto } from '@proxy/work-flows/dtos/rule-builders-dtos';
import { RuleFormConfigService } from '@proxy/work-flows/rules/rule-builders';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-form-config-list-component',
  imports: [ButtonModule, RouterLink, TableModule, TagModule],
  templateUrl: './form-config-list-component.html',
  styleUrl: './form-config-list-component.scss',
})
export class FormConfigListComponent {
  private service = inject(RuleFormConfigService);
  configs = signal<FormConfigListDto[]>([]);
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
          this.configs.set(result.items ?? []);
          this.totalRecords.set(result.totalCount ?? 0);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  remove(c: FormConfigListDto) {
    if (!c.id) return;
    if (!confirm(`Delete form config "${c.name}"?`)) return;
    this.first.set(0);
    this.service.delete(c.id).subscribe(() => this.load({ first: 0, rows: this.rows }));
  }
}
