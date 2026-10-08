import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  NotAuthorizedException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';

import { AppUser, UserRole } from '../models/user.model';
import { Organization } from '../models/organization.model';
import { AuthActions } from '../state/auth/auth.actions';
import { authFeature } from '../state/auth/auth.reducer';
import { TenantActions } from '../state/tenant/tenant.actions';
import { COGNITO_CONFIG } from './cognito-config';
import { TokenStorageService } from './token-storage.service';
import { decodeJwtPayload, parseTenantScope, CognitoIdTokenClaims } from './jwt.util';
import { OrganizationApiService } from '../organization/organization-api.service';

export class LoginFailedError extends Error {}

// Le App Client ne permet que USER_PASSWORD_AUTH + REFRESH_TOKEN_AUTH (pas
// de SRP, voir SCRUM-27) -- InitiateAuthCommand appelle l'API publique de
// Cognito, non authentifiee, scopee au seul Client ID. Aucune credential
// AWS ne transite jamais par le navigateur.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(Store);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly organizationApi = inject(OrganizationApiService);
  private readonly cognito = new CognitoIdentityProviderClient({ region: COGNITO_CONFIG.region });

  readonly isAuthenticated = this.store.selectSignal(authFeature.selectIsAuthenticated);
  readonly currentUser = this.store.selectSignal(authFeature.selectUser);

  async login(email: string, password: string): Promise<void> {
    let result;
    try {
      result = await this.cognito.send(
        new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: COGNITO_CONFIG.clientId,
          AuthParameters: { USERNAME: email, PASSWORD: password },
        }),
      );
    } catch (error) {
      if (error instanceof NotAuthorizedException || error instanceof UserNotFoundException) {
        throw new LoginFailedError('Courriel ou mot de passe incorrect.');
      }
      throw new LoginFailedError('La connexion a échoué. Réessayez dans un instant.');
    }

    const tokens = result.AuthenticationResult;
    if (!tokens?.IdToken || !tokens.AccessToken || !tokens.RefreshToken) {
      throw new LoginFailedError('Réponse de connexion incomplète.');
    }

    this.tokenStorage.save({
      idToken: tokens.IdToken,
      accessToken: tokens.AccessToken,
      refreshToken: tokens.RefreshToken,
      expiresAt: Date.now() + (tokens.ExpiresIn ?? 3600) * 1000,
    });

    const claims = decodeJwtPayload<CognitoIdTokenClaims>(tokens.IdToken);
    const user = this.buildUser(claims);
    this.store.dispatch(AuthActions.login({ user }));

    await this.loadPortfolio();
  }

  async refresh(): Promise<string | null> {
    const stored = this.tokenStorage.read();
    if (!stored) return null;

    try {
      const result = await this.cognito.send(
        new InitiateAuthCommand({
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          ClientId: COGNITO_CONFIG.clientId,
          AuthParameters: { REFRESH_TOKEN: stored.refreshToken },
        }),
      );
      const tokens = result.AuthenticationResult;
      if (!tokens?.IdToken || !tokens.AccessToken) {
        this.logout();
        return null;
      }
      this.tokenStorage.save({
        idToken: tokens.IdToken,
        accessToken: tokens.AccessToken,
        // REFRESH_TOKEN_AUTH ne renvoie pas toujours un nouveau refresh token
        refreshToken: tokens.RefreshToken ?? stored.refreshToken,
        expiresAt: Date.now() + (tokens.ExpiresIn ?? 3600) * 1000,
      });
      return tokens.AccessToken;
    } catch {
      this.logout();
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.tokenStorage.read()?.accessToken ?? null;
  }

  logout(): void {
    const accessToken = this.tokenStorage.read()?.accessToken;
    this.tokenStorage.clear();
    this.store.dispatch(AuthActions.logout());

    // Best-effort : revoque le refresh token cote Cognito. On ne bloque
    // jamais la deconnexion locale la-dessus.
    if (accessToken) {
      this.cognito.send(new GlobalSignOutCommand({ AccessToken: accessToken })).catch(() => {});
    }
  }

  private buildUser(claims: CognitoIdTokenClaims): AppUser {
    const tenantId = claims.tenant_id ?? '';
    const tenantScope = parseTenantScope(claims.tenant_scope, tenantId);
    const email = claims.email ?? claims.sub;
    const localPart = email.split('@')[0];
    const role: UserRole = tenantScope.length > 1 ? 'CONSULTANT' : 'ADMIN_PME';

    return {
      id: claims.sub,
      name: localPart.charAt(0).toUpperCase() + localPart.slice(1),
      initials: localPart.slice(0, 2).toUpperCase(),
      email,
      role,
    };
  }

  private async loadPortfolio(): Promise<void> {
    let organizations: Organization[] = [];
    try {
      organizations = await this.organizationApi.listMine();
    } catch {
      // Le portefeuille reste vide si l'API identity est injoignable --
      // on ne bloque jamais le login la-dessus (l'utilisateur voit juste
      // un selecteur d'organisation vide plutot qu'un echec de connexion).
    }
    this.store.dispatch(TenantActions.setPortfolio({ portfolio: organizations }));
  }
}
