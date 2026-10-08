import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { InputText } from 'primeng/inputtext';

import { ScoringApiService } from '../../core/scoring/scoring-api.service';
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
  private readonly scoringApi = inject(ScoringApiService);

  protected readonly portfolio = this.store.selectSignal(tenantFeature.selectPortfolio);
  protected readonly currentOrganizationId = this.store.selectSignal(tenantFeature.selectCurrentOrganizationId);
  protected readonly search = signal('');

  // Organization.score vaut 0 par defaut (OrganizationApiService, SCRUM-27) :
  // le vrai score par organisation est recupere ici une fois le
  // portefeuille charge, pas par l'API organisations elle-meme.
  private readonly scoreByOrgId = signal<Record<string, number>>({});

  protected readonly filteredPortfolio = computed(() => {
    const scores = this.scoreByOrgId();
    const withScores = this.portfolio().map((org) => ({ ...org, score: scores[org.id] ?? org.score }));

    const term = this.search().trim().toLowerCase();
    if (!term) {
      return withScores;
    }
    return withScores.filter((org) => org.name.toLowerCase().includes(term));
  });

  constructor() {
    effect(() => {
      const organizations = this.portfolio();
      if (organizations.length === 0) {
        return;
      }

      Promise.all(
        organizations.map((org) =>
          this.scoringApi.getScore(org.id).then((score) => [org.id, score.overallScore ?? 0] as const),
        ),
      ).then((entries) => this.scoreByOrgId.set(Object.fromEntries(entries)));
    });
  }

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
