import { NgIf } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.scss',
  standalone: true,
  imports: [SharedModule, NgIf],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true,
    },
  ],
})
export class CustomInputComponent implements ControlValueAccessor {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) type: string = 'text';
  @Input() min: string = '';
  @Input() max: string = '';
  @Input() minLength: string = '';
  @Input() maxLength: string = '';
  @Input() isDebugMode: boolean = false; // Toggle debug mode
  @Input() isdisabled: boolean = false; // Toggle debug mode
  @Input() format: string = '';
  @Input() isRequired: boolean = false;
  @Input() customClass!: string;
  @Output() onBlurEvent = new EventEmitter()
  value: any = '';
  disabled: boolean = false;
  isTouched: boolean = false;

  // CVA required methods
  private onChange: any = () => { };
  private onTouched: any = () => { };

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
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  // Blur event handler
  onBlur(event:Event): void {
    if (!this.isTouched) {
      this.isTouched = true;
      this.onTouched();
    }
    this.onBlurEvent.emit(event)
  }
}
