import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectedWithProviderDropDownList, SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import { UpdateBatchDto } from '@proxy/ehealth-claims/application/contracts/domains/batch';
import { BatchService } from '@proxy/ehealth-claims/application/domains/batchs';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';
import { CustomDropdownComponent } from 'src/app/shared/components/CVA-Form/custom-dropdown/custom-dropdown.component';
import { CustomInputComponent } from 'src/app/shared/components/CVA-Form/custom-input/custom-input.component';
import { FormsErrorComponent } from 'src/app/shared/components/CVA-Form/forms-error/forms-error.component';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';

@Component({
  selector: 'app-coding-batches-edit',
  templateUrl: './coding-batches-edit.component.html',
  styleUrl: './coding-batches-edit.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomInputComponent,
    CustomDropdownComponent,
    FormsErrorComponent,
  ],
})
export class CodingBatchesEditComponent implements OnInit {
  healthcareForm: FormGroup;
  providerList: SelectedWithProviderDropDownList[];
  statusList: SelectedDropDownList[];
  typeList: SelectedDropDownList[];
  batchId: number;

  constructor(
    private fb: FormBuilder,
    private batchService: BatchService,
    private lookAppServicesService: LookupAppServicesService,
    private activatedRoute: ActivatedRoute,
    private customConfirmationService: CustomConfirmationService,
    private router: Router
  ) {
    this.healthcareForm = this.fb.group({
      ehealth_Batch_code: ['', Validators.required],
      providerCode: [''],
      uhia_Batch_code: ['', Validators.required],
      providerType: [''],
      // lhaSerial: ['', Validators.required],
      provider_id: ['', Validators.required],
      type_id: ['', Validators.required],
      status_id: ['', Validators.required],
      reception_Date: ['', Validators.required],
      service_Date: ['', Validators.required],
      claims_Count: [0, [Validators.required, Validators.min(0)]],
      claims_Amount: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.getStatusList();
    this.getTypeList();
    this.onProviderSelect();
    this.getProvidersNameList();
    this.batchId = +this.activatedRoute.snapshot.paramMap.get('id');
    if (this.batchId) {
      this.getBatchById(this.batchId);
    }
  }

  onSubmit() {
    if (this.healthcareForm.valid) {
      const formData = this.healthcareForm.value;
      const { providerCode, providerType, ...updatedFormData } = formData;

      this.sucessCallForbatch(updatedFormData);
    } else {
      Object.keys(this.healthcareForm.controls).forEach(key => {
        const control = this.healthcareForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
  sucessCallForbatch(formData: UpdateBatchDto) {
    this.batchService.update(this.batchId, formData).subscribe({
      next: res => {
        this.customConfirmationService.success('Batch Uptdated Sucessfully', 'Sucess', 5000);

      const storedRoute = localStorage.getItem('editReturnUrl');
        if (storedRoute) {
            this.router.navigate([storedRoute]);
          }else{
            this.router.navigate(['']);
          }
      },
    });
  }

  getProvidersNameList() {
    this.lookAppServicesService.getProviderDropDownList().subscribe({
      next: res => {
        this.providerList = res;
      },
    });
  }

  getTypeList() {
    this.lookAppServicesService.getServiceTypeDropDownList().subscribe({
      next: res => {
        this.typeList = res;
      },
    });
  }
  getStatusList() {
    this.lookAppServicesService.getBatchStatusDropDownList().subscribe({
      next: res => {
        this.statusList = res;
      },
    });
  }

  onProviderSelect() {
    this.healthcareForm.get('provider_id')?.valueChanges.subscribe(value => {
      const selectedProvider = this.providerList?.find(provider => provider.id == value);
      if (selectedProvider) {
        this.healthcareForm.get('providerType')?.setValue(selectedProvider.type);
        this.healthcareForm.get('providerCode')?.setValue(selectedProvider.code);
      }
    });
  }
  patchValues(batchInfo) {
    this.healthcareForm.patchValue({
      ehealth_Batch_code: batchInfo.ehealth_Batch_code || '',
      providerCode: batchInfo.provider.code || '',
      uhia_Batch_code: batchInfo.uhia_Batch_code || '',
      providerType: batchInfo.provider.providerType_Name || '',
      // lhaSerial: batchInfo.lhaSerial || batchInfo.serial,
      provider_id: batchInfo.provider_id || '',
      type_id: batchInfo.type_id || '',
      status_id: batchInfo.status_id || '',
      reception_Date: batchInfo.reception_Date || '',
      service_Date: batchInfo.service_Date || '',
      claims_Count: batchInfo.claims_Count >= 0 ? batchInfo.claims_Count : 0,
      claims_Amount: batchInfo.claims_Amount >= 0 ? batchInfo.claims_Amount : 0,
    });
  }

  getBatchById(id) {
    this.batchService.get(id).subscribe({
      next: res => {
        this.patchValues(res);
      },
    });
  }
}
