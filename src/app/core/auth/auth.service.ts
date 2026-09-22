import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppUser } from '../models/user.model';
import { AuthActions } from '../state/auth/auth.actions';
import { authFeature } from '../state/auth/auth.reducer';
import { TenantActions } from '../state/tenant/tenant.actions';
import { DEMO_ORGANIZATIONS } from '../data/demo-data';

/**
 * Mock d'authentification pour la maquette front-end.
 * L'intégration réelle Cognito (comme dans les microservices : validation du
 * JWT et lecture des claims tenant_id/tenant_scope) fait l'objet d'un ticket
 * séparé (SCRUM-17 epic) une fois les écrans validés.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(Store);

  readonly isAuthenticated = this.store.selectSignal(authFeature.selectIsAuthenticated);
  readonly currentUser = this.store.selectSignal(authFeature.selectUser);

  login(user: AppUser): void {
    this.store.dispatch(AuthActions.login({ user }));

    const portfolio = user.role === 'CONSULTANT' ? DEMO_ORGANIZATIONS : DEMO_ORGANIZATIONS.slice(0, 1);
    this.store.dispatch(TenantActions.setPortfolio({ portfolio }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
