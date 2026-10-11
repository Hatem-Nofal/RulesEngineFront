import { LocalizationService } from '@abp/ng.core';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import {
  BarnLocationType,
  LightingType,
  Sewage,
  VentilationStatus,
  WaterSourceType,
} from '@proxy/ehealth-claims/common/enums/family';

@Component({
  selector: 'app-create-housing-condition-form',
  templateUrl: './create-housing-condition-form.component.html',
  styleUrl: './create-housing-condition-form.component.scss',
})
export class CreateHousingConditionFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  Validators = Validators;

  ventilationOptions: { id: string; name: string }[] = [];
  waterSourceOptions: { id: string; name: string }[] = [];
  sewageOptions: { id: string; name: string }[] = [];
  lightingOptions: { id: string; name: string }[] = [];
  animalsOptions: { id: boolean; name: string }[] = [];
  barnOptions: { id: boolean; name: string }[] = [];
  barnLocationOptions: { id: string; name: string }[] = [];

  constructor(private _localizationService: LocalizationService) {}
  ngOnInit(): void {
    this.setRadioOptions();
    this.subscribeToBarn();
  }
  private subscribeToBarn(): void {
    const barnFlag = this.formGroup.get('hasBarn');
    const barnLocation = this.formGroup.get('barnLocationType');
 
    barnFlag?.valueChanges.subscribe(value => {
      if (value === true) {
        barnLocation?.enable({ emitEvent: false });
        barnLocation?.setValidators([Validators.required]);
      } else {
        barnLocation?.clearValidators();
        barnLocation?.disable({ emitEvent: false });
      }
      barnLocation?.updateValueAndValidity({ emitEvent: false });
    });
 
    if (barnFlag?.value === true) {
      barnLocation?.enable({ emitEvent: false });
      barnLocation?.setValidators([Validators.required]);
      barnLocation?.updateValueAndValidity({ emitEvent: false });
    }
  }
  setRadioOptions() {
    this.ventilationOptions = Object.entries(VentilationStatus).map(([key, value]) => ({
      id: value,
      name: this._localizationService.instant(`RuleApplication::Families:${key}`),
    }));
    this.waterSourceOptions = Object.entries(WaterSourceType).map(([key, value]) => ({
      id: value,
      name: this._localizationService.instant(`RuleApplication::Families:${key}`),
    }));
    this.sewageOptions = Object.entries(Sewage).map(([key, value]) => ({
      id: value,
      name: this._localizationService.instant(`RuleApplication::Families:${key}`),
    }));
    this.lightingOptions = Object.entries(LightingType).map(([key, value]) => ({
      id: value,
      name: this._localizationService.instant(`RuleApplication::Families:${key}`),
    }));
    this.animalsOptions = [
      { id: true, name: this._localizationService.instant('RuleApplication::Families:Exist') },
      {
        id: false,
        name: this._localizationService.instant('RuleApplication::Families:NotExist'),
      },
    ];
    this.barnOptions = [
      { id: true, name: this._localizationService.instant('RuleApplication::Families:Exist') },
      {
        id: false,
        name: this._localizationService.instant('RuleApplication::Families:NotExist'),
      },
    ];
    this.barnLocationOptions = Object.entries(BarnLocationType).map(([key, value]) => ({
      id: value,
      name: this._localizationService.instant(`RuleApplication::Families:${key}`),
    }));
  }
}
