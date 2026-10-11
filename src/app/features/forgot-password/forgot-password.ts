import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputText } from 'primeng/inputtext';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, TranslateModule, InputText, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly submitting = signal(false);

  protected async submit(): Promise<void> {
    if (this.submitting()) return;

    this.submitting.set(true);
    try {
      const email = this.email().trim();
      // Cognito renvoie toujours un succes ici, meme si le compte
      // n'existe pas (voir AuthService.forgotPassword) -- rien a
      // distinguer cote UI entre les deux cas.
      await this.authService.forgotPassword(email);
      this.router.navigate(['/reinitialiser-mot-de-passe'], { queryParams: { email } });
    } finally {
      this.submitting.set(false);
    }
  }
}
