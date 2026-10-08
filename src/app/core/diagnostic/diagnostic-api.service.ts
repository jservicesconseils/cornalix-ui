import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URLS } from '../data/api-config';
import { NistFunctionKey } from '../models/organization.model';
import { AnswerValue, Question } from '../models/question.model';

interface QuestionResponseDto {
  id: string;
  cisControl: number;
  cisSafeguard: string;
  nistFunction: NistFunctionKey;
  implementationGroup: 'IG1' | 'IG2' | 'IG3';
  translations: Record<string, string>;
}

interface AnswerResponseDto {
  id: string;
  questionId: string;
  value: AnswerValue;
  answeredAt: string;
}

// Le modele Question cote frontend garde un seul champ texte
// (cisReference) alors que le backend separe cisControl/cisSafeguard --
// compose ici plutot que d'eclater le modele pour un seul consommateur.
function toQuestion(dto: QuestionResponseDto, answer: AnswerValue | null): Question {
  const text = dto.translations['fr'] ?? Object.values(dto.translations)[0] ?? '';
  return {
    id: dto.id,
    categoryKey: dto.nistFunction,
    cisReference: `CIS ${dto.cisControl} — ${dto.cisSafeguard}`,
    text,
    answer,
  };
}

@Injectable({ providedIn: 'root' })
export class DiagnosticApiService {
  private readonly http = inject(HttpClient);

  // Le catalogue de questions est global ; seules les reponses sont
  // propres a une organisation. Chargees en parallele puis fusionnees :
  // une question absente de /answers n'a simplement pas encore de
  // reponse (answer = null), ce n'est pas une erreur.
  async listQuestionsWithAnswers(organizationId: string): Promise<Question[]> {
    const [questionDtos, answerDtos] = await Promise.all([
      firstValueFrom(
        this.http.get<QuestionResponseDto[]>(`${API_BASE_URLS.diagnostic}/api/v1/diagnostics/questions`),
      ),
      firstValueFrom(
        this.http.get<AnswerResponseDto[]>(
          `${API_BASE_URLS.diagnostic}/api/v1/diagnostics/organizations/${organizationId}/answers`,
        ),
      ),
    ]);

    const answerByQuestionId = new Map(answerDtos.map((dto) => [dto.questionId, dto.value]));
    return questionDtos.map((dto) => toQuestion(dto, answerByQuestionId.get(dto.id) ?? null));
  }

  async saveAnswer(organizationId: string, questionId: string, value: AnswerValue): Promise<void> {
    await firstValueFrom(
      this.http.put<AnswerResponseDto>(
        `${API_BASE_URLS.diagnostic}/api/v1/diagnostics/organizations/${organizationId}/answers/${questionId}`,
        { value },
      ),
    );
  }
}
