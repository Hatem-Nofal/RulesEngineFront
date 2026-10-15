import { RuleFormFieldDto, RuleNodeDto } from '@proxy/work-flows/dtos/rule-builders-dtos';
import { RuleNodeType } from '@proxy/common/enums/rule-node-type.enum';

export type NodeType = RuleNodeType;
export type DataType = 'Number' | 'Decimal' | 'String' | 'Enum' | 'List'   | 'DateTime';

export const isDataType = (value?: string | null): value is DataType =>
  value === 'Number' ||
  value === 'String' ||
  value === 'Enum' ||
  value === 'List' ||

  value === 'DateTime'||value === 'Decimal';

export const FieldDataTypes = [
  { Id: 1, Name: 'List' },
  { Id: 2, Name: 'Number' },
  { Id: 3, Name: 'Text' },
  { Id: 4, Name: 'Decimal' },
  { Id: 5, Name: 'DateTime' },
] as const;

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
  List: [
    { v: 1, l: 'Equals' },
    { v: 2, l: 'Not equals' },
    { v: 7, l: 'Contains' },
    { v: 8, l: 'Not contains' },
  ],

  DateTime: [
   { v: 1, l: '=' },
    { v: 2, l: '≠' },
    { v: 3, l: '>' },
    { v: 4, l: '≥' },
    { v: 5, l: '<' },
    { v: 6, l: '≤' },
  ],
  Decimal: [
  { v: 1, l: '=' },
    { v: 2, l: '≠' },
    { v: 3, l: '>' },
    { v: 4, l: '≥' },
    { v: 5, l: '<' },
    { v: 6, l: '≤' },
  ]
};

export const emptyRoot = (): RuleNodeDto => ({
  nodeType: RuleNodeType.Group,
  logicalOperator: 1,
  children: [],
});

export const operatorIds = (f: RuleFormFieldDto): number[] =>
  f.allowedOperators?.length
    ? f.allowedOperators
    : isDataType(f.dataType)
      ? OPERATORS[f.dataType].map(o => o.v)
      : [];

/** In / Not in take several values; every other operator takes one. */
export const isListOperator = (op?: number | null): boolean => op === 7 || op === 8;

export const defaultValue = (f: RuleFormFieldDto, op?: number | null): unknown =>
  ((f.dataType === 'List' && f.isMultiple)  ) ||
  (f.dataType === 'Enum' && isListOperator(op))
    ? []
    : null;

export const isCollectionType = (t: DataType): boolean => t === 'List'  ;
