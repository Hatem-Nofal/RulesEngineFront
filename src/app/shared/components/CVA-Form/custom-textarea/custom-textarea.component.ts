import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Input,
  ViewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-custom-textarea',
  standalone: true,
  imports: [SharedModule, NgIf],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomTextareaComponent),
      multi: true,
    },
  ],
  templateUrl: './custom-textarea.component.html',
  styleUrl: './custom-textarea.component.scss',
})
export class CustomTextareaComponent implements AfterViewInit {
  @ViewChild('textareaEl') textareaEl!: ElementRef<HTMLTextAreaElement>;

  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() isDebugMode: boolean = false;
  @Input() isdisabled: boolean = false;
  @Input() format: string = '';
  @Input() isRequired: boolean = false;
  @Input() isArabic: boolean = false;

  private _maxLength: number = 524288;
  @Input() set maxLength(v: any) {
    const parsed = parseInt(String(v), 10);
    this._maxLength = isNaN(parsed) ? 524288 : parsed;
  }
  get maxLength(): number {
    return this._maxLength;
  }

  disabled: boolean = false;
  isTouched: boolean = false;
  private pendingValue: string | null = null;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    if (this.pendingValue !== null && this.textareaEl?.nativeElement) {
      this.textareaEl.nativeElement.value = this.pendingValue;
      this.pendingValue = null;
    }
  }

  writeValue(value: any): void {
    const str = value != null && value !== false ? String(value) : '';
    if (this.textareaEl?.nativeElement) {
      this.textareaEl.nativeElement.value = str;
    } else {
      this.pendingValue = str;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.textareaEl?.nativeElement) {
      this.textareaEl.nativeElement.disabled = isDisabled;
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.onChange(String(input.value));
  }

  onBlur(): void {
    if (!this.isTouched) {
      this.isTouched = true;
      this.onTouched();
    }
  }
}