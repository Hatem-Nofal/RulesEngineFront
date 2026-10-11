
import { AbstractControl, ValidationErrors, ValidatorFn, FormControl } from '@angular/forms';
type DateSource = Date | FormControl |string | (() => Date);
export function dateCompareValidator(
  earlierDate: DateSource,
  laterDate: DateSource,
  earlierLabel = 'Start Date',
  laterLabel = 'End Date',
  customErrorName ='customError'
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const getDateValue = (source: DateSource): Date | null => {
      
      if (typeof source === 'function') {
        const result = source();
        return result ? new Date(result) : null;
      }
      if (source instanceof Date) {
        return source;
      }
      if (typeof source == 'string') {
       const control = formGroup.get(source);
        if (!control) return null;
        return control.value ? new Date(control.value) : null;
      }
      return null;
    };
    const d1 = getDateValue(earlierDate);
    const d2 = getDateValue(laterDate);    
    if (!d1 || !d2) return null;
    if (d1 > d2) {
      return {[customErrorName]: `${laterLabel} must be on or after ${earlierLabel}`}
    }
    return null;
  };
}