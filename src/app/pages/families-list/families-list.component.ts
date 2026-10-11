import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { actions, Column, PaginationInfo, TableConfig } from 'src/app/shared/models/table.model';
import { SharedModule } from 'src/app/shared/shared.module';
import { Dialog } from 'primeng/dialog';
// import { FamiliesService } from '@proxy/ehealth-claims/domains/family/families.service';
import { SessionStateService, LocalizationService, LocalizationModule } from '@abp/ng.core';
import { FamilyService } from '@proxy/ehealth-claims/domains/family/family.service';

@Component({
  selector: 'app-families-list',
  templateUrl: './families-list.component.html',
  standalone: true,
  imports: [CommonModule, SharedModule, Dialog, LocalizationModule],
})
export class FamiliesListComponent implements OnInit {
  columns: Column[] = [
 { field: 'beneficiaryName', header: this.l.instant('RuleApplication::Families:Beneficiary'), sortable: false },
    { field: 'hofFirstName', header: this.l.instant('RuleApplication::Families:HofFirstName'), sortable: false },
    { field: 'hofRestOfName', header: this.l.instant('RuleApplication::Families:HofRestOfName'), sortable: false },
    { field: 'hofNationalId', header: this.l.instant('RuleApplication::Families:HofNationalId'), sortable: false },
    { field: 'mobilePhone', header: this.l.instant('RuleApplication::Families:MobilePhone'), sortable: false },
    { field: 'currentAddress', header: this.l.instant('RuleApplication::Families:CurrentAddress'), sortable: false },
  ];

  config: TableConfig = {
    selectable: false,
    filterable: true,
    globalFilterFields: ['hofFirstName', 'hofRestOfName', 'hofNationalId', 'mobilePhone', 'currentAddress'],
    rowsPerPage: 10,
    loading: false,
    showPaginator: true,
    responsive: true,
    scrollable: true,
    resizableColumns: false,
    sortMode: 'single',
    defaultSortField: 'id',
    defaultSortOrder: 1,
    actions: true,
  };

  actionsConfig: actions = {
    edit: true,
    details: false,
    delete: true,
    assignTo: false,
    audit: false,
    viewbatches: false,
    viewClaims: false,
    viewBatchClaims: false,
    ViewFamilyTree: true,
    moveBeneficiary: false,
    splitBeneficiary: false
  };

  data: any[] = [];

  paginationInfo: PaginationInfo = {
    pageSize: 10,
    pageNumber: 1,
    totalItems: 0,
    totalPages: 0,
  };

  search: any = {
    pageSize: 10,
    pageNumber: 1,
    name: null,
    familyId: null,
    nationalId: null,
    onlyParents: null,
  };

  externalFilter: any = {};

  constructor(
    private sessionState: SessionStateService,
    private l: LocalizationService,
    private service: FamilyService,
    private router: Router
  ) {}

  ngOnInit(): void {
        // this.sessionState.setLanguage('ar');
    this.loadPage(1, this.paginationInfo.pageSize);
  }

  addNew(): void {
    this.router.navigate(['/families/create']);
  }

  applySearch(): void {
    this.search.pageNumber = 1;
    this.search.pageSize = this.paginationInfo.pageSize;

    this.externalFilter = {
      name: this.search.name,
      familyId: this.search.familyId,
      nationalId: this.search.nationalId,
    };

    this.loadPage(1, this.search.pageSize ?? 10);
  }

  clearSearch(): void {
    this.search.name = null;
    this.search.familyId = null;
    this.search.nationalId = null;
    this.search.onlyParents = null;
    this.applySearch();
  }

  onGetPaginatedData(evt: {
    sorting?: string;
    skipCount?: number;
    maxResultCount?: number;
    name?: string;
    familyId?: string;
    nationalId?: string;
  }): void {
    const pageSize = evt.maxResultCount ?? 10;
    const skipCount = evt.skipCount ?? 0;
    const pageNumber = Math.floor(skipCount / pageSize) + 1;

    this.loadPage(pageNumber, pageSize);
  }

  private loadPage(pageNumber: number, pageSize: number): void {
    const input = {
      pageNumber,
      pageSize,
      name: this.search.name,
      familyId: this.search.familyId,
      nationalId: this.search.nationalId,
      onlyParents: this.search.onlyParents
    };

    this.config = { ...this.config, loading: true };

    this.service.getAllByDto(input).subscribe({
      next: res => {
        this.data = res.items ?? [];

        const totalItems = res.totalCount ?? 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        this.paginationInfo = {
          pageSize,
          pageNumber,
          totalItems,
          totalPages,
        };

        this.config = { ...this.config, loading: false };
      },
      error: () => {
        this.data = [];
        this.paginationInfo = {
          pageSize,
          pageNumber,
          totalItems: 0,
          totalPages: 0,
        };
        this.config = { ...this.config, loading: false };
      }
    });
  }
displayDeleteDialog = false;
selectedId = 0;
deleting = false;

onDelete(id: number): void {
  this.selectedId = id;
  this.displayDeleteDialog = true;
}

confirmDelete(): void {
  if (!this.selectedId) return;

  this.deleting = true;

  this.service.deleteById(this.selectedId).subscribe({
    next: () => {
      this.deleting = false;
      this.displayDeleteDialog = false;
      this.selectedId = 0;
      this.loadPage(this.paginationInfo.pageNumber, this.paginationInfo.pageSize);
    },
    error: () => {
      this.deleting = false;
    }
  });
}

closeDeleteDialog(): void {
  this.displayDeleteDialog = false;
  this.selectedId = 0;
}
  onEdit(id: number): void {
    this.router.navigate(['/families/edit', id]);
  }
}