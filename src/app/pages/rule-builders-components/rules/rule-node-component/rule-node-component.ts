import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LookupDto } from '@proxy/lookups/dtos';
import { RuleFormFieldDto, RuleNodeDto } from '@proxy/work-flows/dtos/rule-builders-dtos';
import { defaultValue, isListOperator, operatorIds, OPERATORS } from 'src/app/shared/models/constant';

@Component({
  selector: 'app-rule-node-component',
  imports: [FormsModule],
  templateUrl: './rule-node-component.html',
  styleUrl: './rule-node-component.scss',
})
export class RuleNodeComponent {
  node = model.required<RuleNodeDto>();
  fields = input.required<RuleFormFieldDto[]>();
  items = input<LookupDto[]>([]);
  allowGroups = input(true);
  isRoot = input(false);
  remove = output<void>();

  field = computed(() => this.fields().find((f) => f.key === this.node().fieldKey));

  operators = computed(() => {
    const f = this.field();
    if (!f||!f.dataType) return [];
    const ids = operatorIds(f);
   // return OPERATORS[+f.dataType].filter((o) => ids.includes(o.v));
  });

  patch(p: Partial<RuleNodeDto>) {
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
    // this.patch({
    //   children: [
    //     ...this.node().children,
    //     { nodeType: 2, fieldKey: f.key, operator: op, value: defaultValue(f, op), children: [] },
    //   ],
    // });
  }

  addGroup() {
    // this.patch({
    //   children: [...this.node().children, { nodeType: 1, logicalOperator: 1, children: [] }],
    // });
  }

  updateChild(i: number, c: RuleNodeDto) {
   // this.patch({ children: this.node().children.map((x, idx) => (idx === i ? c : x)) });
  }

  removeChild(i: number) {
  //  this.patch({ children: this.node().children.filter((_, idx) => idx !== i) });
  }
}

