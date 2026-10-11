import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectedWithPriceDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto/models';

import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ClaimFormService } from 'src/app/pages/Claims-coding/coding-claims/components/coding-claims-edit/claim-form.service';

@Component({
  selector: 'app-custom-input-search',
  standalone: true,
  imports: [AutoCompleteModule, CommonModule, AutoComplete, FormsModule],
  templateUrl: './custom-input-search.component.html',
  styleUrl: './custom-input-search.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputSearchComponent),
      multi: true,
    },
  ],
})
export class CustomInputSearchComponent implements ControlValueAccessor, OnInit {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) items: SelectedWithPriceDropDownList[] = [];
  @Input({ required: true }) isActivities: boolean = false;

  @Input({ required: true }) selectedItems: SelectedWithPriceDropDownList[] = [];
  @Input() disabledOption: string = '';
  @Output() searchInputChange = new EventEmitter<any>();
  @Output() searchInputNameValue = new EventEmitter<any>();

  @Output() change = new EventEmitter<any>();

  @ViewChild('autocomplete') autocomplete: any;

  filteredItems: any;

  value: any;
  disabled: boolean = false;
  isTouched: boolean = false;
  // CVA required methods
  private onChange: any = () => {};
  private onTouched: any = () => {};
  constructor(private claimFormService: ClaimFormService) {}
  //Implement  OnInit
  ngOnInit(): void {
    if (this.items) {
      this.writeValue(this.items);
    }
  }
  // Implement ControlValueAccessor interface
  writeValue(value: any): void {
    if (Number.isInteger(value)) {
      this.value = Number.isInteger(value);
      this.onSelect(value);
      return;
    }
    if (value?.length === 1) {
      this.value = value[0];
      return;
    }
    if (value == null) {
      this.reset();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // // Input event handler
  // onInput(event: Event): void {
  //
  //   const input = event.target as HTMLInputElement;
  //   this.value = Number(input.value);
  //   this.onChange(this.value);
  // }

  // Blur event handler
  onBlur(): void {
    if (!this.isTouched) {
      this.isTouched = true;
      this.onTouched();
    }
  }

  search(event: AutoCompleteCompleteEvent): void {
    this.searchInputChange.emit(event.query);
  }
  openDropdown(): void {
    if (this.autocomplete) {
      this.autocomplete.show();
    }
  }

  onSelect(event: any): void {
    let selectedItem;
    const activiteyItemsSignal = this.isActivities
      ? this.claimFormService.getActivityItems()
      : this.claimFormService.getDiagnousisItems();
    if (event.value ) {
      selectedItem = this.items.find(x => x.id == event?.value?.id);
      this.isActivities
        ? this.claimFormService.setActivityItem(event.value)
        : this.claimFormService.setDiagnousisItem(event.value);
    } else {
      selectedItem = activiteyItemsSignal.find(x => x.id == event)?.name;
    }

    if (selectedItem) {
      this.value = selectedItem;
      this.onChange(selectedItem.id);
      this.searchInputNameValue.emit({ name: selectedItem.name, price: selectedItem?.price });
    }
  }

  reset(): void {
    this.value = null;
    this.onChange(null);
    this.onTouched();
  }
}
