import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { Column, TableConfig, PaginationInfo, actions } from 'src/app/shared/models/table.model';
import { SortableColumn } from 'primeng/table';
import { BeneficiariesService } from '@proxy/ehealth-claims/domains/beneficiaries';
import { BeneficiaryFamilyTreeRowDto } from '@proxy/ehealth-claims/view-models';
import { LocalizationModule, LocalizationService, SessionStateService } from '@abp/ng.core';

@Component({
  selector: 'app-beneficiary-family-tree',
  standalone: true,
  imports: [CommonModule, SharedModule, LocalizationModule],
  templateUrl: './beneficiary-family-tree.component.html',
})
export class BeneficiaryFamilyTreeComponent implements OnInit {
  id!: number;

  columns: Column[] = [
   { field: 'nationalId', header: this.l.instant('RuleApplication::Beneficiaries:NationalId'), sortable: false },
    { field: 'familyId', header: this.l.instant('RuleApplication::Beneficiaries:FamilyId'), sortable: false },
    { field: 'name', header: this.l.instant('RuleApplication::Beneficiaries:Name'), sortable: false },
    { field: 'familyRole', header: this.l.instant('RuleApplication::Beneficiaries:FamilyRole'), sortable: false },
    { field: 'parentName', header: this.l.instant('RuleApplication::Beneficiaries:Parent'), sortable: false },
    { field: 'maritalStatus', header: this.l.instant('RuleApplication::Beneficiaries:MaritalStatus'), sortable: false },
    { field: 'birthDate', header: this.l.instant('RuleApplication::Beneficiaries:BirthDate'), type: 'date', sortable: false },
    { field: 'deathDate', header: this.l.instant('RuleApplication::Beneficiaries:DeathDate'), type: 'date', sortable: false },
    { field: 'employerName', header: this.l.instant('RuleApplication::Beneficiaries:Employer'), sortable: false },
    { field: 'insuranceSalary', header: this.l.instant('RuleApplication::Beneficiaries:InsuranceSalary'), type: 'number', sortable: false },
  ];


  config: TableConfig = {
    selectable: false,
    filterable: true,
    globalFilterFields: ['name', 'parentName', 'employerName', 'familyRole'],
    rowsPerPage: 100,
    loading: false,
    showPaginator: false,
    responsive: true,
    scrollable: true,
    resizableColumns: false,
    actions: false,
  };

  actionsConfig: actions = {} as any;

  data: BeneficiaryFamilyTreeRowDto[] = [];

  paginationInfo: PaginationInfo = {
    pageSize: 100,
    pageNumber: 1,
    totalItems: 0,
    totalPages: 1,
  };
  
  constructor(
    private sessionState: SessionStateService,
    private l: LocalizationService,
    private route: ActivatedRoute,
    private beneficiariesService: BeneficiariesService
  ) {}

  ngOnInit(): void {
        // this.sessionState.setLanguage('ar');
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadFamilyTree();
  }

  private loadFamilyTree(): void {
    this.beneficiariesService.getFamilyTreeById(this.id).subscribe(res => {

      this.data = (res ?? []).map(x => ({
        ...x,
        name: `${'— '.repeat(x.depth ?? 0)}${x.name}`
      }));

      this.paginationInfo = {
        pageSize: this.data.length || 1,
        pageNumber: 1,
        totalItems: this.data.length,
        totalPages: 1,
      };
    });
  }
}