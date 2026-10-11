import { Directive, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appAlphaNumberic]',
    standalone: false
})
export class AlphaNumbericDirective {
  @Input('appAlphanumeric') enable: boolean = true;
  private regex: RegExp = new RegExp(/^[a-zA-Z0-9]*$/);

  constructor() { }
  @HostListener('input', ['$event'])
  onInputChange(event: KeyboardEvent) {
    if (!this.enable) return;


    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!this.regex.test(value)) {
      input.value = value.replace(/[^a-zA-Z0-9]/g, '');
      event.preventDefault();
    }
  }
}
