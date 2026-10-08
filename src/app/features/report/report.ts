import { Component, computed, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';

import { CIS_CONTROL_LABELS } from '../../core/data/cis-control-labels';
import { QUESTION_CATEGORIES } from '../../core/data/question-categories';
import { CisControlScore, NistFunctionScore } from '../../core/models/organization.model';
import { AnswerValue, Question } from '../../core/models/question.model';
import { ReportingApiService } from '../../core/reporting/reporting-api.service';
import { tenantFeature } from '../../core/state/tenant/tenant.reducer';

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
  imports: [Tabs, TabList, Tab, TabPanels, TabPanel],
  templateUrl: './report.html',
  styleUrl: './report.scss',
})
export class Report {
  private readonly store = inject(Store);
  private readonly reportingApi = inject(ReportingApiService);

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

  protected readonly overallScoreLabel = computed(() =>
    this.overallScore() === null ? '—' : `${this.overallScore()}%`,
  );

  constructor() {
    effect(() => {
      const organizationId = this.currentOrganizationId();
      if (!organizationId) {
        return;
      }

      this.reportingApi.getReport(organizationId).then((report) => {
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
      });
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
}
