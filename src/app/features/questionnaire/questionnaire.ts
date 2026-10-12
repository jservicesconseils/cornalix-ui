import { Component, computed, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';

import { QUESTION_CATEGORIES } from '../../core/data/question-categories';
import { DiagnosticApiService } from '../../core/diagnostic/diagnostic-api.service';
import { AnswerValue, Question } from '../../core/models/question.model';
import { NistFunctionKey } from '../../core/models/organization.model';
import { tenantFeature } from '../../core/state/tenant/tenant.reducer';
import { AsyncState } from '../../shared/async-state/async-state';
import { toErrorMessage } from '../../shared/async-state/http-error.util';

@Component({
  selector: 'app-questionnaire',
  imports: [AsyncState],
  templateUrl: './questionnaire.html',
  styleUrl: './questionnaire.scss',
})
export class Questionnaire {
  private readonly store = inject(Store);
  private readonly diagnosticApi = inject(DiagnosticApiService);

  private readonly currentOrganizationId = this.store.selectSignal(tenantFeature.selectCurrentOrganizationId);

  protected readonly categories = QUESTION_CATEGORIES;
  protected readonly questions = signal<Question[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly selectedCategoryKey = signal<NistFunctionKey>(QUESTION_CATEGORIES[0].key);
  protected readonly selectedIndex = signal(0);

  // Vrai des qu'il n'y a aucune organisation courante -- cas reel d'un
  // Consultant fraichement inscrit, avant qu'aucune organisation cliente
  // ne lui ait donne acces (portefeuille vide, SCRUM-41/45).
  protected readonly hasOrganization = computed(() => this.currentOrganizationId() !== null);

  constructor() {
    // Reagit a la fois au chargement initial du portefeuille et a un
    // changement d'organisation (ex. Consultant qui bascule de client
    // dans le bandeau superieur) -- recharge le catalogue + les reponses
    // de l'organisation nouvellement selectionnee a chaque fois.
    effect(() => {
      const organizationId = this.currentOrganizationId();
      if (!organizationId) {
        // Bug corrige : loading demarrait a true et rien ne le remettait
        // jamais a false dans ce cas, spinner infini au lieu de l'etat
        // vide gere par le gabarit (hasOrganization()).
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.errorMessage.set(null);
      this.diagnosticApi
        .listQuestionsWithAnswers(organizationId)
        .then((questions) => {
          this.questions.set(questions);
          this.selectedCategoryKey.set(QUESTION_CATEGORIES[0].key);
          this.selectedIndex.set(0);
        })
        .catch((error) => this.errorMessage.set(toErrorMessage(error)))
        .finally(() => this.loading.set(false));
    });
  }

  protected readonly categoriesWithCounts = computed(() =>
    this.categories.map((category) => {
      const categoryQuestions = this.questions().filter((q) => q.categoryKey === category.key);
      return {
        ...category,
        total: categoryQuestions.length,
        answered: categoryQuestions.filter((q) => q.answer !== null).length,
      };
    }),
  );

  protected readonly currentCategoryQuestions = computed(() =>
    this.questions().filter((q) => q.categoryKey === this.selectedCategoryKey()),
  );

  protected readonly currentQuestion = computed(
    () => this.currentCategoryQuestions()[this.selectedIndex()] ?? null,
  );

  protected readonly currentCategoryLabel = computed(
    () => this.categories.find((c) => c.key === this.selectedCategoryKey())?.label ?? '',
  );

  protected readonly totalAnswered = computed(() => this.questions().filter((q) => q.answer !== null).length);
  protected readonly totalQuestions = computed(() => this.questions().length);
  protected readonly progressPct = computed(() =>
    this.totalQuestions() === 0 ? 0 : Math.round((this.totalAnswered() / this.totalQuestions()) * 100),
  );

  protected selectCategory(key: NistFunctionKey): void {
    this.selectedCategoryKey.set(key);
    this.selectedIndex.set(0);
  }

  protected setAnswer(value: AnswerValue): void {
    const current = this.currentQuestion();
    const organizationId = this.currentOrganizationId();
    if (!current || !organizationId) return;

    this.questions.update((all) => all.map((q) => (q.id === current.id ? { ...q, answer: value } : q)));

    // Persistance best-effort : l'etat local est deja mis a jour de
    // maniere optimiste, on ne bloque pas la navigation sur le reseau.
    // Pas d'indicateur d'echec visible pour l'instant (hors scope).
    // SCRUM-51 : une fois la reponse enregistree, on complete l'horodatage
    // avec celui renvoye par le serveur (pas une date locale devinee).
    void this.diagnosticApi.saveAnswer(organizationId, current.id, value).then((answeredAt) => {
      this.questions.update((all) => all.map((q) => (q.id === current.id ? { ...q, answeredAt } : q)));
    });
  }

  protected previous(): void {
    if (this.selectedIndex() > 0) {
      this.selectedIndex.update((i) => i - 1);
      return;
    }
    const categoryIndex = this.categories.findIndex((c) => c.key === this.selectedCategoryKey());
    if (categoryIndex > 0) {
      const previousCategory = this.categories[categoryIndex - 1];
      const previousQuestions = this.questions().filter((q) => q.categoryKey === previousCategory.key);
      this.selectedCategoryKey.set(previousCategory.key);
      this.selectedIndex.set(Math.max(0, previousQuestions.length - 1));
    }
  }

  protected next(): void {
    if (this.selectedIndex() < this.currentCategoryQuestions().length - 1) {
      this.selectedIndex.update((i) => i + 1);
      return;
    }
    const categoryIndex = this.categories.findIndex((c) => c.key === this.selectedCategoryKey());
    if (categoryIndex < this.categories.length - 1) {
      this.selectedCategoryKey.set(this.categories[categoryIndex + 1].key);
      this.selectedIndex.set(0);
    }
  }

  protected isFirstQuestion(): boolean {
    return this.selectedIndex() === 0 && this.categories.findIndex((c) => c.key === this.selectedCategoryKey()) === 0;
  }

  protected isLastQuestion(): boolean {
    const categoryIndex = this.categories.findIndex((c) => c.key === this.selectedCategoryKey());
    return (
      this.selectedIndex() === this.currentCategoryQuestions().length - 1 &&
      categoryIndex === this.categories.length - 1
    );
  }

  // SCRUM-51 : formatage local plutot que DatePipe -- aucune locale
  // francaise enregistree dans l'app (DatePipe retomberait sur l'anglais).
  // Meme approche que shared/trend-chart/trend-chart.ts.
  protected formatLastModified(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
