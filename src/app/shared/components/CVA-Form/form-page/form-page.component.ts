import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CustomCheckboxComponent } from '../custom-checkbox/custom-checkbox.component';
import { CustomDropdownComponent } from '../custom-dropdown/custom-dropdown.component';
import { CustomInputComponent } from '../custom-input/custom-input.component';
import { CustomRadioComponent } from '../custom-Radio/custom-Radio.component';
import { FormsErrorComponent } from '../forms-error/forms-error.component';
import { DropDownSearchComponent } from '../drop-down-search/drop-down-search.component';
import { SharedModule } from "src/app/shared/shared.module";

@Component({
  selector: 'app-form-page',
  templateUrl: './form-page.component.html',
  styleUrls: ['./form-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CustomDropdownComponent,
    CustomInputComponent,
    CustomCheckboxComponent,
    CustomRadioComponent,
    DropDownSearchComponent,
    FormsErrorComponent,
    SharedModule
],
})
export class FormPageComponent implements OnInit {
  /**
   *
   */

  // dynamicControls: { name: string, label: string, type: { value: '', disabled: true }, Validators: Validators }[] = [];
  @Input() dynamicControls: {
    name: string;
    label: string;
    type: string;
    value: string;
    validators: any[];
    options?: any[];
  }[] = [];
  @Output() formSubmit = new EventEmitter<any>();
  @Input() encounterNumber: string | null = null;
  form = this.fb.group({});
  constructor(private fb: FormBuilder) {}
  ngOnInit(): void {
    this.setFormControls();
  }
  formReset() {
    const resetValues = {};
    this.dynamicControls.forEach(control => {
      resetValues[control.name] = control.value ?? null;
    });
    this.form.reset(resetValues);
    this.formSubmit.emit(null);
  }

  submit() {    
    if(this.form.valid){
      this.formSubmit.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  setFormControls() {
    this.dynamicControls.forEach(control => {
      this.form.addControl(control.name, new FormControl(control.value, control.validators));
    });
    if (this.encounterNumber) {
      this.form.patchValue({ number: this.encounterNumber });
      this.submit();
    }
  }
}
