import { AppUser, UserRole } from '../models/user.model';
import { CisControlScore, DashboardSnapshot, NistFunctionScore, Organization } from '../models/organization.model';
import { Question, QuestionCategory } from '../models/question.model';

export interface OrgMember {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  email: string;
  status: 'ACTIVE' | 'PENDING';
}

export const DEMO_ORG_MEMBERS: OrgMember[] = [
  { id: 'member-1', name: 'Jean Dupont', initials: 'JD', role: 'ADMIN_PME', email: 'jean.dupont@acme.ca', status: 'ACTIVE' },
  { id: 'member-2', name: 'Sophie Roy', initials: 'SR', role: 'RESPONSABLE_TI', email: 'sophie.roy@acme.ca', status: 'ACTIVE' },
  { id: 'member-3', name: 'Marc Tremblay', initials: 'MT', role: 'EMPLOYE', email: 'marc.tremblay@acme.ca', status: 'ACTIVE' },
  { id: 'member-4', name: 'Julie Gagnon', initials: 'JG', role: 'EMPLOYE', email: 'julie.gagnon@acme.ca', status: 'PENDING' },
  { id: 'member-5', name: 'Alex Martin', initials: 'AM', role: 'ADMIN_PME', email: 'alex.martin@acme.ca', status: 'ACTIVE' },
];

export const DEMO_ORGANIZATIONS: Organization[] = [
  { id: 'org-acme', name: 'Acme Construction', location: 'Montréal, QC', score: 75 },
  { id: 'org-sante', name: 'Clinique Santé Plus', location: 'Laval, QC', score: 62 },
  { id: 'org-nordique', name: 'Les Ateliers Nordique', location: 'Québec, QC', score: 48 },
  { id: 'org-berube', name: 'Transport Bérubé', location: 'Sherbrooke, QC', score: 70 },
  { id: 'org-immobilier', name: 'Groupe Immobilier TC', location: 'Montréal, QC', score: 55 },
  { id: 'org-agro', name: 'Services Agro Inc.', location: 'Drummondville, QC', score: 68 },
];

export const DEMO_USERS: Record<string, AppUser> = {
  admin: {
    id: 'user-jean-dupont',
    name: 'Jean Dupont',
    initials: 'JD',
    email: 'jean.dupont@acme.ca',
    role: 'ADMIN_PME',
  },
  ti: {
    id: 'user-sophie-roy',
    name: 'Sophie Roy',
    initials: 'SR',
    email: 'sophie.roy@acme.ca',
    role: 'RESPONSABLE_TI',
  },
  consultant: {
    id: 'user-jean-dupont-consultant',
    name: 'Jean Dupont',
    initials: 'JD',
    email: 'jean.dupont@cornalix-conseil.ca',
    role: 'CONSULTANT',
  },
};

const NIST_FUNCTION_LABELS: Record<NistFunctionScore['key'], string> = {
  GOVERN: 'Govern',
  IDENTIFY: 'Identify',
  PROTECT: 'Protect',
  DETECT: 'Detect',
  RESPOND: 'Respond',
  RECOVER: 'Recover',
};

export const DEMO_NIST_SCORES: NistFunctionScore[] = [
  { key: 'GOVERN', label: NIST_FUNCTION_LABELS.GOVERN, score: 80 },
  { key: 'IDENTIFY', label: NIST_FUNCTION_LABELS.IDENTIFY, score: 85 },
  { key: 'PROTECT', label: NIST_FUNCTION_LABELS.PROTECT, score: 70 },
  { key: 'DETECT', label: NIST_FUNCTION_LABELS.DETECT, score: 60 },
  { key: 'RESPOND', label: NIST_FUNCTION_LABELS.RESPOND, score: 65 },
  { key: 'RECOVER', label: NIST_FUNCTION_LABELS.RECOVER, score: 55 },
];

export const DEMO_CIS_SCORES: CisControlScore[] = [
  { number: 1, label: 'Gestion des actifs', score: 90 },
  { number: 2, label: 'Inventaire et contrôle des logiciels', score: 80 },
  { number: 3, label: 'Gestion des vulnérabilités', score: 60 },
  { number: 4, label: 'Gestion des configurations', score: 70 },
  { number: 5, label: 'Gestion des comptes', score: 65 },
  { number: 6, label: "Contrôles d'accès", score: 75 },
  { number: 7, label: 'Sensibilisation et formation', score: 85 },
  { number: 8, label: 'Protection des données', score: 70 },
];

export const DEMO_DASHBOARD: DashboardSnapshot = {
  organizationId: 'org-acme',
  overallScore: 75,
  scoreDelta: 5,
  answeredQuestions: 42,
  totalQuestions: 60,
  nistDomains: 6,
  cisControlsCovered: 18,
  lastUpdated: '21 sept. 2026',
  nistFunctionScores: DEMO_NIST_SCORES,
  cisControlScores: DEMO_CIS_SCORES,
  sectorAverage: 62,
};

export const DEMO_QUESTION_CATEGORIES: QuestionCategory[] = [
  { key: 'GOVERN', label: 'Gouvernance' },
  { key: 'IDENTIFY', label: 'Actifs et inventaire' },
  { key: 'PROTECT', label: 'Protection' },
  { key: 'DETECT', label: 'Détection' },
  { key: 'RESPOND', label: 'Réponse' },
  { key: 'RECOVER', label: 'Récupération' },
];

export const DEMO_QUESTIONS: Question[] = [
  // Gouvernance (8)
  {
    id: 'q-govern-1',
    categoryKey: 'GOVERN',
    cisReference: 'CIS Control 14 — Sensibilisation et formation',
    text: 'Une politique de sécurité de l’information est-elle formellement approuvée par la direction ?',
    answer: 'YES',
  },
  {
    id: 'q-govern-2',
    categoryKey: 'GOVERN',
    cisReference: 'Gouvernance',
    text: 'Les rôles et responsabilités en cybersécurité sont-ils définis et communiqués à l’ensemble du personnel ?',
    answer: 'YES',
  },
  {
    id: 'q-govern-3',
    categoryKey: 'GOVERN',
    cisReference: 'Gouvernance',
    text: 'Un processus de gestion des risques cyber est-il en place et révisé au moins une fois par année ?',
    answer: 'YES',
  },
  {
    id: 'q-govern-4',
    categoryKey: 'GOVERN',
    cisReference: 'Conformité',
    text: 'Les exigences de conformité applicables (Loi 25, contrats clients) sont-elles suivies formellement ?',
    answer: 'PARTIAL',
  },
  {
    id: 'q-govern-5',
    categoryKey: 'GOVERN',
    cisReference: 'Gouvernance',
    text: 'Un budget dédié à la cybersécurité est-il alloué chaque année ?',
    answer: 'YES',
  },
  {
    id: 'q-govern-6',
    categoryKey: 'GOVERN',
    cisReference: 'CIS Control 15 — Gestion des fournisseurs de services',
    text: 'Les fournisseurs tiers font-ils l’objet d’une évaluation de risque avant l’octroi d’un accès aux systèmes ?',
    answer: 'YES',
  },
  {
    id: 'q-govern-7',
    categoryKey: 'GOVERN',
    cisReference: 'CIS Control 17 — Gestion des incidents',
    text: 'Un registre des incidents de sécurité est-il tenu à jour ?',
    answer: 'PARTIAL',
  },
  {
    id: 'q-govern-8',
    categoryKey: 'GOVERN',
    cisReference: 'Gouvernance',
    text: 'La haute direction reçoit-elle un rapport périodique sur la posture de cybersécurité de l’organisation ?',
    answer: null,
  },

  // Actifs et inventaire — Identify (6)
  {
    id: 'q-identify-1',
    categoryKey: 'IDENTIFY',
    cisReference: 'CIS Control 1 — Inventory and Control of Enterprise Assets',
    text: "Disposez-vous d'un inventaire à jour de tous les équipements réseau actifs dans l'organisation ?",
    answer: 'YES',
  },
  {
    id: 'q-identify-2',
    categoryKey: 'IDENTIFY',
    cisReference: 'CIS Control 2 — Inventory and Control of Software Assets',
    text: "Disposez-vous d'un inventaire de tous les logiciels autorisés utilisés dans l'organisation ?",
    answer: 'YES',
  },
  {
    id: 'q-identify-3',
    categoryKey: 'IDENTIFY',
    cisReference: 'CIS Control 1 — Inventory and Control of Enterprise Assets',
    text: 'Avez-vous un inventaire à jour de tous les appareils utilisés dans l’organisation (ordinateurs, serveurs, mobiles, équipements réseau, etc.) ?',
    answer: 'YES',
  },
  {
    id: 'q-identify-4',
    categoryKey: 'IDENTIFY',
    cisReference: 'CIS Control 1.1 — Appareils mobiles',
    text: "Disposez-vous d'un inventaire de tous les appareils mobiles utilisés pour accéder aux données de l'entreprise ?",
    answer: 'YES',
  },
  {
    id: 'q-identify-5',
    categoryKey: 'IDENTIFY',
    cisReference: 'CIS Control 5.3',
    text: "Un processus de retrait des équipements et comptes est-il appliqué lors du départ d'un employé ?",
    answer: 'PARTIAL',
  },
  {
    id: 'q-identify-6',
    categoryKey: 'IDENTIFY',
    cisReference: 'CIS Control 2.5',
    text: 'Les logiciels non autorisés sont-ils détectés et retirés automatiquement ?',
    answer: null,
  },

  // Protection (12)
  {
    id: 'q-protect-1',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 12.1',
    text: 'Le réseau est-il segmenté pour isoler les systèmes critiques ou sensibles du reste du trafic ?',
    answer: 'PARTIAL',
  },
  {
    id: 'q-protect-2',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 7.3',
    text: "Les correctifs de sécurité sont-ils appliqués aux logiciels dans un délai défini après leur publication ?",
    answer: 'NO',
  },
  {
    id: 'q-protect-3',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 16.7',
    text: "Le code source des applications développées en interne fait-il l'objet d'une revue avant sa mise en production ?",
    answer: 'PARTIAL',
  },
  {
    id: 'q-protect-4',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 6.5',
    text: 'L’authentification multifacteur (AMF) est-elle exigée pour tous les accès à distance ?',
    answer: 'YES',
  },
  {
    id: 'q-protect-5',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 5.2',
    text: 'Les mots de passe respectent-ils une politique de complexité et de longueur minimale ?',
    answer: 'YES',
  },
  {
    id: 'q-protect-6',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 3.11',
    text: 'Les données sensibles sont-elles chiffrées au repos et en transit ?',
    answer: 'PARTIAL',
  },
  {
    id: 'q-protect-7',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 11.3',
    text: 'Les sauvegardes sont-elles testées régulièrement pour vérifier leur restaurabilité ?',
    answer: 'YES',
  },
  {
    id: 'q-protect-8',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 6.8',
    text: 'Les droits d’accès sont-ils attribués selon le principe du moindre privilège ?',
    answer: 'PARTIAL',
  },
  {
    id: 'q-protect-9',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 10.1',
    text: 'Une solution antivirus ou EDR est-elle déployée sur tous les postes de travail ?',
    answer: 'YES',
  },
  {
    id: 'q-protect-10',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 14.1',
    text: 'Les employés reçoivent-ils une formation annuelle de sensibilisation à la sécurité ?',
    answer: null,
  },
  {
    id: 'q-protect-11',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 1.1 — Appareils mobiles',
    text: 'Les appareils mobiles utilisés pour le travail sont-ils gérés par une solution de gestion des appareils (MDM) ?',
    answer: null,
  },
  {
    id: 'q-protect-12',
    categoryKey: 'PROTECT',
    cisReference: 'CIS Control 13.1',
    text: 'Un pare-feu périmétrique est-il configuré et ses journaux conservés ?',
    answer: null,
  },

  // Détection (10)
  {
    id: 'q-detect-1',
    categoryKey: 'DETECT',
    cisReference: 'CIS Control 8.1',
    text: 'Les journaux d’événements de sécurité sont-ils centralisés et conservés ?',
    answer: 'YES',
  },
  {
    id: 'q-detect-2',
    categoryKey: 'DETECT',
    cisReference: 'CIS Control 13.3',
    text: 'Une solution de détection d’intrusion (IDS/IPS) est-elle déployée sur le réseau ?',
    answer: 'PARTIAL',
  },
  {
    id: 'q-detect-3',
    categoryKey: 'DETECT',
    cisReference: 'CIS Control 8.11',
    text: 'Les alertes de sécurité sont-elles surveillées en continu ou aux heures ouvrables ?',
    answer: 'YES',
  },
  {
    id: 'q-detect-4',
    categoryKey: 'DETECT',
    cisReference: 'CIS Control 7.5',
    text: 'Des tests de vulnérabilité sont-ils exécutés périodiquement ?',
    answer: 'YES',
  },
  {
    id: 'q-detect-5',
    categoryKey: 'DETECT',
    cisReference: 'CIS Control 13.2',
    text: 'Les comportements anormaux sur le réseau déclenchent-ils une alerte automatique ?',
    answer: 'PARTIAL',
  },
  {
    id: 'q-detect-6',
    categoryKey: 'DETECT',
    cisReference: 'CIS Control 9.7',
    text: 'Un processus de détection des tentatives d’hameçonnage est-il en place ?',
    answer: 'YES',
  },
  {
    id: 'q-detect-7',
    categoryKey: 'DETECT',
    cisReference: 'CIS Control 8.5',
    text: 'Les accès administrateurs sont-ils journalisés et audités périodiquement ?',
    answer: 'YES',
  },
  {
    id: 'q-detect-8',
    categoryKey: 'DETECT',
    cisReference: 'Surveillance',
    text: 'Une surveillance des fuites de données (dark web, identifiants compromis) est-elle effectuée ?',
    answer: null,
  },
  {
    id: 'q-detect-9',
    categoryKey: 'DETECT',
    cisReference: 'Disponibilité',
    text: 'Les systèmes critiques font-ils l’objet d’une supervision de disponibilité ?',
    answer: 'YES',
  },
  {
    id: 'q-detect-10',
    categoryKey: 'DETECT',
    cisReference: 'CIS Control 17.9',
    text: 'Les anomalies détectées sont-elles priorisées selon leur niveau de criticité ?',
    answer: null,
  },

  // Réponse (8)
  {
    id: 'q-respond-1',
    categoryKey: 'RESPOND',
    cisReference: 'CIS Control 17.1',
    text: 'Un plan de réponse aux incidents est-il documenté et maintenu à jour ?',
    answer: 'YES',
  },
  {
    id: 'q-respond-2',
    categoryKey: 'RESPOND',
    cisReference: 'CIS Control 17.2',
    text: 'Une équipe ou un contact désigné est-il responsable de la réponse aux incidents ?',
    answer: 'YES',
  },
  {
    id: 'q-respond-3',
    categoryKey: 'RESPOND',
    cisReference: 'Conformité — Loi 25',
    text: 'Les obligations de notification (Loi 25, clients, assureurs) sont-elles connues en cas d’incident ?',
    answer: 'PARTIAL',
  },
  {
    id: 'q-respond-4',
    categoryKey: 'RESPOND',
    cisReference: 'CIS Control 17.7',
    text: 'Un exercice de simulation d’incident (tabletop) a-t-il été réalisé au cours de la dernière année ?',
    answer: 'NO',
  },
  {
    id: 'q-respond-5',
    categoryKey: 'RESPOND',
    cisReference: 'CIS Control 13.6',
    text: 'Les systèmes compromis peuvent-ils être isolés rapidement du reste du réseau ?',
    answer: null,
  },
  {
    id: 'q-respond-6',
    categoryKey: 'RESPOND',
    cisReference: 'Gestion de crise',
    text: 'Une communication de crise est-elle prévue en cas d’incident majeur ?',
    answer: null,
  },
  {
    id: 'q-respond-7',
    categoryKey: 'RESPOND',
    cisReference: 'CIS Control 17.5',
    text: 'Les preuves numériques sont-elles préservées selon un processus défini en cas d’incident ?',
    answer: null,
  },
  {
    id: 'q-respond-8',
    categoryKey: 'RESPOND',
    cisReference: 'Amélioration continue',
    text: 'Un post-mortem est-il réalisé après chaque incident afin d’en tirer des leçons ?',
    answer: null,
  },

  // Récupération (6)
  {
    id: 'q-recover-1',
    categoryKey: 'RECOVER',
    cisReference: 'Continuité des activités',
    text: 'Un plan de continuité des activités est-il documenté ?',
    answer: 'PARTIAL',
  },
  {
    id: 'q-recover-2',
    categoryKey: 'RECOVER',
    cisReference: 'CIS Control 11.1',
    text: 'Les délais de restauration (RTO/RPO) sont-ils définis pour les systèmes critiques ?',
    answer: null,
  },
  {
    id: 'q-recover-3',
    categoryKey: 'RECOVER',
    cisReference: 'CIS Control 11.4',
    text: 'Une copie des sauvegardes est-elle conservée hors site ou hors ligne ?',
    answer: 'YES',
  },
  {
    id: 'q-recover-4',
    categoryKey: 'RECOVER',
    cisReference: 'Reprise après sinistre',
    text: 'Le plan de reprise après sinistre est-il testé au moins une fois par année ?',
    answer: null,
  },
  {
    id: 'q-recover-5',
    categoryKey: 'RECOVER',
    cisReference: 'Transfert de risque',
    text: 'Une police d’assurance cyber-risque est-elle en vigueur ?',
    answer: null,
  },
  {
    id: 'q-recover-6',
    categoryKey: 'RECOVER',
    cisReference: 'Amélioration continue',
    text: 'Les leçons apprises des incidents sont-elles intégrées au plan de continuité ?',
    answer: null,
  },
];
