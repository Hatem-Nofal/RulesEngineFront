import { CommonModule } from '@angular/common';
import { Component, Injector, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AppComponentBase } from 'src/app/app-component-base';
import { ClaimValidationService, BatchValidationJobStatusDto } from '@proxy/ehealth-claims/domains/claims';

@Component({
  selector: 'claimvalidationresultprogress',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, PaginatorModule, CardModule],
  templateUrl: './claimvalidationresultprogress.component.html',
  styleUrl: './claimvalidationresultprogress.component.scss',
})
export class ClaimValidationResultProgressComponent extends AppComponentBase {
  loading = false;

  pageSizeOptions = [5, 10, 20, 50, 100];

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  constructor(
    injector: Injector,
    private claimValidationService: ClaimValidationService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // ensure non-null array
    this.primengTableHelper.records = this.primengTableHelper.records ?? [];
    this.onFiltersChange(true);
  }

  refresh(): void {
    this.onFiltersChange(false);
  }

  onFiltersChange(resetToFirstPage: boolean = true) {
    const pageSize =
      this.paginator?.paginatorState?.rows ??
      this.primengTableHelper.defaultRecordsCountPerPage;

    const pageNumber = resetToFirstPage
      ? 1
      : (this.paginator?.paginatorState?.page ?? 0) + 1;

    if (resetToFirstPage && this.paginator) {
      this.paginator.changePage(0);
    }

    this.loadJobs(pageSize, pageNumber);
  }

  // PrimeNG lazy load callback
  getJobs(event: any) {
    const pageSize = event?.rows ?? this.primengTableHelper.defaultRecordsCountPerPage;
    const pageNumber = Math.floor((event?.first ?? 0) / pageSize) + 1;

    this.loadJobs(pageSize, pageNumber);
  }

  // paginator callback
  getRecordsIfNeeds(event: any) {
    const pageSize = event?.rows ?? this.primengTableHelper.defaultRecordsCountPerPage;
    const pageNumber = (event?.page ?? 0) + 1;

    this.loadJobs(pageSize, pageNumber);
  }

  private loadJobs(pageSize: number, pageNumber: number) {
    this.loading = true;

    this.claimValidationService.getAllValidationJobs(pageSize, pageNumber).subscribe({
      next: (result) => {
        const items = (result?.items ?? []) as BatchValidationJobStatusDto[];

        this.primengTableHelper.records = items;
        this.primengTableHelper.totalRecordsCount = result?.totalCount ?? 0;
      },
      error: () => (this.loading = false),
      complete: () => (this.loading = false),
    });
  }

  statusClass(status?: string | null) {
    return {
      'status-inprogress': status === 'InProgress' || status === 'Queued',
      'status-completed': status === 'Completed',
      'status-failed': status === 'Failed',
    };
  }
}
