import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputText } from 'primeng/inputtext';

import { AuthService, ConfirmSignUpFailedError } from '../../core/auth/auth.service';
import { RegistrationFlowService } from '../../core/auth/registration-flow.service';

@Component({
  selector: 'app-confirm-signup',
  imports: [FormsModule, TranslateModule, InputText],
  templateUrl: './confirm-signup.html',
  styleUrl: './confirm-signup.scss',
})
export class ConfirmSignup {
  private readonly authService = inject(AuthService);
  private readonly registrationFlow = inject(RegistrationFlowService);
  private readonly router = inject(Router);

  // Si l'utilisateur arrive ici directement (rafraichissement de page,
  // lien partage) sans etat en memoire, il n'y a rien a confirmer --
  // retour a l'inscription plutot qu'un ecran casse.
  private readonly pending = this.registrationFlow.pending ?? this.redirectToSignup();

  protected readonly email = this.pending?.email ?? '';
  protected readonly code = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly resendMessage = signal<string | null>(null);

  protected async submit(): Promise<void> {
    if (this.submitting() || !this.pending) return;

    this.errorMessage.set(null);
    this.resendMessage.set(null);
    this.submitting.set(true);
    try {
      await this.authService.confirmSignUp(this.pending.email, this.code());

      if (this.pending.accountType === 'PME') {
        await this.authService.completeRegistration(
          this.pending.email,
          this.pending.password,
          this.pending.organizationName,
          this.pending.organizationLocation,
        );
        this.registrationFlow.clear();
        this.router.navigate(['/tableau-de-bord']);
      } else {
        await this.authService.completeConsultantRegistration(this.pending.email, this.pending.password);
        this.registrationFlow.clear();
        // Portefeuille vide a ce stade (aucune organisation cliente ne
        // peut encore y ajouter ce consultant) -- l'ecran Portefeuille
        // gere deja ce cas plutot que le Tableau de bord, qui a besoin
        // d'une organisation courante pour afficher quoi que ce soit.
        this.router.navigate(['/portefeuille']);
      }
    } catch (error) {
      this.errorMessage.set(
        error instanceof ConfirmSignUpFailedError ? error.message : 'La confirmation a échoué.',
      );
    } finally {
      this.submitting.set(false);
    }
  }

  protected async resend(): Promise<void> {
    if (!this.pending) return;
    this.errorMessage.set(null);
    try {
      await this.authService.resendConfirmationCode(this.pending.email);
      this.resendMessage.set('confirmSignup.resendSent');
    } catch (error) {
      this.errorMessage.set(error instanceof ConfirmSignUpFailedError ? error.message : "L'envoi a échoué.");
    }
  }

  private redirectToSignup(): null {
    this.router.navigate(['/inscription']);
    return null;
  }
}
