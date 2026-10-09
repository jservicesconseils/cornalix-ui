// URLs des 4 microservices pour l'environnement AWS "dev" (branche
// develop -- distinct a la fois de localhost, SCRUM-25, et de prod,
// SCRUM-37). Memes noms d'hote ALB que prod, prefixes "dev-" (routage
// par nom d'hote sur le meme ALB partage, voir decision "infra
// partagee" de l'environnement dev).
export const API_BASE_URLS = {
  identity: 'https://dev-identity.api.cornalix.ca',
  diagnostic: 'https://dev-diagnostic.api.cornalix.ca',
  scoring: 'https://dev-scoring.api.cornalix.ca',
  reporting: 'https://dev-reporting.api.cornalix.ca',
} as const;
