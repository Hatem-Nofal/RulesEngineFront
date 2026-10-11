import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustomDropdownComponent } from 'src/app/shared/components/CVA-Form/custom-dropdown/custom-dropdown.component';
import { CustomInputComponent } from 'src/app/shared/components/CVA-Form/custom-input/custom-input.component';
import { FormsErrorComponent } from 'src/app/shared/components/CVA-Form/forms-error/forms-error.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CustomDropdownMultipleComponent } from '../../../../../../../shared/components/CVA-Form/custom-dropdown-multiple/custom-dropdown-multiple.component';
import { MaxCharactersDirective } from 'src/app/shared/directives/max-charcters/max-characters.directive';
import { SelectedDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import { ClaimDto } from '@proxy/ehealth-claims/domains/claim';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups';

@Component({
  selector: 'app-claims-edit-claim',
  templateUrl: './claims-edit-claim.component.html',
  styleUrl: './claims-edit-claim.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    CustomDropdownComponent,
    CustomInputComponent,
    FormsErrorComponent,
    CustomDropdownMultipleComponent,
    MaxCharactersDirective,
  ],
})
export class ClaimsEditClaimComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() data: ClaimDto;
  minYear: string = '2018-01-01T00:00';
  value: string = '';

  claimsTagOptions: SelectedDropDownList[] = [];
  clinicianOptions: SelectedDropDownList[];

  constructor(private lookupAppServicesService: LookupAppServicesService) {}
  ngOnInit(): void {
    // this.setFormControls();
    this.getTagsOption();
    this.getClinicianOptions();
  }
  getClinicianOptions() {
    this.lookupAppServicesService.getClinicansDropDownList().subscribe({
      next: res => {
        this.clinicianOptions = res;
      },
    });
  }
  getTagsOption() {
    this.lookupAppServicesService.getClaimTagsDropDownList().subscribe({
      next: res => {
        this.claimsTagOptions = res;
      },
    });
  }
  originalPateintFlagMessage() {
    let message: string = '';
    switch (this.data.nid_Valid_Flag) {
      case 'missing':
        message = 'Original patient ID is missing.';
        break;
      case 'lessThan14':
        message = 'Original patient ID is less than 14 characters';
        break;
      case 'moreThan14':
        message = 'Original patient ID is more than 14 characters.';
        break;
      default:
        message = ' Check Original patient ID';
        break;
    }
    return message;
  }
  // setFormControls() {
  //
  //   this.formGroup = new FormGroup({
  //     patient_id: new FormControl(this.data.patient_nid, [Validators.required]),
  //     encounterId: new FormControl(this.data.number, [Validators.required]),
  //     start_time: new FormControl(this.data.visit_Start_Date, [Validators.required]),
  //     end_time: new FormControl(this.data.visit_End_Date, [Validators.required]),
  //     physicianId: new FormControl(1, [Validators.required]),
  //     claim_tags: new FormControl(this.data.claimsTags, [Validators.required]),
  //     batch_id: new FormControl(this.data.batch_id, [Validators.required])
  //   });
  // }
}
