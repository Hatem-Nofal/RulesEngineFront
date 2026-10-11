import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appIntegerNumbers]',
  standalone: true
})
export class IntegerNumbersDirective {

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const invalidKeys = ['.', ',', 'e', '+', '-'];

    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const pastedInput: string = event.clipboardData?.getData('text/plain') ?? '';
    if (!/^\d+$/.test(pastedInput)) {
      event.preventDefault();
    }
  }

}
