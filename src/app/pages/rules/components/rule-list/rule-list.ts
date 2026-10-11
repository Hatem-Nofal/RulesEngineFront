import { PermissionService } from '@abp/ng.core';
import { Component, inject, Injector, ViewChild } from '@angular/core';
import { RuleService } from '@proxy/ehealth-claims/domains/rule';
import { RuleDto, WorkFlowDto, RulesFilterModel } from '@proxy/ehealth-claims/domains/rules';
import { WorkFlowService } from '@proxy/ehealth-claims/domains/work-flow';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { AppComponentBase } from 'src/app/app-component-base';
import { RulesPermissions } from 'src/app/shared/models/appPermissions';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';

@Component({
  selector: 'app-rule-list',
  standalone: false,
  templateUrl: './rule-list.html',
  styleUrl: './rule-list.scss',
})
export class RuleListComponent extends AppComponentBase {
  rulesPermissions=RulesPermissions
  rules: RuleDto[] = [];
  totalCount = 0;
  loading = false;
  pageNumber = 1;
  pageSize = 5;
  workFlowId=0;
  ruleName='';
  workflows: WorkFlowDto[] = [];

  pageSizeOptions = [5, 10, 20, 50];
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  permission = inject(PermissionService)

  constructor(
    injector: Injector,
    private ruleService: RuleService,
    private customConfirmationService: CustomConfirmationService,
    private workflowservice: WorkFlowService,
  
  ) {
    super(injector);
  }
  ngOnInit(): void {
  this.WorkFlowsDropDown();
  this.onFiltersChange(true);
}

WorkFlowsDropDown(filter?: string) {
    this.ruleService.getAllWorkflows(filter).subscribe({
      next: workflows => {
        this.workflows = workflows as WorkFlowDto[];
      },
      error: () => {},
    });
}

onWorkflowFilter(event: { filter: string }) {
    this.WorkFlowsDropDown(event.filter);
}
  clearFilters() {
  this.workFlowId = 0;
  this.ruleName = '';
  this.onFiltersChange(true);
}
onFiltersChange(resetToFirstPage: boolean = true) {
  const pageSize =
    this.paginator?.paginatorState?.rows ??
    this.primengTableHelper.defaultRecordsCountPerPage;

  const pageNumber = resetToFirstPage
    ? 1
    : ((this.paginator?.paginatorState?.page ?? 0) + 1);

  if (resetToFirstPage && this.paginator) {
    this.paginator.changePage(0);
  }

  const model: RulesFilterModel = {
    pageNumber,
    pageSize,
    workFlowId: this.workFlowId,            
    ruleName: this.ruleName?.trim() ?? ''
  };

  this.loadRules(model);
}

getRules(event: any) {
  const pageSize = event.rows;
  const pageNumber = Math.floor((event.first ?? 0) / pageSize) + 1;

  const model: RulesFilterModel = {
    pageNumber,
    pageSize,
    workFlowId: this.workFlowId ?? undefined,
    ruleName: this.ruleName?.trim() || undefined
  };

  this.loadRules(model);
}

loadRules(model: RulesFilterModel) {
  this.loading = true;

  this.ruleService.getList(model).subscribe({
    next: (result) => {
      this.rules = result.items;
      this.totalCount = result.totalCount;
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
    },
    complete: () => (this.loading = false),
    error: () => (this.loading = false)
  });
}

deleteRule(rule: RuleDto): void {
  this.customConfirmationService.warnConfrim(
    `Are you sure you want to delete "${rule?.ruleName}"?`,
    'Confirm Deletion',
    {
      accept: () => {
        this.ruleService.delete(rule.id).subscribe({
          next: () => {
            this.customConfirmationService.success(
              'Rule deleted successfully!',
              'success',
              5000
            );

            const rows = this.paginator?.paginatorState?.rows ?? 10;
            const page = this.paginator?.paginatorState?.page ?? 0;

            const model: RulesFilterModel = {
              pageNumber: page + 1,
              pageSize: rows,
              workFlowId: this.workFlowId ?? undefined,
              ruleName: this.ruleName?.trim() || undefined
            };
            this.loadRules(model);
          },
          error: () => {
            this.customConfirmationService.error(
              'Failed to delete rule.',
              'error',
              5000
            );
          }
        });
      },
      reject: () => {}
    }
  );
}

getRecordsIfNeeds(event: any) {
  const pageSize = event.rows ?? 10;
  const pageNumber = (event.page ?? 0) + 1;

  const model: RulesFilterModel = {
    pageNumber,
    pageSize,
    workFlowId: this.workFlowId ?? undefined,
    ruleName: this.ruleName?.trim() || undefined
  };

  this.loadRules(model);
}

  // changePageSize(size: number) {
  //   this.pageSize = size;
  //   this.pageNumber = 1;
  //   this.loadRules();
  // }

  // goToPage(page: number) {
  //   if (page >= 1 && page <= this.totalPages) {
  //     this.pageNumber = page;
  //     this.loadRules();
  //   }
  // }
  // prevPage(): void {
  //   if (this.pageNumber > 1) {
  //     this.pageNumber--;
  //     this.loadRules();
  //   }
  // }

  // nextPage(): void {
  //   if (this.pageNumber < this.totalPages) {
  //     this.pageNumber++;
  //     this.loadRules();
  //   }
  // }
}
