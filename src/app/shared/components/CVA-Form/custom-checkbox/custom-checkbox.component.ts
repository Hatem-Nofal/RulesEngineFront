import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectedDropDownList } from '@proxy/common/dtos/models';

@Component({
  selector: 'app-custom-checkbox',
  templateUrl: './custom-checkbox.component.html',
  styleUrls: ['./custom-checkbox.component.scss'],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomCheckboxComponent),
      multi: true,
    },
  ],
})
export class CustomCheckboxComponent implements ControlValueAccessor {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) size: string = 'col-6';
  @Input({ required: true }) options: { id: number, name: string, disabled: boolean, selected: boolean }[] = [];
  @Input() selectedValue: [] = [];

  value: any[] = [];
  disabled = false;
  onChange: (value: any) => void = () => { };
  onTouched: () => void = () => { };

  writeValue(value: any[] = []): void {

    this.value = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleValue(option: SelectedDropDownList): void {
    if (this.disabled) return;

    this.onChange(this.getSelectedValues(option));
    this.onTouched();
  }

  getSelectedValues(option: SelectedDropDownList) {
    if (this.value.includes(option.id)) {
      this.value = this.value.filter((id: any) => id !== option.id);
    } else {
      this.value.push(option.id);
    } return this.value;
  }
}
