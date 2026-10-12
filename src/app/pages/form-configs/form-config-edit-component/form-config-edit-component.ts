import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RuleFormConfigService } from '@proxy/rule-builder/api';
import { WorkFlowService } from '@proxy/work-flows';
import { WorkflowDto } from '@proxy/work-flows/dtos';


@Component({
  selector: 'app-form-config-edit-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './form-config-edit-component.html',
  styleUrl: './form-config-edit-component.scss',
})
export class FormConfigEditComponent implements OnInit {
  private service = inject(RuleFormConfigService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  configId: string | null = null;
  name = '';
  description = '';
  isActive = true;
  allowNestedGroups = true;

  strategies = signal<StrategyOption[]>([]);
  catalog = signal<CatalogField[]>([]);
  selected = signal<SelectedField[]>([]);
  saving = signal(false);

  available = computed(() => {
    const used = new Set(this.selected().map((s) => s.fieldId));
    return this.catalog().filter((f) => !used.has(f.id));
  });

  picked = signal<Set<string>>(new Set());
  allPicked = computed(
    () => this.available().length > 0 && this.available().every((f) => this.picked().has(f.id)),
  );

  ngOnInit() {
    this.service.getCatalog().subscribe((c) => this.catalog.set(c));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') return;

    this.configId = id;
    this.service.get(id).subscribe((c) => {
      this.name = c.name;
      this.description = c.description ?? '';
      this.isActive = c.isActive;
      this.allowNestedGroups = c.allowNestedGroups;
      this.selected.set(
        c.fields.map((f) => ({ fieldId: f.fieldId, allowedOperators: f.allowedOperators ?? [] })),
      );
    });
  }

  fieldOf(id: string) {
    return this.catalog().find((f) => f.id === id);
  }

  operatorsFor(f: CatalogField) {
    return OPERATORS[f.dataType];
  }

  togglePick(id: string) {
    this.picked.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleAll() {
    this.picked.set(this.allPicked() ? new Set() : new Set(this.available().map((f) => f.id)));
  }

  /** Adds every ticked field (in catalog order) in one go. */
  addPicked() {
    const toAdd = this.available()
      .filter((f) => this.picked().has(f.id))
      .map((f) => ({ fieldId: f.id, allowedOperators: [] as number[] }));
    if (!toAdd.length) return;
    this.selected.update((list) => [...list, ...toAdd]);
    this.picked.set(new Set());
  }

  remove(i: number) {
    this.selected.update((list) => list.filter((_, idx) => idx !== i));
  }

  move(i: number, delta: number) {
    this.selected.update((list) => {
      const j = i + delta;
      if (j < 0 || j >= list.length) return list;
      const copy = [...list];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  toggleOp(i: number, op: number) {
    this.selected.update((list) =>
      list.map((s, idx) =>
        idx !== i
          ? s
          : {
              ...s,
              allowedOperators: s.allowedOperators.includes(op)
                ? s.allowedOperators.filter((x) => x !== op)
                : [...s.allowedOperators, op],
            },
      ),
    );
  }

  save() {
    if (!this.name.trim()) {
      alert('Name is required.');
      return;
    }

    if (this.selected().length === 0) {
      alert('Add at least one field.');
      return;
    }

    this.saving.set(true);
    const dto = {
      name: this.name.trim(),
      description: this.description.trim() || null,
      isActive: this.isActive,
      allowNestedGroups: this.allowNestedGroups,
      fields: this.selected().map((s) => ({
        fieldId: s.fieldId,
        allowedOperators: s.allowedOperators.length ? s.allowedOperators : null,
      })),
    };

    const request: Observable<unknown> = this.configId
      ? this.service.update(this.configId, dto)
      : this.service.create(dto);

    request.subscribe({
      next: () => this.router.navigate(['/form-configs']),
      error: () => this.saving.set(false), // the interceptor already showed the server message
    });
  }
}
