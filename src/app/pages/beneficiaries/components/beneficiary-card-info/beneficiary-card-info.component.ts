import { PermissionService } from '@abp/ng.core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BeneficiariesPermissions } from 'src/app/shared/models/appPermissions';

@Component({
  selector: 'app-beneficiary-card-info',
  standalone: false,
  templateUrl: './beneficiary-card-info.component.html',
  styleUrl: './beneficiary-card-info.component.scss',
})
export class BeneficiaryCardInfoComponent {
  @Input() formGroup!: FormGroup; // Accepts either hofForm or member FormGroup
  @Input() showMoreDetails = false; // Toggle for details
  @Input() index?: number; // Optional index for array items
  @Input() viewAction!: string;
  @Output() update = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  deletePermission: boolean;
  updatePermossion:boolean;
  constructor(public permission: PermissionService) {
    this.deletePermission = this.permission.getGrantedPolicy(
      BeneficiariesPermissions.BeneficiariesDelete,
    );
    this.updatePermossion = this.permission.getGrantedPolicy(
      BeneficiariesPermissions.BeneficiariesUpdate,
    );
  }
  toggleDetails() {
    this.showMoreDetails = !this.showMoreDetails;
  }

  onUpdate() {
    this.update.emit(this.formGroup.value);
    // this.showForm.emit(this.beneficiaryType)
  }
  onDelete() {
    if (this.index !== undefined) {
      this.delete.emit(this.index);
    }
  }
}
