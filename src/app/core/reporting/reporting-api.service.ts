import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URLS } from '../data/api-config';
import { NistFunctionKey } from '../models/organization.model';
import { AnswerValue, Question, formatCisReference, pickQuestionText } from '../models/question.model';
import { mapFractionsToPercent, toPercent } from '../models/score.util';

interface AnsweredQuestionDto {
  questionId: string;
  cisControl: number;
  cisSafeguard: string;
  nistFunction: NistFunctionKey;
  translations: Record<string, string>;
  value: AnswerValue;
  answeredAt: string;
}

interface ReportResponseDto {
  organizationId: string;
  overallScore: number | null;
  scoreByFunction: Partial<Record<NistFunctionKey, number>>;
  scoreByCisControl: Record<string, number>;
  answers: AnsweredQuestionDto[];
}

export interface ReportSnapshot {
  overallScore: number | null;
  scoreByFunction: Partial<Record<NistFunctionKey, number>>;
  scoreByCisControl: Record<string, number>;
  // Seulement les questions auxquelles l'organisation a repondu -- meme
  // logique de lecture que le calcul du score cote backend (pas les
  // questions du catalogue encore sans reponse).
  answeredQuestions: Question[];
}

function toAnsweredQuestion(dto: AnsweredQuestionDto): Question {
  return {
    id: dto.questionId,
    categoryKey: dto.nistFunction,
    cisReference: formatCisReference(dto.cisControl, dto.cisSafeguard),
    text: pickQuestionText(dto.translations),
    answer: dto.value,
  };
}

@Injectable({ providedIn: 'root' })
export class ReportingApiService {
  private readonly http = inject(HttpClient);

  async getReport(organizationId: string): Promise<ReportSnapshot> {
    const dto = await firstValueFrom(
      this.http.get<ReportResponseDto>(
        `${API_BASE_URLS.reporting}/api/v1/reporting/organizations/${organizationId}/report`,
      ),
    );
    return {
      overallScore: toPercent(dto.overallScore),
      scoreByFunction: mapFractionsToPercent(dto.scoreByFunction ?? {}),
      scoreByCisControl: mapFractionsToPercent(dto.scoreByCisControl ?? {}),
      answeredQuestions: dto.answers.map(toAnsweredQuestion),
    };
  }
}
