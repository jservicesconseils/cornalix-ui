import { NistFunctionKey } from './organization.model';

export type AnswerValue = 'YES' | 'NO' | 'PARTIAL' | 'NOT_APPLICABLE';

export interface QuestionCategory {
  key: NistFunctionKey;
  label: string;
}

export interface Question {
  id: string;
  categoryKey: NistFunctionKey;
  cisReference: string;
  text: string;
  answer: AnswerValue | null;
}
