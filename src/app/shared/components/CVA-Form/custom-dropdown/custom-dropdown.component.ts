import { NgFor } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LocalizationService } from '@abp/ng.core'; // ← add
import { CustomDropDownOption } from 'src/app/shared/models/inputs.model';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-custom-dropdown',
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.scss'],
  standalone: true,
  imports: [SharedModule, NgFor],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdownComponent),
      multi: true,
    },
  ],
})
export class CustomDropdownComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() options: CustomDropDownOption[] = [];
  @Input() selectedValue = '';
  @Input() isRequired: boolean = false;
  @Input() isDisabled: boolean = false;
  value: string = '';
  disabled = false;
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private localization: LocalizationService) {}

  get selectPlaceholder(): string {
    return this.localization.instant('RuleApplication::Common:Select');
  }

  writeValue(value: string): void {
    if (this.selectedValue) {
      this.value = this.selectedValue;
    }
    this.value = value;
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
}