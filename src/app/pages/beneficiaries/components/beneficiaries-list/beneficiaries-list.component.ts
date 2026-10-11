import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LocalizationModule, LocalizationService, SessionStateService } from '@abp/ng.core';
import { BeneficiariesService } from '@proxy/ehealth-claims/domains/beneficiaries';
import {
  BeneficiaryDto,
  BeneficiarySearchRequestDto,
  EmployerDto,
  MoveBeneficiaryRequest,
  SplitBeneficiaryRequest,
} from '@proxy/ehealth-claims/view-models';
import { Dialog } from 'primeng/dialog';
import { CustomDropdownComponent } from 'src/app/shared/components/CVA-Form/custom-dropdown/custom-dropdown.component';
import { CustomDropDownOption } from 'src/app/shared/models/inputs.model';
import { actions, Column, PaginationInfo, TableConfig } from 'src/app/shared/models/table.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-beneficiaries-list',
  templateUrl: './beneficiaries-list.component.html',
  standalone: true,
  imports: [CommonModule, SharedModule, CustomDropdownComponent, Dialog, LocalizationModule],
})
export class BeneficiariesListComponent implements OnInit {
  columns: Column[] = [
    {
      field: 'familyId',
      header: this.l.instant('RuleApplication::Beneficiaries:FamilyId'),
      sortable: false,
    },
    {
      field: 'name',
      header: this.l.instant('RuleApplication::Beneficiaries:Name'),
      sortable: false,
    },
    {
      field: 'familyRole',
      header: this.l.instant('RuleApplication::Beneficiaries:FamilyRole'),
      sortable: false,
    },
    {
      field: 'parentName',
      header: this.l.instant('RuleApplication::Beneficiaries:Parent'),
      sortable: false,
    },
    {
      field: 'employerName',
      header: this.l.instant('RuleApplication::Beneficiaries:Employer'),
      sortable: false,
    },
    {
      field: 'insuranceSalary',
      header: this.l.instant('RuleApplication::Beneficiaries:InsuranceSalary'),
      type: 'number',
      sortable: false,
    },
  ];

  employerOptions: CustomDropDownOption[] = [];
  selectedEmployerId = '';

  config: TableConfig = {
    selectable: false,
    filterable: true,
    globalFilterFields: ['name', 'parentName', 'employerName', 'familyRole'],
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
    moveBeneficiary: true,
    splitBeneficiary: true,
  };

  data: BeneficiaryDto[] = [];

  paginationInfo: PaginationInfo = {
    pageSize: 10,
    pageNumber: 1,
    totalItems: 0,
    totalPages: 0,
  };

  search: BeneficiarySearchRequestDto = {
    pageSize: 10,
    pageNumber: 1,
  };

  externalFilter: any = {};

  // Move dialog
  moveDialogVisible = false;
  selectedBeneficiaryForMove: BeneficiaryDto | null = null;
  parentNationalId = '';
  parentSearchResults: BeneficiaryDto[] = [];
  selectedNewParentId: number | null = null;
  moveLoading = false;
  searchParentLoading = false;

  // Split dialog
  splitDialogVisible = false;
  selectedBeneficiaryForSplit: BeneficiaryDto | null = null;
  splitLoading = false;

  constructor(
    private sessionState: SessionStateService,
    private l: LocalizationService,
    private beneficiariesService: BeneficiariesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // this.sessionState.setLanguage('ar');
    this.loadPage(1, this.paginationInfo.pageSize);
    this.loadEmployers();
  }

  addNew(): void {
    this.router.navigate(['/beneficiaries/create']);
  }

  private loadEmployers(): void {
    this.beneficiariesService.getAllEmployers().subscribe((res: EmployerDto[]) => {
      this.employerOptions = (res ?? []).map(e => ({
        id: String(e.id),
        name: e.nameAr ?? e.nameEn ?? `Employer #${e.id}`,
      }));
    });
  }

  applySearch(): void {
    this.search.pageNumber = 1;
    // this.search.pageSize = this.paginationInfo.pageSize;

    // this.search.employerId = this.selectedEmployerId ? Number(this.selectedEmployerId) : null;

    this.externalFilter = {
      name: this.search.name,
      familyId: this.search.familyId,
      employerId: this.search.employerId,
    };

    this.loadPage(1, this.search.pageSize ?? 10);
  }

  clearSearch(): void {
    // this.search.name = null;
    // this.search.familyId = null;
    // this.search.nationalId = null;
    // this.search.onlyParents = null;
    this.selectedEmployerId = '';
    // this.search.employerId = null;
    this.applySearch();
  }

  onGetPaginatedData(evt: {
    sorting?: string;
    skipCount?: number;
    maxResultCount?: number;
    name?: string;
    familyId?: string;
    employerId?: number;
  }): void {
    const pageSize = evt.maxResultCount ?? 10;
    const skipCount = evt.skipCount ?? 0;
    const pageNumber = Math.floor(skipCount / pageSize) + 1;

    this.loadPage(pageNumber, pageSize);
  }

  private loadPage(pageNumber: number, pageSize: number): void {
    const input: BeneficiarySearchRequestDto = {
      pageNumber,
      pageSize,
      name: this.search.name,
      familyId: this.search.familyId,
      employerId: this.selectedEmployerId ? Number(this.selectedEmployerId) : undefined,
      nationalId: this.search.nationalId,
      onlyParents: this.search.onlyParents,
    };

    this.beneficiariesService.getAll(input).subscribe(res => {
      this.data = res.items ?? [];

      const totalItems = res.totalCount ?? 0;
      const totalPages = Math.ceil(totalItems / pageSize);

      this.paginationInfo = {
        pageSize,
        pageNumber,
        totalItems,
        totalPages,
      };
    });
  }

  onDelete(id: number): void {
    const confirmed = confirm('Are you sure you want to delete this beneficiary?');
    if (!confirmed) return;

    this.beneficiariesService.delete(id).subscribe(msg => {
      alert(msg);
      this.loadPage(this.paginationInfo.pageNumber, this.paginationInfo.pageSize);
    });
  }

  // =========================
  // Move
  // =========================
  openMoveDialog(row: BeneficiaryDto): void {
    this.selectedBeneficiaryForMove = row;
    this.parentNationalId = '';
    this.parentSearchResults = [];
    this.selectedNewParentId = null;
    this.moveLoading = false;
    this.searchParentLoading = false;
    this.moveDialogVisible = true;
  }

  closeMoveDialog(): void {
    this.moveDialogVisible = false;
    this.selectedBeneficiaryForMove = null;
    this.parentNationalId = '';
    this.parentSearchResults = [];
    this.selectedNewParentId = null;
    this.moveLoading = false;
    this.searchParentLoading = false;
  }

  searchParentsByNationalId(): void {
    const nationalId = this.parentNationalId?.trim();

    if (!nationalId) {
      this.parentSearchResults = [];
      this.selectedNewParentId = null;
      return;
    }

    this.searchParentLoading = true;

    this.beneficiariesService
      .getAll({
        pageNumber: 1,
        pageSize: 10,
        nationalId,
        onlyParents: true,
      })
      .subscribe({
        next: res => {
          const currentBeneficiaryId = this.selectedBeneficiaryForMove?.id;

          this.parentSearchResults = (res.items ?? []).filter(x => x.id !== currentBeneficiaryId);
          this.selectedNewParentId = null;
          this.searchParentLoading = false;
        },
        error: () => {
          this.searchParentLoading = false;
          this.parentSearchResults = [];
          this.selectedNewParentId = null;
        },
      });
  }

  confirmMove(): void {
    if (!this.selectedBeneficiaryForMove?.id) {
      alert('Selected beneficiary not found');
      return;
    }

    if (!this.selectedBeneficiaryForMove.parentId) {
      alert('Selected beneficiary must be a child');
      return;
    }

    if (!this.selectedNewParentId) {
      alert('Please select a new parent');
      return;
    }



    this.moveLoading = true;

    // this.beneficiariesService.moveBeneficiaryByInput(input).subscribe({
    //   next: () => {
    //     this.moveLoading = false;
    //     this.closeMoveDialog();
    //     this.loadPage(this.paginationInfo.pageNumber, this.paginationInfo.pageSize);
    //   },
    //   error: err => {
    //     this.moveLoading = false;
    //     alert(err?.error?.error?.message || err?.error?.message || 'Move failed');
    //   },
    // });
  }

  // =========================
  // Split
  // =========================
  openSplitDialog(row: BeneficiaryDto): void {
    this.selectedBeneficiaryForSplit = row;
    this.splitLoading = false;
    this.splitDialogVisible = true;
  }

  closeSplitDialog(): void {
    this.splitDialogVisible = false;
    this.selectedBeneficiaryForSplit = null;
    this.splitLoading = false;
  }

  confirmSplit(): void {
    if (!this.selectedBeneficiaryForSplit?.id) {
      alert('Selected beneficiary not found');
      return;
    }

    if (!this.selectedBeneficiaryForSplit.parentId) {
      alert('Selected beneficiary must be a child');
      return;
    }

    const input: SplitBeneficiaryRequest = {
      // oldParentId: this.selectedBeneficiaryForSplit.parentId,
      beneficiaryId: this.selectedBeneficiaryForSplit.id,
    };

    this.splitLoading = true;

    this.beneficiariesService.splitBeneficiaryByInput(input).subscribe({
      next: () => {
        this.splitLoading = false;
        this.closeSplitDialog();
        this.loadPage(this.paginationInfo.pageNumber, this.paginationInfo.pageSize);
      },
      error: err => {
        this.splitLoading = false;
        alert(err?.error?.error?.message || err?.error?.message || 'Failed to split beneficiary');
      },
    });
  }
}
