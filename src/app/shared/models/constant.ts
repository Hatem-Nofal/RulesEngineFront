import { RuleFormFieldDto, RuleNodeDto } from '@proxy/work-flows/dtos/rule-builders-dtos';

export type NodeType = 1 | 2; // 1 = Group, 2 = Condition
export type DataType = 'Number' | 'String' | 'Enum' | 'ItemList' | 'MultipleSelect';

export const OPERATORS: Record<DataType, { v: number; l: string }[]> = {
  Number: [
    { v: 1, l: '=' },
    { v: 2, l: '≠' },
    { v: 3, l: '>' },
    { v: 4, l: '≥' },
    { v: 5, l: '<' },
    { v: 6, l: '≤' },
  ],
  String: [
    { v: 1, l: 'Equals' },
    { v: 2, l: 'Not equals' },
  ],
  Enum: [
    { v: 1, l: 'Equals' },
    { v: 2, l: 'Not equals' },
  ],
  ItemList: [
    { v: 1, l: 'Equals' },
    { v: 2, l: 'Not equals' },
  ],
  MultipleSelect: [
    { v: 7, l: 'Contains' },
    { v: 8, l: 'Not contains' },
  ],
};

export const emptyRoot = (): RuleNodeDto => ({ nodeType: 1, logicalOperator: 1, children: [] });

export const operatorIds = (f: RuleFormFieldDto): number[] =>
  f.allowedOperators?.length ? f.allowedOperators : f.dataType ? OPERATORS[f.dataType].map(o => o.v) : [];

/** In / Not in take several values; every other operator takes one. */
export const isListOperator = (op?: number | null): boolean => op === 7 || op === 8;

export const defaultValue = (f: RuleFormFieldDto, op?: number | null): any =>
  f.dataType === 'MultipleSelect' || (f.dataType === 'Enum' && isListOperator(op)) ? [] : null;
