export interface Column {
  field: string;
  header: string;
  width?: string;
  type?: 'text' | 'date' | 'boolean' | 'status' | 'number' | 'count'| 'link'|'date-time';
  format?: string;
  sortable?: boolean;
  filterable?: boolean;
  routerLink?:string;
  linkPermission?:boolean;
  severity?: (value: any) => string;
}

export interface TableConfig {
  selectable?: boolean;
  filterable?: boolean;
  globalFilterFields?: string[];
  rowsPerPage?: number;
  loading?: boolean;
  showPaginator?: boolean;
  responsive?: boolean;
  scrollable?: boolean;
  resizableColumns?: boolean;
  sortMode?: 'single' | 'multiple';
  defaultSortField?: string;
  defaultSortOrder?: 1 | -1;
  actions: boolean;
}

export interface TableState {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: number;
  filters?: { [key: string]: any };
}

export interface PaginationInfo {
  pageSize?: number;
  pageNumber?: number;
  totalItems?: number;
  totalPages?: number;
}
export interface actions {
  audit?: boolean;
  assignTo?:boolean;
  edit?:boolean;
  viewbatches?:boolean;
  viewClaims?:boolean;
  details?:boolean;
  viewBatchClaims?:boolean;
  delete?:boolean;
  ViewFamilyTree?: boolean;
  moveBeneficiary?: boolean;
  splitBeneficiary?: boolean;
 }
