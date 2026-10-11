import { LocalizationService } from '@abp/ng.core';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';

@Component({
  selector: 'app-create-basic-family-form',
  templateUrl: './create-basic-family-form.component.html',
  styleUrl: './create-basic-family-form.component.scss',
})
export class CreateBasicFamilyFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  Validators = Validators;
  @Input() familyMembersCount: number = 0;
  @Input() familyCode?: string;
  egyptianOptions: { id: boolean; name: string; disabled: boolean }[] = [];
  anotherAddressOptions: { id: boolean; name: string }[] = [];
  districtList: SelectedDropDownList[] = [];
  governoratList: SelectedDropDownList[] = [];
  providerList: SelectedDropDownList[] = [];
  constructor(
    private _localizationService: LocalizationService,
    private _lookupServiceService: LookupAppServicesService,
  ) {}
  ngOnInit(): void {
    this.setRadioOptions();
    this.getGovernorateDropdownList();
    this.setFormChanges();
    this.preloadDependentLists();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['familyMembersCount'] && this.formGroup) {
      this.formGroup.get('familyMembersCount')?.setValue(
        this.familyMembersCount,
        { emitEvent: false }
      );
    }
  }

  preloadDependentLists() {
    const govId = this.formGroup.get('housingGovernorateId')?.value;
    if (govId) {
      this.formGroup.get('districtId')?.enable({ emitEvent: false });
      this.formGroup.get('primaryCareUnitId')?.enable({ emitEvent: false });
      this.getDistrictByGovernateId(govId);
      this.getProviderByGovernateId(govId);
    }
  }

  setRadioOptions() {
    this.egyptianOptions = [
      {
        id: true,
        name: this._localizationService.instant('RuleApplication::Yes'),
        disabled: this.formGroup.get('isHofEgyptian')?.disabled ?? false,
      },
      {
        id: false,
        name: this._localizationService.instant('RuleApplication::No'),
        disabled: this.formGroup.get('isHofEgyptian')?.disabled ?? false,
      },
    ];
    this.anotherAddressOptions = [
      { id: true, name: this._localizationService.instant('RuleApplication::Yes') },
      { id: false, name: this._localizationService.instant('RuleApplication::No') },
    ];
  }
  getGovernorateDropdownList() {
    this._lookupServiceService.getGovernateDropDownList().subscribe({
      next: res => {
        this.governoratList = res;
      },
      error: () => {},
      complete: () => {},
    });
  }

  setFormChanges() {
    const familyAddressControl = this.formGroup.get('familyAddress');
    const anotherAddressControl = this.formGroup.get('hasDifferentAddress');
    const newAddressControl = this.formGroup.get('newAddress');
    const governorateControl = this.formGroup.get('housingGovernorateId');
    const districtControl = this.formGroup.get('districtId');
    const pcuControl = this.formGroup.get('primaryCareUnitId');
    
    anotherAddressControl?.valueChanges.subscribe(value => {
      if (value === true) {
        newAddressControl?.enable({ emitEvent: false });
        newAddressControl?.setValidators([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(1000),
        ]);
      } else {
      
        newAddressControl?.clearValidators();
        newAddressControl?.disable({ emitEvent: false });
      }
      newAddressControl?.updateValueAndValidity({ emitEvent: false });
    });

    familyAddressControl?.valueChanges.subscribe(value => {
      if (value && value.length >= 2) {
        governorateControl?.enable();
      }
    });

    newAddressControl?.valueChanges.subscribe(value => {
      if (value && value.length >= 2) {
        governorateControl?.enable();
      }
    });

    governorateControl?.valueChanges.subscribe(value => {
      if (value) {
        districtControl?.enable();
        pcuControl?.enable();
        this.getDistrictByGovernateId(value);
        this.getProviderByGovernateId(value);
      } else {
        districtControl?.reset();
        districtControl?.disable();
        pcuControl?.reset();
        pcuControl?.disable();
      }
    });
  }





  getDistrictByGovernateId(id: number) {
    this._lookupServiceService.getAreaDropDownListByGovId(id).subscribe({
      next: res => {
        this.districtList = res;
      },
    });
  }
  getProviderByGovernateId(id: number) {
    this._lookupServiceService.getProviderByGovernateIdByGovId(id).subscribe({
      next: res => {
        this.providerList = res;
      },
      
    });
  }
}