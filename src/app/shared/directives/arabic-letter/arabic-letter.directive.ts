import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appArabicLetter]',
  standalone: false,
})
export class ArabicLetterDirective {
  @Input('appArabicLetter') enable: boolean = true;
  private regex: RegExp = new RegExp(/^[\u0600-\u06FF\s]*$/);

  constructor() {}
  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    if (!this.enable) return;

    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Replace anything not Arabic letters or spaces
    const sanitized = value.replace(/[^\u0621-\u064A\s]/g, '');

    if (sanitized !== value) {
      input.value = sanitized;
      // Update the bound FormControl if present
      const nativeEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(nativeEvent);
    }
  }
}
