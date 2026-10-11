import { LocalizationService } from '@abp/ng.core';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import {
  BreadwinnerRelationIfFatherDeceased,
  IncomeType,
} from '@proxy/ehealth-claims/common/enums/family';

@Component({
  selector: 'app-create-socail-research-form',
  templateUrl: './create-socail-research-form.component.html',
  styleUrl: './create-socail-research-form.component.scss',
})
export class CreateSocailResearchFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  Validators = Validators;

  incomeTypeOptions: { id: string; name: string }[] = [];
  questionOptions: { id: boolean; name: string }[] = [];
  relationList: { id: string; name: string }[] = [];
  currency: string = '';
  constructor(private _localizationService: LocalizationService) {}
  ngOnInit(): void {
    this.setRadioOptions();
  }
  setRadioOptions() {
    this.currency = this._localizationService.instant('RuleApplication::Common:EGYCurrency');
    this.incomeTypeOptions = Object.entries(IncomeType).map(([key, value]) => ({
      id: value,
      name: this._localizationService.instant(`RuleApplication::Families:${key}`),
    }));
    this.questionOptions = [
      { id: true, name: this._localizationService.instant('RuleApplication::Yes') },
      { id: false, name: this._localizationService.instant('RuleApplication::No') },
    ];
    this.relationList = Object.entries(BreadwinnerRelationIfFatherDeceased).map(([key, value]) => ({
      id: value,
      name: this._localizationService.instant(`RuleApplication::HOF:${value}`),
    }));
  }
}
