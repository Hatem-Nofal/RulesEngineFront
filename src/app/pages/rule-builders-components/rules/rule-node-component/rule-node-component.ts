import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LookupDto } from '@proxy/lookups/dtos';
import { RuleFormFieldDto, RuleNodeDto } from '@proxy/work-flows/dtos/rule-builders-dtos';
import { RuleNodeType } from '@proxy/common/enums/rule-node-type.enum';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import {
  defaultValue,
  isCollectionType,
  isDataType,
  isListOperator,
  operatorIds,
  OPERATORS,
} from 'src/app/shared/models/constant';

@Component({
  selector: 'app-rule-node',
  imports: [ButtonModule, FormsModule, InputTextModule, MultiSelectModule, SelectModule],
  templateUrl: './rule-node-component.html',
  styleUrl: './rule-node-component.scss',
})
export class RuleNodeComponent {
  node = model.required<RuleNodeDto>();
  fields = input.required<RuleFormFieldDto[]>();
  /** Preloaded options keyed by lookup source or field key. */
  lookups = input<Record<string, LookupDto[]>>({});
  allowGroups = input(true);
  isRoot = input(false);
  remove = output<void>();

  logicalOperators = [
    { value: 1, label: 'AND' },
    { value: 2, label: 'OR' },
  ];

  field = computed(() => this.fields().find(f => f.key === this.node().fieldKey));

  operators = computed(() => {
    const f = this.field();
    if (!f || !isDataType(f.dataType)) return [];
    const ids = operatorIds(f);
    return OPERATORS[f.dataType as keyof typeof OPERATORS].filter(o => ids.includes(o.v));
  });

  patch(p: Partial<RuleNodeDto>) {
    this.node.update(n => ({ ...n, ...p }));
  }

  isCollection(f: RuleFormFieldDto) {
    if (!f.dataType || !isDataType(f.dataType)) return false;
    return isCollectionType(f.dataType);
  }
  isMultipleSelect(f: RuleFormFieldDto) {
    if (!f.dataType || !isDataType(f.dataType)) return false;
    return isCollectionType(f.dataType) && f.isMultiple;
  }

  loadOptionsForField(fieldKey?: string | null): LookupDto[] {
    if (
      fieldKey == 'Activities' ||
      fieldKey == 'PrimaryActivity' ||
      fieldKey == 'SecondaryActivity'
    )
      return [
        { id: 'item1', name: 'item1' },
        { id: 'item2', name: 'item2' },
      ];
    else if (fieldKey == 'Diagnoses') {
      return [
        { id: 'item3', name: 'item3' },
        { id: 'item4', name: 'item4' },
      ];
    }
    return [];
  }

  /** Older rules stored a single string; the editor always works with a list. */
  asArray(v: unknown): string[] {
    return Array.isArray(v) ? v : v ? [String(v)] : [];
  }



  isList(op?: number | null) {
    return isListOperator(op);
  }

  onField(key: string) {
    const f = this.fields().find(x => x.key === key);
    if (!f) return;
    const op = operatorIds(f)[0];
    this.patch({ fieldKey: key, operator: op, value: defaultValue(f, op) ,isMultiple:f.isMultiple});
  }

  /** Switching between single (Equals) and list (In) operators converts the value shape. */
  onOperator(op: number) {
    const f = this.field();
    const v = this.node().value;
    let value = v;
    if (f?.dataType === 'Enum') {
      if (isListOperator(op)) value = Array.isArray(v) ? v : v ? [v] : [];
      else value = Array.isArray(v) ? (v[0] ?? null) : v;
    } else if (f && isDataType(f.dataType) && isCollectionType(f.dataType)) {
      if (this.isMultipleSelect(f)) value = Array.isArray(v) ? v : v == null ? [] : [v];
      else value = Array.isArray(v) ? (v[0] ?? null) : v;
    }
    this.patch({ operator: op,value: value  ,isMultiple:f?.isMultiple});
  }

  toggleValue(option: string) {
    const current: string[] = Array.isArray(this.node().value) ? this.node().value : [];
    this.patch({
      value: current.includes(option) ? current.filter(x => x !== option) : [...current, option],
    });
  }

  addCondition() {
    const f = this.fields()[0];
    if (!f) return;

    const op = operatorIds(f)[0];
    const children = this.node().children ?? [];
    const firstGroupIndex = children.findIndex(child => child.logicalOperator != null);
    const insertAt = firstGroupIndex === -1 ? children.length : firstGroupIndex;
    const condition: RuleNodeDto = {
      nodeType: RuleNodeType.Condition,
      logicalJoinOperator: 1,
      fieldKey: f.key,
      operator: op,
      value: defaultValue(f, op),
      children: [],
      isMultiple:f.isMultiple
    };
    this.patch({
      children: [
        ...children.slice(0, insertAt),
        condition,
        ...children.slice(insertAt),
      ],
    });
  }

  addGroup() {
    this.patch({
      children: [
        ...(this.node().children ?? []),
        {
          nodeType: RuleNodeType.Group,
          logicalOperator: 1,
          logicalJoinOperator: 1,
          children: [],
        },
      ],
    });
  }

  /** Sets the AND / OR that connects child i to the previous child. */
  setJoin(i: number, op: number) {
    const children = this.node().children ?? [];
    const child = children[i];
    if (!child) return;

    this.patch({
      children: children.map((current, index) =>
        index === i ? { ...current, logicalJoinOperator: op } : current,

      ),
      isMultiple:child.isMultiple
    });
  }

  updateChild(previousChild: RuleNodeDto, updatedChild: RuleNodeDto) {
    const children = this.node().children ?? [];
    const childIndex = children.indexOf(previousChild);
    if (childIndex === -1) return;

    const child =
      updatedChild.nodeType === RuleNodeType.Group
        ? updatedChild
        : { ...updatedChild, nodeType: RuleNodeType.Condition };
    this.patch({
      children: children.map((current, index) => (index === childIndex ? child : current)),
      isMultiple:child.isMultiple
    });
  }

  removeChild(i: number) {
    this.patch({
      children: (this.node().children ?? []).filter((_: any, idx: number) => idx !== i),
    });
  }
  onValueChange(value: string): void {
  this.patch({
    value: value === '' ? null : Number(value)
  });
}
}
