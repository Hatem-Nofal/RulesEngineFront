import { mapEnumToOptions, PermissionService, SessionStateService } from '@abp/ng.core';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Gender } from '@proxy/ehealth-claims/common/enums/beneficiaries';
import { FamilyRole } from '@proxy/ehealth-claims/common/enums/beneficiaries/family-role.enum';
import { BeneficiariesPermissions } from 'src/app/shared/models/appPermissions';

@Component({
  selector: 'app-family-tree',
  standalone: false,
  templateUrl: './family-tree.component.html',
  styleUrl: './family-tree.component.scss',
})
export class FamilyTreeComponent implements OnChanges {
  @Input() familyMembers: any;
  @Input() familyCode?: string;

  @Output() update = new EventEmitter<any>();
  @Output() move = new EventEmitter<any>();
  @Output() split = new EventEmitter<any>();
  @Output() deactivate = new EventEmitter<any>();

  headOfFamily: any;
  spouses: any[] = [];
  children: any[] = [];
  parents: any[] = [];
  siblings: any[] = [];

  totalMembers = 0;
  adultsCount = 0;
  childrenCount = 0;

  lang: string;
  gender = Gender;

  splitPermission: boolean;
  movePermission: boolean;
  updatePermission: boolean;
  deactivatePermission: boolean;

  selectedRoles: FamilyRole[] = [FamilyRole.HeadOfFamily, FamilyRole.Self];

  roleGroups: { label: string; roles: FamilyRole[] }[] = [
    { label: FamilyRole.HeadOfFamily, roles: [FamilyRole.HeadOfFamily, FamilyRole.Self] },
    { label: 'Spouse', roles: [FamilyRole.Wife, FamilyRole.Husband] },
    { label: 'Children', roles: [FamilyRole.Son, FamilyRole.Daughter] },
    { label: 'Others', roles: [FamilyRole.Father, FamilyRole.Mother, FamilyRole.Brother, FamilyRole.Sister] },
  ];

  constructor(
    private sessionState: SessionStateService,
    public permission: PermissionService,
  ) {
    this.lang = sessionState.getLanguage();
    this.splitPermission = this.permission.getGrantedPolicy(BeneficiariesPermissions.BeneficiariesSplit);
    this.movePermission = this.permission.getGrantedPolicy(BeneficiariesPermissions.BeneficiariesMove);
    this.updatePermission = this.permission.getGrantedPolicy(BeneficiariesPermissions.BeneficiariesUpdate);
    this.deactivatePermission = this.permission.getGrantedPolicy(BeneficiariesPermissions.BeneficiariesDeActivate);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['familyMembers']?.currentValue) {
      this.headOfFamily = this.familyMembers.find(
        (m: any) => m.familyRole === FamilyRole.HeadOfFamily || m.familyRole === FamilyRole.Self,
      );
      this.spouses = this.familyMembers.filter(
        (m: any) => m.familyRole === FamilyRole.Wife || m.familyRole === FamilyRole.Husband,
      );
      this.children = this.familyMembers.filter(
        (m: any) => m.familyRole === FamilyRole.Son || m.familyRole === FamilyRole.Daughter,
      );
      this.parents = this.familyMembers.filter(
        (m: any) => m.familyRole === FamilyRole.Father || m.familyRole === FamilyRole.Mother,
      );
      this.siblings = this.familyMembers.filter(
        (m: any) => m.familyRole === FamilyRole.Brother || m.familyRole === FamilyRole.Sister,
      );

      this.totalMembers = this.familyMembers.length;
      this.childrenCount = this.children.length;
      this.adultsCount = this.totalMembers - this.childrenCount;
    }
  }

  setRoleFilter(roles: FamilyRole[] | null): void {
    this.selectedRoles = roles ?? [];
  }

  isGroupActive(groupRoles: FamilyRole[]): boolean {
    return (
      this.selectedRoles.length === groupRoles.length &&
      groupRoles.every(r => this.selectedRoles.includes(r))
    );
  }

  isRoleSelected(role: FamilyRole): boolean {
    return this.selectedRoles.includes(role);
  }

  isHeadRole(role: string): boolean {
    return role === FamilyRole.HeadOfFamily || role === FamilyRole.Self;
  }

  getStatusSeverity(status: string): 'success' | 'danger' {
    return status === 'complete' ? 'success' : 'danger';
  }

  getMemberEmoji(member: any): string {
    const role = member?.familyRole;
    const isFemale = member?.gender === this.gender.Female;
    if (role === FamilyRole.Son) return '👦';
    if (role === FamilyRole.Daughter) return '👧';
    return isFemale ? '👩' : '👨';
  }

  getGenderIcon(gender: string): string {
    return gender === this.gender.Female ? 'pi-venus' : 'pi-mars';
  }

  getNodeClass(role: string): string {
    switch (role) {
      case FamilyRole.HeadOfFamily:
      case FamilyRole.Self:
        return 'node-hof';
      case FamilyRole.Wife:
      case FamilyRole.Husband:
        return 'node-spouse';
      case FamilyRole.Son:
      case FamilyRole.Daughter:
        return 'node-child';
      case FamilyRole.Father:
      case FamilyRole.Mother:
        return 'node-parent';
      case FamilyRole.Brother:
      case FamilyRole.Sister:
        return 'node-sibling';
      default:
        return 'node-sibling';
    }
  }

  onUpdate(member: any) {
    this.update.emit(member);
  }

  onMove(member: any) {
    this.move.emit(member);
  }

  onSplit(member: any) {
    this.split.emit(member);
  }

  onDeactivate(member: any) {
    this.deactivate.emit(member);
  }
}