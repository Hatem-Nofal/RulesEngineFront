import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumbersWithDot]',
  standalone: true

})
export class NumbersWithDotDirective {
  private specialKeys: string[] = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];


  constructor(private control: NgControl) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;
    const selectionStart = input.selectionStart ?? currentValue.length;
    const selectionEnd = input.selectionEnd ?? currentValue.length;

    // Simulate the next value after key press
    const nextValue =
      currentValue.substring(0, selectionStart) +
      event.key +
      currentValue.substring(selectionEnd);

    const regex = /^\d*(\.\d{0,3})?$/;
    if (this.specialKeys.includes(event.key)) {
      // Allow special keys
      return;
    }


    if (!regex.test(nextValue)) {
      event.preventDefault();

    }

  }


  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const pastedInput: string = event.clipboardData?.getData('text/plain') || '';
    const current: string = this.control?.control?.value || '';
    const next = current + pastedInput;

    const regex = /^\d*\.?\d{0,3}$/;

    if (!regex.test(next)) {
      event.preventDefault();
    }
  }

}
