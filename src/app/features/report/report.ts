import { Component, computed, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';

import { CIS_CONTROL_LABELS } from '../../core/data/cis-control-labels';
import { QUESTION_CATEGORIES } from '../../core/data/question-categories';
import { CisControlScore, NistFunctionScore } from '../../core/models/organization.model';
import { AnswerValue, Question } from '../../core/models/question.model';
import { ReportingApiService } from '../../core/reporting/reporting-api.service';
import { ScoringApiService } from '../../core/scoring/scoring-api.service';
import { tenantFeature } from '../../core/state/tenant/tenant.reducer';
import { AsyncState } from '../../shared/async-state/async-state';
import { toErrorMessage } from '../../shared/async-state/http-error.util';
import { TrendChart, TrendPoint } from '../../shared/trend-chart/trend-chart';

const ANSWER_LABEL: Record<AnswerValue, string> = {
  YES: 'Oui',
  NO: 'Non',
  PARTIAL: 'Partiel',
  NOT_APPLICABLE: 'N/A',
};

interface AnsweredQuestionRow extends Question {
  answerLabel: string;
}

@Component({
  selector: 'app-report',
  imports: [Tabs, TabList, Tab, TabPanels, TabPanel, AsyncState, TrendChart],
  templateUrl: './report.html',
  styleUrl: './report.scss',
})
export class Report {
  private readonly store = inject(Store);
  private readonly reportingApi = inject(ReportingApiService);
  private readonly scoringApi = inject(ScoringApiService);

  protected readonly currentOrganization = this.store.selectSignal(tenantFeature.selectCurrentOrganization);
  private readonly currentOrganizationId = this.store.selectSignal(tenantFeature.selectCurrentOrganizationId);

  protected readonly overallScore = signal<number | null>(null);
  protected readonly nistFunctionScores = signal<NistFunctionScore[]>(
    QUESTION_CATEGORIES.map((c) => ({ key: c.key, label: c.label, score: 0 })),
  );
  protected readonly cisControlScores = signal<CisControlScore[]>(
    CIS_CONTROL_LABELS.map((c) => ({ ...c, score: 0 })),
  );
  protected readonly answeredQuestions = signal<AnsweredQuestionRow[]>([]);
  protected readonly scoreHistory = signal<TrendPoint[]>([]);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

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

      Promise.all([this.reportingApi.getReport(organizationId), this.scoringApi.getHistory(organizationId)])
        .then(([report, history]) => {
          this.overallScore.set(report.overallScore);
          this.nistFunctionScores.set(
            QUESTION_CATEGORIES.map((c) => ({ key: c.key, label: c.label, score: report.scoreByFunction[c.key] ?? 0 })),
          );
          this.cisControlScores.set(
            CIS_CONTROL_LABELS.map((c) => ({ ...c, score: report.scoreByCisControl[String(c.number)] ?? 0 })),
          );
          this.answeredQuestions.set(
            report.answeredQuestions.map((q) => ({ ...q, answerLabel: ANSWER_LABEL[q.answer!] })),
          );
          this.scoreHistory.set(history);
        })
        .catch((error) => this.errorMessage.set(toErrorMessage(error)))
        .finally(() => this.loading.set(false));
    });
  }

  protected readonly bestFunction = computed(() => [...this.nistFunctionScores()].sort((a, b) => b.score - a.score)[0]);

  protected readonly worstFunction = computed(() =>
    [...this.nistFunctionScores()].sort((a, b) => a.score - b.score)[0],
  );

  protected answerBadgeClass(answer: AnswerValue): string {
    if (answer === 'YES') return 'badge--yes';
    if (answer === 'NO') return 'badge--no';
    return 'badge--partial';
  }

  // SCRUM-48 : export "PDF" via l'impression navigateur plutot qu'une
  // librairie dediee (client ou serveur) -- aucune nouvelle dependance,
  // reutilise le rendu deja a jour de l'ecran. La feuille @media print
  // (report.scss/styles.scss) force l'affichage de tous les onglets et
  // masque le chrome de l'app (sidebar/topbar/actions).
  protected exportPdf(): void {
    window.print();
  }
}
