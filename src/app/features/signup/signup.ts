import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';

import { AuthService, SignUpFailedError } from '../../core/auth/auth.service';
import { RegistrationFlowService } from '../../core/auth/registration-flow.service';
import { PasswordRequirements } from '../../shared/password-requirements/password-requirements';
import { isPasswordValid } from '../../shared/password-requirements/password-rules';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, TranslateModule, InputText, Password, RouterLink, PasswordRequirements],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private readonly authService = inject(AuthService);
  private readonly registrationFlow = inject(RegistrationFlowService);
  private readonly router = inject(Router);

  protected readonly organizationName = signal('');
  protected readonly fullName = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected async submit(): Promise<void> {
    if (this.submitting()) return;

    this.errorMessage.set(null);

    if (!isPasswordValid(this.password())) {
      this.errorMessage.set('Le mot de passe ne respecte pas tous les critères ci-dessous.');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.submitting.set(true);
    try {
      const email = this.email().trim();
      await this.authService.signUp(email, this.password(), this.fullName().trim());
      this.registrationFlow.start({
        email,
        password: this.password(),
        organizationName: this.organizationName().trim(),
      });
      this.router.navigate(['/confirmer-inscription']);
    } catch (error) {
      this.errorMessage.set(error instanceof SignUpFailedError ? error.message : "La création du compte a échoué.");
    } finally {
      this.submitting.set(false);
    }
  }
}
