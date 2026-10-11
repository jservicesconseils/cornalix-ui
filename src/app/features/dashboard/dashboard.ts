import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LucideRefreshCw, LucideCheck, LucideArrowRight, LucideFlag } from '@lucide/angular';

import { CIS_CONTROL_LABELS } from '../../core/data/cis-control-labels';
import { QUESTION_CATEGORIES } from '../../core/data/question-categories';
import { DiagnosticApiService } from '../../core/diagnostic/diagnostic-api.service';
import { CisControlScore, NistFunctionScore } from '../../core/models/organization.model';
import { ScoringApiService } from '../../core/scoring/scoring-api.service';
import { tenantFeature } from '../../core/state/tenant/tenant.reducer';
import { RadarChart } from '../../shared/radar-chart/radar-chart';
import { TrendChart, TrendPoint } from '../../shared/trend-chart/trend-chart';
import { AsyncState } from '../../shared/async-state/async-state';
import { toErrorMessage } from '../../shared/async-state/http-error.util';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, RadarChart, TrendChart, LucideRefreshCw, LucideCheck, LucideArrowRight, LucideFlag, AsyncState],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly store = inject(Store);
  private readonly scoringApi = inject(ScoringApiService);
  private readonly diagnosticApi = inject(DiagnosticApiService);

  private readonly currentOrganizationId = this.store.selectSignal(tenantFeature.selectCurrentOrganizationId);

  // Nombre total de fonctions NIST CSF 2.0 -- fait structurel du
  // referentiel, pas une donnee a charger.
  protected readonly nistDomainsTotal = QUESTION_CATEGORIES.length;

  protected readonly overallScore = signal<number | null>(null);
  protected readonly answeredCount = signal(0);
  protected readonly totalCount = signal(0);
  protected readonly nistFunctionScores = signal<NistFunctionScore[]>(
    QUESTION_CATEGORIES.map((c) => ({ key: c.key, label: c.label, score: 0 })),
  );
  protected readonly cisControlScores = signal<CisControlScore[]>(
    CIS_CONTROL_LABELS.map((c) => ({ ...c, score: 0 })),
  );

  // Nombre de controles CIS pour lesquels l'organisation a au moins une
  // reponse exploitable (presents dans scoreByCisControl) -- pas la
  // taille du catalogue, qui peut en couvrir davantage sans reponse.
  protected readonly cisControlsCoveredCount = signal(0);

  protected readonly scoreHistory = signal<TrendPoint[]>([]);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly overallScorePct = computed(() => this.overallScore() ?? 0);
  protected readonly overallScoreLabel = computed(() =>
    this.overallScore() === null ? '—' : `${this.overallScore()}%`,
  );

  constructor() {
    effect(() => {
      const organizationId = this.currentOrganizationId();
      if (!organizationId) {
        return;
      }

      this.loading.set(true);
      this.errorMessage.set(null);

      Promise.all([
        this.scoringApi.getScore(organizationId),
        this.diagnosticApi.listQuestionsWithAnswers(organizationId),
        this.scoringApi.getHistory(organizationId),
      ])
        .then(([score, questions, history]) => {
          this.overallScore.set(score.overallScore);
          this.cisControlsCoveredCount.set(Object.keys(score.scoreByCisControl).length);
          this.nistFunctionScores.set(
            QUESTION_CATEGORIES.map((c) => ({ key: c.key, label: c.label, score: score.scoreByFunction[c.key] ?? 0 })),
          );
          this.cisControlScores.set(
            CIS_CONTROL_LABELS.map((c) => ({ ...c, score: score.scoreByCisControl[String(c.number)] ?? 0 })),
          );
          this.answeredCount.set(questions.filter((q) => q.answer !== null).length);
          this.totalCount.set(questions.length);
          this.scoreHistory.set(history);
        })
        .catch((error) => this.errorMessage.set(toErrorMessage(error)))
        .finally(() => this.loading.set(false));
    });
  }
}
