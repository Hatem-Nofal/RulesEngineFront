import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formateWithoutRound',
  standalone: true
})
export class FormateWithoutRoundPipe implements PipeTransform {

   transform(value: number | string, maxDecimals: number = 3): string {
    if (value == null || isNaN(Number(value))) return '';
    const [intPart, decPart = ''] = value.toString().split('.');
    const truncated = decPart.slice(0, maxDecimals);
    return truncated ? `${intPart}.${truncated}` : intPart;
  }
}
