import { BaseCoreModule } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BatchDropDownItemDto, ClaimValidationService } from '@proxy/ehealth-claims/domains/claims';
import { RuleService } from '@proxy/ehealth-claims/domains/rule';
import { WorkflowDropDownDto } from '@proxy/ehealth-claims/domains/rules';
import { ClaimsService } from '@proxy/rules/controllers';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { debounceTime, Subject } from 'rxjs';
import { ClaimsPermissions } from 'src/app/shared/models/appPermissions';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';

@Component({
  selector: 'app-batchvlaidaion',
  // imports: [
  //   CommonModule,
  //   FormsModule,
  //   CardModule,
  //   MultiSelectModule,
  //   ButtonModule,
  //   MessageModule,
  //   BaseCoreModule,
  // ],
  templateUrl: './batchvlaidaion.component.html',
  styleUrl: './batchvlaidaion.component.scss',
})
export class BatchvlaidaionComponent implements OnInit {
  ClaimsPermissions = ClaimsPermissions;
  batches: BatchDropDownItemDto[] = [];
  batchSearch = '';
  pageNumber = 1;
  workflows: WorkflowDropDownDto[] = [];
  itemSize = 50;
  totalCount = 0;
  selectedBatchIds: number[] = [];
  selectedWorkflowIds: number[] = [];

  isLoading = false;
  isValidated = false;

  filterInput$ = new Subject<string>();

  private _isLoadingPage = false;
  private _lastLoadedPage: number | null = null;
  constructor(
    private service: ClaimsService,
    private ruleService: RuleService,
    private claimValidationService: ClaimValidationService,
    private customConfirmationService: CustomConfirmationService
  ) {}

  ngOnInit() {
    this.loadDropdownData();
    this.filterInput$.pipe(debounceTime(300)).subscribe(searchText => {
      this.batchSearch = searchText;
      this.pageNumber = 1;
      this.batches = [];
      this.loadBatches(true, () => this.onBatchesLazyLoad({}));
    });
  }

  loadDropdownData() {
    this.service
      .getBatchesDropDownByPageSizeAndPageNumberAndSearch(
        this.itemSize,
        this.pageNumber,
        this.batchSearch
      )
      .subscribe(res => {
        this.totalCount = res.totalCount ?? this.batches.length;
        this.batches = res.items;
      });
    this.ruleService.getAllWorkflows().subscribe(data => (this.workflows = data));
  }

  validateBatch() {
    this.isLoading = true;
    this.isValidated = false;

    this.claimValidationService
      .validateBatchByInput({
        batchIds: this.selectedBatchIds,
        workflowIds: this.selectedWorkflowIds,
      })
      .subscribe({
        next: () => {
          this.isValidated = true;
          this.customConfirmationService.success('Batch validated successfully', 'Sucess', 5000);
          // this.snackBar.open('Batch validated successfully', 'Close', { duration: 3000 });
        },
        error: () => {
          this.customConfirmationService.error('Batch validated failed', 'Error', 5000);
        },
        complete: () => (this.isLoading = false),
      });
  }

  onBatchesLazyLoad(event: { first?: number; rows?: number; last?: number }) {
    const first = event?.first ?? 0;
    const rows = event?.rows ?? (event?.last ? event.last - first + 1 : this.itemSize);

    // if everything fits on first page or already fully loaded, stop
    if (this.totalCount <= this.itemSize || this.batches.length >= this.totalCount) return;

    // If the requested end is still within already loaded range, skip
    const requestedEnd = event?.last ?? first + rows - 1;
    if (requestedEnd < this.batches.length - 1) return;

    // Prevent overlapping calls
    if (this._isLoadingPage) return;

    // Always advance strictly by one page
    const nextPage = this.pageNumber + 1;

    // Optional guard: skip if we already loaded this page (helps with noisy events)
    if (this._lastLoadedPage === nextPage) return;
    this._lastLoadedPage = nextPage;
    this._isLoadingPage = true;
    const pageSize = 50;
    this.service
      .getBatchesDropDownByPageSizeAndPageNumberAndSearch(pageSize, nextPage, this.batchSearch)
      .subscribe({
        next: res => {
          const incoming = res?.items ?? [];
          const existingIds = new Set(this.batches.map(c => c.id));
          this.batches = [...this.batches, ...incoming.filter(c => !existingIds.has(c.id))];
          this.totalCount = res?.totalCount ?? this.totalCount;
          this.pageNumber = nextPage;
        },
        error: err => {
          console.error('Lazy load batches failed:', err);
          this._lastLoadedPage = null;
        },
        complete: () => {
          this._isLoadingPage = false;
        },
      });
  }

  onBatchSearchChange(event) {
    this.filterInput$.next(event?.filter || '');
  }
  loadBatches(reset = false, after?: () => void) {
    if (reset) {
      this.pageNumber = 1;
      this.batches = [];
    }
    this.service
      .getBatchesDropDownByPageSizeAndPageNumberAndSearch(
        this.itemSize,
        this.pageNumber,
        this.batchSearch
      )
      .subscribe(res => {
        this.batches = res.items;
        this.totalCount = res.totalCount ?? this.batches.length;
        if (after) after();
      });
  }
  downloadExcel() {
    this.service
      .exportResultsByRequest({
        batchIds: this.selectedBatchIds,
      })
      .subscribe((blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Batch_Validation_Results.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
