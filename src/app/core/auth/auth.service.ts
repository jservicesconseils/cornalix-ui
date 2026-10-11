import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  NotAuthorizedException,
  UserNotFoundException,
  UsernameExistsException,
  InvalidPasswordException,
  CodeMismatchException,
  ExpiredCodeException,
  LimitExceededException,
} from '@aws-sdk/client-cognito-identity-provider';

import { AppUser, parseRole } from '../models/user.model';
import { Organization } from '../models/organization.model';
import { AuthActions } from '../state/auth/auth.actions';
import { authFeature } from '../state/auth/auth.reducer';
import { TenantActions } from '../state/tenant/tenant.actions';
import { COGNITO_CONFIG } from './cognito-config';
import { TokenStorageService } from './token-storage.service';
import { decodeJwtPayload, CognitoIdTokenClaims } from './jwt.util';
import { OrganizationApiService } from '../organization/organization-api.service';
import { UserApiService } from '../user/user-api.service';

export class LoginFailedError extends Error {}
export class SignUpFailedError extends Error {}
export class ConfirmSignUpFailedError extends Error {}
export class ForgotPasswordFailedError extends Error {}

// Le App Client ne permet que USER_PASSWORD_AUTH + REFRESH_TOKEN_AUTH (pas
// de SRP, voir SCRUM-27) -- InitiateAuthCommand appelle l'API publique de
// Cognito, non authentifiee, scopee au seul Client ID. Aucune credential
// AWS ne transite jamais par le navigateur.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(Store);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly organizationApi = inject(OrganizationApiService);
  private readonly userApi = inject(UserApiService);
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

      // Reconstruit l'utilisateur a partir du jeton rafraichi -- important
      // juste apres une auto-inscription (SCRUM-41) : tenant_id/role
      // n'existaient pas sur le jeton obtenu au premier login, seul un
      // jeton rafraichi apres coup les porte.
      const claims = decodeJwtPayload<CognitoIdTokenClaims>(tokens.IdToken);
      this.store.dispatch(AuthActions.login({ user: this.buildUser(claims) }));

      return tokens.AccessToken;
    } catch {
      this.logout();
      return null;
    }
  }

  // Cree le compte Cognito (statut UNCONFIRMED) -- auto_verified_attributes
  // = ["email"] sur le Pool declenche automatiquement l'envoi d'un code de
  // verification a cette adresse, sans configuration cote applicatif.
  async signUp(email: string, password: string, name: string): Promise<void> {
    try {
      await this.cognito.send(
        new SignUpCommand({
          ClientId: COGNITO_CONFIG.clientId,
          Username: email,
          Password: password,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'name', Value: name },
          ],
        }),
      );
    } catch (error) {
      if (error instanceof UsernameExistsException) {
        throw new SignUpFailedError('Un compte existe déjà avec ce courriel.');
      }
      if (error instanceof InvalidPasswordException) {
        throw new SignUpFailedError(
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.',
        );
      }
      throw new SignUpFailedError("La création du compte a échoué. Réessayez dans un instant.");
    }
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    try {
      await this.cognito.send(
        new ConfirmSignUpCommand({ ClientId: COGNITO_CONFIG.clientId, Username: email, ConfirmationCode: code }),
      );
    } catch (error) {
      if (error instanceof CodeMismatchException) {
        throw new ConfirmSignUpFailedError('Le code saisi est incorrect.');
      }
      if (error instanceof ExpiredCodeException) {
        throw new ConfirmSignUpFailedError('Ce code a expiré -- demandez-en un nouveau.');
      }
      // Cognito renvoie NotAuthorizedException ("Current status is
      // CONFIRMED") si le compte est deja confirme -- un double-clic sur
      // "Confirmer", un onglet reste ouvert apres une confirmation deja
      // reussie, ou une nouvelle tentative d'inscription sur un courriel
      // deja confirme. Retenter ne peut alors jamais reussir (le compte
      // restera "deja confirme"), donc on traite ca comme un succes
      // plutot qu'une erreur qui pousserait a reessayer indefiniment.
      if (error instanceof NotAuthorizedException && error.message?.includes('Current status is CONFIRMED')) {
        return;
      }
      throw new ConfirmSignUpFailedError('La confirmation a échoué. Réessayez dans un instant.');
    }
  }

  async resendConfirmationCode(email: string): Promise<void> {
    try {
      await this.cognito.send(new ResendConfirmationCodeCommand({ ClientId: COGNITO_CONFIG.clientId, Username: email }));
    } catch (error) {
      if (error instanceof LimitExceededException) {
        throw new ConfirmSignUpFailedError('Trop de tentatives -- réessayez dans quelques minutes.');
      }
      throw new ConfirmSignUpFailedError("L'envoi du code a échoué. Réessayez dans un instant.");
    }
  }

  // Termine l'auto-inscription (SCRUM-41) une fois le compte confirme :
  // connexion, creation de l'organisation (devient ADMIN_PME), puis
  // rafraichissement du jeton pour que l'UI reflete immediatement le
  // nouveau tenant_id/role sans demander a l'utilisateur de se reconnecter.
  async completeRegistration(email: string, password: string, organizationName: string, location?: string): Promise<void> {
    await this.login(email, password);
    await this.organizationApi.register(organizationName, location);
    await this.refresh();
    await this.loadPortfolio();
  }

  // Meme principe, pour un Consultant cybersecurite -- aucune
  // organisation creee, seul le role est assigne. Son portefeuille
  // reste vide apres coup (aucune organisation cliente ne peut encore
  // l'y ajouter, fonctionnalite separee) : loadPortfolio() le confirme
  // simplement plutot que de le supposer.
  async completeConsultantRegistration(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.userApi.registerAsConsultant();
    await this.refresh();
    await this.loadPortfolio();
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await this.cognito.send(new ForgotPasswordCommand({ ClientId: COGNITO_CONFIG.clientId, Username: email }));
    } catch {
      // Cognito renvoie UserNotFoundException si le compte n'existe pas --
      // volontairement avale : un message identique, qu'un compte existe
      // ou non pour ce courriel, evite de confirmer a un attaquant qu'une
      // adresse est enregistree.
    }
  }

  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    try {
      await this.cognito.send(
        new ConfirmForgotPasswordCommand({
          ClientId: COGNITO_CONFIG.clientId,
          Username: email,
          ConfirmationCode: code,
          Password: newPassword,
        }),
      );
    } catch (error) {
      if (error instanceof CodeMismatchException) {
        throw new ForgotPasswordFailedError('Le code saisi est incorrect.');
      }
      if (error instanceof ExpiredCodeException) {
        throw new ForgotPasswordFailedError('Ce code a expiré -- demandez-en un nouveau.');
      }
      if (error instanceof InvalidPasswordException) {
        throw new ForgotPasswordFailedError(
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.',
        );
      }
      throw new ForgotPasswordFailedError('La réinitialisation a échoué. Réessayez dans un instant.');
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
    const email = claims.email ?? claims.sub;
    const localPart = email.split('@')[0];

    return {
      id: claims.sub,
      name: localPart.charAt(0).toUpperCase() + localPart.slice(1),
      initials: localPart.slice(0, 2).toUpperCase(),
      email,
      role: parseRole(claims.role),
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
