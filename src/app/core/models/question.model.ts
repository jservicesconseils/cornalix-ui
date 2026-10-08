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

// Format commun de citation CIS Controls v8 ("CIS <controle> — <safeguard>"),
// partage par les mappages DTO de cornalix-ms-diagnostic et
// cornalix-ms-reporting (chacun renvoie cisControl/cisSafeguard separement).
export function formatCisReference(cisControl: number, cisSafeguard: string): string {
  return `CIS ${cisControl} — ${cisSafeguard}`;
}

// Texte d'une question pour la langue d'affichage courante (francais pour
// l'instant, pas de selection de langue cote UI) avec repli sur la
// premiere traduction disponible si le francais manque.
export function pickQuestionText(translations: Record<string, string>): string {
  return translations['fr'] ?? Object.values(translations)[0] ?? '';
}
