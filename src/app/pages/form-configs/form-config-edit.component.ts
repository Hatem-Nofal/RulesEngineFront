import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { OPERATORS } from '../rules/rule.models';
import { CatalogField, StrategyOption } from './form-config.models';
import { FormConfigService } from './form-config.service';

interface SelectedField {
  fieldId: string;
  allowedOperators: number[]; // empty = all operators of the type
}

@Component({
  selector: 'app-form-config-edit',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ configId ? 'Edit form config' : 'Create form config' }}</h5>
        <a routerLink="/form-configs" class="btn btn-sm btn-outline-secondary">Back</a>
      </div>

      <div class="card-body">
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <label class="form-label">Name</label>
            <input
              class="form-control"
              [(ngModel)]="name"
              maxlength="200"
              placeholder="Config name"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Description</label>
            <input class="form-control" [(ngModel)]="description" maxlength="1000" />
          </div>
        
          <div class="col-12 d-flex gap-4">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                id="nested"
                [(ngModel)]="allowNestedGroups"
              />
              <label class="form-check-label" for="nested">Allow nested groups</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="active" [(ngModel)]="isActive" />
              <label class="form-check-label" for="active">Active</label>
            </div>
          </div>
        </div>

        <h6>Fields</h6>
        <div class="row g-3">
          <div class="col-md-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small">Available (tick several)</span>
              <div class="btn-group btn-group-sm">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  [disabled]="!available().length"
                  (click)="toggleAll()"
                >
                  {{ allPicked() ? 'Clear' : 'Select all' }}
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  [disabled]="picked().size === 0"
                  (click)="addPicked()"
                >
                  Add selected ({{ picked().size }})
                </button>
              </div>
            </div>
             
            <div class="list-group">
              @for (f of available(); track f.id) {
                <label class="list-group-item d-flex gap-2 align-items-start">
                  <input
                    class="form-check-input mt-1"
                    type="checkbox"
                    [checked]="picked().has(f.id)"
                    (change)="togglePick(f.id)"
                  />
                  <span>
                    {{ f.label }}
                    <div class="small text-muted">{{ f.key }} · {{ f.dataType }}</div>
                  </span>
                </label>
              } @empty {
                <div class="text-muted small">All fields are added.</div>
              }
            </div>
          </div>

          <div class="col-md-8">
            <div class="text-muted small mb-1">Selected (order = order in the builder)</div>
            @for (
              s of selected();
              track s.fieldId;
              let i = $index;
              let first = $first;
              let last = $last
            ) {
              @let f = fieldOf(s.fieldId);
              <div class="card mb-2">
                <div class="card-body py-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{ f?.label }}</strong>
                      <span class="small text-muted ms-2">{{ f?.key }} · {{ f?.dataType }}</span>
                    </div>
                    <div class="btn-group btn-group-sm">
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        [disabled]="first"
                        (click)="move(i, -1)"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        [disabled]="last"
                        (click)="move(i, 1)"
                      >
                        ↓
                      </button>
                      <button type="button" class="btn btn-outline-danger" (click)="remove(i)">
                        ✕
                      </button>
                    </div>
                  </div>

                  @if (f) {
                    <div class="mt-2 d-flex flex-wrap gap-3 align-items-center">
                      <span class="small text-muted">Allowed operators:</span>
                      @for (o of operatorsFor(f); track o.v) {
                        <div class="form-check form-check-inline m-0">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            [id]="'op-' + s.fieldId + '-' + o.v"
                            [checked]="s.allowedOperators.includes(o.v)"
                            (change)="toggleOp(i, o.v)"
                          />
                          <label class="form-check-label" [for]="'op-' + s.fieldId + '-' + o.v">{{
                            o.l
                          }}</label>
                        </div>
                      }
                      <span class="small text-muted">(none checked = all)</span>
                    </div>
                  }
                </div>
              </div>
            } @empty {
              <div class="text-muted small">No fields selected yet.</div>
            }
          </div>
        </div>

        <button type="button" class="btn btn-primary mt-3" [disabled]="saving()" (click)="save()">
          Save
        </button>
      </div>
    </div>
  `,
})
export class FormConfigEditComponent implements OnInit {
  private service = inject(FormConfigService);
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
