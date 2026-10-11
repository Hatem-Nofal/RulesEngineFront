import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-radio',
  templateUrl: './custom-Radio.component.html',
  styleUrls: ['./custom-Radio.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomRadioComponent),
      multi: true,
    },
  ],
})
export class CustomRadioComponent implements OnInit, ControlValueAccessor {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() options: { id: string; name: string }[] = [];
  value: any;
  @Input() isdisabled: boolean = false;
  @Input() isRequired: boolean = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor() {}

  ngOnInit() {}

  // CVA Methods
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
    this.isdisabled = isDisabled;
  }

  // Method to update value
  updateValue(value: any): void {
    if (!this.isdisabled) {
      this.value = value;
      this.onChange(value);
      this.onTouched();
    }
  }
}
