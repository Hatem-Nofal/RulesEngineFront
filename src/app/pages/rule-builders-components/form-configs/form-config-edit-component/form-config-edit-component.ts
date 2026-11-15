import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  CreateFormConfigEditDto,
  FormConfigListDto,
  RuleFieldCatalogDto,
  RuleFormFieldDto,
} from "@proxy/work-flows/dtos/rule-builders-dtos";
import { RuleFormConfigService } from "@proxy/work-flows/rules/rule-builders";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { isDataType, OPERATORS } from "src/app/shared/models/constant";
import {
  FieldGroup,
  FieldItem,
  GroupableField,
  UNGROUPED_LABEL,
} from "./models/fieldgroup";

@Component({
  selector: "app-form-config-edit-component",
  imports: [
    ButtonModule,
    CheckboxModule,
    FormsModule,
    InputTextModule,
    RouterLink,
    TableModule,
  ],
  templateUrl: "./form-config-edit-component.html",
  styleUrl: "./form-config-edit-component.scss",
})
export class FormConfigEditComponent implements OnInit {
  private service = inject(RuleFormConfigService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  configId: number | null = null;
  name = "";
  description = "";
  isActive = true;
  allowNestedGroups = true;

  selected = signal<RuleFormFieldDto[]>([]);
  saving = signal(false);
  loading = signal(false);
  loadFailed = signal(false);
  metadataLoaded = signal(true);
  catalog = signal<RuleFieldCatalogDto[]>([]);
  available = computed(() => {
    return this.catalog();
  });
  picked = signal<Set<number>>(new Set());
  allPicked = computed(
    () =>
      this.available().length > 0 &&
      this.available().every(
        (f) => f.id !== undefined && this.picked().has(f.id)
      )
  );

  canSave = computed(
    () =>
      !this.saving() &&
      !this.loading() &&
      this.metadataLoaded() &&
      this.selected().length > 0 &&
      this.selected().every((field) => !!field.id)
  );

  readonly groupedAvailable = computed<FieldGroup[]>(() => {
    const map = new Map<string, FieldItem[]>();

    for (const f of this.available()) {
      const name =
        (f as GroupableField).groupName?.toString().trim() || UNGROUPED_LABEL;
      const bucket = map.get(name);
      if (bucket) {
        bucket.push(f);
      } else {
        map.set(name, [f]);
      }
    }

    return [...map.entries()]
      .map(([name, fields]) => ({ name, fields }))
      .sort((a, b) => {
        if (a.name === UNGROUPED_LABEL) return 1;
        if (b.name === UNGROUPED_LABEL) return -1;
        return a.name.localeCompare(b.name);
      });
  });

  /** Names of expanded groups. Empty set = every group starts collapsed. */
  readonly expandedGroups = signal<ReadonlySet<string>>(new Set());

  isCollapsed(name: string): boolean {
    return !this.expandedGroups().has(name);
  }

  toggleCollapse(name: string): void {
    this.expandedGroups.update((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  expandAll(): void {
    this.expandedGroups.set(
      new Set(this.groupedAvailable().map((g) => g.name))
    );
  }

  collapseAll(): void {
    this.expandedGroups.set(new Set());
  }

  pickedCount(group: FieldGroup): number {
    const picked = this.picked();
    return group.fields.reduce(
      (n, f) => n + (picked.has(f.id ?? 0) ? 1 : 0),
      0
    );
  }

  isGroupAllPicked(group: FieldGroup): boolean {
    return (
      group.fields.length > 0 && this.pickedCount(group) === group.fields.length
    );
  }

  isGroupPartiallyPicked(group: FieldGroup): boolean {
    const count = this.pickedCount(group);
    return count > 0 && count < group.fields.length;
  }

  /** Select all / clear all for one group, reusing your existing togglePick. */
  toggleGroup(group: FieldGroup): void {
    const selectAll = !this.isGroupAllPicked(group);
    const picked = this.picked();
    for (const f of group.fields) {
      if (picked.has(f.id ?? 0) !== selectAll) {
        this.togglePick(f.id ?? 0);
      }
    }
  }

  ngOnInit() {
    this.service.ruleFields().subscribe((c) => this.catalog.set(c));

    const id = this.route.snapshot.paramMap.get("id");
    if (!id || id === "new") return;

    this.configId = Number(id);
    this.loading.set(true);
    this.metadataLoaded.set(false);
    this.service
      .get(this.configId)
      .pipe(
        switchMap((config) =>
          this.findListItem(this.configId ?? 0).pipe(
            map((metadata) => ({ config, metadata }))
          )
        )
      )
      .subscribe({
        next: ({ config, metadata }) => {
          this.name = config.name ?? "";
          this.allowNestedGroups = config.allowNestedGroups ?? false;
          this.selected.set(config.fields ?? []);
          if (metadata) {
            this.description = metadata.description ?? "";
            this.isActive = metadata.isActive ?? false;
            this.metadataLoaded.set(true);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loadFailed.set(true);
          this.loading.set(false);
        },
      });
  }

  operatorsFor(field: RuleFormFieldDto) {
    return isDataType(field.dataType) ? OPERATORS[field.dataType] : [];
  }

  toggleOperator(index: number, operator: number) {
    this.selected.update((fields) =>
      fields.map((field, fieldIndex) => {
        if (fieldIndex !== index) return field;
        const current = field.allowedOperators ?? [];
        return {
          ...field,
          id: field.id,
          allowedOperators: current.includes(operator)
            ? current.filter((value) => value !== operator)
            : [...current, operator],
          dataType: field.dataType,
        };
      })
    );
  }

  setMultiple(index: number, isMultiple: boolean) {
    this.selected()[index].allowedOperators = [];
    this.selected.update((fields) =>
      fields.map((field, fieldIndex) =>
        fieldIndex === index
          ? { ...field, id: field.id, isMultiple, dataType: field.dataType }
          : field
      )
    );
  }

  remove(index: number) {
    this.selected.update((fields) =>
      fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, isDeleted: true } : field
      )
    );
    this.selected.update((fields) =>
      fields.filter((_, fieldIndex) => fieldIndex !== index)
    );
  }

  save() {
    if (!this.name.trim()) {
      alert("Name is required.");
      return;
    }

    if (!this.metadataLoaded()) {
      alert(
        "Configuration details could not be loaded. Refresh the page before saving."
      );
      return;
    }

    if (!this.selected().length || this.selected().some((field) => !field.id)) {
      alert("At least one valid field is required.");
      return;
    }

    const input: CreateFormConfigEditDto = {
      name: this.name.trim(),
      description: this.description.trim() || null,
      isActive: this.isActive,
      allowNestedGroups: this.allowNestedGroups,
      fields: this.selected().map((field) => ({
        fieldId: field.id!,
        allowedOperators: field.allowedOperators?.length
          ? field.allowedOperators
          : null,
        isMultiple:
          field.dataType === "List" ? field.isMultiple ?? false : false,
        isDefault: false,
        dataType: field.dataType,
      })),
    };

    this.saving.set(true);
    const request: Observable<unknown> = this.configId
      ? this.service.update(this.configId, input)
      : this.service.create(input);

    request.subscribe({
      next: () => this.router.navigate(["/form-configs"]),
      error: () => this.saving.set(false),
    });
  }

  private findListItem(
    id: number,
    skipCount = 0
  ): Observable<FormConfigListDto | null> {
    const pageSize = 100;
    return this.service.getList({ skipCount, maxResultCount: pageSize }).pipe(
      switchMap((result) => {
        const match = (result.items ?? []).find((item) => item.id === id);
        if (match) return of(match);

        const nextSkipCount = skipCount + pageSize;
        if (
          nextSkipCount >= (result.totalCount ?? 0) ||
          !(result.items?.length ?? 0)
        ) {
          return of(null);
        }
        return this.findListItem(id, nextSkipCount);
      })
    );
  }

  togglePick(id: number) {
    this.picked.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleAll() {
    this.picked.set(
      this.allPicked()
        ? new Set()
        : new Set(
            this.available()
              .map((f) => (f.id !== undefined ? f.id : null))
              .filter((v): v is number => !!v)
          )
    );
  }
  addPicked() {
    const toAdd = this.available()
      .filter((f) => f.id !== undefined && this.picked().has(f.id))
      .map((f) => ({
        id: f.id,
        allowedOperators: [] as number[],
        isMultiple: f.dataType === "List",
        dataType: f.dataType,
      }));
    if (!toAdd.length) return;
    this.selected.update((list) => [...list, ...toAdd]);
    this.picked.set(new Set());
  }
  fieldOf(id: number): RuleFieldCatalogDto | undefined {
    return this.catalog().find((f) => f.id === id);
  }
}
