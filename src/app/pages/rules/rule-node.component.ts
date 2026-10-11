import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  defaultValue,
  isListOperator,
  Lookup,
  OPERATORS,
  operatorIds,
  RuleField,
  RuleNode,
} from './rule.models';

/** Recursive builder node: renders a Group (AND/OR + children) or a Condition row. */
@Component({
  selector: 'app-rule-node',
  imports: [FormsModule],
  template: `
    @let n = node();
    @if (n.nodeType === 1) {
      <div class="group">
        <div class="bar">
          <select
            class="form-select form-select-sm w-auto"
            [ngModel]="n.logicalOperator"
            (ngModelChange)="patch({ logicalOperator: $event })"
          >
            <option [ngValue]="1">AND</option>
            <option [ngValue]="2">OR</option>
          </select>
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="addCondition()">
            + Condition
          </button>
          @if (allowGroups()) {
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="addGroup()">
              + Group
            </button>
          }
          @if (!isRoot()) {
            <button type="button" class="btn btn-sm btn-outline-danger" (click)="remove.emit()">
              ✕
            </button>
          }
        </div>

        @for (c of n.children; track $index) {
          <app-rule-node
            [node]="c"
            [fields]="fields()"
            [items]="items()"
            [allowGroups]="allowGroups()"
            [isRoot]="false"
            (nodeChange)="updateChild($index, $event)"
            (remove)="removeChild($index)"
          />
        }
        @if (n.children.length === 0) {
          <small class="text-muted">No conditions yet.</small>
        }
      </div>
    } @else {
      <div class="cond">
        <select
          class="form-select form-select-sm w-auto"
          [ngModel]="n.fieldKey"
          (ngModelChange)="onField($event)"
        >
          @for (f of fields(); track f.key) {
            <option [ngValue]="f.key">{{ f.label }}</option>
          }
        </select>

        @if (field(); as f) {
          <select
            class="form-select form-select-sm w-auto"
            [ngModel]="n.operator"
            (ngModelChange)="onOperator($event)"
          >
            @for (o of operators(); track o.v) {
              <option [ngValue]="o.v">{{ o.l }}</option>
            }
          </select>

          @switch (f.dataType) {
            @case ('Number') {
              <input
                type="number"
                class="form-control form-control-sm w-auto"
                [ngModel]="n.value"
                (ngModelChange)="patch({ value: $event })"
              />
            }
            @case ('Enum') {
           
                <select
                  class="form-select form-select-sm w-auto"
                  [ngModel]="n.value"
                  (ngModelChange)="patch({ value: $event })"
                >
                  <option [ngValue]="null">Select…</option>
                  @for (o of f.options ?? []; track o) {
                    <option [ngValue]="o">{{ o }}</option>
                  }
                </select>
               
            }
            @case ('ItemList') {
              <select
                class="form-select form-select-sm w-auto"
                [ngModel]="n.value"
                (ngModelChange)="patch({ value: $event })"
              >
                <option [ngValue]="null">Select item…</option>
                @for (i of items(); track i.id) {
                  <option [ngValue]="i.id">{{ i.name }}</option>
                }
              </select>
            }
            @case ('MultipleSelect') {
              <details class="code-list-dropdown">
                <summary class="code-list-trigger" aria-label="Select one or more codes">
                  @let selectedCount = codeSelectionCount(n.value);
                  <span>{{ selectedCount ? selectedCount + ' selected' : 'Select codes' }}</span>
                </summary>
                <div class="code-list-options" role="group" aria-label="Available codes">
                  @for (i of items(); track i.id) {
                    <label class="code-list-option">
                      <input
                        type="checkbox"
                        [checked]="isCodeSelected(n.value, i.id)"
                        (change)="toggleCode(i.id)"
                      />
                      <span>{{ i.name }}</span>
                    </label>
                  }
                  @if (items().length === 0) {
                    <span class="code-list-empty">No codes available.</span>
                  }
                </div>
              </details>
            }
            @default {
              <input
                type="text"
                class="form-control form-control-sm w-auto"
                [ngModel]="n.value"
                (ngModelChange)="patch({ value: $event })"
              />
            }
          }
        } @else {
          <span class="text-warning">Field no longer available in this workflow's form.</span>
        }

        <button type="button" class="btn btn-sm btn-outline-danger" (click)="remove.emit()">
          ✕
        </button>
      </div>
    }
  `,
  styles: [
    `
      .group {
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 0.75rem;
        margin: 0.5rem 0;
        background: rgba(148, 163, 184, 0.08);
      }
      .bar,
      .cond {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
      }
      .cond {
        margin: 0.35rem 0;
      }
      .code-list-dropdown {
        position: relative;
      }
      .code-list-dropdown[open] {
        z-index: 2;
      }
      .code-list-trigger {
        display: flex;
        min-width: 10rem;
        max-width: min(18rem, calc(100vw - 2rem));
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.375rem 0.75rem;
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
        background: #fff;
        color: #212529;
        cursor: pointer;
        font-size: 0.875rem;
        list-style: none;
      }
      .code-list-trigger::-webkit-details-marker {
        display: none;
      }
      .code-list-trigger::after {
        width: 0.5rem;
        height: 0.5rem;
        border-right: 1.5px solid currentColor;
        border-bottom: 1.5px solid currentColor;
        content: '';
        transform: translateY(-0.125rem) rotate(45deg);
      }
      .code-list-dropdown[open] .code-list-trigger::after {
        transform: translateY(0.125rem) rotate(225deg);
      }
      .code-list-trigger:focus-visible {
        border-color: #0d6efd;
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
      }
      .code-list-options {
        position: absolute;
        top: calc(100% + 0.25rem);
        left: 0;
        z-index: 3;
        width: min(18rem, calc(100vw - 2rem));
        max-height: 15rem;
        overflow-y: auto;
        padding: 0.375rem;
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
        background: #fff;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }
      .code-list-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
      }
      .code-list-option:hover {
        background: #f1f3f5;
      }
      .code-list-option input {
        flex: 0 0 auto;
        accent-color: #0d6efd;
      }
      .code-list-empty {
        display: block;
        padding: 0.375rem 0.5rem;
        color: #6c757d;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class RuleNodeComponent {
  node = model.required<RuleNode>();
  fields = input.required<RuleField[]>();
  items = input<Lookup[]>([]);
  allowGroups = input(true);
  isRoot = input(false);
  remove = output<void>();

  field = computed(() => this.fields().find((f) => f.key === this.node().fieldKey));

  operators = computed(() => {
    const f = this.field();
    if (!f) return [];
    const ids = operatorIds(f);
    return OPERATORS[f.dataType].filter((o) => ids.includes(o.v));
  });

  patch(p: Partial<RuleNode>) {
    this.node.update((n) => ({ ...n, ...p }));
  }

  isList(op?: number | null) {
    return isListOperator(op);
  }

  onField(key: string) {
    const f = this.fields().find((x) => x.key === key);
    if (!f) return;
    const op = operatorIds(f)[0];
    this.patch({ fieldKey: key, operator: op, value: defaultValue(f, op) });
  }

  /** Switching between single (Equals) and list (In) operators converts the value shape. */
  onOperator(op: number) {
    const f = this.field();
    const v = this.node().value;
    let value = v;
    if (f?.dataType === 'MultipleSelect') {
      if (isListOperator(op)) value = Array.isArray(v) ? v : v ? [v] : [];
      else value = Array.isArray(v) ? (v[0] ?? null) : v;
    }
    this.patch({ operator: op, value });
  }

  toggleValue(option: string) {
    const current: string[] = Array.isArray(this.node().value) ? this.node().value : [];
    this.patch({
      value: current.includes(option) ? current.filter((x) => x !== option) : [...current, option],
    });
  }

  codeSelectionCount(value: unknown): number {
    return this.selectedCodes(value).length;
  }

  isCodeSelected(value: unknown, id: string): boolean {
    return this.selectedCodes(value).includes(id);
  }

  toggleCode(id: string) {
    const current = this.selectedCodes(this.node().value);
    this.patch({
      value: current.includes(id) ? current.filter((code) => code !== id) : [...current, id],
    });
  }

  private selectedCodes(value: unknown): string[] {
    if (Array.isArray(value)) return value.filter((code): code is string => typeof code === 'string');
    return typeof value === 'string' ? [value] : [];
  }

  addCondition() {
    const f = this.fields()[0];
    if (!f) return;
    const op = operatorIds(f)[0];
    this.patch({
      children: [
        ...this.node().children,
        { nodeType: 2, fieldKey: f.key, operator: op, value: defaultValue(f, op), children: [] },
      ],
    });
  }

  addGroup() {
    this.patch({
      children: [...this.node().children, { nodeType: 1, logicalOperator: 1, children: [] }],
    });
  }

  updateChild(i: number, c: RuleNode) {
    this.patch({ children: this.node().children.map((x, idx) => (idx === i ? c : x)) });
  }

  removeChild(i: number) {
    this.patch({ children: this.node().children.filter((_, idx) => idx !== i) });
  }
}
