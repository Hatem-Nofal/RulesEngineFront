import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from '@abp/ng.theme.shared';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';
import { FamilyService } from '@proxy/ehealth-claims/domains/family';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';
import { LocalizationModule, SessionStateService } from '@abp/ng.core';

@Component({
  selector: 'app-family-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LocalizationModule
  ],
 styleUrls: ['./family-form.component.scss'],
  templateUrl: './family-form.component.html',
})
export class FamilyFormComponent implements OnInit {
  @ViewChild('beneficiarySearchBox') beneficiarySearchBox!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  id!: number;
  loading = false;
@Input() familyMembersCount: number = 0; 
  beneficiaryOptions: any[] = [];
  beneficiarySearch = '';
  showBeneficiaryDropdown = false;
  selectedBeneficiaryName = '';

  isHofEgyptianOptions = [
    { name: 'Yes', id: true },
    { name: 'No', id: false },
  ];

  yesNoOptions = [
    { name: 'Yes', id: true },
    { name: 'No', id: false },
  ];

  ventilationStatusOptions = [
    { name: 'Good', id: 1 },
    { name: 'Bad', id: 2 },
  ];

  sanitationTypeOptions = [
    { name: 'Healthy', id: 1 },
    { name: 'Trench', id: 2 },
  ];

  waterSourceTypeOptions = [
    { name: 'Public', id: 1 },
    { name: 'Other', id: 2 },
  ];

  lightingTypeOptions = [
    { name: 'Electricity', id: 1 },
    { name: 'Other', id: 2 },
  ];

  barnLocationTypeOptions = [
    { name: 'Outside Home', id: 1 },
    { name: 'Inside Home', id: 2 },
  ];

  incomeTypeOptions = [
    { name: 'ثابت', id: 1 },
    { name: 'متغير', id: 2 },
  ];

  breadwinnerRelationOptions = [
    { name: 'Wife', id: 1 },
    { name: 'Son', id: 2 },
    { name: 'Daughter', id: 3 },
    { name: 'Father', id: 4 },
    { name: 'Mother', id: 5 },
    { name: 'Brother', id: 6 },
    { name: 'Sister', id: 7 },
    { name: 'Other', id: 8 },
  ];

  neighborhoodOptions: { name: string; id: number }[] = [];
  primaryCareUnitOptions: { name: string; id: number }[] = [];

  constructor(
    private sessionState: SessionStateService,
    private msgService: CustomConfirmationService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: FamilyService,
    private lookupService: LookupAppServicesService
  ) {}

  ngOnInit(): void {
    // this.sessionState.setLanguage('ar');
    this.buildForm();
if (this.familyMembersCount) {
    this.form.get('familyMembersCount')?.setValue(
      this.familyMembersCount,
      { emitEvent: false }
    );
  }
    const idParam = this.route.snapshot.params['id'];
    this.id = idParam ? +idParam : 0;

    this.loadNeighborhoods();
    this.loadPrimaryCareUnits();
    this.handleConditionalValidation();

    if (this.id) {
      this.load();
    } else {
      this.loadBeneficiaries();
    }
  }
ngOnChanges(changes: SimpleChanges): void {
    if (changes['familyMembersCount'] && this.form) {
      this.form.get('familyMembersCount')?.setValue(
        this.familyMembersCount,
        { emitEvent: false }
      );
    }
  }
buildForm(): void {
  this.form = this.fb.group(
    {
      beneficiaryId: [null, Validators.required],
      isHofEgyptian: [true, Validators.required],

      hofNationalId: [{ value: '', disabled: true }],
      hofFirstName: [{ value: '', disabled: true }],
      hofRestOfName: [{ value: '', disabled: true }],

      currentAddress: [
        '',
        [
          Validators.required,
          Validators.maxLength(500),
        ],
      ],

      hasDifferentAddress: [false, Validators.required],
      newAddress: ['', Validators.maxLength(500)],

      neighborhood: [null],
      primaryCareUnitId: [null],

      mobilePhone: [
        '',
        [
          Validators.pattern(/^[0-9]{10,15}$/),
        ],
      ],

      homePhone: [
        '',
        [
          Validators.maxLength(20),
        ],
      ],

      workPhone: [
        '',
        [
          Validators.maxLength(20),
        ],
      ],

      nearestPhone: [
        '',
        [
          Validators.maxLength(20),
        ],
      ],

      familyMembersCount: [
        1,
        [
          Validators.required,
          Validators.min(1),
        ],
      ],

      womenCount: [
        0,
        [
          Validators.min(0),
        ],
      ],

      roomsCountTotal: [
        0,
        [
          Validators.required,
          Validators.min(0),
        ],
      ],

      roomsCountForSleeping: [
        0,
        [
          Validators.required,
          Validators.min(0),
        ],
      ],

      ventilationStatus: [null, Validators.required],
      sanitationType: [null, Validators.required],
      waterSourceType: [null, Validators.required],
      lightingType: [null, Validators.required],

      hasBarn: [false, Validators.required],
      barnLocationType: [null],

      hasBirdsOrAnimalsAtHome: [false, Validators.required],

      incomeType: [null, Validators.required],

      averageMonthlyIncome: [
        0,
        [
          Validators.min(0),
        ],
      ],

      hasChronicDiseases: [false, Validators.required],
      hasDisabilities: [false, Validators.required],
      receivesSocialSecurityPension: [false, Validators.required],

      breadwinnerRelationIfFatherDeceased: [null],

      notes: [
        '',
        [
          Validators.maxLength(1000),
        ],
      ],
    },
    {
      validators: [this.roomsValidator],
    }
  );
}

  get f() {
    return this.form.controls;
  }

  private roomsValidator = (group: AbstractControl): ValidationErrors | null => {
    const total = group.get('roomsCountTotal')?.value ?? 0;
    const sleeping = group.get('roomsCountForSleeping')?.value ?? 0;

    if (sleeping > total) {
      return { invalidRooms: true };
    }

    return null;
  };

  handleConditionalValidation(): void {
    this.form.get('hasDifferentAddress')?.valueChanges.subscribe(value => {
      const control = this.form.get('newAddress');
      if (value) {
        control?.setValidators([Validators.required, Validators.maxLength(500)]);
      } else {
        control?.clearValidators();
        control?.setValue('');
      }
      control?.updateValueAndValidity();
    });

    this.form.get('hasBarn')?.valueChanges.subscribe(value => {
      const control = this.form.get('barnLocationType');
      if (value) {
        control?.setValidators([Validators.required]);
      } else {
        control?.clearValidators();
        control?.setValue(null);
      }
      control?.updateValueAndValidity();
    });
  }

 load(): void {
  this.loading = true;

  this.service.getByIdById(this.id).subscribe({
    next: (res: any) => {
      if (res) {
        this.form.patchValue({
          beneficiaryId: res.beneficiaryId,
          isHofEgyptian: res.isHofEgyptian,
          hofNationalId: res.hofNationalId,
          hofFirstName: res.hofFirstName,
          hofRestOfName: res.hofRestOfName,
          currentAddress: res.currentAddress,
          hasDifferentAddress: res.hasDifferentAddress,
          newAddress: res.newAddress,
          neighborhood: res.neighborhood,
          primaryCareUnitId: res.primaryCareUnitId,
          mobilePhone: res.mobilePhone,
          homePhone: res.homePhone,
          workPhone: res.workPhone,
          nearestPhone: res.nearestPhone,
          familyMembersCount: res.familyMembersCount,
          womenCount: res.womenCount,
          roomsCountTotal: res.roomsCountTotal,
          roomsCountForSleeping: res.roomsCountForSleeping,
          ventilationStatus: res.ventilationStatus,
          sanitationType: res.sanitationType,
          waterSourceType: res.waterSourceType,
          lightingType: res.lightingType,
          hasBarn: res.hasBarn,
          barnLocationType: res.barnLocationType,
          hasBirdsOrAnimalsAtHome: res.hasBirdsOrAnimalsAtHome,
          incomeType: res.incomeType,
          averageMonthlyIncome: res.averageMonthlyIncome,
          hasChronicDiseases: res.hasChronicDiseases,
          hasDisabilities: res.hasDisabilities,
          receivesSocialSecurityPension: res.receivesSocialSecurityPension,
          breadwinnerRelationIfFatherDeceased: res.breadwinnerRelationIfFatherDeceased,
          notes: res.notes,
        });

        this.selectedBeneficiaryName =
          res.beneficiaryName ||
          res.beneficiary?.name ||
          '';

        if (this.selectedBeneficiaryName) {
          this.beneficiarySearch = this.selectedBeneficiaryName;
        }

        this.loadBeneficiaries(this.selectedBeneficiaryName || undefined, true);
      }

      this.loading = false;
    },
    error: () => {
      this.loading = false;
    },
  });
}

  loadBeneficiaries(name: string='', keepSelected = false): void {
    this.lookupService.getBeneficiariesDropDownByName(name).subscribe({
      next: (res: any[]) => {
        this.beneficiaryOptions = res.map(x => ({
          name: x.name,
          id: x.id,
          nationalId: x.nationalId,
          firstName: x.firstName,
          restOfName : x.restOfName
        }));

        if (keepSelected) {
          this.syncSelectedBeneficiaryText();
        }
      },
      error: () => {
        this.beneficiaryOptions = [];
      },
    });
  }

  syncSelectedBeneficiaryText(): void {
    const selectedId = this.form.get('beneficiaryId')?.value;
    if (!selectedId) return;

    const selected = this.beneficiaryOptions.find(x => x.id === selectedId);
    if (selected) {
      this.selectedBeneficiaryName = selected.name;
      this.beneficiarySearch = selected.name;
    }
  }

selectBeneficiary(item: any): void {
  this.form.get('beneficiaryId')?.setValue(item.id);
  this.form.get('beneficiaryId')?.markAsTouched();

  this.selectedBeneficiaryName = item.name;
  this.beneficiarySearch = item.name;
  this.form.patchValue({
    hofNationalId: item.nationalId || '',
    hofFirstName: item.firstName || '',
    hofRestOfName: item.restOfName || ''
  });

  this.showBeneficiaryDropdown = false;
}

  onBeneficiarySearch(): void {
    const value = (this.beneficiarySearch || '').trim();

    if (!value) {
      this.form.get('beneficiaryId')?.setValue(null);
      this.selectedBeneficiaryName = '';
      this.loadBeneficiaries();
      this.showBeneficiaryDropdown = false;
      return;
    }

    if (this.selectedBeneficiaryName && value !== this.selectedBeneficiaryName) {
      this.form.get('beneficiaryId')?.setValue(null);
    }

    this.loadBeneficiaries(value);
    this.showBeneficiaryDropdown = true;
  }

  onBeneficiaryFocus(): void {
    const value = (this.beneficiarySearch || '').trim();
    this.loadBeneficiaries(value || undefined, true);
    this.showBeneficiaryDropdown = true;
  }

  clearBeneficiarySearch(): void {
    this.beneficiarySearch = '';
    this.selectedBeneficiaryName = '';
    this.form.get('beneficiaryId')?.setValue(null);
    this.showBeneficiaryDropdown = false;
    this.loadBeneficiaries();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.beneficiary-search-wrapper')) {
      this.showBeneficiaryDropdown = false;
    }
  }

save(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const handleError = (error: any) => {
    const message =
      error?.error?.error?.message ||
      error?.error?.message?.value ||
      error?.error?.message ||
      error?.message ||
      'An unexpected error occurred';

    this.msgService.error(message, 'Error', 5000);
    this.loading = false;
  };

  this.loading = true;

  const request = this.id
    ? { id: this.id, ...this.form.getRawValue() }
    : this.form.getRawValue();

  const apiCall = this.id
    ? this.service.updateByInput(request)
    : this.service.createByInput(request);

  apiCall.subscribe({
    next: () => {
      this.msgService.success(
        this.id ? 'Updated successfully' : 'Created successfully',
        'Success',
        1000
      );
      this.loading = false;
      this.cancel();
    },
    error: handleError,
  });
}
  cancel(): void {
    this.router.navigate(['/families']);
  }

  loadNeighborhoods(): void {
    const method = (this.lookupService as any).getNeighborhoods?.bind(this.lookupService);
    if (!method) return;

    method().subscribe({
      next: (res: any[]) => {
        this.neighborhoodOptions = res.map(x => ({
          name: x.name,
          id: x.id,
        }));
      },
      error: () => {
        this.neighborhoodOptions = [];
      },
    });
  }

  loadPrimaryCareUnits(): void {
    const method = (this.lookupService as any).getPrimaryCareUnits?.bind(this.lookupService);
    if (!method) return;

    method().subscribe({
      next: (res: any[]) => {
        this.primaryCareUnitOptions = res.map(x => ({
          name: x.name,
          id: x.id,
        }));
      },
      error: () => {
        this.primaryCareUnitOptions = [];
      },
    });
  }
}