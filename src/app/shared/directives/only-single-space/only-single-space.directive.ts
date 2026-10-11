import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appOnlySingleSpace]',
  standalone: false,
})
export class OnlySingleSpaceDirective {
  constructor(private ngControl: NgControl) {}
  @HostListener('input', ['$event'])
  onInput(event: any) {
    const input = event.target as HTMLInputElement;
    // Collapse multiple spaces into one
    input.value = input.value.replace(/\s+/g, ' ');
       input.value =  input.value.replace(/^\s+/, '');
    event.target.dispatchEvent(new Event('input')); // update FormControl

     this.ngControl.control?.setValue(input.value, { emitEvent: true });
  }
}
