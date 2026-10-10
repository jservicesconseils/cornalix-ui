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

  private readonly currentOrganizationId = this.store.selectSignal(tenantFeature.selectCurrentOrganizationId);

  protected readonly members = signal<OrgMember[]>([]);

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
}
