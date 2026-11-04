import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { LookupDto } from "@proxy/lookups/dtos";
 import { WorkFlowService } from "@proxy/work-flows";
import { SaveWorkflowDto } from "@proxy/work-flows/dtos";
import {
  RejectionLevel,
  rejectionLevelOptions,
} from "@proxy/common/enums/rejection-level.enum";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { BaseCoreModule } from "@abp/ng.core";
import { RuleFormConfigService } from "@proxy/work-flows/rules/rule-builders";
import { ViolationType } from "@proxy/common/enums";
import { SelectedDropDownList } from "@proxy/common/dtos";
import {
  RuleFormConfigDto,
  RuleNodeDto,
} from "@proxy/work-flows/dtos/rule-builders-dtos";
import { RuleNodeComponent } from "../../rules/rule-node-component/rule-node-component";
import { emptyRoot } from "src/app/shared/models/constant";

@Component({
  selector: "app-workflow-edit-component",
  imports: [
    ButtonModule,
    FormsModule,
    InputTextModule,
    RouterLink,
    SelectModule,
    BaseCoreModule,
    RuleNodeComponent,
  ],
  templateUrl: "./workflow-edit-component.html",
  styleUrl: "./workflow-edit-component.scss",
})
export class WorkflowEditComponent implements OnInit {
  private service = inject(WorkFlowService);
  private formConfigService = inject(RuleFormConfigService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  workflowId: number | null = null;
  ruleExpression?: string | null = null;
  name = "";
  configId: number | null = null;
  config = signal<RuleFormConfigDto | null>(null);
  root = signal<RuleNodeDto>(emptyRoot());
  rejectionLevel = RejectionLevel.Activity;
  violationMessage ?: string | null = null;

  configs = signal<LookupDto[]>([]);
  isWorkflowLevel = signal<boolean>(false);
  rejectionLevels = rejectionLevelOptions;
  ruleCount = signal(0);
  saving = signal(false);
  loading = signal(false);
  selectedViolationType = signal<ViolationType>(ViolationType.Error);
  violationTypes = signal<SelectedDropDownList[]>([]);
  ngOnInit() {
    this.violationTypes.set(
      Object.entries(ViolationType)
        .filter(([key]) => isNaN(Number(key)))
        .map(([key, value]) => ({
          id: Number(value),
          name: key,
        }))
    );
    this.loading.set(true);
    this.formConfigService.getConfigs().subscribe({
      next: (configs) => this.configs.set(configs),
      error: () => this.loading.set(false),
    });

    const id = this.route.snapshot.paramMap.get("id");
    if (!id || id === "new") {
      this.loading.set(false);
      return;
    }

    this.workflowId = Number(id);
    this.service.get(this.workflowId).subscribe({
      next: (workflow) => {
        this.name = workflow.name ?? "";
        this.configId = workflow.ruleFormConfigId ?? null;
        this.root.set(workflow.root ?? emptyRoot());
        this.rejectionLevel =
          workflow.rejectionLevel ?? RejectionLevel.Activity;
        this.ruleCount.set(workflow.ruleCount ?? 0);
        this.isWorkflowLevel.set(workflow.isWorkflowLevel ?? false);
        this.ruleExpression = workflow.ruleExpression;
        this.violationMessage = workflow.violationMessage ?? "";
        this.selectedViolationType.set(workflow.violationType ?? ViolationType.Error);
        if (this.configId) this.loadConfig(this.configId);

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onConfigChange(id: number | null) {
    this.configId = id;
    this.config.set(null);
    this.root.set(emptyRoot());
    if (id) this.loadConfig(id);
  }

  private loadConfig(id: number) {
    this.formConfigService.get(id).subscribe({
      next: (config) => this.config.set(config),
      error: () => this.config.set(null),
    });
  }

  save() {
    if (!this.name.trim()) {
      alert("Name is required.");
      return;
    }

    this.saving.set(true);
    const dto: SaveWorkflowDto = {
      name: this.name.trim(),
      rejectionLevel: this.rejectionLevel,
      isWorkflowLevel: this.isWorkflowLevel(),
      ruleExpression: this.ruleExpression ?? "",
      violationMessage:this.violationMessage??"",
      ruleFormConfigId:this.configId,
      violationType:this.selectedViolationType(),
      root: this.configurationRoot(this.root()),
    };
    if (this.configId) dto.ruleFormConfigId = this.configId;
    const request = this.workflowId
      ? this.service.update(this.workflowId, dto)
      : this.service.create(dto);

    request.subscribe({
      next: () => this.router.navigate(["/workflows"]),
      error: () => this.saving.set(false), // the interceptor already showed the server message
    });
  }

  private configurationRoot(node: RuleNodeDto): RuleNodeDto {
    return {
      ...node,
      value: null,
      activityTypeId: null,
      children: node.children?.map((child) =>
        this.configurationRoot(child)
      ),
    };
  }
}
