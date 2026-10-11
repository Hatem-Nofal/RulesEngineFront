import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { PrimengTableHelper } from 'src/assets/config/primeng-table-helper';
import { actions, Column, PaginationInfo, TableConfig, TableState } from '../../models/table.model';

@Component({
  selector: 'app-shared-table',
  standalone: false,
  templateUrl: './shared-table.component.html',
  styleUrls: ['./shared-table.component.scss'],
  providers: [PrimengTableHelper],
})
export class SharedTableComponent implements OnInit, OnChanges {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
@Output() moveBeneficiary = new EventEmitter<any>();
@Output() splitBeneficiary = new EventEmitter<any>();
  page: { sorting?: string; skipCount?: number; maxResultCount?: number } = {};
  _externalFilterData;
  @Input() _externalFilter: any = null; // External filter data to be passed to the table component

  @Input() set columns(value: Column[]) {
    this.columnsSignal.set(value || []);
  }
  @Input() set data(value: any[]) {
    this.dataSignal.set(value || []);
  }
  @Input() set config(value: TableConfig) {
    this.configSignal.set({
      selectable: false,
      filterable: true,
      globalFilterFields: [],
      rowsPerPage: 10,
      loading: false,
      showPaginator: true,
      responsive: true,
      scrollable: true,
      resizableColumns: false,
      sortMode: 'single',
      defaultSortField: 'id',
      defaultSortOrder: 1,
      ...value,
    });
  }
  @Input() set paginationInfo(value: PaginationInfo) {
    if (value) {
      this.paginationInfoSignal.set({
        pageSize: value.pageSize || 10,
        pageNumber: value.pageNumber || 1,
        totalItems: value.totalItems || 0,
        totalPages: value.totalPages || 0,
      });
    }
  }
  @Input() set actions(value: actions) {
    this.actionsConfig.set(value);
  }
  @Output() deleteItem = new EventEmitter<number>();

  @Output() openAssignToDialog = new EventEmitter<{ id: number; orgId: number; show: boolean }>(
    false
  );
  
  @Output() getPaginatedData = new EventEmitter<{
    sorting?: string;
    skipCount?: number;
    maxResultCount?: number;
  }>();
  columnsSignal = signal<Column[]>([]);
  dataSignal = signal<any[]>([]);
  configSignal = signal<TableConfig>({
    selectable: false,
    filterable: true,
    globalFilterFields: [],
    rowsPerPage: 10,
    loading: false,
    showPaginator: true,
    responsive: true,
    scrollable: true,
    resizableColumns: false,
    sortMode: 'single',
    defaultSortField: '',
    defaultSortOrder: 1,
    actions: false,
  });

  actionsConfig = signal<actions>({
    edit: false,
    details: false,
    assignTo: false,
    audit: false,
    viewbatches: false,
    viewClaims: false,
    viewBatchClaims: false,
    delete:false,
    ViewFamilyTree: false,
    moveBeneficiary: false,
    splitBeneficiary: false
  });

  paginationInfoSignal = signal<PaginationInfo>({
    pageSize: 10,
    pageNumber: 1,
    totalItems: 0,
    totalPages: 0,
  });

  // Computed signals for derived state
  readonly hasData = computed(() => this.dataSignal().length > 0);
  readonly currentPage = computed(() => this.paginationInfoSignal().pageNumber || 1);
  readonly totalPages = computed(() => this.paginationInfoSignal().totalPages || 0);

  selectedItems: any[] = [];
  globalFilterValue: string = '';
  ltr: boolean = document.dir !== 'rtl';

  tableState: TableState = {
    first: 0,
    rows: 10,
    sortField: '',
    sortOrder: 1,
    filters: {},
  };

  records: any[] = [];
  items: MenuItem[] | undefined;
  visible: boolean = false;
  basePath: string;
  rowsPerPage = 50;
  constructor(public primengTableHelper: PrimengTableHelper, private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns'] || changes['config']) {
      this.initializeTable();
    }
    if (changes['_externalFilter'] && !changes['_externalFilter'].firstChange) {
      this._externalFilterData = changes['_externalFilter'].currentValue;
      this.setPaginatedData(
        { first: 0, rows: this.configSignal().rowsPerPage || 10 } as LazyLoadEvent,
        this._externalFilterData
      ); // Call loadData with the new filter
    }
  }

  ngOnInit() {
    this.initializeTable();
    this.setDropdownRoutes();
  }

  private initializeTable(): void {
    try {
      this.records = [...this.dataSignal()];
      this.primengTableHelper.totalRecordsCount = this.paginationInfoSignal().totalItems || 0;
      this.primengTableHelper.records = this.records;
      this.primengTableHelper.defaultRecordsCountPerPage =
        this.paginationInfoSignal().pageSize || 10;
      const currentInfo = this.paginationInfoSignal();
      this.paginationInfoSignal.update(info => ({
        ...info,
        totalItems: this.dataSignal().length,
        totalPages: Math.ceil(this.dataSignal().length / info.pageSize),
      }));
      this.loadData({ first: 0, rows: this.configSignal().rowsPerPage || 10 } as LazyLoadEvent);
    } catch (error) {
      console.error('Error initializing table:', error);
      this.records = [];
      this.paginationInfoSignal.update(info => ({
        ...info,
        totalItems: 0,
        totalPages: 0,
      }));
    }
  }

  getRecordsIfNeeds(event: LazyLoadEvent, externalFilteredData?: any): void {
    if (!event) return;

    if (this.primengTableHelper.shouldResetPaging(event)) {
      if (this.paginator) {
        this.paginator.changePage(0);
      }
      return;
    }

    this.primengTableHelper.showLoadingIndicator();
    this.loadData(event, externalFilteredData);
  }

  loadData(event: LazyLoadEvent, externalFilteredData?: any[]) {
    this.primengTableHelper.showLoadingIndicator();

    try {
      let filteredData = [...this.dataSignal()];

      // Apply filtering
      filteredData = this.filterData(filteredData, event);
      // Apply sorting
      if (event.sortField) {
        // filteredData = this.sortData(filteredData, event);
        this.setPaginatedData(event);
      }

      // Calculate pagination
      const startIndex = event.first || 0;
      const endIndex = startIndex + (event.rows || 10);

      // Update records and pagination info
      this.records = filteredData.slice(startIndex, endIndex);
      this.paginationInfoSignal.update(info => ({
        ...info,
        totalItems: filteredData.length,
        pageSize: event.rows || 10,
        pageNumber: Math.floor(startIndex / (event.rows || 10)) + 1,
        totalPages: Math.ceil(filteredData.length / (event.rows || 10)),
      }));
    } catch (error) {
      console.error('Error loading data:', error);
      this.records = [];
      this.paginationInfoSignal.update(info => ({
        ...info,
        totalItems: 0,
        totalPages: 0,
      }));
    } finally {
      this.primengTableHelper.hideLoadingIndicator();
    }
  }

  // private sortData(data: any[], event: LazyLoadEvent): any[] {
  //   if (!event.sortField) return data;

  //   return [...data].sort((a, b) => {
  //     const valueA = a[event.sortField!];
  //     const valueB = b[event.sortField!];
  //     const sortOrder = event.sortOrder || 1;

  //     if (valueA === null || valueA === undefined) return 1 * sortOrder;
  //     if (valueB === null || valueB === undefined) return -1 * sortOrder;

  //     if (typeof valueA === 'string') {
  //       return valueA.localeCompare(valueB) * sortOrder;
  //     }

  //     if (valueA instanceof Date) {
  //       return (valueA.getTime() - valueB.getTime()) * sortOrder;
  //     }

  //     if (valueA < valueB) return -1 * sortOrder;
  //     if (valueA > valueB) return 1 * sortOrder;
  //     return 0;
  //   });
  // }
handleMoveBeneficiary(rowData: any): void {
  this.moveBeneficiary.emit(rowData);
}

handleSplitBeneficiary(rowData: any): void {
  this.splitBeneficiary.emit(rowData);
}
  isValidNumber(value: any): boolean {
    return (
      value !== null &&
      value !== undefined &&
      value !== '' &&
      !isNaN(Number(value)) &&
      typeof value !== 'boolean'
    );
  }

  formatCellValue(value: any, col: Column): any {
    if (value === null || value === undefined) {
      return '-';
    }

    try {
      switch (col.type) {
        case 'count':
          return this.isValidNumber(value)
            ? new Intl.NumberFormat('en-US', {
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              }).format(Number(value))
            : '-';
        case 'number':
          return this.isValidNumber(value)
            ? new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              }).format(Number(value))
            : '-';
        case 'date':
          return value instanceof Date || !isNaN(Date.parse(value))
            ? new Date(value).toLocaleDateString()
            : '-';
        case 'date-time':
          return value instanceof Date || !isNaN(Date.parse(value))
            ? new Date(value).toLocaleString()
            : '-';
        case 'boolean':
          return !!value;
        default:
          return value;
      }
    } catch (error) {
      console.error(`Error formatting cell value for column ${col.field}:`, error);
      return '-';
    }
  }

  filterData(data: any[], event: LazyLoadEvent): any[] {
    let filteredData = [...data];

    // Global filter
    if (this.globalFilterValue && this.configSignal().globalFilterFields?.length) {
      const searchValue = this.globalFilterValue.toLowerCase();
      filteredData = filteredData.filter(item => {
        return this.configSignal().globalFilterFields?.some(field => {
          const value = item[field];
          if (value === null || value === undefined) {
            return false;
          }
          return String(value).toLowerCase().includes(searchValue);
        });
      });
    }

    // Column filters
    if (event.filters) {
      Object.entries(event.filters).forEach(([key, filterMeta]) => {
        if (Array.isArray(filterMeta)) {
          filterMeta.forEach(meta => {
            if (meta.value !== null && meta.value !== undefined) {
              filteredData = filteredData.filter(item => {
                const itemValue = item[key];
                if (itemValue === null || itemValue === undefined) {
                  return false;
                }
                return String(itemValue).toLowerCase().includes(String(meta.value).toLowerCase());
              });
            }
          });
        }
      });
    }

    return filteredData;
  }

  onFilter(value: string): void {
    this.globalFilterValue = value;
    this.tableState.first = 0;
    this.loadData({ first: 0, rows: this.configSignal().rowsPerPage || 10 } as LazyLoadEvent);
  }
buildQueryParams(item: any, rowData: any): any {
  const key = item.queryKey;
  if (!key) return {};

  const value = rowData?.[key] ?? rowData?.id;
  return value !== undefined && value !== null ? { [key]: value } : {};
}
  clearFilters(): void {
    this.globalFilterValue = '';
    if (this.dataTable) {
      this.dataTable.clear();
    }
    this.loadData({ first: 0, rows: this.configSignal().rowsPerPage || 10 } as LazyLoadEvent);
  }

  onSelectionChange(event: any): void {
    this.selectedItems = event;
  }

  onPageChange(event: any): void {
    if (!event) return;
    this.setPaginatedData(event);
    this.tableState.first = event.first;
    this.tableState.rows = event.rows;
    this.paginationInfoSignal.update(info => ({
      ...info,
      pageNumber: Math.floor(event.first / event.rows) + 1,
    }));
    this.loadData(event);
  }
  setPaginatedData(event, externalFilteredData?: any) {
    //! To Get New Pagination Data

    this.page = {
      ...(this._externalFilterData || null),
      sorting: this.primengTableHelper.getSorting(this.dataTable),
      skipCount: this.primengTableHelper.getSkipCount(this.paginator, event),
      maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event),
    };
    this.rowsPerPage = this.page.maxResultCount;
    this.getPaginatedData.emit(this.page);
  }

  getSeverity(value: any, col: Column): string {
    if (!col.severity) return 'info';
    try {
      return col.severity(value);
    } catch (error) {
      console.error(`Error getting severity for column ${col.field}:`, error);
      return 'info';
    }
  }

  canShowLink(col: Column, rowData: any): boolean {
    return col.linkPermission && rowData.batchStatusId !== 6;
  }

  setDropdownRoutes() {
    const currentUrl = this.router.url;

    if (currentUrl.includes('digital-archive')) {
      this.basePath = this.router.url.split('?')[0];
    } else {
      this.basePath = currentUrl.split('/')[1];
    }

    // Dynamically set items based on the passed actionsConfig
    this.items = [
      {
        label: 'Edit',
        icon: 'bi bi-pencil-square me-1',
        key: 'edit', //  filter  according to action config
        type: 'action',
        action: (id: number) => this.handleEdit(id),
        showWhen: (rowData: any) => ![6].includes(rowData?.batchStatusId), // check on Edit Claims dpeone fon Batch status is not issued
      },
      {
        label: 'Delete',
        icon: 'bi bi-trash me-1 text-danger',
        key: 'delete',
        type: 'action',
        action: (id: number) => this.handleDelete(id),
      },
      {
        label: 'Audit',
        icon: 'bi bi-clock-history me-1',
        key: 'audit',
        type: 'action',
        action: (id: number) => this.handleAudit(id),
      },
      {
        label: 'Details',
        icon: 'bi bi-journal-text me-1',
        key: 'details',
        type: 'link',
        path: `/${this.basePath}/view/`,
      },
      {
        label: 'Assign to',
        icon: 'bi bi-person-fill me-1',
        key: 'assignTo',
        type: 'action',
        action: (id: number, orgId: number) => this.openAssignTo(id, orgId),
        showWhen: (rowData: any) => [2, 4].includes(rowData?.status_id), // check if the status is new or complete show assign to
      },
      {
        label: 'View Batches',
        icon: 'bi bi-boxes me-1',
        key: 'viewbatches',
        type: 'queryLink',
        path: '/digital-archive/batches',
        queryKey: 'providerId',
      },
      {
        label: 'View Claims',
        icon: 'bi bi-card-list me-1',
        key: 'viewClaims',
        type: 'queryLink',
        path: '/digital-archive/claims',
        queryKey: 'batchId',
      },
      {
        label: 'View Claims',
        icon: 'bi bi-card-list me-1',
        key: 'viewBatchClaims',
        type: 'queryLink',
        path: '/coding-claims/all',
        queryKey: 'batchId',
      },
{
  label: 'Move',
  icon: 'bi bi-arrow-left-right me-1',
  key: 'moveBeneficiary',
  type: 'action',
  action: (_id: number, _orgId: number, rowData: any) => this.handleMoveBeneficiary(rowData),
  showWhen: (rowData: any) => rowData?.parentId != null
},
{
  label: 'Split',
  icon: 'bi bi-scissors me-1',
  key: 'splitBeneficiary',
  type: 'action',
  action: (_id: number, _orgId: number, rowData: any) => this.handleSplitBeneficiary(rowData),
  showWhen: (rowData: any) => rowData?.parentId != null
},
   {
  label: 'View Family Tree',
  icon: 'bi bi-diagram-3 me-1',
  key: 'ViewFamilyTree',
  type: 'link',
  path: '/beneficiaries/family-tree/',
}
    ].filter(item => this.actionsConfig()[item.key]);
  }
  openAssignTo(id: number = 1, orgId: number) {
    this.openAssignToDialog.emit({ id, orgId, show: true });
  }
handleDelete(id: number): void {
  this.deleteItem.emit(id);
}
  handleEdit(id: number): void {
    const currentUrl = this.router.url;
    localStorage.setItem('editReturnUrl', currentUrl);
    this.router.navigate([`/${this.basePath}/edit/${id}`]);
  }
  handleAudit(id: number) {
    const currentUrl = this.router.url;
    localStorage.setItem('auditReturnUrl', currentUrl);
    this.router.navigate([`/${this.basePath}/audit/${id}`]);
  }
}
