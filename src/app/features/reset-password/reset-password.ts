import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';

import { AuthService, ForgotPasswordFailedError } from '../../core/auth/auth.service';
import { PasswordRequirements } from '../../shared/password-requirements/password-requirements';
import { isPasswordValid } from '../../shared/password-requirements/password-rules';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, TranslateModule, InputText, Password, RouterLink, PasswordRequirements],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly email = this.route.snapshot.queryParamMap.get('email') ?? '';
  protected readonly code = signal('');
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly success = signal(false);

  protected async submit(): Promise<void> {
    if (this.submitting()) return;

    this.errorMessage.set(null);

    if (!isPasswordValid(this.newPassword())) {
      this.errorMessage.set('Le mot de passe ne respecte pas tous les critères ci-dessous.');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.submitting.set(true);
    try {
      await this.authService.confirmForgotPassword(this.email, this.code(), this.newPassword());
      this.success.set(true);
    } catch (error) {
      this.errorMessage.set(
        error instanceof ForgotPasswordFailedError ? error.message : 'La réinitialisation a échoué.',
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
