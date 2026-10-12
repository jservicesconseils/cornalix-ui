import { Component, computed, inject, signal } from '@angular/core';
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
}

// "Parametres" retire (SCRUM-53) : lien mort (disabled, sans route
// enregistree) visible en permanence sans aucun ecran derriere.
const NAV_ITEMS: NavItem[] = [
  { label: 'nav.dashboard', icon: 'pi pi-home', route: '/dashboard' },
  { label: 'nav.portfolio', icon: 'pi pi-briefcase', route: '/portfolio', roles: ['CONSULTANT'] },
  { label: 'nav.questionnaire', icon: 'pi pi-list-check', route: '/questionnaire' },
  { label: 'nav.reports', icon: 'pi pi-chart-bar', route: '/reports' },
  { label: 'nav.users', icon: 'pi pi-users', route: '/users', roles: ['ADMIN_PME', 'CONSULTANT'] },
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

  // Le selecteur d'organisation n'a de sens que pour un Consultant
  // (portefeuille de plusieurs organisations clientes) -- un compte PME
  // n'a jamais qu'une seule organisation, donc portfolio().length > 0
  // seul (sans ce filtre par role) l'affichait aussi inutilement pour
  // eux.
  protected readonly isConsultant = computed(() => this.user()?.role === 'CONSULTANT');

  protected readonly navItems = computed(() => {
    const role = this.user()?.role;
    return NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role)));
  });

  // SCRUM-52 : sidebar fixe (240px) sans place sur mobile/tablette --
  // devient un tiroir hors-canevas sous le seuil defini dans shell.scss,
  // ouvert/ferme via ce signal (bouton hamburger + clic sur le voile).
  protected readonly mobileNavOpen = signal(false);

  protected toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

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
    this.router.navigate(['/login']);
  }
}
