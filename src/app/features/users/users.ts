import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Avatar } from 'primeng/avatar';

import { DEMO_ORG_MEMBERS } from '../../core/data/demo-data';
import { ROLE_LABELS, UserRole } from '../../core/models/user.model';

type RoleFilter = 'ALL' | UserRole;

@Component({
  selector: 'app-users',
  imports: [FormsModule, InputText, TableModule, Avatar],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  protected readonly members = DEMO_ORG_MEMBERS;

  protected roleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  }

  protected readonly search = signal('');
  protected readonly roleFilter = signal<RoleFilter>('ALL');

  protected readonly filterChips = computed(() => {
    const countByRole = (role: UserRole) => this.members.filter((m) => m.role === role).length;
    return [
      { key: 'ALL' as RoleFilter, label: 'Tous', count: this.members.length },
      { key: 'ADMIN_PME' as RoleFilter, label: 'Administrateurs', count: countByRole('ADMIN_PME') },
      { key: 'RESPONSABLE_TI' as RoleFilter, label: 'Responsables TI', count: countByRole('RESPONSABLE_TI') },
      { key: 'EMPLOYE' as RoleFilter, label: 'Employés', count: countByRole('EMPLOYE') },
    ];
  });

  protected readonly filteredMembers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    return this.members.filter((m) => {
      const matchesRole = role === 'ALL' || m.role === role;
      const matchesSearch = !term || m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  });
}
