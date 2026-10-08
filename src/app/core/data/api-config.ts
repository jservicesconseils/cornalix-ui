// URLs des 4 microservices en local. A externaliser dans une config par
// environnement au moment du deploiement (ticket separe, voir SCRUM-25).
export const API_BASE_URLS = {
  identity: 'http://localhost:8081',
  diagnostic: 'http://localhost:8082',
  scoring: 'http://localhost:8083',
  reporting: 'http://localhost:8084',
} as const;
