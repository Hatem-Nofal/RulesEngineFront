import { Component, inject, OnInit, signal, ViewChild } from "@angular/core";
import { RouterLink } from "@angular/router";
import { RejectionLevel, rejectionLevelOptions } from "@proxy/common/enums";
import { LookupDto } from "@proxy/lookups/dtos";
import { WorkFlowService } from "@proxy/work-flows";
import { WorkflowDto } from "@proxy/work-flows/dtos";
import { RuleFormConfigService } from "@proxy/work-flows/rules/rule-builders";
import { ButtonModule } from "primeng/button";
import { Table, TableLazyLoadEvent, TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { FormPageComponent } from "src/app/shared/components/CVA-Form/form-page/form-page.component";

@Component({
  selector: "app-workflow-list-component",
  imports: [
    ButtonModule,
    RouterLink,
    TableModule,
    TagModule,
    FormPageComponent,
  ],
  templateUrl: "./workflow-list-component.html",
  styleUrl: "./workflow-list-component.scss",
})
export class WorkflowListComponent implements OnInit {
  @ViewChild("dt") table!: Table;
  private formConfigService = inject(RuleFormConfigService);

  private service = inject(WorkFlowService);
  configs = signal<LookupDto[]>([]);

  workflows = signal<WorkflowDto[]>([]);
  rejectionLevel = signal<RejectionLevel | null>(null);
  ruleFormConfigId = signal<number | null>(null);
  name = signal<string | null>(null);

  totalRecords = signal(0);
  loading = signal(false);
  first = signal(0);
  rows = 10;
  rejectionLevels = rejectionLevelOptions.map((x) => ({
    id: x.value,
    name: x.key,
  }));
  dynamicControls: any[] = [
    { name: "name", label: "Name", type: "text" },
    {
      name: "ruleFormConfigId",
      label: "Rule Form Config",
      type: "dropdown",
      options: this.configs(),
    },
    {
      name: "rejectionLevel",
      label: "Rejection Level",
      type: "dropdown",
      options: this.rejectionLevels,
    },
  ];

  ngOnInit(): void {
    this.formConfigService.getConfigs().subscribe({
      next: (configs) => {this.configs.set(configs)
    this.dynamicControls.find((item) => item.name == "ruleFormConfigId").options =
          this.configs();

      },
      error: () => this.loading.set(false),
    });
  }
  load(event: TableLazyLoadEvent = {}) {
    const first = event.first ?? 0;
    this.first.set(first);
    this.loading.set(true);
    const sortField = Array.isArray(event.sortField)
      ? event.sortField[0]
      : event.sortField;
    this.service
      .getList({
        skipCount: first,
        maxResultCount: event.rows ?? this.rows,
        sorting: sortField
          ? `${sortField} ${event.sortOrder === -1 ? "DESC" : "ASC"}`
          : undefined,
        rejectionLevel: this.rejectionLevel(),
        name: this.name(),
        ruleFormConfigId: this.ruleFormConfigId(),
      })
      .subscribe({
        next: (result) => {
          this.workflows.set(result.items ?? []);
          this.totalRecords.set(result.totalCount ?? 0);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  remove(w: WorkflowDto) {
    if (!w.id) return;
    if (!confirm(`Delete workflow "${w.name}"?`)) return;
    this.first.set(0);
    this.service
      .delete(w.id)
      .subscribe(() => this.load({ first: 0, rows: this.rows }));
  }
  sumbitFilter(event: any) {
    this.rejectionLevel.set(event.rejectionLevel?Number(event.rejectionLevel) as RejectionLevel:null);
    this.ruleFormConfigId.set(event.ruleFormConfigId);
    this.name.set(event.name);
    const currentMetadata = this.table.createLazyLoadMetadata();

    this.load(currentMetadata);
  }

  resetFilter() {
    this.rejectionLevel.set(null);
    this.ruleFormConfigId.set(null);
    this.name.set(null);

    const currentMetadata = this.table.createLazyLoadMetadata();

    this.load(currentMetadata);
  }
  getEnumText(id: string | number): string {
  return RejectionLevel[Number(id)] ?? 'Unknown';
}
}
