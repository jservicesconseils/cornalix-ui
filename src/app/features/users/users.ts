import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Avatar } from 'primeng/avatar';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';

import { OrgMember, ROLE_LABELS, UserRole } from '../../core/models/user.model';
import { UserApiService } from '../../core/user/user-api.service';
import { ConsultantAccess, ConsultantAccessApiService } from '../../core/consultant/consultant-access-api.service';
import { authFeature } from '../../core/state/auth/auth.reducer';
import { tenantFeature } from '../../core/state/tenant/tenant.reducer';

type RoleFilter = 'ALL' | UserRole;

// Roles qu'un ADMIN_PME peut assigner depuis cet ecran -- CONSULTANT
// est deliberement exclu, meme choix que les puces de filtre
// ci-dessous : un consultant cybersecurite n'est pas "invite" dans une
// organisation comme un membre ordinaire (portefeuille multi-tenant,
// gere autrement).
const INVITABLE_ROLES: UserRole[] = ['ADMIN_PME', 'RESPONSABLE_TI', 'EMPLOYE'];

@Component({
  selector: 'app-users',
  imports: [FormsModule, InputText, TableModule, Avatar, Dialog, Select],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private readonly store = inject(Store);
  private readonly userApi = inject(UserApiService);
  private readonly consultantAccessApi = inject(ConsultantAccessApiService);

  private readonly currentOrganizationId = this.store.selectSignal(tenantFeature.selectCurrentOrganizationId);
  private readonly user = this.store.selectSignal(authFeature.selectUser);

  // Affiche quelle organisation est consultee -- important pour un
  // Consultant qui bascule entre plusieurs organisations clientes via le
  // selecteur de la barre du haut (sinon ambigu de savoir laquelle est
  // affichee ici).
  protected readonly currentOrganization = this.store.selectSignal(tenantFeature.selectCurrentOrganization);

  // Inviter/retirer un membre ou gerer l'acces consultant exige deja le
  // role ADMIN_PME cote backend (UserController/ConsultantAccessController,
  // 403 sinon) -- cache ces controles plutot que de laisser un Consultant
  // (qui garde un acces en LECTURE a la liste des membres d'une
  // organisation cliente) cliquer sur des boutons qui echoueraient.
  protected readonly isAdmin = computed(() => this.user()?.role === 'ADMIN_PME');

  protected readonly members = signal<OrgMember[]>([]);

  protected readonly consultantAccesses = signal<ConsultantAccess[]>([]);
  protected readonly consultantEmail = signal('');
  protected readonly consultantSubmitting = signal(false);
  protected readonly consultantError = signal<string | null>(null);

  protected readonly inviteRoleOptions = INVITABLE_ROLES.map((role) => ({ label: ROLE_LABELS[role], value: role }));
  protected readonly inviteDialogVisible = signal(false);
  protected readonly inviteEmail = signal('');
  protected readonly inviteName = signal('');
  protected readonly inviteRole = signal<UserRole>('EMPLOYE');
  protected readonly inviteSubmitting = signal(false);
  protected readonly inviteError = signal<string | null>(null);

  constructor() {
    effect(() => {
      const organizationId = this.currentOrganizationId();
      if (!organizationId) {
        return;
      }
      this.userApi.list(organizationId).then((members) => this.members.set(members));
      this.consultantAccessApi.list(organizationId).then((accesses) => this.consultantAccesses.set(accesses));
    });
  }

  protected roleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  }

  protected readonly search = signal('');
  protected readonly roleFilter = signal<RoleFilter>('ALL');

  protected readonly filterChips = computed(() => {
    const members = this.members();
    const countByRole = (role: UserRole) => members.filter((m) => m.role === role).length;
    return [
      { key: 'ALL' as RoleFilter, label: 'Tous', count: members.length },
      { key: 'ADMIN_PME' as RoleFilter, label: 'Administrateurs', count: countByRole('ADMIN_PME') },
      { key: 'RESPONSABLE_TI' as RoleFilter, label: 'Responsables TI', count: countByRole('RESPONSABLE_TI') },
      { key: 'EMPLOYE' as RoleFilter, label: 'Employés', count: countByRole('EMPLOYE') },
    ];
  });

  protected readonly filteredMembers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    return this.members().filter((m) => {
      const matchesRole = role === 'ALL' || m.role === role;
      const matchesSearch = !term || m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  });

  protected openInviteDialog(): void {
    this.inviteEmail.set('');
    this.inviteName.set('');
    this.inviteRole.set('EMPLOYE');
    this.inviteError.set(null);
    this.inviteDialogVisible.set(true);
  }

  protected async submitInvite(): Promise<void> {
    const organizationId = this.currentOrganizationId();
    if (!organizationId) {
      return;
    }

    this.inviteSubmitting.set(true);
    this.inviteError.set(null);
    try {
      const created = await this.userApi.invite(
        organizationId,
        this.inviteEmail().trim(),
        this.inviteName().trim(),
        this.inviteRole(),
      );
      this.members.update((current) => [...current, created]);
      this.inviteDialogVisible.set(false);
    } catch {
      this.inviteError.set("L'invitation a échoué. Vérifiez le courriel ou réessayez dans un instant.");
    } finally {
      this.inviteSubmitting.set(false);
    }
  }

  protected async removeMember(member: OrgMember): Promise<void> {
    const organizationId = this.currentOrganizationId();
    if (!organizationId) {
      return;
    }
    if (!confirm(`Retirer l'accès de ${member.name} ?`)) {
      return;
    }

    await this.userApi.remove(organizationId, member.id);
    this.members.update((current) => current.filter((m) => m.id !== member.id));
  }

  protected async grantConsultantAccess(): Promise<void> {
    const organizationId = this.currentOrganizationId();
    if (!organizationId || this.consultantSubmitting()) {
      return;
    }

    this.consultantSubmitting.set(true);
    this.consultantError.set(null);
    try {
      const access = await this.consultantAccessApi.grant(organizationId, this.consultantEmail().trim());
      this.consultantAccesses.update((current) => [...current, access]);
      this.consultantEmail.set('');
    } catch {
      this.consultantError.set(
        "Impossible de donner l'accès -- vérifiez que ce courriel correspond à un compte Consultant déjà inscrit.",
      );
    } finally {
      this.consultantSubmitting.set(false);
    }
  }

  protected async revokeConsultantAccess(access: ConsultantAccess): Promise<void> {
    const organizationId = this.currentOrganizationId();
    if (!organizationId) {
      return;
    }
    if (!confirm(`Retirer l'accès de ${access.consultantEmail} ?`)) {
      return;
    }

    await this.consultantAccessApi.revoke(organizationId, access.id);
    this.consultantAccesses.update((current) => current.filter((a) => a.id !== access.id));
  }
}
