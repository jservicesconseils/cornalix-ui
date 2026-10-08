// Coordonnees du User Pool Cognito dev (memes valeurs que les 4 microservices
// backend). Le Client App n'a pas de secret (SPA publique) et n'autorise que
// USER_PASSWORD_AUTH + REFRESH_TOKEN_AUTH (pas de SRP) -- voir SCRUM-27.
export const COGNITO_CONFIG = {
  region: 'ca-central-1',
  userPoolId: 'ca-central-1_9cLNOsUJ3',
  clientId: '4l81biuvniq3vbd12m2r5hrh86',
} as const;
