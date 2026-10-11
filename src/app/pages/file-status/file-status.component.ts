import { NgClass } from '@angular/common';
import { Component, Injector, ViewChild } from '@angular/core';
import { RuleService } from '@proxy/ehealth-claims/domains/rule';
import { RulesFileDto } from '@proxy/ehealth-claims/domains/rules';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { AppComponentBase } from 'src/app/app-component-base';

@Component({
  selector: 'app-file-status',
  //imports: [ButtonModule, TableModule, PaginatorModule, CardModule  ,NgClass],
  templateUrl: './file-status.component.html',
  styleUrl: './file-status.component.scss',
})
export class FileStatusComponent extends AppComponentBase {
  rulesFile: RulesFileDto[] = [];
  totalCount = 0;
  loading = false;
  pageNumber = 1;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20, 50];
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  constructor(injector: Injector, private ruleService: RuleService) {
    super(injector);
  }
  getRules(event) {
    const pageSize = event.rows;
    const pageNumber = event.first + 1;
    this.loadRules(pageSize, pageNumber);
  }
  loadRules(pageSize: number, pageNumber: number) {
    this.loading = true;
    this.ruleService
      .getAllRulesFilesByPageNumberAndPageSize(pageNumber, pageSize)
      .subscribe(result => {
        this.rulesFile = result.items;
        this.totalCount = result.totalCount;
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.records = result.items;

        this.loading = false;
      });
  }

  getRecordsIfNeeds(event) {
    const pageSize = event.rows;
    const pageNumber = event.page + 1;
    this.loadRules(pageSize, pageNumber);
  }
}
