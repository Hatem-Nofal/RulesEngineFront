import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { SharedModule } from 'src/app/shared/shared.module';
@Component({
  selector: 'app-drop-down-search',
  standalone: true,
  imports: [CommonModule, SharedModule, SelectModule],
  templateUrl: './drop-down-search.component.html',
  styleUrl: './drop-down-search.component.scss',

  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropDownSearchComponent),
      multi: true,
    },
  ],
})
export class DropDownSearchComponent implements OnInit, ControlValueAccessor {
  @Input() options: any[] | undefined;
  @Input() label: string = '';
  @Input() isRequired: boolean = false;
  @Input() isDisabled!: boolean;
  value: string | undefined;
  disabled: boolean = false;

  @Output() searchChange = new EventEmitter<string>();
  ngOnInit() {}
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? null;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelect(value: string): void {
    if (this.disabled) return;

    this.value = value;
    this.onChange(this.value);
    this.onTouched();
  }
  onFilter(searchTerm: string): void {
    this.searchChange.emit(searchTerm);
  }
}
