import { Component, computed, signal } from '@angular/core';
import { DEMO_QUESTIONS, DEMO_QUESTION_CATEGORIES } from '../../core/data/demo-data';
import { AnswerValue, Question } from '../../core/models/question.model';
import { NistFunctionKey } from '../../core/models/organization.model';

@Component({
  selector: 'app-questionnaire',
  imports: [],
  templateUrl: './questionnaire.html',
  styleUrl: './questionnaire.scss',
})
export class Questionnaire {
  protected readonly categories = DEMO_QUESTION_CATEGORIES;
  protected readonly questions = signal<Question[]>(DEMO_QUESTIONS);

  protected readonly selectedCategoryKey = signal<NistFunctionKey>('IDENTIFY');
  protected readonly selectedIndex = signal(2);

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
    if (!current) return;
    this.questions.update((all) => all.map((q) => (q.id === current.id ? { ...q, answer: value } : q)));
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
}
