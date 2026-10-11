export type UserRole = 'ADMIN_PME' | 'RESPONSABLE_TI' | 'EMPLOYE' | 'CONSULTANT';

export interface AppUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
}

// Un membre d'une organisation, tel que renvoye par
// GET /api/v1/organizations/{id}/users (cornalix-ms-identity,
// SCRUM-40). INVITED/ACTIVE : memes valeurs que UserStatus cote
// backend.
export interface OrgMember {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  email: string;
  status: 'INVITED' | 'ACTIVE';
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN_PME: 'Administrateur',
  RESPONSABLE_TI: 'Responsable TI',
  EMPLOYE: 'Employé',
  CONSULTANT: 'Consultant',
};

const ROLE_VALUES: readonly string[] = Object.keys(ROLE_LABELS);

// Role le moins privilegie, utilise quand le claim "role" du jeton est
// absent ou invalide -- meme choix fail-safe que TenantClaims cote
// backend (cornalix-ms-identity), jamais un defaut qui afficherait des
// controles admin a quelqu'un qui n'y aurait pas droit.
export function parseRole(raw: string | undefined): UserRole {
  return raw && ROLE_VALUES.includes(raw) ? (raw as UserRole) : 'EMPLOYE';
}
