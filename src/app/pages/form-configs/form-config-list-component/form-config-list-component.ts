import { PagedResultDto } from '@abp/ng.core';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RuleFormConfigService } from '@proxy/rule-builder/api';
import { FormConfigListDto } from '@proxy/work-flows/dtos/rule-builders-dtos';


@Component({
  selector: 'app-form-config-list-component',
  imports: [RouterLink],
  templateUrl: './form-config-list-component.html',
  styleUrl: './form-config-list-component.scss',
})
export class FormConfigListComponent implements OnInit {
  private service = inject(RuleFormConfigService);
  configs = signal<FormConfigListDto[]>([]);

  ngOnInit() {
    this.load();
  }

  load() {
   // this.service.getList( PagedResultDto<FormConfigListDto>()).subscribe(c => this.configs.set(c));
  }

  remove(c: FormConfigListDto) {
    if (!c.id) return;
    if (!confirm(`Delete form config "${c.name}"?`)) return;
    this.service.delete(c.id).subscribe(() => this.load());
  }
}
