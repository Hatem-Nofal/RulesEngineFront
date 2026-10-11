import { CommonModule, DatePipe, Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import {
  ClaimDto,
  ClaimListDto,
  ClaimPagedAndFilterDto,
  ClaimService,
  ClaimWithAuditDto,
  EditClaimDto,
  EditDiagnosisDto,
  EditMedicalActivityDto,
} from '@proxy/ehealth-claims/domains/claim';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { Column, TableConfig } from 'src/app/shared/models/table.model';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { ClaimFormService } from './claim-form.service';
import { CodingClaimEditService } from './coding-claim-edit.service';
import { ClaimsEditActivitiesComponent } from './components/claims-edit-activities/claims-edit-activities.component';
import { ClaimsEditClaimComponent } from './components/claims-edit-claim/claims-edit-claim.component';
import { ClaimsEditDiagnosisComponent } from './components/claims-edit-diagnosis/claims-edit-diagnosis.component';
import { FormateWithoutRoundPipe } from 'src/app/shared/pipes/formate-without-round.pipe';
import { LocalizationService } from '@abp/ng.core';
import { CustomInputComponent } from 'src/app/shared/components/CVA-Form/custom-input/custom-input.component';
import { ClaimsCodingPermissions } from 'src/app/shared/models/appPermissions';
import { SelectedDropDownList, SelectedWithPriceDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import { FilesManagerService } from '@proxy/ehealth-claims/files-managers';
import { DiagnosisDto } from '@proxy/ehealth-claims/domains/claim/diagnosis';

@Component({
  selector: 'app-coding-claims-edit',
  templateUrl: './coding-claims-edit.component.html',
  styleUrl: './coding-claims-edit.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TabsModule,
    ClaimsEditClaimComponent,
    ClaimsEditDiagnosisComponent,
    ClaimsEditActivitiesComponent,
    DialogModule,
    FormateWithoutRoundPipe,
    CustomInputComponent,
  ],
  providers: [DatePipe],
})
export class CodingClaimsEditComponent implements OnInit, AfterViewInit, OnDestroy {
  disableDiagnoses: boolean = false; // Flag to disable the diagnosis field
  disableActivities: boolean = false; // Flag to disable the activities field
  encounterId: string = '';
  iframeUrl: SafeResourceUrl | null = null;
  claimsData: ClaimListDto[] = [];
  claimsSearchErrorMessage:string='';
  selectedEncounter: ClaimListDto;
  @ViewChild('tab1', { read: ElementRef }) tab1!: ElementRef;
  @ViewChild('tab2', { read: ElementRef }) tab2!: ElementRef;
  @ViewChild('tab3', { read: ElementRef }) tab3!: ElementRef;
  @ViewChild('tab4', { read: ElementRef }) tab4!: ElementRef;
  activeTab = 'claim'; // The currently active tab's value
claimsCodingPermissions =ClaimsCodingPermissions
  claimForm!: FormGroup;
  claimId: number;
  claimData: ClaimDto | ClaimWithAuditDto;
  totalValues: any;
  auditTotalValues: {
    totalApproved: number;
    totalRejected: number;
  };
  searchDropdownList;
  diagnosisSearchDropdownList: SelectedDropDownList[] = [];
  activityTypeList: SelectedWithPriceDropDownList[] = [];
  inView: boolean = false;
  columns: Column[] = [
    {
      field: 'actionUser',
      header: 'User',
      width: '150px',
    },
    {
      field: 'create_timestamp',
      header: 'Date',
      width: '150px',
      type: 'date-time',
    },
    {
      field: 'claimstatus',
      header: 'Status',
      type: 'text',
      width: '150px',
    },
  ];
  detailsColumns: Column[] = [
    {
      field: 'type',
      header: 'Type',
      width: '150px',
      type: 'text',
    },
    {
      field: 'count',
      header: 'Count',
      width: '150px',
      type: 'count',
    },
    {
      field: 'net',
      header: 'Total Net',
      type: 'number',
      width: '150px',
    },
  ];
  detailsArray: { type: string; count: number; net: number }[] = [];

  tableConfig: TableConfig = {
    actions: false,
  };
  activateAudit: boolean = false;
  auditFormValue: FormArray = new FormArray([]); // Initialize to an empty array
  ctrlPressed = false; // Flag to track if Ctrl key is pressed
  openDetails: boolean = false;
  openClaimdSearchDialog: boolean = false;
  disableSave: boolean = false;
  url: any;
  fileName: any;
  fileload = true;
  claimsLoggings: any;
  get medicalDiagnosis(): FormArray {
    return this.claimFormService.medicalDiagnosis;
  }
  get medicalActivities(): FormArray {
    return this.claimFormService.medicalActivities;
  }
  private destroy$ = new Subject<void>();
  isPreDrafted: boolean = false;
  isAudit: boolean = false;
  constructor(
    // private persistence: DataPersistenceService<boolean>,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private claimService: ClaimService,
    private customConfirmationService: CustomConfirmationService,
    private filesManagerService: FilesManagerService,
    private sanitizer: DomSanitizer,
    private location: Location,
    private datePipe: DatePipe,
    private _LocalizationService: LocalizationService,

    private codingClaimEditService: CodingClaimEditService,
    private claimFormService: ClaimFormService
  ) {}

  ngOnInit(): void {
    this.claimsSearchErrorMessage=""
    this.claimId = Number(this.activatedRoute.snapshot.params['id']);
    window.addEventListener('storage', event => {
      if (event.key === 'reloadSignal' && event.newValue) {
        window.location.reload();
      }
    });
    this.isPreDrafted = !!localStorage.getItem(`claimDraft_${this.claimId}`);
    this.filesManagerService.getPdfbyIdByClaimId(this.claimId).subscribe({
      next: (response: Blob) => {
        const url = URL.createObjectURL(response);
        this.url = url;
        this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.fileload = false;
      },
      error: error => {
        console.error('Error fetching file:', error);
      },
    });
    // Get the claimId from route params
    this.inView = this.router.url.includes('view');
    // Subscribe to route data changes to get claimDetails
    this.activatedRoute.data.subscribe(data => {
      const isDraft = this.codingClaimEditService.loadDraft(this.claimId);
      this.isAudit = this.router.url.includes('audit');
      // if only drafted claim found in edit mode only
      if (isDraft && !this.isAudit) {
        this.claimData = this.codingClaimEditService.getDefaultClaimData();
        this.claimFormService.initializeForm(this.claimData);
        const draftData = isDraft['data'];
        this.customConfirmationService.warnConfrim(
          'You have unsaved changes from a previous session.<br> Would you like to restore them?',
          'Alert',
          {
            accept: () => {
              this.loadClaimData(draftData);
              this.calculateTotals();
            },
            reject: () => {
              this.loadClaimData(data['claimDetails']);
              this.calculateTotals();
              this.codingClaimEditService.clearDraft(this.claimId);
            },
            dismiss: () => {
              this.disableSave = false;
            },
          },
          false
        );
      } else {
        this.loadClaimData(data['claimDetails']);
      }
    });
    this.claimForm = this.claimFormService.getForm();
    this.handleTotals();
    // this.getSummaryTable();.
  }
  calculateTotals() {
    this.claimFormService.medicalActivities.valueChanges
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe(() => {
        const visibleControls = this.claimFormService.medicalActivities.controls.filter(
          ctrl => !ctrl.get('isDeleted')?.value
        );
        this.codingClaimEditService.updateTotals(visibleControls);
      });
  }
  private loadClaimData(claimData: ClaimDto | ClaimWithAuditDto) {

    this.claimData = claimData;
    this.claimFormService.initializeForm(this.claimData);
    this.setFormData();
    this.setClaimDate();
    this.formDetectChanges();
  }
  // set data as drafted in localStorage
  private formDetectChanges() {
    this.claimForm = this.claimFormService.getForm();
    this.codingClaimEditService.autoSaveDraft(this.claimForm, this.claimId, this.claimData);
  }

  setFormData() {
    this.medicalDiagnosis.clear();
    this.claimFormService.setActivityItem([], true);
    if (this.claimData?.medicalDiagnosis.length > 0) {
      this.claimData?.medicalDiagnosis.forEach(item => {
        this.addDiagnosis(item);
        this.diagnosisSearchDropdownList.push({
          id: item.diagnosis_id || item?.['diagnosisId'],
          disabled: false,
          name: item.diagnosisName,
        });
        this.claimFormService.setDiagnousisItem(this.diagnosisSearchDropdownList, true);
      });
    }

    this.medicalActivities.clear();
    if (this.claimData?.medicalActivities.length > 0) {
      this.claimData?.medicalActivities.forEach(item => {
        this.addActivity(item);
        this.activityTypeList.push({
          id: item.sub_type_id || item?.subTypeId,
          disabled: false,
          name: item.subActivitiesName,
          price: item.price,
        });
        this.claimFormService.setActivityItem(this.activityTypeList, true);
      });
    }
    this.claimFormService.onStartDateChange();
  }
  addActivity(item?: any) {
    this.claimFormService.addMedicalActivity(item);

    // this.getSearchResult(this.medicalActivities, this.medicalActivities.length - 1);
  }
  setClaimDate() {
    if (this.claimForm) {
      this.claimForm
        ?.get('visitStartDate')
        ?.valueChanges?.pipe(takeUntil(this.destroy$))
        .subscribe(dateStr => {
          const date = new Date(dateStr);
          this.codingClaimEditService.setVisitStartDate(date);
        });
    }
  }
  addDiagnosis(item?: DiagnosisDto) {
    this.claimFormService.addMedicalDiagnosis(false, item);
    // this.getSearchResult(this.medicalDiagnosis, this.medicalDiagnosis.length - 1);
  }

  ngAfterViewInit(): void {
    this.checkPage();
  }
  activateAuditUpdate($event: any) {
    this.activateAudit = $event;
    this.setAudtitDetailsHeaders();
  }
  checkPage() {
    const currentUrl = this.router.url;
    if (this.activateAudit || currentUrl.includes('view')) {
      this.claimForm.disable();
    }
  }
  confirmSubmit(exit: boolean) {
    this.disableSave = true;

    if (
      this.totalValues?.totalNet !== this.claimData?.total_Net &&
      this.claimData?.total_Net !== null
    ) {
      this.customConfirmationService.warnConfrim(
        ' Are you sure you want to submit with Entered Net not equal Claimed Net?',
        'Alert',
        {
          accept: () => {
            this.onSubmit(exit);
          },
          reject: () => {
            this.disableSave = false;

            if (!this.isPreDrafted) this.codingClaimEditService.clearDraft(this.claimId);
          },
          dismiss: () => {
            this.disableSave = false;
          },
        }
      );
    } else {
      this.onSubmit(exit);
    }
  }

  onSubmit(exit: boolean): void {
    this.claimForm.controls['isDraft'].setValue(!exit);

    const medicalActivitiesArray = this.claimFormService.medicalActivities as FormArray;

    // medicalActivitiesArray.controls.filter(a => !a.value.isDeleted);
    const updatedmedicalActivitiesArray = this.getUpdatedMedicalActivities(medicalActivitiesArray);

    // Replace the existing FormArray with the filtered one
    //this.claimForm.setControl('medicalActivities', updatedmedicalActivitiesArray);

    const medicalDiagnosisArray = this.claimFormService.medicalDiagnosis as FormArray;
    const updatedmedicalDiagnosisArray = this.getUpdatedMedicalDiagnosis(medicalDiagnosisArray);

    // Replace the existing FormArray with the filtered one
    //this.claimForm.setControl('medicalDiagnosis', updatedmedicalDiagnosisArray);
    // this.persistence.loadState(this.claimId.toString()).subscribe(saved => {
    //
    //   if (saved.state) {
    //     let confirmationHeader;
    //     this._LocalizationService.get('::error').subscribe(val => (confirmationHeader = val));
    //     this.customConfirmationService.error("This claim already submitted", confirmationHeader, 10000);
    //     this.persistence.removeState(this.claimId.toString())

    //     window.location.reload();

    //    }
    // });
    // Map form to EditClaimDto
    const formValue = this.claimForm.getRawValue();
    const editClaimDto: EditClaimDto = {
      id: formValue.id,
      encounterId: formValue.encounterId,
      patientNid: formValue.patientNid,
      visitStartDate: formValue.visitStartDate,
      visitEndDate: formValue.visitEndDate,
      physicianId: formValue.physicianId,
      isDraft: formValue.isDraft,
      concurrencyStamp: formValue.concurrencyStamp,
      medicalDiagnosis: updatedmedicalDiagnosisArray.controls.map((control: AbstractControl) => {
        const diagnosisValue = (control as FormGroup).getRawValue();
        return {
          id: diagnosisValue.id ?? 0,
          diagnosisId: diagnosisValue.diagnosisId,
          diagnosisType: diagnosisValue.diagnosisType,
          isDeleted: diagnosisValue.isDeleted || false,
        } as EditDiagnosisDto;
      }),
      medicalActivities: updatedmedicalActivitiesArray.controls.map((control: AbstractControl) => {
        const activityValue = (control as FormGroup).getRawValue();
        return {
          id: activityValue.id ?? 0,
          quantity: activityValue.quantity,
          gross: activityValue.gross,
          net: activityValue.net,
          patientShare: activityValue.patientShare,
          startTime: activityValue.startTime,
          activityTypeId: activityValue.activityTypeId,
          subTypeId: activityValue.subTypeId,
          isDeleted: activityValue.isDeleted || false,
          activityTags: activityValue.activityTags || [],
        } as EditMedicalActivityDto;
      }),
      claimsTags: formValue.claimsTags || [],
    };

    // ;
    this.claimService.editClaimByInput(editClaimDto).subscribe({
      next: res => {
        // re-assign the orignal data
        //this.claimForm.setControl('medicalActivities', medicalActivitiesArray);
        // this.claimForm.setControl('medicalDiagnosis', medicalDiagnosisArray);
        this.customConfirmationService.success('Claim Updated Successfully', 'Success', 1000);
        this.codingClaimEditService.clearDraft(this.claimId);
        this.claimForm.markAsPristine(); // for data from store again in localStorage
        // this.persistence.saveState({id:this.claimId.toString(),state:true}).subscribe({
        //   next: () => {
        // },
        //   error: err => console.error('Save failed', err)
        // });
        localStorage.setItem('reloadSignal', Date.now().toString());

        if (exit) {
          // this.location.back();
          const storedRoute = localStorage.getItem('editReturnUrl').toString();

          if (storedRoute) {
            this.router.navigateByUrl(storedRoute);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          window.location.reload();
        }
      },
      error: () => {
        //this.persistence.saveState({id:this.claimId.toString(),state:false}).subscribe();

        this.disableSave = false;
      },
      complete: () => {
        //this.persistence.saveState({id:this.claimId.toString(),state:true}).subscribe();
        this.disableSave = false;
      },
    });
  }

  confirmAuditSubmit(exit: boolean) {
    this.disableSave = true;

    const approvedMismatch =
      this.auditTotalValues?.totalApproved !== this.claimData?.audit_Appr_Amt;
    const rejectedMismatch = this.auditTotalValues?.totalRejected !== this.claimData?.audit_Rej_Amt;

    let message = '';
    this.disableSave = true;
    if (
      approvedMismatch &&
      rejectedMismatch &&
      this.claimData?.audit_Appr_Amt !== null &&
      this.claimData?.audit_Rej_Amt !== null
    ) {
      message =
        'Are you sure you want to submit with Entered Approved/Rejected amount not equal to Audited Approved/Rejected amount?';
    } else if (approvedMismatch && this.claimData?.audit_Appr_Amt !== null) {
      message =
        'Are you sure you want to submit with Entered Approved Net not equal to Audited Approved?';
    } else if (rejectedMismatch && this.claimData?.audit_Rej_Amt !== null) {
      message =
        'Are you sure you want to submit with Entered Rejected Net not equal to Audited Rejected?';
    }

    if (message) {
      this.customConfirmationService.warnConfrim(message, 'Alert', {
        accept: () => {
          this.auditSubmit(exit);
        },
        reject: () => {
          this.disableSave = false;
        },
        dismiss: () => {
          this.disableSave = false;
        },
      });
    } else {
      this.auditSubmit(exit);
    }
  }

  auditSubmit(exit: boolean): void {
    // ;
    const updatedAuditFormValue = this.getAuditForm(this.auditFormValue);
    this.auditFormValue = updatedAuditFormValue;
    // Replace the existing FormArray with the filtered one
    this.claimService.editAuditClaimByInput(this.auditFormValue.value).subscribe({
      next: res => {
        this.customConfirmationService.success('Claim Updated Successfully', 'Success', 1000);
        this.codingClaimEditService.clearDraft(this.claimId);
        if (exit) {
          // this.location.back();
          // this.router.navigate(['/claims-auditing/audit']);
          const storedRoute = localStorage.getItem('auditReturnUrl');

          if (storedRoute) {
            this.router.navigateByUrl(storedRoute);
          } else {
            this.router.navigate(['']);
          }
        }
      },
      error: () => {
        this.disableSave = false;
      },
      complete: () => {
        this.disableSave = false;
      },
    });
  }
  handleTotals() {
    // You can store and display the totals wherever you need
    this.codingClaimEditService.totals$.subscribe(totals => {
      this.totalValues = totals;
    });
  }
  handleAuditTotals(event) {
    this.auditTotalValues = event;
  }

  getAuditFormValue($event: any) {
    this.auditFormValue = $event;
  }
  // Handle the keydown event for tab cycling
  handleTabKeyDown(event: KeyboardEvent): void {
    // Handle the Tab key to cycle between tabs
    if (event.key === 'Tab') {
      event.preventDefault(); // Prevent default behavior of Tab
      this.cycleToNextTab(); // Manually cycle to next tab on Tab key press
    }

    // Check if Ctrl is pressed for cycling with Arrow keys
    if (event.key === 'Control') {
      this.ctrlPressed = true;
    }

    // Only trigger cycling if Ctrl is pressed and an arrow key is pressed together
    if (this.ctrlPressed) {
      if (event.key === 'ArrowRight') {
        event.preventDefault(); // Prevent default behavior of ArrowRight
        this.cycleToNextTab();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault(); // Prevent default behavior of ArrowLeft
        this.cycleToPreviousTab();
      }
    }
  }
  // Reset the flag when Ctrl key is released
  handleKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Control') {
      this.ctrlPressed = false;
    }
  }

  // Function to cycle to the next tab
  cycleToNextTab(): void {
    const tabOrder = ['claim', 'diagnosis', 'activities', 'history'];
    const currentTabIndex = tabOrder.indexOf(this.activeTab);
    this.activeTab = tabOrder[(currentTabIndex + 1) % tabOrder.length];
  }

  // Function to cycle to the previous tab
  cycleToPreviousTab(): void {
    const tabOrder = ['claim', 'diagnosis', 'activities', 'history'];
    const currentTabIndex = tabOrder.indexOf(this.activeTab);
    this.activeTab = tabOrder[(currentTabIndex - 1 + tabOrder.length) % tabOrder.length];
  }
  setAudtitDetailsHeaders() {
    if (this.activateAudit) {
      this.detailsColumns.push(
        {
          field: 'approved',
          header: 'Total Approved',
          type: 'number',
          width: '150px',
        },
        {
          field: 'rejected',
          header: 'Total Rejected',
          type: 'number',
          width: '150px',
        }
      );
    }
  }
  detailsCalculations(event) {
    this.detailsArray = event;
  }

  getDisableDiagnoses($event: any) {
    this.disableDiagnoses = $event;
  }
  getDisableActivities($event: any) {
    this.disableActivities = $event;
  }
  openPdf() {
    //this.downloadFile(this.claimECMBatche,  this. fileName +'.pdf')
    window.open(this.url, '_blank');
  }
  navigateToEdit() {
    if (this.router.url.includes('my-tasks')) {
      this.router.navigate(['my-tasks/edit', this.claimId], {
        queryParams: { batchId: this.claimData.batch_id },
      });
    } else {
      this.router.navigate(['coding-claims/edit', this.claimId], {
        queryParams: { batchId: this.claimData.batch_id },
      });
    }
  }
  navigateToAudit() {
    if (this.router.url.includes('my-tasks')) {
      this.router.navigate(['my-tasks/audit', this.claimId], {
        queryParams: { batchId: this.claimData.batch_id },
      });
    } else {
      this.router.navigate(['claims-auditing/audit', this.claimId], {
        queryParams: { batchId: this.claimData.batch_id },
      });
    }
  }
  getUpdatedMedicalActivities(medicalActivities: FormArray): FormArray {
    const updatedArray = new FormArray([]);
    medicalActivities.controls.forEach((group: AbstractControl) => {
      if (group instanceof FormGroup) {
        const isGroupDirty = group.dirty;
        const hasDirtyChild =
          Object.values(group.controls).some(control => control.dirty) ||
          group.get('isDirty')?.value;
        const isDeleted = group.get('isDeleted')?.value;
        const isNewItem = group.get('id')?.value == 0;
        if (
          (isGroupDirty || hasDirtyChild || isDeleted || isNewItem) &&
          !(isNewItem && isDeleted)
        ) {
          updatedArray.push(group);
        }
      }
    });
    return updatedArray;
  }
  getAuditForm(auditForms: FormArray): FormArray {
    const updatedArray = new FormArray([]);
    auditForms.controls.forEach((group: AbstractControl) => {
      if (group instanceof FormGroup) {
        const isDirty = Object.values(group.controls).some(
          control => control.dirty || control.pristine
        );

        if (isDirty) {
          // Push the whole original group (or a cloned one if you want immutability)
          updatedArray.push(group);
        }
      }
    });

    return updatedArray;
  }

  getUpdatedMedicalDiagnosis(medicalDiagnosis: FormArray): FormArray {
    const updatedArray = new FormArray([]);
    medicalDiagnosis.controls.forEach((group: AbstractControl) => {
      if (group instanceof FormGroup) {
        const isDeleted = group.get('isDeleted')?.value;
        const isDirty =
          group.dirty ||
          Object.values(group.controls).some(c => c.dirty) ||
          group.get('isDirty')?.value;
        const isNewItem = !group.get('id')?.value;
        if ((isDirty || isDeleted || isNewItem) && !(isNewItem && isDeleted)) {
          updatedArray.push(group);
        }
      }
    });
    return updatedArray;
  }
  openDetailsDialog() {
    this.openDetails = true;
    const visibleControls = this.claimFormService.medicalActivities.controls.filter(
      ctrl => !ctrl.get('isDeleted')?.value
    );
    const control = this.isAudit
      ? this.getAuditForm(this.auditFormValue).controls
      : visibleControls;

    this.codingClaimEditService.detailsGroupCalculations(control).subscribe(res => {
      this.detailsArray = res;
    });
  }
  openCliamDialog() {
    this.openClaimdSearchDialog = true;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.codingClaimEditService.destroy();
  }
  get formValidation(): boolean {
    const claimForm = this.claimFormService.getForm();
    // --- Filter visible (non-deleted) items ---

    const visibleDiagnosis = this.claimFormService.medicalDiagnosis.controls.filter(
      c => !c.get('isDeleted')?.value
    );

    const visibleActivities = this.claimFormService.medicalActivities.controls.filter(
      c => !c.get('isDeleted')?.value
    );

    const allDiagnosisValid = visibleDiagnosis.every(c => c.valid);

    const allActivitiesValid = visibleActivities.every(c => c.valid);

    const hasVisibleDiagnosis = visibleDiagnosis.length > 0;

    const hasVisibleActivities = visibleActivities.length > 0;
    const allValid =
      hasVisibleDiagnosis &&
      hasVisibleActivities &&
      allDiagnosisValid &&
      allActivitiesValid &&
      claimForm.valid;

    return allValid;
  }
  searchEncounter() {
    if (this.encounterId) {
      this.router.navigate(['/coding-claims/all'], { queryParams: { number: this.encounterId } });
      // this.getClaimsList();
    }
  }
  // getClaimsList() {
  //   const data: ClaimPagedAndFilterDto = {
  //     batch_id: undefined,
  //     patient_nid: undefined,
  //     number: this.encounterId || undefined,
  //     maxResultCount: undefined,
  //     skipCount: undefined,
  //     sorting: null,
  //   };

  //   this.claimService.getList(data).subscribe({
  //     next: res => {
  //       // console.log(res)
  //       this.claimsData = res.items;
  //       if(this.claimsData.length>0){
  //         if(![6].includes(res.items[0]?.batchStatusId)){
  //             this.redirect(res.items[0])
  //         }else{
  //              this.claimsSearchErrorMessage = "Cannot Edit On this Claim "
  //         }
        
  //       }else{
  //         this.claimsSearchErrorMessage = "There is No Claim with this Number"
  //       }
    
        
  //       // this.paginationInfo = { totalItems: res.totalCount };
  //     },
  //     error: () => {},
  //     complete: () => {},
  //   });
  // }
  // selectEncounter(encounter: any , index) {
  //   this.selectedEncounter = encounter;
  //   this.redirect(encounter , index);
  //   console.log('Selected Encounter:', encounter);
  // }
  // redirect(data: ClaimListDto) {
  //   // debugger
  //   const urlSegments = this.router.url.split('/');
  //   const lastIndex = urlSegments.length - 1;

  //   // replace with new id from user
  //   urlSegments[lastIndex] = data.id.toString();

  //   // navigate to new URL
  //   const newUrl = urlSegments.join('/');
  //   this.router.navigateByUrl(newUrl);
  //   this.openClaimdSearchDialog =false;
  //   this.encounterId= " ";
  //   this.claimsSearchErrorMessage="";
  // }
}
