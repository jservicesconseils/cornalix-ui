import { Injectable } from '@angular/core';

// Un Administrateur PME cree son organisation a l'inscription ; un
// Consultant cybersecurite n'en a aucune a lui (il gere un portefeuille
// d'organisations clientes) -- types distincts plutot qu'un
// organizationName optionnel, pour qu'un oubli de branchement cote
// ConfirmSignup soit une erreur de compilation plutot qu'un bug muet.
export type PendingRegistration =
  | { accountType: 'PME'; email: string; password: string; organizationName: string; organizationLocation: string }
  | { accountType: 'CONSULTANT'; email: string; password: string };

// Porte les donnees d'inscription (SCRUM-41) entre l'ecran Inscription
// et l'ecran Confirmation -- en memoire seulement (jamais dans
// localStorage/l'URL, le mot de passe y transite). Un rafraichissement
// de page entre les deux perd l'etat ; l'ecran Confirmation renvoie
// alors vers /inscription plutot que d'echouer silencieusement.
@Injectable({ providedIn: 'root' })
export class RegistrationFlowService {
  private pendingRegistration: PendingRegistration | null = null;

  start(registration: PendingRegistration): void {
    this.pendingRegistration = registration;
  }

  get pending(): PendingRegistration | null {
    return this.pendingRegistration;
  }

  clear(): void {
    this.pendingRegistration = null;
  }
}
