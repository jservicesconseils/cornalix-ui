import { Injectable } from '@angular/core';

export interface PendingRegistration {
  email: string;
  password: string;
  organizationName: string;
}

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
