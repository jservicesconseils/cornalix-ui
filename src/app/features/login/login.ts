import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Checkbox } from 'primeng/checkbox';

import { AuthService, LoginFailedError } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslateModule, InputText, Password, Checkbox],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly email = signal('test@cornalix.ca');
  protected readonly password = signal('');
  protected readonly rememberMe = signal(true);
  protected readonly lang = signal(this.translate.currentLang || 'fr');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected switchLang(lang: 'fr' | 'en'): void {
    this.lang.set(lang);
    this.translate.use(lang);
  }

  protected async submit(): Promise<void> {
    if (this.submitting()) return;

    this.errorMessage.set(null);
    this.submitting.set(true);
    try {
      await this.authService.login(this.email().trim(), this.password());
      this.router.navigate(['/tableau-de-bord']);
    } catch (error) {
      this.errorMessage.set(
        error instanceof LoginFailedError ? error.message : 'La connexion a échoué. Réessayez.',
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
