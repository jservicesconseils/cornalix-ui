import { HttpErrorResponse } from '@angular/common/http';

// Message utilisateur a partir d'une erreur HTTP (SCRUM-44) -- distingue
// un service en amont indisponible (502, renvoye par reporting/scoring
// quand diagnostic ne repond pas, ou 0 si la requete n'a jamais atteint
// le serveur) d'un refus d'acces, plutot qu'un message generique dans
// tous les cas.
export function toErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0 || error.status === 502 || error.status === 503) {
      return 'Un service est temporairement indisponible. Réessayez dans un instant.';
    }
    if (error.status === 403) {
      return "Vous n'avez pas accès à cette organisation.";
    }
    if (error.status === 401) {
      return 'Votre session a expiré. Reconnectez-vous.';
    }
  }
  return 'Une erreur est survenue. Réessayez dans un instant.';
}
