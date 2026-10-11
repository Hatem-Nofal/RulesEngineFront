import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({
  name: 'activityTypeFilter',
  standalone: true,
  pure: true
})
export class ActivityTypeFilterPipe implements PipeTransform {
  transform(controls: AbstractControl[], typeId: number | null | undefined, allControls: AbstractControl[]): AbstractControl[] {
    if (!allControls) return [];
    // if (!filterActive || filterActive.name === 'All') return controls; // If filter is inactive, return all controls
    if (!typeId || typeId == 0) return controls; // 0 or null means "All"
    let typeIds = [Number(typeId)]
    return allControls.filter(control => typeIds.includes(Number(control.get('activityTypeId')?.value)));
  }
}
