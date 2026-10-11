import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectedWithProviderDropDownList, SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import { CreateBatchDto } from '@proxy/ehealth-claims/application/contracts/domains/batch';
import { BatchService } from '@proxy/ehealth-claims/application/domains/batchs';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';
import { CustomDropdownComponent } from 'src/app/shared/components/CVA-Form/custom-dropdown/custom-dropdown.component';
import { CustomInputComponent } from 'src/app/shared/components/CVA-Form/custom-input/custom-input.component';
import { FormsErrorComponent } from 'src/app/shared/components/CVA-Form/forms-error/forms-error.component';
import { CustomConfirmationService } from 'src/app/shared/services/customConfirmation.service';

@Component({
  selector: 'app-coding-batches-create',
  templateUrl: './coding-batches-create.component.html',
  styleUrl: './coding-batches-create.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomInputComponent,
    FormsErrorComponent,
    CustomDropdownComponent,
  ],
})
export class CodingBatchesCreateComponent implements OnInit {
  healthcareForm: FormGroup;
  providerList: SelectedWithProviderDropDownList[];
  statusList: SelectedDropDownList[];
  typeList: SelectedDropDownList[];
  constructor(
    private fb: FormBuilder,
    private batchService: BatchService,
    private lookAppServicesService: LookupAppServicesService,
    private router: Router,
    private customConfirmationService: CustomConfirmationService,
    private location: Location
  ) {
    this.healthcareForm = this.fb.group({
      ehealth_Batch_code: ['', Validators.required],
      providerCode: [''],
      uhiA_Batch_code: ['', Validators.required],
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
  sucessCallForbatch(formData: CreateBatchDto) {
    this.batchService.create(formData).subscribe({
      next: res => {
        this.customConfirmationService.success('Batch Created Sucessfully', 'Sucess', 1000);
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
}
