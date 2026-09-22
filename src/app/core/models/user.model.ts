export type UserRole = 'ADMIN_PME' | 'RESPONSABLE_TI' | 'EMPLOYE' | 'CONSULTANT';

export interface AppUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN_PME: 'Administrateur',
  RESPONSABLE_TI: 'Responsable TI',
  EMPLOYE: 'Employé',
  CONSULTANT: 'Consultant',
};
