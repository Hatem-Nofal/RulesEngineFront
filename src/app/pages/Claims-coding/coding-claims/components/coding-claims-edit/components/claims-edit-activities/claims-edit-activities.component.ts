import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule, DatePipe } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete/autocomplete.interface';
import { TooltipModule } from 'primeng/tooltip';
import {
  debounceTime,
  distinctUntilChanged,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
} from 'rxjs';
import { CustomCheckboxComponent } from 'src/app/shared/components/CVA-Form/custom-checkbox/custom-checkbox.component';
import { CustomDropdownComponent } from 'src/app/shared/components/CVA-Form/custom-dropdown/custom-dropdown.component';
import { CustomInputSearchComponent } from 'src/app/shared/components/CVA-Form/custom-input-search/custom-input-search.component';
import { CustomInputComponent } from 'src/app/shared/components/CVA-Form/custom-input/custom-input.component';
import { FormsErrorComponent } from 'src/app/shared/components/CVA-Form/forms-error/forms-error.component';
import { IntegerNumbersDirective } from 'src/app/shared/directives/integer-numbers/integer-numbers.directive';
import { NumbersWithDotDirective } from 'src/app/shared/directives/numbers-with-dot/numbersWithDot.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { ClaimFormService } from '../../claim-form.service';
import { CodingClaimEditService } from '../../coding-claim-edit.service';
import { LookupsCodingEditService } from '../../lookups-coding-edit.service';
import { ActivityTypeFilterPipe } from './activityTypeFilter.pipe';
import { ClaimsAuditActivityComponent } from './claims-audit-activity/claims-audit-activity.component';
import { dateCompareValidator } from 'src/app/shared/validators/minDate-validator';
import { SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import { ClaimDto, ClaimWithAuditDto } from '@proxy/ehealth-claims/domains/claim';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';

@Component({
  selector: 'app-claims-edit-activities',
  templateUrl: './claims-edit-activities.component.html',
  styleUrl: './claims-edit-activities.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TooltipModule,
    CustomDropdownComponent,
    CustomInputComponent,
    CustomCheckboxComponent,
    CustomInputSearchComponent,
    ClaimsAuditActivityComponent,
    FormsErrorComponent,
    ActivityTypeFilterPipe,
    NumbersWithDotDirective,
    IntegerNumbersDirective,
    ScrollingModule,
  ],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimsEditActivitiesComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(CustomInputSearchComponent) customInputSearchComponent!: CustomInputSearchComponent;
  // @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  @ViewChild('trigger', { static: true }) trigger!: ElementRef;

  @Input() formArray!: FormArray;
  @Input() data: ClaimDto | ClaimWithAuditDto;
  @Input() activityTypeList: SelectedDropDownList[] = [];
  @Output() auditFormValue = new EventEmitter<FormArray>();
  @Output() activateAudit = new EventEmitter<boolean>(false);
  @Output() disableActivities = new EventEmitter<boolean>(false);
  @Output() totalAuditChanged = new EventEmitter<{
    totalApproved: number;
    totalRejected: number;
  }>();

  activitiesSearchDropdownList: SelectedDropDownList[];
  tagsOptions: SelectedDropDownList[];
  searchResults: SelectedDropDownList[];
  activateAuditStatus: boolean = false;
  auditForm!: FormArray;
  expandedIndex: number = -1;
  keepAliveIndex: number = -1;
  searchedText = '';
  activitiesInvalid: any[] = [];
  activityName: any;
  showFilterDropdown = false;
  activityTypes: { id: number; icon: string; name: string }[] = []; // Replace with your actual types
  // displayedActivities: AbstractControl<any, any>[];
  activeType: any;
  searchSubjects: Subject<string>[] = [];
  visibleCount = 200;
  filteredArray: any[] = [];

  private destroy$ = new Subject<void>();

  get visibleActivities() {
    return this.activities.controls.slice(0, this.visibleCount);
  }
  get activities(): FormArray {
    return this.claimFormService.medicalActivities;
  }
  get invalidIndexes(): number[] {
    const formArray = this.activateAuditStatus ? this.auditForm : this.formArray;
    if (!formArray || !formArray.controls) return [];
    // Build list of non-deleted controls (keeping order)
    const activeControls = formArray.controls
      .map((control, originalIndex) => ({ control, originalIndex }))
      .filter(({ control }) => !control.get('isDeleted')?.value);
    // Return 1-based position among active (not original index)
    return activeControls
      .map(({ control }, pos) => ({ control, pos }))
      .filter(({ control }) => control.invalid)
      .map(({ pos }) => pos + 1);
  }
  visitStartDateMin = computed(() => {
    const rawDate = this.claimDateService.visitStartDate() || this.data?.visit_Start_Date;
    const parsedDate = new Date(rawDate);
    return isNaN(parsedDate.getTime())
      ? ''
      : this.datePipe.transform(parsedDate, 'yyyy-MM-ddTHH:mm:ss') || '';
  });
  activityTypeMap: { [id: number]: { id: number; icon: string; name: string } } = {};
  @ViewChild('searchInput') searchInputComponent: any;
  viewMood: boolean;
  constructor(
    private fb: FormBuilder,
    private lookupsCodingEditService: LookupsCodingEditService,
    private lookupAppServicesService: LookupAppServicesService,
    private activatedRoute: ActivatedRoute,
    private claimDateService: CodingClaimEditService,
    private datePipe: DatePipe,
    private claimFormService: ClaimFormService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const visitDate = this.visitStartDateMin();
      if (visitDate) {
        // this.claimFormService.updateStartTimeValidation(this.visitStartDateMin);
      }
    });
  }

  private subscriptions: Subscription[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const controls = changes?.formArray?.currentValue?.controls;
    if (controls) {
      this.claimDateService.updateTotals(controls);
      this.updateVisibleActivities();
       this.activities.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkForControlChange();
    });
    }
  }

  ngOnInit(): void {
    this.initializeForm();
    this.handleAuditMode();
    this.loadDropdowns();
    if (this.activateAuditStatus) {
      this.listenToAuditValuesChanges();
    } else {
      this.listenToValueChanges();
    }
    this.progressivelyRender();
    this.claimFormService.onStartDateChange();

   
  }
  private initializeForm(): void {
    // this.claimFormService.updateStartTimeValidation(this.visitStartDateMin);
    // this.claimFormService.onMedicalActivityChanges();
  }
  private progressivelyRender(): void {
    if (this.visibleCount < this.activities.length) {
      this.visibleCount += 200;
      this.updateVisibleActivities();
      setTimeout(() => this.progressivelyRender(), 50); // small delay to keep UI responsive
    }
  }

  private handleAuditMode(): void {
    this.viewMood = this.activatedRoute.snapshot.url[0]?.path === 'view';
    const isAuditRoute = this.activatedRoute.snapshot.url[0]?.path === 'audit';
    this.activateAuditStatus = isAuditRoute;
    this.activateAudit.emit(this.activateAuditStatus);
    if (!isAuditRoute) return;
    // Initialize audit form from service
    this.claimFormService.initializeAuditFormFromActivities(this.activities);
    this.auditForm = this.claimFormService.getAuditForm();
    this.setauditFormValue();

    // Listen to changes
    this.auditForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.setauditFormValue();
    });
  }

  private loadDropdowns(): void {
    this.getActivityTypeDropdown();
    this.getActivityTagsDropdown();
    this.calculateTotals();
  }
  private setauditFormValue() {
    this.auditFormValue.emit(this.auditForm);
    const totals = this.claimFormService.calculateAuditTotals();
    this.totalAuditChanged.emit(totals);
  }

  initializeAuditForm() {
    this.activities.controls.forEach((activity, index) => {
      this.addAudit(activity.value);
    });
  }
  toggleIndex(index: number): void {
    // this.expandedIndex = this.expandedIndex === index ? null : index;
    if (this.expandedIndex === index) {
      // closing
      this.keepAliveIndex = index;
      this.expandedIndex = -1;
      setTimeout(() => {
        if (this.keepAliveIndex === index) {
          this.keepAliveIndex = -1; // destroy after delay
        }
      }, 30); // adjust to match collapse animation
    } else {
      // opening
      this.expandedIndex = index;
      this.keepAliveIndex = -1;
    }
  }
  // getActivityName(index, activityControl) {
  //   const activityControlIndex = this.visibleActivitiesArray.indexOf(activityControl);
  //   const filtedControl =
  //     this.filteredArray.length > 0
  //       ? this.filteredArray?.find(item => item.originalIndex == activityControlIndex).control
  //       : activityControl;
  //   if (!filtedControl) return 'New Activity';

  //   const activityId = filtedControl.get('id')?.value;
  //   const subActivitiesName = filtedControl.get('subActivitiesName')?.value;

  //   const matched = this.claimFormService.getActivityItems().find(activity => {
  //     return (
  //       activity => activity?.id == activityId || activity?.name == subActivitiesName ||
  //       (activityId != 0 ? activity?.name : '')
  //     );
  //   });
  //   return matched?.name || 'New Activity';

  //   // const isId = activityControl.get('id')?.value;
  //   // const isName = activityControl.get('subActivitiesName')?.value;

  //   // const activityItems = this.claimFormService.getActivityItems();
  //   // const matched = activityItems.find(
  //   //   activity => activity?.activityId === isId || activity?.name === isName
  //   // );

  //   // return matched?.name
  // }
  getActivityName(index, activityControl) {
    let control;
    if (this.filteredArray?.length > 0) {
      const actualIndex = this.visibleActivitiesArray.indexOf(activityControl);
      control = this.filteredArray.find(item => item?.originalIndex == actualIndex)?.control;
    } else {
      // fallback to visible controls
      const visibleControls = this.claimFormService.medicalActivities.controls.filter(
        ctrl => !ctrl.get('isDeleted')?.value
      );
      control = visibleControls[index];
    }

    let name;
    if (control) {
      const isId = control?.get('id')?.value;
      const isName = control?.get('subActivitiesName')?.value;
      const isNewAdded =
        !control?.get('subActivitiesName')?.value && !control?.get('subTypeId')?.value;
      name = isNewAdded
        ? 'New Activity'
        : this.claimFormService
            .getActivityItems()
            .find(activity => activity?.id == isId || activity?.name == isName)?.name;
    }

    return name;
  }
  addActivity(id: number = 2) {
    this.claimFormService.addMedicalActivity(null, this.visitStartDateMin(), false, id, true);
    this.updateVisibleActivities();
    const visibleControls = this.claimFormService.medicalActivities.controls.filter(
      ctrl => !ctrl.get('isDeleted')?.value
    );
    this.expandedIndex = visibleControls.length - 1;
    this.activityTypeList = [];
    const newControl = visibleControls[visibleControls.length - 1];
    if (this.activeType && this.activeType.id != 0) {
      const newActivityTypeId = newControl.get('activityTypeId')?.value;
      if (newActivityTypeId === this.activeType.id) {
        // Find its real index in the FormArray (the original index)
        const originalIndex = visibleControls.indexOf(newControl);
        // Add to filteredArray with both control + original index
        this.filteredArray.push({ control: newControl, originalIndex });
      }
    }
  }
  visibleActivitiesArray: AbstractControl[] = [];
  checkForControlChange() {
    this.visibleActivitiesArray.forEach((control: AbstractControl) => {
      // Avoid duplicate subscriptions
      if (!control.get('isDirty')?.value) {
        const sub = control.valueChanges.subscribe(() => {
          control.get('isDirty')?.setValue(true, { emitEvent: false });
        });
        this.subscriptions.push(sub);
      }
    });
  }
  updateVisibleActivities(): void {
    this.visibleActivitiesArray = this.activities.controls.filter(c => !c.get('isDeleted')?.value);
  }
  getDisplayNumber(control: AbstractControl): number {
    return this.visibleActivitiesArray.indexOf(control) + 1;
  }
  addAudit(activity: any) {
    const auditGroup = this.fb.group({
      activityTypeId: new FormControl({ value: activity.activityTypeId, disabled: true }),
      net: new FormControl({ value: Number(activity.net), disabled: true }),
      activityId: new FormControl({ value: Number(activity.id), disabled: false }),
      approvedAmount: new FormControl({ value: activity.approvedAmount || null, disabled: false }),
      rejectedAmount: new FormControl({ value: activity.rejectedAmount || null, disabled: false }),
      activityRejectionReasons: new FormControl({
        value: activity.activityRejectionReasons,
        disabled: false,
      }),
      activityTags: new FormControl({ value: activity.auditActivityTags, disabled: false }),
    });
    this.auditForm.push(auditGroup);
  }
  removeActivity(control: AbstractControl): void {
    const index = this.activities.controls.indexOf(control);
    if (index === -1) return;
    // ;
    const activityId = control.get('id')?.value;
    if (activityId === 0) {
      // Remove directly
      this.activities.removeAt(index);
    } else {
      // Mark as deleted
      this.claimFormService.removeMedicalActivity(index);
    }

    // Filter out the removed activity from the activity items
    const updatedActivityItems = this.claimFormService
      .getActivityItems()
      .filter(item => item.activityId !== activityId);

    // Update the activity items in the service
    this.claimFormService.setActivityItem(updatedActivityItems, true);

    this.filteredArray = this.filteredArray.filter(item => item.control !== control);
    this.activitiesInvalid = this.activitiesInvalid
      .filter(i => i !== index + 1) // remove deleted one
      .map(i => (i > index + 1 ? i - 1 : i)); // shift others down by 1
    this.disableActivities.emit(this.activitiesInvalid.length > 0);
    // this.revalidateAllActivities();
    this.updateVisibleActivities();
  }

  getActivityTypeOptions() {
    return [
      { value: 'dental', label: 'Dental' },
      { value: 'drug', label: 'Drug' },
      { value: 'procedure', label: 'Procedure' },
      { value: 'service code', label: 'Service code' },
      { value: 'consumables', label: 'Consumables' },
    ];
  }
  getColumnClass(control: any): string {
    if (
      control.type === 'checkbox' ||
      control.type === 'radio' ||
      control.name === 'batch_id' ||
      control.type === 'search'
    ) {
      return 'col-12 mt-1';
    } else if (
      control.name == 'quantity' ||
      control.name === 'gross' ||
      control.name === 'net' ||
      control.name === 'patientShare'
    ) {
      return 'col-3 mt-1';
    }
    return 'col-6 mt-1';
  }

  getActivityTypeDropdown() {
    this.lookupsCodingEditService.getActivityTypeDropDownList().subscribe({
      next: res => {
        this.activitiesSearchDropdownList = res;
        this.setActivityFilters(); // this.activities.setValue(this.activities.value)
      },
    });
  }

  getActivityTagsDropdown() {
    this.lookupsCodingEditService.getActivityTagsDropDownList().subscribe({
      next: res => {
        this.tagsOptions = res;
      },
    });
  }

  onSearchInputChange(searchText: string, index: number, activity): void {
    if (searchText.length >= 2) {
      of(searchText)
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap(searchText => {
            const visibleControls = this.claimFormService.medicalActivities.controls.filter(
              ctrl => !ctrl.get('isDeleted')?.value
            );
            const contol = visibleControls[index];

            const activityTypeValue = activity.get('activityTypeId')?.value;
            const activityId = Number(activityTypeValue);
            this.searchedText = searchText;
            return this.lookupAppServicesService.getActivitySubTypeByActivityIdAndsearchTermDropDownListByActivityIdAndSearchTermAndBatchId(
              activityId,
              searchText,
              this.data.batch_id
            );
          })
        )
        .subscribe(results => {
          this.activityTypeList = results;
          this.searchInputComponent?.openDropdown();
        });
    }
  }

  onSearchInputNameValue(event: any, index: number, activity) {
    // ;
    if (event.name) {
      this.claimFormService.updateMedicalActivity(activity, event);
      const visibleControls = this.claimFormService.medicalActivities.controls.filter(
        ctrl => !ctrl.get('isDeleted')?.value
      );
      const contol = this.visibleActivitiesArray[index];
      // contol.get('subActivitiesName')?.setValue(event?.name);
      activity.get('subActivitiesName')?.setValue(event?.name);
      // const activityControlIndex = visibleControls.indexOf(activity);
      // const filtedControl = this.filteredArray?.find(
      //   item => item?.originalIndex == activityControlIndex
      // ).control;
      // filtedControl?.get('subActivitiesName')?.setValue(event?.name);
    }
  }
  listenToValueChanges() {
    this.activities.valueChanges.pipe(debounceTime(100), takeUntil(this.destroy$)).subscribe(() => {
      this.calculateTotals();
    });
  }
  listenToAuditValuesChanges() {
    this.auditForm.valueChanges.pipe(debounceTime(100), takeUntil(this.destroy$)).subscribe(() => {
      this.calculateAuditTotals();
    });
  }
  calculateTotals() {
    this.activities.valueChanges.pipe(debounceTime(100), takeUntil(this.destroy$)).subscribe(() => {
      const visibleControls = this.claimFormService.medicalActivities.controls.filter(
        ctrl => !ctrl.get('isDeleted')?.value
      );
      this.claimDateService.updateTotals(visibleControls);
    });
  }
  calculateAuditTotals() {
    // let totalQuantity = 0;
    // let totalApproved = 0;
    // let totalRejected = 0;

    // this.auditForm.controls.forEach(audit => {
    //   totalApproved += Number(audit.get('approvedAmount')?.value || 0);
    //   totalRejected += Number(audit.get('rejectedAmount')?.value || 0);
    // });
    // // Emit the totals to parent
    // this.totalAuditChanged.emit({
    //   totalApproved,
    //   totalRejected,
    // });
    this.auditForm.valueChanges.pipe(debounceTime(100), takeUntil(this.destroy$)).subscribe(() => {
      this.claimDateService.updateTotals(this.auditForm.controls);
    });
  }

  onChangeActivityType(event, index, activityControl) {
    const visibleControls = this.claimFormService.medicalActivities.controls.filter(
      ctrl => !ctrl.get('isDeleted')?.value
    );
    const contol = activityControl;
    contol.get('subTypeId')?.reset();
    // this.displayedActivities[index].get('activityTypeId')?.setValue(event.target.value);
    this.changeValueType(event, 'activityTypeId', index, contol);
    this.activityTypeList = [];
  }
  calculateDrugActivityPrice(activityControl) {
    const quantity = Number(activityControl?.get('quantity')?.value);
    const price =
      this.claimFormService
        .getActivityItems()
        .find(activity => activity.id == activityControl?.get('subTypeId')?.value)?.price || 0;

    return (quantity * price)?.toFixed(3);
  }

  changeValueType(event, name, index, activityControl) {
    // ;
    // this.activities.at(index).get(name)?.patchValue(Number(event.target.value));
    const visibleControls = this.claimFormService.medicalActivities.controls.filter(
      ctrl => !ctrl.get('isDeleted')?.value
    );
    const contol = activityControl;
    const activityTypeId = contol?.get('activityTypeId').value;
    if (name === 'gross') {
      const control = contol;

      // let gross = Number(control.get('gross').value);
      let rawValue = contol?.get(name).value;

      if (rawValue === '') {
        contol?.get(name).setValue(null);
        control?.get('net').setValue(null);
        control?.get('patientShare').setValue(null);
      }
      // else {
      //   let gross = Number(rawValue);
      //   // console.log(gross)
      //   // if (gross === 0) {
      //   //   contol.get(name).setValue(0);
      //   // }
      // }

      // if servicrype is er set the patient with 0
      if (this.checkServiceValue(activityTypeId) || this.data.serviceTypeId == 3) {
        control?.get('net').setValue(rawValue);
        control?.get('patientShare').setValue(0);
        // 10% applied on drugs and prodecures types
      } else {
        this.changeNetAndShare(control, index, activityTypeId);
      }

      // if (!gross) {
      //   control.get('gross').setValue(null)

      // };
    }
    // patient share changes
    if (name === 'patientShare') {
      this.changeGrossAndNet(contol, index, activityTypeId);
    }
    if (name === 'net') {
      this.changeGrossAndShare(contol, index, activityTypeId);
    }
    if (name === 'net' || name === 'patientShare' || name === 'gross') {
      this.priceChanged(contol, index);
    }
    if (name == 'quantity') {
      let rawValue = contol?.get(name).value;
      if (rawValue === '') {
        contol?.get(name).setValue(null);
      }
      //  else {
      //   let quantity = Number(rawValue);
      //   if (quantity === 0) {
      //     contol.get(name).setValue(0);
      //   }
      // }
    }
    this.calculateTotals();
  }
  checkServiceValue(activityTypeId) {
    return (
      (this.data.serviceTypeId == 1 || this.data.serviceTypeId == 2) &&
      Number(activityTypeId) !== 2 &&
      Number(activityTypeId) !== 3
    );
  }

  changeNetAndShare(control: AbstractControl, index, activityTypeId) {
    const isIncluded = Number(activityTypeId) === 2 || Number(activityTypeId) === 3;
    if (control.get('gross').value !== null) {
      const gross = Number(control.get('gross').value);
      const patientShare = Number((isIncluded ? gross * 0.1 : 0).toFixed(3));
      const net = Number((isIncluded ? gross * 0.9 : 0).toFixed(3));

      control.get('patientShare').setValue(patientShare);
      control.get('net').setValue(net > 0 ? net : 0);
      if (gross < control.get('net').value + control.get('patientShare').value) {
        this.disableActivity(control, index);
      }
    }
  }

  changeGrossAndShare(control: AbstractControl, index, activityTypeId) {
    const net = Number(control.get('net').value);
    let gross = Number(control.get('gross').value);
    let patientShare: number;

    patientShare = Number((gross - net).toFixed(3));
    if (control.get('net').value == '') {
      control.get('net').setValue(null);
    }
    if (net > gross) {
      this.disableActivity(control, index);
    } else {
      control.get('patientShare').setValue(patientShare > 0 ? patientShare : 0);
    }
    if (!control.get('net').value && !control.get('gross').value) {
      control.get('patientShare').setValue(null);
    }
    //// control.get('net').setValue(0);
    // patientShare = activityTypeId === 2 ? gross * 0.1 : patientShare
  }

  changeGrossAndNet(control: AbstractControl, index, activityTypeId) {
    const patientShare = Number(control.get('patientShare').value);
    let gross = Number(control.get('gross').value);
    let net: number;

    net = Number((gross - patientShare).toFixed(3));
    if (control.get('patientShare').value == '') {
      control.get('patientShare').setValue(null);
    }

    if (patientShare > gross) {
      this.disableActivity(control, index);
    } else {
      control.get('net').setValue(net > 0 ? net : 0);
    }
    if (!control.get('patientShare').value && !control.get('gross').value) {
      control.get('net').setValue(null);
    }
    // control.get('patientShare').setValue(0);
  }
  priceChanged(control: AbstractControl, index) {
    const patientShare = Number(control?.get('patientShare').value);
    const net = Number(control?.get('net').value);
    const gross = Number(control?.get('gross').value);
    const total = +(patientShare + net).toFixed(3); // round to 3 decimals
    const roundedGross = +gross.toFixed(3);
    if (roundedGross < total && this.activitiesInvalid.includes(index + 1)) {
      this.disableActivity(control, index);
    } else {
      this.enableActivity(control, index);
    }
  }
  gorssMessageError: string;
  disableActivity(control: AbstractControl, index: number) {
    // this.claimFormService.setActivityError(
    //   index,
    //   'Gross must equal Net + Patient Share (Gross = Net + Patient Share).'
    // );
    this.gorssMessageError = 'Gross must equal Net + Patient Share (Gross = Net + Patient Share).';
    control?.setErrors({ customError: this.gorssMessageError });
    this.activitiesInvalid.push(index + 1);
    this.activitiesInvalid = Array.from(new Set(this.activitiesInvalid));
    this.disableActivities.emit(true);
  }
  enableActivity(control: AbstractControl, index: number) {
    // this.claimFormService.clearActivityError(index);
    this.activitiesInvalid = this.activitiesInvalid.filter(item => item !== index + 1);
    this.disableActivities.emit(false);
    control?.setErrors(null);
    this.gorssMessageError = '';
  }
  onSelectSubTypeId(event: AutoCompleteSelectEvent | any, i, activity) {
    // this.activities.at(i).get('subActivitiesName')?.setValue(this.activityName);
    const visibleControls = this.claimFormService.medicalActivities.controls.filter(
      ctrl => !ctrl.get('isDeleted')?.value
    );
    const contol = visibleControls[i];
    if (!event.target.value) {
      activity.get('subTypeId')?.setValue(null);
    }
  }

  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }
  filterByType(type: { id: number; icon: string; name: string }) {
    const visibleControls = this.claimFormService.medicalActivities.controls.filter(
      ctrl => !ctrl.get('isDeleted')?.value
    );

    // Map each control to its index
    const indexedVisibleControls = visibleControls.map((ctrl, index) => ({ ctrl, index }));

    // Filter by activityTypeId and keep original index
    const filteredWithIndex = indexedVisibleControls.filter(
      item => item.ctrl.get('activityTypeId')?.value == type.id
    );

    // Store filtered controls and their original indexes
    this.filteredArray = filteredWithIndex.map(item => ({
      control: item.ctrl,
      originalIndex: item.index,
    }));

    this.activeType = type;
  }

  deepCloneControl(control: AbstractControl): AbstractControl {
    if (control instanceof FormControl) {
      return new FormControl(control.value);
    }

    if (control instanceof FormGroup) {
      const clone: { [key: string]: AbstractControl } = {};
      Object.keys(control.controls).forEach(key => {
        clone[key] = this.deepCloneControl(control.controls[key]);
      });
      return new FormGroup(clone);
    }

    if (control instanceof FormArray) {
      const clones = control.controls.map(c => this.deepCloneControl(c));
      return new FormArray(clones);
    }

    throw new Error('Unsupported control type');
  }
  getActivityTypeById(id: number | string) {
    return this.activityTypes.find(type => type.id === id) || null;
  }

  setActivityFilters() {
    this.claimDateService
      .setActivityFilters()
      .subscribe(({ filteredActivityTypes, activityTypeMap }) => {
        this.activityTypes = filteredActivityTypes;
        this.activityTypeMap = activityTypeMap;
        this.cdr.detectChanges();
      });
  }

  // onScroll(event: Event) {
  //   const target = event.target as HTMLElement;
  //   if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
  //     // Near the bottom, load more
  //     this.visibleCount += 10;
  //   }
  // }

  trackByIndex(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
     this.subscriptions.forEach(sub => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }
}
