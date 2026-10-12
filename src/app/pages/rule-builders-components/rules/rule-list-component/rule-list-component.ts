import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RuleListItemDto } from '@proxy/work-flows/dtos/rules-dtos';
import { RuleService } from '@proxy/work-flows/rules';


@Component({
  selector: 'app-rule-list-component',
  imports: [RouterLink],
  templateUrl: './rule-list-component.html',
  styleUrl: './rule-list-component.scss',
})
export class RuleListComponent implements OnInit {
  private service = inject(RuleService);
  rules = signal<RuleListItemDto[]>([]);

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getList().subscribe(r => this.rules.set(r));
  }

  remove(r: RuleListItemDto ) {
    if (!confirm(`Delete rule "${r.name}"?`)) return;
    this.service.delete(r.id).subscribe(() => this.load());
  }
}
