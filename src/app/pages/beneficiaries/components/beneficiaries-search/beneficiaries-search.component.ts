import { LocalizationService, PermissionService } from '@abp/ng.core';
import { ToasterService } from '@abp/ng.theme.shared';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectedWithProviderDropDownList } from '@proxy/ehealth-claims/application/contracts/common/dto';
import {
  BeneficiaryInactivationReasonEnum,
  FamilyRole,
} from '@proxy/ehealth-claims/common/enums/beneficiaries';
import { BeneficiariesService } from '@proxy/ehealth-claims/domains/beneficiaries';
import { LookupAppServicesService } from '@proxy/ehealth-claims/lookups/lookup-app-services.service';
import {
  BeneficiaryDto,
  MoveBeneficiaryRequest,
  SplitBeneficiaryRequest,
} from '@proxy/ehealth-claims/view-models';
import {
  DeActivateBeneficiaryDto,
  SearchTargetFamilyRequest,
  TargetFamilyResultDto,
} from '@proxy/ehealth-claims/view-models/beneficiary';
import { MenuItem } from 'primeng/api';
import { BeneficiariesPermissions } from 'src/app/shared/models/appPermissions';

@Component({
  selector: 'app-beneficiaries-search',
  templateUrl: './beneficiaries-search.component.html',
  styleUrl: './beneficiaries-search.component.scss',
})
export class BeneficiariesSearchComponent implements OnInit {
  nationalId: string = '';
  beneficiaryInfo: BeneficiaryDto | null = null;
  errorMessage: string | null = null;
  showCard: boolean = false;

  // ─── NID Validation ─────────────────────────────────────────
  private nidRegex = /^[23]\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{7}$/;

  private EGY_GOV_CODES = new Set([
    '01',
    '02',
    '03',
    '04',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '31',
    '32',
    '33',
    '34',
    '35',
    '88',
  ]);

  items: MenuItem[] = [];
  createPermission: boolean;
  showMoveDialog = false;
  moveSearchText = '';
  moveSearchInProgress = false;
  moveSearchError: string | null = null;
  moveTargetFamily: TargetFamilyResultDto | null = null;
  moveRelationOptions: { id: FamilyRole; name: string; disabled?: boolean }[] = [];
  moveSelectedRelation: FamilyRole | null = null;
  movePcuOptions: SelectedWithProviderDropDownList[] = [];
  moveSelectedPcu: number | null = null;
  moveInProgress = false;
  moveError: string | null = null;
  showInactivateDialog = false;
  inactivationReason: BeneficiaryInactivationReasonEnum | null = null;
  inactivationNote: string = '';
  inactivationInProgress = false;
  inactivationError: string | null = null;
  inactivationReasons: { label: string; value: BeneficiaryInactivationReasonEnum }[] = [];

  showSplitDialog = false;
  splitInProgress = false;
  splitError: string | null = null;

  constructor(
    private _beneficiariesService: BeneficiariesService,
    private _localizationService: LocalizationService,
    private router: Router,
    public permission: PermissionService,
    private toaster: ToasterService,
    private lookupServiceService: LookupAppServicesService,
  ) {
    this.createPermission = this.permission.getGrantedPolicy(
      BeneficiariesPermissions.BeneficiariesCreate,
    );
  }

  ngOnInit(): void {
    const permissionMap: Record<string, string> = {
      view: BeneficiariesPermissions.BeneficiariesView,
      move: BeneficiariesPermissions.BeneficiariesMove,
      update: BeneficiariesPermissions.BeneficiariesUpdate,
      split: BeneficiariesPermissions.BeneficiariesSplit,
      audit: BeneficiariesPermissions.BeneficiariesView,
    };
    this.lookupServiceService.getProviderDropDownList().subscribe({
      next: (list: SelectedWithProviderDropDownList[]) => {
        this.movePcuOptions = list;
      },
      error: () => {},
    });
    this.items = [
      {
        label: this._localizationService.instant('RuleApplication::Common:View'),
        icon: 'pi pi-eye',
        command: () => this.onClickBtnRouting('view'),
        disabled: false,
        name: 'view',
      },
      {
        label: this._localizationService.instant('RuleApplication::Common:Move'),
        icon: 'pi pi-arrows-h',
        command: () => this.openMoveDialog(),
        disabled: false,
        name: 'move',
      },
      {
        label: this._localizationService.instant('RuleApplication::Common:Update'),
        icon: 'pi pi-pencil',
        command: () => this.onClickBtnRouting('edit'),
        disabled: false,
        name: 'update',
      },
      {
        label: this._localizationService.instant('RuleApplication::Common:Split'),
        icon: 'pi pi-sitemap',
        command: () => this.openSplitDialog(),
        disabled: false,
        name: 'split',
      },
      {
        label: this._localizationService.instant('RuleApplication::Common:AuditHistory'),
        icon: 'pi pi-building',
        command: () => this.view(),
        disabled: false,
        name: 'audit',
      },
    ].filter(item => this.permission.getGrantedPolicy(permissionMap[item.name]));

    this.inactivationReasons = [
      {
        label: this._localizationService.instant(
          'RuleApplication::Beneficiaries:InactivationReason:Death',
        ),
        value: BeneficiaryInactivationReasonEnum.Death,
      },
      {
        label: this._localizationService.instant(
          'RuleApplication::Beneficiaries:InactivationReason:Departure',
        ),
        value: BeneficiaryInactivationReasonEnum.Departure,
      },
      {
        label: this._localizationService.instant(
          'RuleApplication::Beneficiaries:InactivationReason:CannotBeContactedWithOverduePremium',
        ),
        value: BeneficiaryInactivationReasonEnum.CannotBeContactedWithOverduePremium,
      },
    ];
  }

  // ─── NID Parser ──────────────────────────────────────────────
  private parseNationalId(nid: string): { isValid: boolean } {
    if (!nid || nid.length !== 14) return { isValid: false };

    const centuryDigit = nid.charAt(0);
    if (centuryDigit !== '2' && centuryDigit !== '3') return { isValid: false };

    const yy = Number(nid.substring(1, 3));
    const mm = Number(nid.substring(3, 5));
    const dd = Number(nid.substring(5, 7));
    const gov = nid.substring(7, 9);

    // ─── Check governorate code ──────────────────────────────
    if (!this.EGY_GOV_CODES.has(gov)) return { isValid: false };

    // ─── Check valid date ────────────────────────────────────
    const year = (centuryDigit === '2' ? 1900 : 2000) + yy;
    const birth = new Date(year, mm - 1, dd);
    if (birth.getFullYear() !== year || birth.getMonth() !== mm - 1 || birth.getDate() !== dd)
      return { isValid: false };

    // ─── Check age is reasonable ─────────────────────────────
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 0 || age > 120) return { isValid: false };

    return { isValid: true };
  }

  // ─── Search ──────────────────────────────────────────────────
  onSearchBeneficiary() {
    // ─── Step 1: format check ──────────────────────────────
    if (!this.nidRegex.test(this.nationalId)) {
      this.errorMessage = this._localizationService.instant(
        'RuleApplication::Beneficiaries:NationalIdErrorMessage',
      );
      this.showCard = false;
      return;
    }

    // ─── Step 2: extracted values check ───────────────────
    const parsed = this.parseNationalId(this.nationalId);
    if (!parsed.isValid) {
      this.errorMessage = this._localizationService.instant(
        'RuleApplication::Beneficiaries:InvalidNationalId',
      );
      this.showCard = false;
      return;
    }

    // ─── Step 3: search API ────────────────────────────────
    this.errorMessage = null;
    this._beneficiariesService.searchByNationalIdById(this.nationalId).subscribe({
      next: res => {
        this.showCard = true;
        this.beneficiaryInfo = res;
        this.activateActionuttons(res);
      },
      error: err => {
        this.showCard = false;
      },
    });
  }

  view() {}
  openMoveDialog() {
    if (
      !this.beneficiaryInfo?.isActive ||
      this.beneficiaryInfo?.familyRole === FamilyRole.HeadOfFamily
    ) {
      return;
    }

    this.moveSearchText = '';
    this.moveSearchError = null;
    this.moveTargetFamily = null;
    this.moveSelectedRelation = null;
    this.moveSelectedPcu = null;
    this.moveError = null;

    this.moveRelationOptions = Object.values(FamilyRole)
      .filter(role => role !== FamilyRole.HeadOfFamily)
      .map(role => ({
        id: role,
        name: this._localizationService.instant(`RuleApplication::HOF:${role}`),
        disabled: role === FamilyRole.Self,
      }));

    this.showMoveDialog = true;
  }

onSearchTargetFamily() {
  if (!this.moveSearchText?.trim()) {
    return;
  }

  this.moveSearchInProgress = true;
  this.moveSearchError = null;
  this.moveTargetFamily = null;
  this.moveSelectedPcu = null;
  this.moveSelectedRelation = null;
  this.moveError = null;

  const input: SearchTargetFamilyRequest = { searchText: this.moveSearchText.trim() };

  this._beneficiariesService.searchTargetFamilyForMoveByInput(input).subscribe({
    next: (res: TargetFamilyResultDto) => {
      this.moveSearchInProgress = false;
      this.moveTargetFamily = res;
    },
    error: err => {
      this.moveSearchInProgress = false;
      this.moveSearchError =
        err?.error?.error?.message ||
        err?.error?.message ||
        this._localizationService.instant(
          'RuleApplication::Beneficiaries:MoveTargetFamilyNotFound',
        );
    },
  });
}

  getSelectedPcuName(): string {
    return this.movePcuOptions.find(p => p.id === this.moveSelectedPcu)?.name ?? '';
  }

  onCancelMove() {
    this.showMoveDialog = false;
    this.moveTargetFamily = null;
    this.moveError = null;
  }

onConfirmMove() {
  if (
    !this.beneficiaryInfo ||
    this.beneficiaryInfo.id === undefined ||
    !this.moveTargetFamily ||
    !this.moveSelectedRelation ||
    !this.moveSelectedPcu
  ) {
    return;
  }

  this.moveInProgress = true;
  this.moveError = null;

  const input: MoveBeneficiaryRequest = {
    beneficiaryId: this.beneficiaryInfo.id,
    toBeneficiaryId: this.moveTargetFamily.headOfFamilyId,
    relationToHof: this.moveSelectedRelation,
    primaryCareUnitId: this.moveSelectedPcu,
  };

  this._beneficiariesService.moveBeneficiaryByInput(input).subscribe({
    next: () => {
      this.moveInProgress = false;
      this.showMoveDialog = false;

      this.toaster.success(
        this._localizationService.instant('RuleApplication::Beneficiaries:MoveSuccessMessage'),
      );

      this._beneficiariesService.searchByNationalIdById(this.nationalId).subscribe({
        next: res => {
          this.beneficiaryInfo = res;
          this.activateActionuttons(res);
        },
        error: () => {},
      });
    },
    error: err => {
      this.moveInProgress = false;
      this.moveError =
        err?.error?.error?.message ||
        err?.error?.message ||
        this._localizationService.instant('RuleApplication::Beneficiaries:MoveError');
    },
  });
}
  onClickBtnRouting(name: string) {
    if (name == 'edit') {
      this.router.navigate([
        '/beneficiaries/edit',
        this.beneficiaryInfo?.parentId || this.beneficiaryInfo?.id,
      ]);
    } else if (name == 'view') {
      this.router.navigate([
        '/beneficiaries/view',
        this.beneficiaryInfo?.parentId || this.beneficiaryInfo?.id,
      ]);
    }
    localStorage.removeItem('fromViewFamForm')
  }

  activateActionuttons(beneficiaryInfo: BeneficiaryDto) {
    this.items = this.items.filter(item => item.name !== 'deactivate');

    const familyRole = beneficiaryInfo?.familyRole;
    const canInactivate =
      !!beneficiaryInfo?.isActive &&
      !!familyRole &&
      ![FamilyRole.HeadOfFamily, FamilyRole.Self].includes(familyRole) &&
      this.permission.getGrantedPolicy(BeneficiariesPermissions.BeneficiariesDeActivate);

    if (canInactivate) {
      this.items.push({
        label: this._localizationService.instant('RuleApplication::Common:Deactivate'),
        icon: 'pi pi-ban',
        command: () => this.openInactivateDialog(),
        disabled: false,
        name: 'deactivate',
      });
    }

    this.items.forEach(item => {
      if (item.name === 'update') {
        item.disabled = !beneficiaryInfo?.isActive;
      } else if (['move', 'split'].includes(item.name)) {
        item.disabled =
          !beneficiaryInfo?.isActive ||
          beneficiaryInfo?.familyRole === FamilyRole.HeadOfFamily ||
          beneficiaryInfo?.familyRole === FamilyRole.Self;
      }
    });
  }

  openInactivateDialog() {
    if (
      !this.beneficiaryInfo?.isActive ||
      this.beneficiaryInfo?.familyRole === FamilyRole.HeadOfFamily
    ) {
      return;
    }
    this.inactivationReason = null;
    this.inactivationNote = '';
    this.inactivationError = null;
    this.showInactivateDialog = true;
  }

  onCancelInactivation() {
    this.showInactivateDialog = false;
    this.inactivationReason = null;
    this.inactivationNote = '';
    this.inactivationError = null;
  }

  onConfirmInactivation() {
    if (
      !this.inactivationReason ||
      !this.beneficiaryInfo ||
      this.beneficiaryInfo.id === undefined
    ) {
      return;
    }

    const currentBeneficiary: BeneficiaryDto = this.beneficiaryInfo;
    const beneficiaryId: number = this.beneficiaryInfo.id;

    this.inactivationInProgress = true;
    this.inactivationError = null;

    const input: DeActivateBeneficiaryDto = {
      beneficiaryId: beneficiaryId,
      inactivationReason: this.inactivationReason,
      inactivationNote: this.inactivationNote || undefined,
    };

    this._beneficiariesService.deActivateBeneficiary(input).subscribe({
      next: () => {
        this.inactivationInProgress = false;
        this.showInactivateDialog = false;

        const updatedBeneficiary: BeneficiaryDto = {
          ...currentBeneficiary,
          isActive: false,
          eligibilityFlag: false,
        };

        this.beneficiaryInfo = updatedBeneficiary;
        this.activateActionuttons(updatedBeneficiary);
      },
      error: () => {
        this.inactivationInProgress = false;
        this.inactivationError = this._localizationService.instant(
          'RuleApplication::Beneficiaries:InactivationError',
        );
      },
    });
  }

  openSplitDialog() {
    if (
      !this.beneficiaryInfo?.isActive ||
      this.beneficiaryInfo?.familyRole === FamilyRole.HeadOfFamily
    ) {
      return;
    }
    this.splitError = null;
    this.showSplitDialog = true;
  }

  onCancelSplit() {
    this.showSplitDialog = false;
    this.splitError = null;
  }

  onConfirmSplit() {
    if (!this.beneficiaryInfo || this.beneficiaryInfo.id === undefined) {
      return;
    }

    const beneficiaryId: number = this.beneficiaryInfo.id;

    this.splitInProgress = true;
    this.splitError = null;

    const input: SplitBeneficiaryRequest = {
      beneficiaryId: beneficiaryId,
    };

    this._beneficiariesService.splitBeneficiaryByInput(input).subscribe({
      next: (res: any) => {
        this.splitInProgress = false;
        this.showSplitDialog = false;
        this.toaster.success('RuleApplication::Beneficiaries:SplitSuccessMessage');
        localStorage.setItem('fromViewFamForm', 'true');
        this.router.navigate(['/beneficiaries/edit', res.beneficiaryId]);
      },
      error: () => {
        this.splitInProgress = false;
        this.splitError = this._localizationService.instant(
          'RuleApplication::Beneficiaries:SplitError',
        );
      },
    });
  }

  onInputChange() {
    if (this.errorMessage) {
      this.errorMessage = null;
    }
  }

  onReset() {
    this.nationalId = '';
    this.errorMessage = null;
    this.showCard = false;
    this.beneficiaryInfo = null;
  }

  addNewMember() {
    localStorage.setItem('nationalId', this.nationalId);
    this.router.navigate(['/beneficiaries/create']);
  }
}