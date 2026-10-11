import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { CustomCheckboxComponent } from 'src/app/shared/components/CVA-Form/custom-checkbox/custom-checkbox.component';
import { CustomDropdownMultipleComponent } from 'src/app/shared/components/CVA-Form/custom-dropdown-multiple/custom-dropdown-multiple.component';
import { CustomInputComponent } from 'src/app/shared/components/CVA-Form/custom-input/custom-input.component';
import { FormsErrorComponent } from 'src/app/shared/components/CVA-Form/forms-error/forms-error.component';
import { NumbersWithDotDirective } from 'src/app/shared/directives/numbers-with-dot/numbersWithDot.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { LookupsCodingEditService } from '../../../lookups-coding-edit.service';
import { SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';

@Component({
  selector: 'app-claims-audit-activity',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    CustomCheckboxComponent,
    CustomInputComponent,
    Dialog,
    ButtonModule,
    CustomDropdownMultipleComponent,
    FormsErrorComponent,
    NumbersWithDotDirective,
  ],
  templateUrl: './claims-audit-activity.component.html',
  styleUrl: './claims-audit-activity.component.scss',
})
export class ClaimsAuditActivityComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) formGroup: FormGroup;
  @Input({ required: true }) data: any;

  option: SelectedDropDownList[] = [];
  dialogReasons: boolean = false;
  dropdownOptions: any;
  dropdownRejectionReasons: SelectedDropDownList[];
  haveReasons: boolean = false;
  addReasons: boolean = false;

  /**
   *
   */
  constructor(
    private lookupsCodingEditService: LookupsCodingEditService,
    private cdr: ChangeDetectorRef
  ) {}
  ngAfterViewInit(): void {
    this.getAuditTags();
  }

  ngOnInit(): void {
    this.onChangePrice(this.data.rejectedAmount, this.data.approvedAmount);

    this.getRejectionReasons();
  }
  getAuditTags() {
    this.lookupsCodingEditService.getClaimAuditDropDownList().subscribe({
      next: res => {
        this.option = res;
        this.cdr.detectChanges();
      },
      error: err => {},
      complete: () => {},
    });
  }
  showDialog() {
    this.dialogReasons = true;
  }
  getRejectionReasons() {
    this.lookupsCodingEditService.getActivityRegectionReasonDropDownList().subscribe({
      next: res => {
        this.dropdownRejectionReasons = res;
      },
      error: err => {
        console.error(err);
      },
      complete: () => {},
    });
  }
  onChangePrice(rejected, approved, input?: string) {
    const net = Number(this.data.net);
    if (this.data.net === null || this.data.net === undefined || isNaN(net)) {
      if (!this.formGroup.get('approvedAmount').value || !approved) {
        this.formGroup.get('approvedAmount').setValue(0);
      }
      if (!this.formGroup.get('rejectedAmount').value || !rejected) {
        this.formGroup.get('rejectedAmount').setValue(0);
      }
      return;
    }

    if (rejected) {
      rejected = Number(rejected);
    }
    if (approved) {
      approved = Number(approved);
    }

    if (input === 'rejectedAmount') {
      if (net - rejected > 0) {
        this.formGroup.get('approvedAmount').setValue((net - rejected).toFixed(3));
        approved = net - rejected;
      }
      this.formGroup.get('rejectedAmount').setValue(rejected);
    } else if (input === 'approvedAmount') {
      if (net - approved > 0) {
        this.formGroup.get('rejectedAmount').setValue((net - approved).toFixed(3));
        rejected = net - approved;
      }
      this.formGroup.get('approvedAmount').setValue(approved);
    }
    if (approved + rejected > net) {
      this.formGroup.get('approvedAmount').setValue(0);
      this.formGroup.get('rejectedAmount').setValue(0);
    }
    if (!this.formGroup.get('approvedAmount').value || !approved) {
      this.formGroup.get('approvedAmount').setValue(0);
    }
    if (!this.formGroup.get('rejectedAmount').value || !rejected) {
      this.formGroup.get('rejectedAmount').setValue(0);
    }

    // Always update form values
    this.formGroup.get('approvedAmount').setValue(this.formatValue(approved));
    this.formGroup.get('rejectedAmount').setValue(this.formatValue(rejected));
    if (rejected + approved > net) {
      // this.formGroup.get('approvedAmount').setValue(0);
      // this.formGroup.get('rejectedAmount').setValue(0);
      this.formGroup.setErrors({
        customError:
          'Approved Amount And Rejected Amount Must Equal Net Amount (Net = Approved Amount + Rejected Amount)',
      });
    } else {
      this.formGroup.setErrors(null);
      this.haveReasons = this.data.activityRejectionReasons > 0 ? true : false;
      this.addReasons = rejected > 0 ? true : false;
      this.checkReasonsEntered();
    }
  }

  checkReasonsEntered() {
    if (this.formGroup.get('activityRejectionReasons').value.length == 0 && this.addReasons) {
      this.formGroup.setErrors({ customError: 'Please Add Rejection Reasons' });
    }
  }

  formatValue = (value: number): string => {
    if (value === 0 || !value) return '0';
    return Number.isInteger(value) ? value?.toString() : value?.toFixed(3);
  };
}
