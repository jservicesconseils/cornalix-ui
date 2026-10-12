import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';

import {
  AdminQuestion,
  ImplementationGroup,
  QuestionAdminApiService,
  QuestionFormValue,
  QuestionImportResult,
} from '../../../core/diagnostic/question-admin-api.service';
import { QUESTION_CATEGORIES } from '../../../core/data/question-categories';
import { NistFunctionKey } from '../../../core/models/organization.model';

const IMPLEMENTATION_GROUP_OPTIONS: { label: string; value: ImplementationGroup }[] = [
  { label: 'IG1', value: 'IG1' },
  { label: 'IG2', value: 'IG2' },
  { label: 'IG3', value: 'IG3' },
];

interface QuestionFormState {
  cisControl: number | null;
  cisSafeguard: string;
  nistFunction: NistFunctionKey | null;
  implementationGroup: ImplementationGroup | null;
  textFr: string;
  textEn: string;
}

const EMPTY_FORM: QuestionFormState = {
  cisControl: null,
  cisSafeguard: '',
  nistFunction: null,
  implementationGroup: null,
  textFr: '',
  textEn: '',
};

@Component({
  selector: 'app-questions-admin',
  imports: [FormsModule, InputText, InputNumber, TableModule, Dialog, Select],
  templateUrl: './questions-admin.html',
  styleUrl: './questions-admin.scss',
})
export class QuestionsAdmin {
  private readonly api = inject(QuestionAdminApiService);

  protected readonly nistFunctionOptions = QUESTION_CATEGORIES;
  protected readonly implementationGroupOptions = IMPLEMENTATION_GROUP_OPTIONS;

  protected readonly questions = signal<AdminQuestion[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);

  protected readonly search = signal('');

  protected readonly filteredQuestions = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.questions();
    }
    return this.questions().filter((question) => {
      const text = `${question.cisControl} ${question.cisSafeguard} ${Object.values(question.translations).join(' ')}`;
      return text.toLowerCase().includes(term);
    });
  });

  protected readonly dialogVisible = signal(false);
  protected readonly editingQuestion = signal<AdminQuestion | null>(null);
  protected readonly form = signal<QuestionFormState>(EMPTY_FORM);
  protected readonly formSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  // Import CSV : pas de signal pour le File lui-meme (pas besoin de
  // reactivite dessus), seul le resultat et l'etat de la requete le sont.
  private selectedFile: File | null = null;
  protected readonly selectedFileName = signal<string | null>(null);
  protected readonly importing = signal(false);
  protected readonly importError = signal<string | null>(null);
  protected readonly importResult = signal<QuestionImportResult | null>(null);

  constructor() {
    this.loadQuestions();
  }

  protected nistFunctionLabel(key: NistFunctionKey): string {
    return QUESTION_CATEGORIES.find((category) => category.key === key)?.label ?? key;
  }

  protected questionText(question: AdminQuestion): string {
    return question.translations['fr'] ?? Object.values(question.translations)[0] ?? '';
  }

  protected async loadQuestions(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const questions = await this.api.listAll();
      questions.sort((a, b) => a.cisControl - b.cisControl || a.cisSafeguard.localeCompare(b.cisSafeguard));
      this.questions.set(questions);
    } catch {
      this.loadError.set('Impossible de charger le catalogue de questions.');
    } finally {
      this.loading.set(false);
    }
  }

  protected openCreateDialog(): void {
    this.editingQuestion.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.formError.set(null);
    this.dialogVisible.set(true);
  }

  protected openEditDialog(question: AdminQuestion): void {
    this.editingQuestion.set(question);
    this.form.set({
      cisControl: question.cisControl,
      cisSafeguard: question.cisSafeguard,
      nistFunction: question.nistFunction,
      implementationGroup: question.implementationGroup,
      textFr: question.translations['fr'] ?? '',
      textEn: question.translations['en'] ?? '',
    });
    this.formError.set(null);
    this.dialogVisible.set(true);
  }

  protected updateForm(patch: Partial<QuestionFormState>): void {
    this.form.update((current) => ({ ...current, ...patch }));
  }

  protected async submitForm(): Promise<void> {
    const value = this.form();
    if (!value.cisControl || !value.cisSafeguard.trim() || !value.nistFunction || !value.implementationGroup || !value.textFr.trim()) {
      this.formError.set('Le contrôle CIS, le safeguard, la fonction NIST, le groupe et le texte français sont requis.');
      return;
    }

    const translations: Record<string, string> = { fr: value.textFr.trim() };
    if (value.textEn.trim()) {
      translations['en'] = value.textEn.trim();
    }

    const payload: QuestionFormValue = {
      cisControl: value.cisControl,
      cisSafeguard: value.cisSafeguard.trim(),
      nistFunction: value.nistFunction,
      implementationGroup: value.implementationGroup,
      translations,
    };

    this.formSubmitting.set(true);
    this.formError.set(null);
    try {
      const editing = this.editingQuestion();
      if (editing) {
        const updated = await this.api.update(editing.id, payload);
        this.questions.update((current) => current.map((q) => (q.id === updated.id ? updated : q)));
      } else {
        const created = await this.api.create(payload);
        this.questions.update((current) => [...current, created]);
      }
      this.dialogVisible.set(false);
    } catch (error) {
      this.formError.set(this.extractErrorMessage(error) ?? "L'enregistrement a échoué. Vérifiez les champs ou réessayez.");
    } finally {
      this.formSubmitting.set(false);
    }
  }

  protected async deleteQuestion(question: AdminQuestion): Promise<void> {
    if (!confirm(`Supprimer la question CIS ${question.cisControl} — ${question.cisSafeguard} ?`)) {
      return;
    }

    try {
      await this.api.delete(question.id);
      this.questions.update((current) => current.filter((q) => q.id !== question.id));
    } catch (error) {
      alert(
        this.extractErrorMessage(error) ??
          'Suppression impossible -- cette question a déjà des réponses enregistrées.',
      );
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;
    this.selectedFileName.set(file?.name ?? null);
    this.importResult.set(null);
    this.importError.set(null);
  }

  protected async importSelectedFile(): Promise<void> {
    if (!this.selectedFile) {
      return;
    }

    this.importing.set(true);
    this.importError.set(null);
    this.importResult.set(null);
    try {
      const result = await this.api.importCsv(this.selectedFile);
      this.importResult.set(result);
      await this.loadQuestions();
    } catch (error) {
      this.importError.set(this.extractErrorMessage(error) ?? "L'import a échoué. Vérifiez le format du fichier.");
    } finally {
      this.importing.set(false);
    }
  }

  private extractErrorMessage(error: unknown): string | null {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
      return error.error.message;
    }
    return null;
  }
}
