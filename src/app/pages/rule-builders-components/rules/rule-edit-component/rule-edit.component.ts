import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { RuleNodeComponent } from "../rule-node-component/rule-node-component";
import { RuleService } from "@proxy/work-flows/rules";
import {
  RuleFormConfigDto,
  RuleNodeDto,
} from "@proxy/work-flows/dtos/rule-builders-dtos";
import { RuleExpressionResultDto } from "@proxy/work-flows/rules/rule-expression-builders";
import { emptyRoot } from "src/app/shared/models/constant";
import { RuleFormConfigService } from "@proxy/rule-builder/api/rule-form-config.service";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { LookupService } from "@proxy/ehealth-claims/lookups";
import {
  SelectedDropDownList,
  SelectedDropDownListByGuid,
} from "@proxy/common/dtos";
import { ViolationType } from "@proxy/common/enums";

import { CustomConfirmationService } from "src/app/shared/services/customConfirmation.service";
import { LookupDto } from "@proxy/lookups/dtos";
@Component({
  selector: "app-rule-edit",
  imports: [
    ButtonModule,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    RouterLink,
    RuleNodeComponent,
    SelectModule,
  ],
  templateUrl: "./rule-edit.component.html",
  styleUrl: "./rule-edit.component.scss",
})
export class RuleEditComponent implements OnInit {
  private service = inject(RuleService);
  private lookupService = inject(LookupService);
  private ruleFormConfigService = inject(RuleFormConfigService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected readonly customConfirmationService = inject(
    CustomConfirmationService
  );

  ruleId: string | null = null;
  name = signal<string | null>("");
  violationMessage = signal<string | null>("");

  isActive = signal<boolean>(false);

  workflows = signal<SelectedDropDownListByGuid[]>([]);
  workflowId = signal<string | null>(null);
   config = signal<RuleFormConfigDto | null>(null);
  root = signal<RuleNodeDto>(emptyRoot());
  loading = signal(false);
  saving = signal(false);
  expression = signal<RuleExpressionResultDto | null>(null);
  hasCustomeRule = signal<boolean>(false);
  ruleExpression = signal<string>("");
  selectedViolationType = signal<ViolationType>(ViolationType.Error);
  violationTypes = signal<LookupDto[]>([]);

  ngOnInit() {
    this.violationTypes.set(
      Object.entries(ViolationType)
        .filter(([key]) => isNaN(Number(key)))
        .map(([key, value]) => ({
          id: String(value),
          name: key,
        }))
    );
    this.lookupService.getWorkflowsDropDownList().subscribe({
      next: (result) => {
        const options: SelectedDropDownListByGuid[] = [];
        for (const workflow of result ?? []) {
          if (workflow.id)
            options.push({ id: workflow.id, name: workflow.name });
        }
        this.workflows.set(options);
      },
    });

    const id = this.route.snapshot.paramMap.get("id");
    if (!id || id === "new") return;

    this.ruleId = id;
    this.loading.set(true);
    this.service.get(id).subscribe({
      next: (rule) => {
        let ruleExpressionResultDto: RuleExpressionResultDto = {
          expression: rule.expression ?? "",
        };
        this.name.set(rule.name ?? "");
        this.isActive.set(rule.isActive ?? true);
        this.workflowId.set(rule.workflowId ?? null);
        this.hasCustomeRule.set(rule.workflowHasCustomeRule ?? false);
        this.ruleExpression.set(rule.expression ?? "");
        this.expression.set(ruleExpressionResultDto);
        this.violationMessage.set(rule.violationMessage??"")
        this.selectedViolationType.set(rule.violationType??ViolationType.Error)

        this.root.set(rule.root ?? emptyRoot());
        if (rule.workflowId && !this.hasCustomeRule())
          this.loadConfig(rule.workflowId);
        else this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onWorkflowChange(id: string | null) {
    this.workflowId.set(id);
    this.config.set(null);
    this.expression.set(null);
    this.root.set(emptyRoot()); // conditions from another config may not fit
    if (id && !this.hasCustomeRule()) this.loadConfig(id);
  }

  private loadConfig(workflowId: string) {
    this.loading.set(true);
    this.ruleFormConfigService.getByWorkflow(workflowId).subscribe({
      next: (cfg) => {
        this.config.set(cfg);
        this.loading.set(false);
      },
      error: () => {
        this.config.set(null);
        this.loading.set(false);
      },
    });
  }

  private isValid(node: RuleNodeDto): boolean {
    if (node.nodeType === 1) {
      const children = node.children ?? [];
      return (
        children.length > 0 && children.every((child) => this.isValid(child))
      );
    }
    const v = node.value;
    const empty =
      v === null ||
      v === undefined ||
      v === "" ||
      (Array.isArray(v) && v.length === 0);
    return !!node.fieldKey && !!node.operator && !empty;
  }

  preview() {
    if (!this.workflowId() || !this.isValid(this.root())) {
      this.customConfirmationService.error(
        "Complete the conditions first.",
        "Error",
        5000
      );
      return;
    }
    if (!this.hasCustomeRule()) {
      this.service
        .previewExpressionByInput({
          id: this.ruleId,
          name: this.name()?.trim() || "preview",
          workflowId: this.workflowId()!,
          isActive: this.isActive(),
          violationMessage: this.violationMessage(),
          violationType: this.selectedViolationType(),
          root: this.root(),
        })
        .subscribe((e) => this.expression.set(e));
    }
  }

  save() {
    if (!this.selectedViolationType() || !this.workflowId()) {
      this.customConfirmationService.error(
        "violationType and workflow are required.",
        "Error",
        5000
      );
      return;
    }
    if (!this.isValid(this.root())) {
      this.customConfirmationService.error(
        "Every group needs at least one condition and every condition needs a value",
        "Error",
        5000
      );

      return;
    }

    this.saving.set(true);
    const input = {
      id: this.ruleId,
      name: this.name()?.trim(),
      workflowId: this.workflowId()!,
      isActive: this.isActive(),
      root: this.root(),
      violationType: this.selectedViolationType(),
      violationMessage: this.violationMessage(),
    };
    const request = this.ruleId
      ? this.service.update(this.ruleId, input)
      : this.service.create(input);

    request.subscribe({
      next: () => this.router.navigate(["/rules"]),
      error: () => this.saving.set(false),
    });
  }
}
