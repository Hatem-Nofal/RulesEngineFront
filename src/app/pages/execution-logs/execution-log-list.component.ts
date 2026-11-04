import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import type { TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import type {
  RulesEngineExecutionLogFiltersDto,
  RulesEngineExecutionLogListDto,
} from 'src/app/proxy/logers/dtos/models';
import { RulesEngineExecutionLogService } from 'src/app/proxy/logers/rules-engine-execution-log.service';
import { LookupService } from 'src/app/proxy/lookups/lookup.service';
import type { SelectedDropDownList } from 'src/app/proxy/common/dtos/models';

@Component({
  selector: 'app-execution-log-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ButtonModule, InputTextModule, SelectModule, TableModule, TagModule],
  templateUrl: './execution-log-list.component.html',
  styleUrl: './execution-log-list.component.scss',
})
export class ExecutionLogListComponent implements OnInit {
  @ViewChild('table') private table?: Table;

  private readonly logService = inject(RulesEngineExecutionLogService);
  private readonly lookupService = inject(LookupService);
  private readonly destroyRef = inject(DestroyRef);

  logs = signal<RulesEngineExecutionLogListDto[]>([]);
  workflows = signal<SelectedDropDownList[]>([]);
  totalRecords = signal(0);
  first = signal(0);
  loading = signal(false);
  errorMessage = signal('');
  workflowErrorMessage = signal('');
  rows = 10;

  filters: Omit<RulesEngineExecutionLogFiltersDto, 'skipCount' | 'maxResultCount' | 'sorting'> = {
    workFlowName: null,
    fromDate: null,
    toDate: null,
    activity: null,
    claimNumber: null,
    ruleName: null,
  };

  ngOnInit(): void {
    this.lookupService
      .getWorkflowsDropDownList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (workflows) => this.workflows.set(workflows ?? []),
        error: (error: unknown) => {
          console.error('Failed to load workflow filters for execution logs.', error);
          this.workflowErrorMessage.set('Workflow filter options could not be loaded.');
        },
      });
  }

  load(event: TableLazyLoadEvent = {}): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.rows;
    const sortField = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField;

    this.first.set(first);
    this.rows = rows;
    this.loading.set(true);
    this.errorMessage.set('');

    const input: RulesEngineExecutionLogFiltersDto = {
      ...this.filters,
      skipCount: first,
      maxResultCount: rows,
      sorting: sortField ? `${sortField} ${event.sortOrder === -1 ? 'DESC' : 'ASC'}` : undefined,
    };

    this.logService
      .getRulesEngineExecutionLogListByInput(input)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.logs.set(result.items ?? []);
          this.totalRecords.set(result.totalCount ?? 0);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          console.error('Failed to load rules engine execution logs.', error);
          this.errorMessage.set('Execution logs could not be loaded. Please try again.');
          this.logs.set([]);
          this.totalRecords.set(0);
          this.loading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.load({ ...this.table?.createLazyLoadMetadata(), first: 0, rows: this.rows });
  }

  resetFilters(): void {
    this.filters = {
      workFlowName: null,
      fromDate: null,
      toDate: null,
      activity: null,
      claimNumber: null,
      ruleName: null,
    };
    this.load({ ...this.table?.createLazyLoadMetadata(), first: 0, rows: this.rows });
  }
}
