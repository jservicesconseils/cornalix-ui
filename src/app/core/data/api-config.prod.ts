// URLs des 4 microservices en production (SCRUM-37). Remplace
// api-config.ts via fileReplacements (angular.json, configuration
// "production") au moment du build -- routage par nom d'hote sur
// l'ALB partage (SCRUM-36), pas de changement de chemin par rapport
// au local (chaque service garde /api/v1/... a la racine).
export const API_BASE_URLS = {
  identity: 'https://identity.api.cornalix.ca',
  diagnostic: 'https://diagnostic.api.cornalix.ca',
  scoring: 'https://scoring.api.cornalix.ca',
  reporting: 'https://reporting.api.cornalix.ca',
} as const;
