import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { CustomDropDownOption } from '../../../models/inputs.model';

@Component({
  selector: 'app-custom-dropdown-multiple',
  templateUrl: './custom-dropdown-multiple.component.html',
  styleUrls: ['./custom-dropdown-multiple.component.scss'],
  standalone: true,
  imports: [MultiSelectModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdownMultipleComponent),
      multi: true
    }
  ]
})
export class CustomDropdownMultipleComponent implements ControlValueAccessor {
  @Input({ required: true }) options: CustomDropDownOption[] = [];
  @Input() placeholder: string = 'Select items';
  @Input() label: string;
  @Input() isDisabled: boolean = false;
  @Input() selectedOptions: [];
  @Input() showHeader:boolean =false;

  selectedValues: any[] = [];
  onChange: any = () => { };
  onTouched: any = () => { };

  writeValue(value: any[]): void {
    if (value !== undefined) {
      this.selectedValues = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onSelectionChange(event: any): void {
    this.selectedValues = event.value;

    this.onChange(this.selectedValues);
    this.onTouched();
  }
}
