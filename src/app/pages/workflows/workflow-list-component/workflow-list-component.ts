import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkFlowService } from '@proxy/work-flows';
import { WorkflowDto } from '@proxy/work-flows/dtos';


@Component({
  selector: 'app-workflow-list-component',
  imports: [RouterLink],
  templateUrl: './workflow-list-component.html',
  styleUrl: './workflow-list-component.scss',
})
export class WorkflowListComponent implements OnInit {
  private service = inject(WorkFlowService);
  workflows = signal<WorkflowDto[]>([]);

  ngOnInit() {
    this.load();
  }

  load() {
    //this.service.getList().subscribe(w => this.workflows.set(w));
  }

  remove(w: WorkflowDto) {
    if (!confirm(`Delete workflow "${w.name}"?`)) return;
    //this.service.delete(w.id).subscribe(() => this.load());
  }
}
