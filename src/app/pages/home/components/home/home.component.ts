import { Component } from '@angular/core';
import { BatchesCodingPermissions, ClaimsCodingPermissions, DigitalArchivePermissions, MyTasksPermissions } from 'src/app/shared/models/appPermissions';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false,
})
export class HomeComponent {
  myTasksPermissionsEntry = MyTasksPermissions.MyTasksEntry
  batchesProcessingPermissions = BatchesCodingPermissions.BatchesCodingAll
  claimsProcessingPermissions = ClaimsCodingPermissions.ClaimsCodingAll
  digitalArchivePermissions = DigitalArchivePermissions.DigitalArchiveProviders
  myTasksPermissionsAudit = MyTasksPermissions.MyTasksAudit
}
