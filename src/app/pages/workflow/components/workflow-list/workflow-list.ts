import { PermissionService } from '@abp/ng.core';
import { Component, inject, Injector, OnInit, ViewChild } from '@angular/core';
import { WorkFlowDto } from '@proxy/ehealth-claims/domains/rules';
import { WorkFlowService } from '@proxy/ehealth-claims/domains/work-flow';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { AppComponentBase } from 'src/app/app-component-base';
import { WorkflowsPermissions } from 'src/app/shared/models/appPermissions';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';

@Component({
  selector: 'app-workflow-list',
  templateUrl: './workflow-list.html',
  standalone: false,
  styleUrls: ['./workflow-list.scss'],
})
export class WorkFlowListComponent extends AppComponentBase implements OnInit {
  workflowsPermissions=WorkflowsPermissions
  permission =inject(PermissionService)
  loading = false;
  workflows: WorkFlowDto[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20, 50];
  dialogResult = '';

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  constructor(
    injector: Injector,
    private workflowService: WorkFlowService,
    private customConfirmationService: CustomConfirmationService
  ) {
    super(injector);
  }

  ngOnInit(): void {}
  getWorkFlow(event) {
    const pageSize = event.rows;
    const pageNumber = event.first + 1;
    this.loadWorkflows(pageSize, pageNumber);
  }
  loadWorkflows(pageSize: number, pageNumber: number): void {
    this.loading = true;
    this.workflowService.getList(pageNumber, pageSize).subscribe(data => {
      this.workflows = data.items;
      this.totalCount = data.totalCount;
      this.primengTableHelper.totalRecordsCount = data.totalCount;
      this.primengTableHelper.records = data.items;
      this.loading = false;
    });
  }
  // openDialog(): void {
  //   const dialogConfig = new MatDialogConfig();

  //   dialogConfig.disableClose = true;
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.width = '400px';
  //   dialogConfig.data = {
  //     title: 'Confirmation Required',
  //     message: 'Are you sure you want to proceed with this action?',
  //   } as DialogData;

  //   const dialogRef = this.dialog.open(DeleteConfirmComponent, dialogConfig);

  //   dialogRef.afterClosed().subscribe(result => {
  //     this.dialogResult = result ? 'Confirmed' : 'Cancelled';
  //   });
  // }
  deleteWorkflow(workflow: WorkFlowDto): void {
    this.customConfirmationService.warnConfrim(
      `Are you sure you want to delete "${workflow.name}"?`,
      'Confirm Deletion',
      {
        accept: () => {
          this.workflowService.delete(workflow.id).subscribe({
            next: () => {
              this.customConfirmationService.success(
                'Workflow deleted successfully!',
                'success',
                5000
              );
              this.loadWorkflows(
                this.paginator?.paginatorState?.rows,
                this.paginator.paginatorState?.page + 1
              );
              this.workflows = this.workflows.filter(w => w.id !== workflow.id);
            },
            error: () => {
              this.customConfirmationService.error('Failed to delete workflow.', 'error', 5000);
            },
          });
        },
        reject: () => {},
      }
    );
  }

  getRecordsIfNeeds(event) {
    const pageSize = event.rows;
    const pageNumber = event.page + 1;
    this.loadWorkflows(pageSize, pageNumber);
  }
}
