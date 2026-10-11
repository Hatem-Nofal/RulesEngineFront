import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { LocalizationModule, LocalizationService } from '@abp/ng.core';


@Component({
  selector: 'app-validation-summary',
  standalone: true,
  imports: [CommonModule, LocalizationModule],
  templateUrl: './validation-summary.component.html',
  styleUrl: './validation-summary.component.scss',
})
export class ValidationSummaryComponent {
  @Input() errorMessages: string[] | null = null;

  @Input() formGroup?: FormGroup;

  @Input() fieldLabels: Record<string, string> = {};

  @Input() showWhenUntouched = false;
  
  constructor(private _localizationService: LocalizationService) {}

  /** The list the template renders. */
  get errors(): string[] {
    if (this.errorMessages && this.errorMessages.length) {
      return this.errorMessages;
    }
    if (this.formGroup) {
      return this.buildFromForm(this.formGroup);
    }
    return [];
  }

  private buildFromForm(group: FormGroup, acc: string[] = []): string[] {
    Object.keys(group.controls).forEach(key => {
      const control = group.get(key);
      if (!control) return;

      // Recurse into nested groups
      if ((control as FormGroup).controls) {
        this.buildFromForm(control as FormGroup, acc);
        return;
      }

      const shouldCheck = this.showWhenUntouched || control.touched;
      if (control.invalid && shouldCheck) {
        const label =
          this.fieldLabels[key] ||
          this._localizationService.instant(`RuleApplication::Families:${this.cap(key)}`);
        acc.push(this.messageFor(label, control.errors));
      }
    });
    return acc;
  }

  private messageFor(label: string, errors: any): string {
    if (!errors) return label;
    if (errors['required']) {
      return `${label} ${this._localizationService.instant('RuleApplication::Validation:IsRequired')}`;
    }
    if (errors['minlength']) {
      return `${label} ${this._localizationService.instant('RuleApplication::Validation:TooShort')}`;
    }
    if (errors['maxlength']) {
      return `${label} ${this._localizationService.instant('RuleApplication::Validation:TooLong')}`;
    }
    if (errors['min']) {
      return `${label} ${this._localizationService.instant('RuleApplication::Validation:TooSmall')}`;
    }
    if (errors['max']) {
      return `${label} ${this._localizationService.instant('RuleApplication::Validation:TooLarge')}`;
    }
    if (errors['pattern']) {
      return `${label} ${this._localizationService.instant('RuleApplication::Validation:InvalidFormat')}`;
    }
    return label;
  }

  private cap(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}