import { QuestionCategory } from '../models/question.model';

// Libelles d'affichage des 6 fonctions NIST CSF 2.0 pour la navigation du
// questionnaire. Pas de donnees mock ici : les cles correspondent a
// l'enum NistFunction du backend (cornalix-ms-diagnostic), seuls les
// libelles francais sont definis cote client.
export const QUESTION_CATEGORIES: QuestionCategory[] = [
  { key: 'GOVERN', label: 'Gouvernance' },
  { key: 'IDENTIFY', label: 'Actifs et inventaire' },
  { key: 'PROTECT', label: 'Protection' },
  { key: 'DETECT', label: 'Détection' },
  { key: 'RESPOND', label: 'Réponse' },
  { key: 'RECOVER', label: 'Récupération' },
];
