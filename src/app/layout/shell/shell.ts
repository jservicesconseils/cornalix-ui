import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/auth/auth.service';
import { authFeature } from '../../core/state/auth/auth.reducer';
import { tenantFeature } from '../../core/state/tenant/tenant.reducer';
import { TenantActions } from '../../core/state/tenant/tenant.actions';
import { ROLE_LABELS, UserRole } from '../../core/models/user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'nav.dashboard', icon: 'pi pi-home', route: '/tableau-de-bord' },
  { label: 'nav.portfolio', icon: 'pi pi-briefcase', route: '/portefeuille', roles: ['CONSULTANT'] },
  { label: 'nav.questionnaire', icon: 'pi pi-list-check', route: '/questionnaire' },
  { label: 'nav.reports', icon: 'pi pi-chart-bar', route: '/rapports' },
  { label: 'nav.users', icon: 'pi pi-users', route: '/utilisateurs', roles: ['ADMIN_PME', 'CONSULTANT'] },
  { label: 'nav.settings', icon: 'pi pi-cog', route: '/parametres', disabled: true },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, Select, Avatar, Menu, FormsModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly store = inject(Store);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.store.selectSignal(authFeature.selectUser);
  protected readonly portfolio = this.store.selectSignal(tenantFeature.selectPortfolio);
  protected readonly currentOrganization = this.store.selectSignal(tenantFeature.selectCurrentOrganization);
  protected readonly currentOrganizationId = this.store.selectSignal(tenantFeature.selectCurrentOrganizationId);

  protected readonly roleLabel = computed(() => (this.user() ? ROLE_LABELS[this.user()!.role] : ''));

  protected readonly navItems = computed(() => {
    const role = this.user()?.role;
    return NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role)));
  });

  protected readonly userMenuItems: MenuItem[] = [
    {
      label: 'Se déconnecter',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  protected onOrganizationChange(organizationId: string): void {
    this.store.dispatch(TenantActions.selectOrganization({ organizationId }));
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/connexion']);
  }
}
