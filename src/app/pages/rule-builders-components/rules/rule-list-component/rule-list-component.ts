import { Options } from "@popperjs/core";
import {
  Component,
  inject,
  Injector,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  SelectedDropDownList,
 } from "@proxy/common/dtos";
import { LookupService } from "@proxy/lookups";
import { RuleListItemDto } from "@proxy/work-flows/dtos/rules-dtos";
import { RuleService } from "@proxy/work-flows/rules";
import { ButtonModule } from "primeng/button";
import { Table, TableLazyLoadEvent, TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { FormPageComponent } from "src/app/shared/components/CVA-Form/form-page/form-page.component";
import { Paginator } from "primeng/paginator";
import { AppComponentBase } from "src/app/app-component-base";
import { RulePagedAndSortedResultRequestDto } from "@proxy/work-flows/dtos";

@Component({
  selector: "app-rule-list-component",
  imports: [
    ButtonModule,
    RouterLink,
    TableModule,
    TagModule,
    FormPageComponent,
  ],
  templateUrl: "./rule-list-component.html",
  styleUrl: "./rule-list-component.scss",
})
export class RuleListComponent extends AppComponentBase implements OnInit {
   @ViewChild("dt") table!: Table;

  private service = inject(RuleService);
  private lookupservice = inject(LookupService);
  rules = signal<RuleListItemDto[]>([]);
  rulename = signal<string>("");
  workflowId = signal<number | null>(null);
  workflows = signal<SelectedDropDownList[]>([]);
  totalRecords = signal(0);
  loading = signal(false);
  first = signal(0);
  rows = 10;
  dynamicControls: any[] = [
    {
      name: "workflowId",
      label: "work Flow Name",
      type: "dropdown",
      options: [],
    },
    { name: "ruleName", label: "Rule Name", type: "text" },
  ];

  constructor(injector: Injector) {
    super(injector);
  }
  ngOnInit(): void {
    this.lookupservice.getWorkflowsDropDownList().subscribe({
      next: (result) => {
        this.workflows.set(result);
        this.dynamicControls.find((item) => item.name == "workflowId").options =
          this.workflows();
      },
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
        ruleName: this.rulename(),
        workflowId: this.workflowId(),
      })
      .subscribe({
        next: (result) => {
          this.rules.set(result.items ?? []);
          this.totalRecords.set(result.totalCount ?? 0);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  remove(r: RuleListItemDto) {
    if (!r.id) return;
    if (!confirm(`Delete rule "${r.name}"?`)) return;
    this.first.set(0);
    this.service
      .delete(r.id)
      .subscribe(() => this.load({ first: 0, rows: this.rows }));
  }
  sumbitFilter(event: any) {
    this.rulename.set(event.ruleName);
    this.workflowId.set(event.workflowId);

    const currentMetadata = this.table.createLazyLoadMetadata();

    this.load(currentMetadata);
  }
  resetFilter() {
    this.rulename.set("");
    this.workflowId.set(null);

    const currentMetadata = this.table.createLazyLoadMetadata();

    this.load(currentMetadata);
  }
}
