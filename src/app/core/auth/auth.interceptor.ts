import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { API_BASE_URLS } from '../data/api-config';
import { TokenStorageService } from './token-storage.service';
import { AuthService } from './auth.service';

const API_PREFIXES = Object.values(API_BASE_URLS);

// N'attache le jeton qu'aux appels vers nos 4 microservices -- jamais aux
// fichiers i18n statiques ni a d'autres origines. Sur un 401, tente un
// rafraichissement (REFRESH_TOKEN_AUTH) et rejoue la requete une seule
// fois ; sur un nouvel echec, deconnecte et renvoie vers /connexion.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiCall = API_PREFIXES.some((prefix) => req.url.startsWith(prefix));
  if (!isApiCall) {
    return next(req);
  }

  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const withAuth = (token: string) => req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  const accessToken = tokenStorage.read()?.accessToken;
  const initialReq = accessToken ? withAuth(accessToken) : req;

  return next(initialReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !accessToken) {
        return throwError(() => error);
      }

      return from(authService.refresh()).pipe(
        switchMap((newToken) => {
          if (!newToken) {
            router.navigate(['/connexion']);
            return throwError(() => error);
          }
          return next(withAuth(newToken));
        }),
      );
    }),
  );
};
