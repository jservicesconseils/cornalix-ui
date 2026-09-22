import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';

import { tenantFeature } from '../../core/state/tenant/tenant.reducer';
import { DEMO_DASHBOARD, DEMO_QUESTIONS } from '../../core/data/demo-data';
import { AnswerValue } from '../../core/models/question.model';

const ANSWER_LABEL: Record<AnswerValue, string> = {
  YES: 'Oui',
  NO: 'Non',
  PARTIAL: 'Partiel',
  NOT_APPLICABLE: 'N/A',
};

@Component({
  selector: 'app-report',
  imports: [Tabs, TabList, Tab, TabPanels, TabPanel],
  templateUrl: './report.html',
  styleUrl: './report.scss',
})
export class Report {
  private readonly store = inject(Store);

  protected readonly currentOrganization = this.store.selectSignal(tenantFeature.selectCurrentOrganization);
  protected readonly snapshot = DEMO_DASHBOARD;
  protected readonly answeredQuestions = computed(() =>
    DEMO_QUESTIONS.filter((q) => q.answer !== null).map((q) => ({ ...q, answerLabel: ANSWER_LABEL[q.answer!] })),
  );

  protected readonly bestFunction = computed(() =>
    [...this.snapshot.nistFunctionScores].sort((a, b) => b.score - a.score)[0],
  );

  protected readonly worstFunction = computed(() =>
    [...this.snapshot.nistFunctionScores].sort((a, b) => a.score - b.score)[0],
  );

  protected answerBadgeClass(answer: AnswerValue): string {
    if (answer === 'YES') return 'badge--yes';
    if (answer === 'NO') return 'badge--no';
    return 'badge--partial';
  }
}
