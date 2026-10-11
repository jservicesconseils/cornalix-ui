import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { InputText } from 'primeng/inputtext';

import { ScoringApiService } from '../../core/scoring/scoring-api.service';
import { tenantFeature } from '../../core/state/tenant/tenant.reducer';
import { TenantActions } from '../../core/state/tenant/tenant.actions';
import { AsyncState } from '../../shared/async-state/async-state';
import { toErrorMessage } from '../../shared/async-state/http-error.util';

@Component({
  selector: 'app-portfolio',
  imports: [FormsModule, InputText, AsyncState],
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

  // Portefeuille vide (ex. Consultant qui vient de s'inscrire, SCRUM-41)
  // n'est jamais un etat "chargement" ni "erreur" -- loading reste faux
  // tant qu'il n'y a rien a charger, le gabarit #emptymessage existant
  // s'en charge.
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

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

      this.loading.set(true);
      this.errorMessage.set(null);

      // Un seul appel pour tout le portefeuille plutot qu'un par
      // organisation (SCRUM-43) -- cornalix-ms-scoring calcule les N
      // scores server-side, en parallele.
      this.scoringApi
        .getScores(organizations.map((org) => org.id))
        .then((scores) => {
          const entries = Object.entries(scores).map(([orgId, score]) => [orgId, score.overallScore ?? 0] as const);
          this.scoreByOrgId.set(Object.fromEntries(entries));
        })
        .catch((error) => this.errorMessage.set(toErrorMessage(error)))
        .finally(() => this.loading.set(false));
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
