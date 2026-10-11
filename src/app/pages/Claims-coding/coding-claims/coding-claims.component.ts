import { PermissionService } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { FormPageComponent } from 'src/app/shared/components/CVA-Form/form-page/form-page.component';
import {
  ClaimsCodingPermissions,
  ClaimsProcessingPermissions,
} from 'src/app/shared/models/appPermissions';
import { CustomDropDown } from 'src/app/shared/models/inputs.model';
import { PaginationInfo } from 'src/app/shared/models/table.model';
import { SharedModule } from 'src/app/shared/shared.module';
import { CodingClaimsConfig } from './coding-claims.config';
import { ClaimListDto, ClaimPagedAndFilterDto, ClaimService } from '@proxy/ehealth-claims/domains/claim';

@Component({
  selector: 'app-coding-claims',
  templateUrl: './coding-claims.component.html',
  styleUrl: './coding-claims.component.scss',
  standalone: true,
  imports: [SharedModule, CommonModule, FormPageComponent],
})
export class CodingClaimsComponent extends CodingClaimsConfig implements OnInit {
  @ViewChild(FormPageComponent) formPage!: FormPageComponent;
  selectedOption: string;
  paginationInfo: PaginationInfo = {};
  claimsCodingPermissions = ClaimsCodingPermissions;
  claimsProcessingPermissions = ClaimsProcessingPermissions; // processing is auditing
  actions = {};
  claimsData: ClaimListDto[] = [];
  filterOptions: CustomDropDown = { options: [] };
  statusName = '';
  batchId: number;
  switchEncounterNumber: string;
  _externalFilter: ClaimPagedAndFilterDto;
  constructor(
    private claimService: ClaimService,
    private activatedRoute: ActivatedRoute,
    protected permissionService: PermissionService,
    private router: Router,
    private injector: Injector
  ) {
    super(permissionService);
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.batchId = params['queryKey'] || null;
      this.switchEncounterNumber = params['number'] || null;
    });
    this.statusName = this.activatedRoute.snapshot.data['status'];
    if (this.statusName) {
      this.getPermissions(this.statusName);
      this.setConfig(this.statusName);
    }
  }

  setConfig(statusName: string) {
    if (statusName === 'new') {
      this.columns.push({
        field: 'modifiedOn',
        header: 'Modified At',
        type: 'date',
        format: 'dd/MM/yyyy',
      });
    }
  }
  handleFormSubmit(event: ClaimPagedAndFilterDto) {
    this._externalFilter = event;
    // this.getClaimsList(this.statusName, event);
  }

  getClaimsList(statusName: string = '', event?: ClaimPagedAndFilterDto) {
    const data: ClaimPagedAndFilterDto = {
      batch_id: this.batchId || undefined,
      patient_nid: event?.patient_nid || undefined,
      number: event?.number || undefined,
      maxResultCount: event?.maxResultCount || 10,
      skipCount: event?.skipCount || 0,
      sorting: event?.sorting || null,
    };

    let apiCall: Observable<any>;
    switch ((statusName || '').toLowerCase()) {
      case 'drafted':
        apiCall = this.claimService.getDraftList(data);
        break;
      case 'new':
        apiCall = this.claimService.getNewList(data);
        break;
      case 'audit':
        apiCall = this.claimService.getNewList(data);
        break;
      default:
        apiCall = this.claimService.getList(data);
        break;
    }
    apiCall.subscribe({
      next: res => {
        this.claimsData = res.items;
        this.paginationInfo = { totalItems: res.totalCount };
      },
      error: () => {},
      complete: () => {},
    });
  }
  getPermissions(statusName: string) {
    let permissionsArray: { name: string; permission: string }[] = [];
    switch (statusName) {
      case 'audit':
        permissionsArray = [
          { name: 'audit', permission: this.claimsProcessingPermissions.ClaimsProcessingClaims },
          { name: 'details', permission: this.claimsProcessingPermissions.ClaimsProcessingClaims },
        ];
        break;
      case 'all':
        permissionsArray = [
          { name: 'edit', permission: this.claimsCodingPermissions.ClaimsCodingAllEdit },
          { name: 'details', permission: this.claimsCodingPermissions.ClaimsCodingAllView },
        ];
        break;
      case 'drafted':
        permissionsArray = [
          { name: 'edit', permission: this.claimsCodingPermissions.ClaimsCodingDraftEdit },
          { name: 'details', permission: this.claimsCodingPermissions.ClaimsCodingDraftView },
        ];
        break;
      case 'new':
        permissionsArray = [
          { name: 'edit', permission: this.claimsCodingPermissions.ClaimsCodingNewُEdit },
          { name: 'details', permission: this.claimsCodingPermissions.ClaimsCodingNewView },
        ];
        break;
    }

    permissionsArray.forEach(permissionObj => {
      this.permissionService.getGrantedPolicy$(permissionObj.permission).subscribe(policies => {
        this.actions[permissionObj.name] = policies;
        if (permissionObj.name === 'edit' && policies) {
          this.columns.forEach(col => {
            if (col.type === 'link') {
              col.linkPermission = policies;
              col.routerLink = policies? '/coding-claims/edit/' : '';
            }
          });
        }
      });
    });
  }
  getPaginatedData(event: any) {
    const mergedFilter: ClaimPagedAndFilterDto = {
      ...event,
      ...this._externalFilter,
    };
    this.getClaimsList(this.statusName, mergedFilter);
  }
}
