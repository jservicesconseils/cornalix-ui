import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { InputText } from 'primeng/inputtext';

import { tenantFeature } from '../../core/state/tenant/tenant.reducer';
import { TenantActions } from '../../core/state/tenant/tenant.actions';

@Component({
  selector: 'app-portfolio',
  imports: [FormsModule, InputText],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  protected readonly portfolio = this.store.selectSignal(tenantFeature.selectPortfolio);
  protected readonly currentOrganizationId = this.store.selectSignal(tenantFeature.selectCurrentOrganizationId);
  protected readonly search = signal('');

  protected readonly filteredPortfolio = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.portfolio();
    }
    return this.portfolio().filter((org) => org.name.toLowerCase().includes(term));
  });

  protected scoreLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('');
  }

  protected open(organizationId: string): void {
    this.store.dispatch(TenantActions.selectOrganization({ organizationId }));
    this.router.navigate(['/tableau-de-bord']);
  }
}
