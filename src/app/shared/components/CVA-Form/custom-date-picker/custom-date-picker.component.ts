import { DatePipe, NgIf } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-date-picker',
  standalone: true,
  imports: [SharedModule, NgIf, DatePickerModule],
  templateUrl: './custom-date-picker.component.html',
  styleUrl: './custom-date-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatePickerComponent),
      multi: true,
    },
  ],
})
export class CustomDatePickerComponent {
  @Input({ required: true }) label: string = '';
  @Input({ required: false }) type: string = 'text';
  @Input() min?: Date;
  @Input() max?: Date;
  @Input() minLength?: Date;
  @Input() maxLength?: Date;
  @Input() isDebugMode: boolean = false; // Toggle debug mode
  @Input() isdisabled: boolean = false; // Toggle debug mode
  @Input() format: string = '';
  @Input() isRequired: boolean = false;

  value: any = '';
  private onChange: any = () => {};
  private onTouched: any = () => {};
  disabled: boolean = false;
  isTouched: boolean = false;

  constructor(private datePipe: DatePipe) {}
  // Implement ControlValueAccessor interface
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  // Input event handler
  onInput(event: any): void {
    if (event instanceof Date) {
      const day = String(event.getDate()).padStart(2, '0');
      const month = String(event.getMonth() + 1).padStart(2, '0');
      const year = event.getFullYear();

      this.value = `${day}-${month}-${year}`;
      this.onChange(`${day}-${month}-${year}`);
    }
  }

  // Blur event handler
  onBlur(): void {
    if (!this.isTouched) {
      this.isTouched = true;
      this.onTouched();
    }
  }
}
