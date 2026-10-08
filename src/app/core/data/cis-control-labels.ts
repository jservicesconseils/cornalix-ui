import { CisControlScore } from '../models/organization.model';

// Titres francais des 18 controles CIS Controls v8. Reference statique
// (la liste des controles est fixe, definie par CIS) -- seuls les scores
// par controle, affiches a part, viennent du backend (cornalix-ms-scoring).
export const CIS_CONTROL_LABELS: Omit<CisControlScore, 'score'>[] = [
  { number: 1, label: 'Inventaire et contrôle des actifs matériels' },
  { number: 2, label: 'Inventaire et contrôle des actifs logiciels' },
  { number: 3, label: 'Protection des données' },
  { number: 4, label: 'Configuration sécurisée des actifs et logiciels' },
  { number: 5, label: 'Gestion des comptes' },
  { number: 6, label: "Gestion des contrôles d'accès" },
  { number: 7, label: 'Gestion continue des vulnérabilités' },
  { number: 8, label: "Gestion des journaux d'audit" },
  { number: 9, label: 'Protections courriel et navigateur web' },
  { number: 10, label: 'Défense contre les logiciels malveillants' },
  { number: 11, label: 'Récupération des données' },
  { number: 12, label: "Gestion de l'infrastructure réseau" },
  { number: 13, label: 'Surveillance et défense réseau' },
  { number: 14, label: 'Sensibilisation et formation à la sécurité' },
  { number: 15, label: 'Gestion des fournisseurs de services' },
  { number: 16, label: 'Sécurité des logiciels applicatifs' },
  { number: 17, label: 'Gestion de la réponse aux incidents' },
  { number: 18, label: "Tests d'intrusion" },
];
