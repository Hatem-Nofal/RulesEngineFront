import { Directive, HostListener, Input, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appMaxCharacters]',
  standalone: true
})
export class MaxCharactersDirective {
  @Input() maxChar: number = 0;
  @Input() decimalMax: number = 3;

  constructor(@Optional() private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove dot for maxChar check
    const plainLength = value.replace('.', '').length;
    const [intPart, decPart] = value.split('.');

    if (this.maxChar > 0 && plainLength > this.maxChar) {
      value = value.slice(0, this.maxChar);
    }

    if (decPart && decPart.length > this.decimalMax) {
      value = intPart + '.' + decPart.slice(0, this.decimalMax);
    }

    // Update both DOM and form control
    input.value = value;
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(value, { emitEvent: true });
    }
  }
}
