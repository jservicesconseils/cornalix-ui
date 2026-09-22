import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Checkbox } from 'primeng/checkbox';

import { AuthService } from '../../core/auth/auth.service';
import { DEMO_USERS } from '../../core/data/demo-data';
import { AppUser } from '../../core/models/user.model';

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

  protected readonly email = signal('jean.dupont@acme.ca');
  protected readonly password = signal('');
  protected readonly rememberMe = signal(true);
  protected readonly lang = signal(this.translate.currentLang || 'fr');

  protected switchLang(lang: 'fr' | 'en'): void {
    this.lang.set(lang);
    this.translate.use(lang);
  }

  protected submit(): void {
    const user = this.resolveDemoUser(this.email());
    this.authService.login(user);
    this.router.navigate(['/tableau-de-bord']);
  }

  private resolveDemoUser(email: string): AppUser {
    const normalized = email.trim().toLowerCase();
    if (normalized.includes('sophie') || normalized.includes('.ti')) {
      return DEMO_USERS['ti'];
    }
    if (normalized.includes('consultant')) {
      return DEMO_USERS['consultant'];
    }
    return DEMO_USERS['admin'];
  }
}
