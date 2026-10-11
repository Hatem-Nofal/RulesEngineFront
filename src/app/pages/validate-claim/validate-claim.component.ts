import { BaseCoreModule } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClaimDropDownItemDto, BatchDropDownItemDto, ClaimValidationResultDto, ClaimValidationService } from '@proxy/ehealth-claims/domains/claims';
import { RuleService } from '@proxy/ehealth-claims/domains/rule';
import { WorkflowDropDownDto } from '@proxy/ehealth-claims/domains/rules';
import { ClaimsService } from '@proxy/rules/controllers';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { debounceTime, Subject } from 'rxjs';
import { ClaimsPermissions } from 'src/app/shared/models/appPermissions';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';

@Component({
  selector: 'app-validate-claim',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    SelectModule,
    MultiSelectModule,
    ButtonModule,
    MessageModule,
    BaseCoreModule,
  ],
  templateUrl: './validate-claim.component.html',
  styleUrl: './validate-claim.component.scss',
  standalone:true
})
export class ValidateClaimComponent implements OnInit {
  claimSearch = '';
  batchSearch = '';
  pageNumber = 1;

  workflows: WorkflowDropDownDto[] = [];

  selectedClaimId: number;
  selectedBatchId: number;
  selectedWorkflowIds: number[] = [];

  itemSize = 50;

  claims: ClaimDropDownItemDto[] = [];
  batches: BatchDropDownItemDto[] = [];

  totalCount = 0;

  failureList: ClaimValidationResultDto[] = [];

  filterInput$ = new Subject<string>();
  filterBatchInput$ = new Subject<string>();
  claimPermissions = ClaimsPermissions;

  isLoading: boolean = false;

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
      this.claimSearch = searchText;
      this.pageNumber = 1;
      this.claims = [];
      this.loadClaims(true, () => this.onclaimsLazyLoad({}));
    });

    this.filterBatchInput$.pipe(debounceTime(300)).subscribe(searchText => {
      this.batchSearch = searchText;
      this.pageNumber = 1;
      this.batches = [];
      this.loadBatches(true, () => this.onBatchesLazyLoad({}));
    });
  }

  loadDropdownData() {
    this.loadBatches();
    this.ruleService.getAllWorkflows().subscribe(data => (this.workflows = data));
  }

  loadClaims(reset = false, after?: () => void) {
    if (reset) {
      this.pageNumber = 1;
      this.claims = [];
    }

    this.service
      .getClaimsDropDownByPageSizeAndPageNumberAndBatchidAndSearch(
        this.itemSize,
        this.pageNumber,
        this.selectedBatchId,
        this.claimSearch
      )
      .subscribe(res => {
        this.claims = res.items;
        this.totalCount = res.totalCount ?? this.claims.length;
        if (after) after();
      });
  }

  validateClaim() {
    this.isLoading = true;
    this.failureList = [];

    this.service
      .validateSingleClaimAgainstWorkflowsByRequest({
        claimId: this.selectedClaimId,
        workflowIds: this.selectedWorkflowIds,
      })
      .subscribe({
        next: res => {
          if (res.success) {
            this.customConfirmationService.success('No Violations Found ', 'Sucess', 5000);
            this.failureList = [];
          } else {
            this.failureList = res.failed ?? [];
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.customConfirmationService.error('Claim validated failed', 'Error', 5000);
        },
      });
  }

  onclaimsLazyLoad(event: { first?: number; rows?: number; last?: number }): void {
    const first = event?.first ?? 0;
    const rows = event?.rows ?? (event?.last ? event.last - first + 1 : this.itemSize);

    if (this.totalCount <= this.itemSize || this.claims.length >= this.totalCount) return;

    const requestedEnd = event?.last ?? first + rows - 1;
    if (requestedEnd < this.claims.length - 1) return;

    if (this._isLoadingPage) return;

    const nextPage = this.pageNumber + 1;

    if (this._lastLoadedPage === nextPage) return;
    this._lastLoadedPage = nextPage;
    this._isLoadingPage = true;

    const pageSize = 50;

    this.service
      .getClaimsDropDownByPageSizeAndPageNumberAndBatchidAndSearch(
        pageSize,
        nextPage,
        this.selectedBatchId,
        this.claimSearch
      )
      .subscribe({
        next: res => {
          const incoming = res?.items ?? [];
          const existingIds = new Set(this.claims.map(c => c.id));
          this.claims = [...this.claims, ...incoming.filter(c => !existingIds.has(c.id))];
          this.totalCount = res?.totalCount ?? this.totalCount;
          this.pageNumber = nextPage;
        },
        error: err => {
          console.error('Lazy load claims failed:', err);
          this._lastLoadedPage = null;
        },
        complete: () => {
          this._isLoadingPage = false;
        },
      });
  }

  onclaimSearchChange(event: any) {
    this.filterInput$.next(event?.filter || '');
  }

  onBatchSearchChange(event: any) {
    if (event?.filter) {
      this.filterBatchInput$.next(event.filter || '');
    } else if (event?.value) {
      this.loadClaims(true);
    }
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

  onBatchesLazyLoad(event: { first?: number; rows?: number; last?: number }) {
    const first = event?.first ?? 0;
    const rows = event?.rows ?? (event?.last ? event.last - first + 1 : this.itemSize);

    if (this.totalCount <= this.itemSize || this.batches.length >= this.totalCount) return;

    const requestedEnd = event?.last ?? first + rows - 1;
    if (requestedEnd < this.batches.length - 1) return;

    if (this._isLoadingPage) return;

    const nextPage = this.pageNumber + 1;

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
        error: () => {
          this._lastLoadedPage = null;
        },
        complete: () => {
          this._isLoadingPage = false;
        },
      });
  }

  trackByRow(index: number, item: ClaimValidationResultDto): string | number {
    const anyItem = item as any;

    if (anyItem && anyItem.id != null) return anyItem.id;

    const patientId = anyItem?.patientId ?? '';
    const claimNumber = anyItem?.claimNumber ?? '';
    const wf = anyItem?.workFlowName ?? '';
    const rule = anyItem?.rule ?? '';

    if (!patientId && !claimNumber && !wf && !rule) return index;

    return `${patientId}|${claimNumber}|${wf}|${rule}`;
  }
}
