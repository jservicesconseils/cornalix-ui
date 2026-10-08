import { Injectable } from '@angular/core';

export interface StoredTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const STORAGE_KEY = 'cornalix.auth.tokens';

// localStorage plutot que la session NgRx : les jetons doivent survivre un
// rechargement de page, et l'auth guard a besoin de les lire avant meme que
// le store ait fini de s'hydrater (pas le cas ici, store en memoire pure,
// mais ca reste la bonne couche pour ce genre de donnee).
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  save(tokens: StoredTokens): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  read(): StoredTokens | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredTokens;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
