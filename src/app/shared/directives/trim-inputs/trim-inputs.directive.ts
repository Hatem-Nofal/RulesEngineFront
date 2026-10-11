import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTrimInputs]',
  standalone: false,
})
export class TrimInputsDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('blur')
  onBlur() {
    const control = this.ngControl.control;
    if (!control) return;

    const val = control.value;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed !== val) {
        control.setValue(trimmed);
      }
    }
  }

  @HostListener('input')
  onInput() {
    const control = this.ngControl.control;
    if (!control) return;

    const val = control.value;
    if (typeof val === 'string') {
      control.setValue(val.trim(), { emitEvent: true });
    }
  }
}
