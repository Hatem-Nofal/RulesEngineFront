import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete/autocomplete.interface';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { CustomDropdownComponent } from 'src/app/shared/components/CVA-Form/custom-dropdown/custom-dropdown.component';
import { CustomInputSearchComponent } from 'src/app/shared/components/CVA-Form/custom-input-search/custom-input-search.component';
import { FormsErrorComponent } from 'src/app/shared/components/CVA-Form/forms-error/forms-error.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ClaimFormService } from '../../claim-form.service';
import { CodingClaimEditService } from '../../coding-claim-edit.service';
import { SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';

@Component({
  selector: 'app-claims-edit-diagnosis',
  templateUrl: './claims-edit-diagnosis.component.html',
  styleUrl: './claims-edit-diagnosis.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    CustomDropdownComponent,
    CustomInputSearchComponent,
    FormsErrorComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdownComponent),
      multi: true,
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputSearchComponent),
      multi: true,
    },
  ],
})
export class ClaimsEditDiagnosisComponent implements OnInit, OnChanges {
  @Input() formArray!: FormArray; // Use definite assignment assertion
  @Input() data: FormGroup; // Initialize to an empty array
  @Input() diagnosisSearchDropdownList: SelectedDropDownList[] = [];
  @Output() disableDiagnoses: EventEmitter<boolean> = new EventEmitter<boolean>();
  // items = ['item'];
  diagnosisTypeOption = [
    { id: 'Principal', name: 'Principal', disabled: false },
    { id: 'Secondary', name: 'Secondary', disabled: false },
  ];
  expandedIndex: number = -1;
  searchedText = '';
  searchSubject = new Subject<string>();
  disableDiagnosesValue: boolean = true;

  get invalidIndexes(): number[] {
    // Build array of active (non-deleted) controls keeping their original index
    const active = this.diagnosis.controls
      .map((control, originalIndex) => ({ control, originalIndex }))
      .filter(({ control }) => !control.get('isDeleted')?.value);
    // Return 1-based positions among active controls where control is invalid
    return active
      .map(({ control }, pos) => ({ control, pos })) // pos is zero-based among active
      .filter(({ control }) => control.invalid)
      .map(({ pos }) => pos + 1);
  }

  constructor(
    private fb: FormBuilder,
    private lookupAppServicesService: LookupAppServicesService,
    private claimFormService: ClaimFormService,
    private codingClaimEditService: CodingClaimEditService,
    private cdref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const hasPrincipal = this.diagnosis.controls.some(
      c => c.get('diagnosisType')?.value === 'Principal' && !c.get('isDeleted')?.value
    );
    this.diagnosisTypeOption[0].disabled = hasPrincipal ? true : false;
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.changeDisabledStatues();
  }
  get diagnosis(): FormArray {
    return this.claimFormService.medicalDiagnosis;
  }
  addDiagnosis(): void {
    // Always recheck if first one should be principal
    const hasPrincipal = this.diagnosis.controls.some(
      c => c.get('diagnosisType')?.value === 'Principal' && !c.get('isDeleted')?.value
    );
    this.diagnosisTypeOption[0].disabled = hasPrincipal ? true : false;
    this.claimFormService.addMedicalDiagnosis(hasPrincipal,null,true);
    this.changeDisabledStatues();
    this.expandedIndex = this.diagnosis.length - 1;
  }
  removeDiagnosis(index: number): void {
    this.claimFormService.removeMedicalDiagnosis(index);
    this.changeDisabledStatues();
    // Recalculate after deletion
    const active = this.diagnosis.controls.filter(c => !c.get('isDeleted')?.value);
    if (active.length === 0) {
      // Show error immediately
      this.diagnosis.setErrors({ noPrincipalDiagnosis: true });
    }
    const hasPrincipal = this.diagnosis.controls.some(
      c => c.get('diagnosisType')?.value === 'Principal' && !c.get('isDeleted')?.value
    );
    this.diagnosisTypeOption[0].disabled = hasPrincipal ? true : false;
  }

  get validVisibleDiagnosis(): boolean {
    // Filter out deleted ones
    const visibleDiagnosis = this.diagnosis.controls.filter(c => !c.get('isDeleted')?.value);
    // Return true if all visible diagnosis controls are valid
    return visibleDiagnosis.every(c => !c.invalid);
  }
  changeDisabledStatues() {
    const hasPrincipal = this.diagnosis.controls.some(
      c => c.get('diagnosisType')?.value === 'Principal' && !c.get('isDeleted')?.value
    );
    this.diagnosisTypeOption[0].disabled = hasPrincipal ? true : false;
    this.disableDiagnoses.emit(this.checkDiagnosisType());
    this.disableDiagnosesValue = this.checkDiagnosisType();
  }
  checkDiagnosisType() {
    if (this.diagnosis.length === 0) return false;

    const ifTypePrinciple = this.diagnosis.controls
      .filter(c => !c.get('isDeleted')?.value)
      .find(control => control.get('diagnosisType')?.value === 'Principal');
    if (ifTypePrinciple) {
      return true;
    } else {
      return false;
    }
  }

  get visibleDiagnosis() {
    return this.diagnosis.controls;
  }
  getDiagnosisName(index) {
    const contol = this.claimFormService.medicalDiagnosis.at(index);
    const isId = contol?.get('diagnosisId')?.value;
    const isName = contol?.get('diagnosisName')?.value;
    let name;
    if (isName) {
      name = this.claimFormService
        .getDiagnousisItems()
        .find(diagnosis => diagnosis?.name === isName)?.name;
    } else {
      name = this.claimFormService
        .getDiagnousisItems()
        .find(diagnosis => diagnosis?.id === isId)?.name;
    }
    contol.get('diagnosisName').setValue(name);
    return name;
  }
  getVisibleIndex(index: number): number {
    const active = this.diagnosis.controls.filter(c => !c.get('isDeleted')?.value);
    // Find current control in the active list
    const control = this.diagnosis.at(index);
    const pos = active.indexOf(control);
    // Return 1-based visible index
    return pos >= 0 ? pos + 1 : -1;
  }
  getDiagnosisList(searchText: string) {
    this.lookupAppServicesService.getDiagnosisDropDownListBySearchTerm(searchText).subscribe({
      next: res => {
        this.diagnosisSearchDropdownList = res;
      },
    });
  }
  onSearchInputChange(searchText: string, index: number): void {
    this.searchedText = searchText;
    this.codingClaimEditService.searchDiagnosis(searchText).subscribe(data => {
      this.diagnosisSearchDropdownList = data;
    });
  }

  onSearchInputNameValue(event, index: number) {
    if (event) {
      this.claimFormService.updateMedicalDiagnosis(index, event);
    }
  }

  onChangeDiagnosisType(event, control: AbstractControl) {
    this.changeDisabledStatues();
    control.get('isDirty').setValue(true);
  }
  onSelectSubTypeId(event: AutoCompleteSelectEvent | any, i) {
    if (!event.target.value) {
      this.diagnosis.at(i).get('diagnosisName')?.setValue(null);
      this.diagnosis.at(i).get('diagnosisId')?.setValue(null);
    }
    this.diagnosis.at(i).get('isDirty').setValue(true);
  }
}
