import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LookupDto } from '@proxy/lookups/dtos';
import { WorkFlowService } from '@proxy/work-flows';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-workflow-edit-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './workflow-edit-component.html',
  styleUrl: './workflow-edit-component.scss',
})
export class WorkflowEditComponent implements OnInit {
  private service = inject(WorkFlowService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  workflowId: string | null = null;
  name = '';
  configId: string | null = null;

  configs = signal<LookupDto[]>([]);
  ruleCount = signal(0);
  saving = signal(false);

  ngOnInit() {
    //this.service.getConfigs().subscribe(c => this.configs.set(c));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') return;

    this.workflowId = id;
    this.service.get(id).subscribe(w => {
      // this.name = w.name;
      // this.configId = w.ruleFormConfigId;
      // this.ruleCount.set(w.ruleCount);
    });
  }

  save() {
    if (!this.name.trim()) {
      alert('Name is required.');
      return;
    }

    this.saving.set(true);
    const dto = { name: this.name.trim(), ruleFormConfigId: this.configId };
    const request: Observable<unknown> = this.workflowId ? this.service.update(this.workflowId, dto) : this.service.create(dto);

    request.subscribe({
      next: () => this.router.navigate(['/workflows']),
      error: () => this.saving.set(false), // the interceptor already showed the server message
    });
  }
}
