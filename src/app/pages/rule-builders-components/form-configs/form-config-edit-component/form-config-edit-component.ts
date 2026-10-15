import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RuleFormConfigService } from '@proxy/rule-builder/api';
import {
  CreateFormConfigEditDto,
  FormConfigListDto,
  RuleFieldCatalogDto,
  RuleFormFieldDto,
} from '@proxy/work-flows/dtos/rule-builders-dtos';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { isDataType, OPERATORS } from 'src/app/shared/models/constant';

@Component({
  selector: 'app-form-config-edit-component',
  imports: [ButtonModule, CheckboxModule, FormsModule, InputTextModule, RouterLink, TableModule],
  templateUrl: './form-config-edit-component.html',
  styleUrl: './form-config-edit-component.scss',
})
export class FormConfigEditComponent implements OnInit {
  private service = inject(RuleFormConfigService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  configId: string | null = null;
  name = '';
  description = '';
  isActive = true;
  allowNestedGroups = true;

  selected = signal<RuleFormFieldDto[]>([]);
  saving = signal(false);
  loading = signal(false);
  loadFailed = signal(false);
  metadataLoaded = signal(true);
  catalog = signal<RuleFieldCatalogDto[]>([]);
  available = computed(() => {
    const used = new Set(this.selected().map(s => s.id));
    return this.catalog().filter(f => !used.has(f.id));
  });
  picked = signal<Set<string>>(new Set());
  allPicked = computed(
    () =>
      this.available().length > 0 &&
      this.available().every(f => f.id !== undefined && this.picked().has(f.id)),
  );

  canSave = computed(
    () =>
      !this.saving() &&
      !this.loading() &&
      this.metadataLoaded() &&
      this.selected().length > 0 &&
      this.selected().every(field => !!field.id),
  );

  ngOnInit() {
    this.service.ruleFields().subscribe(c => this.catalog.set(c));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') return;

    this.configId = id;
    this.loading.set(true);
    this.metadataLoaded.set(false);
    this.service
      .get(id)
      .pipe(
        switchMap(config => this.findListItem(id).pipe(map(metadata => ({ config, metadata })))),
      )
      .subscribe({
        next: ({ config, metadata }) => {
          this.name = config.name ?? '';
          this.allowNestedGroups = config.allowNestedGroups ?? false;
          this.selected.set(config.fields ?? []);
          if (metadata) {
            this.description = metadata.description ?? '';
            this.isActive = metadata.isActive ?? false;
            this.metadataLoaded.set(true);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loadFailed.set(true);
          this.loading.set(false);
        },
      });
  }

  operatorsFor(field: RuleFormFieldDto) {
    return isDataType(field.dataType) ? OPERATORS[field.dataType] : [];
  }

  toggleOperator(index: number, operator: number) {
    this.selected.update(fields =>
      fields.map((field, fieldIndex) => {
        if (fieldIndex !== index) return field;
        const current = field.allowedOperators ?? [];
        return {
          ...field,
          id: field.id,
          allowedOperators: current.includes(operator)
            ? current.filter(value => value !== operator)
            : [...current, operator],
            dataType: field.dataType
        };
      }),
    );
  }

  setMultiple(index: number, isMultiple: boolean) {
    this.selected()[index].allowedOperators = [];
    this.selected.update(fields =>
      fields.map((field, fieldIndex) => (fieldIndex === index ? { ...field,   id: field.id, isMultiple, dataType: field.dataType } : field)),
    );
  }

  move(index: number, offset: number) {
    this.selected.update(fields => {
      const nextIndex = index + offset;
      if (nextIndex < 0 || nextIndex >= fields.length) return fields;
      const reordered = [...fields];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
      return reordered;
    });
  }

  remove(index: number) {
    this.selected.update(fields => fields.filter((_, fieldIndex) => fieldIndex !== index));
  }

  save() {
    if (!this.name.trim()) {
      alert('Name is required.');
      return;
    }

    if (!this.metadataLoaded()) {
      alert('Configuration details could not be loaded. Refresh the page before saving.');
      return;
    }

    if (!this.selected().length || this.selected().some(field => !field.id )) {
      alert('At least one valid field is required.');
      return;
    }

    const input: CreateFormConfigEditDto = {
      name: this.name.trim(),
      description: this.description.trim() || null,
      isActive: this.isActive,
      allowNestedGroups: this.allowNestedGroups,
      fields: this.selected().map(field => ({
        fieldId: field.id!,
        allowedOperators: field.allowedOperators?.length ? field.allowedOperators : null,
        isMultiple: field.dataType === 'List' ? (field.isMultiple ?? false) : false,
        dataType: field.dataType
      })),
    };

    this.saving.set(true);
    const request: Observable<unknown> = this.configId
      ? this.service.update(this.configId, input)
      : this.service.create(input);

    request.subscribe({
      next: () => this.router.navigate(['/form-configs']),
      error: () => this.saving.set(false),
    });
  }

  private findListItem(id: string, skipCount = 0): Observable<FormConfigListDto | null> {
    const pageSize = 100;
    return this.service.getList({ skipCount, maxResultCount: pageSize }).pipe(
      switchMap(result => {
        const match = (result.items ?? []).find(item => item.id === id);
        if (match) return of(match);

        const nextSkipCount = skipCount + pageSize;
        if (nextSkipCount >= (result.totalCount ?? 0) || !(result.items?.length ?? 0)) {
          return of(null);
        }
        return this.findListItem(id, nextSkipCount);
      }),
    );
  }

  togglePick(id: string) {
    this.picked.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleAll() {
    this.picked.set(
      this.allPicked()
        ? new Set()
        : new Set(
            this.available()
              .map(f => (f.id !== undefined ? f.id : null))
              .filter((v): v is string => !!v),
          ),
    );
  }
  addPicked() {
    const toAdd = this.available()
      .filter(f => f.id !== undefined && this.picked().has(f.id))
      .map(f => ({ id: f.id, allowedOperators: [] as number[], isMultiple: f.dataType === 'List' ? true: false, dataType: f.dataType }));
    if (!toAdd.length) return;
    this.selected.update(list => [...list, ...toAdd]);
    this.picked.set(new Set());
  }
  fieldOf(id: string) {
    return this.catalog().find(f => f.id === id);
  }
}
