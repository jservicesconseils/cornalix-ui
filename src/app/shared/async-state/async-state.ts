import { Component, input } from '@angular/core';

// Enveloppe un chargement reseau (SCRUM-44) : spinner pendant le
// chargement, bandeau d'erreur en cas d'echec, contenu projete sinon.
// Utilise par Tableau de bord, Portefeuille, Rapport et Questionnaire --
// seul ecran jusqu'ici (Connexion) a gerer ses erreurs reseau.
@Component({
  selector: 'app-async-state',
  imports: [],
  templateUrl: './async-state.html',
  styleUrl: './async-state.scss',
})
export class AsyncState {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
}
