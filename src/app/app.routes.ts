import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'connexion',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'inscription',
    loadComponent: () => import('./features/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'confirmer-inscription',
    loadComponent: () => import('./features/confirm-signup/confirm-signup').then((m) => m.ConfirmSignup),
  },
  {
    path: 'mot-de-passe-oublie',
    loadComponent: () => import('./features/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reinitialiser-mot-de-passe',
    loadComponent: () => import('./features/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tableau-de-bord' },
      {
        path: 'tableau-de-bord',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'portefeuille',
        loadComponent: () => import('./features/portfolio/portfolio').then((m) => m.Portfolio),
      },
      {
        path: 'questionnaire',
        loadComponent: () => import('./features/questionnaire/questionnaire').then((m) => m.Questionnaire),
      },
      {
        path: 'rapports',
        loadComponent: () => import('./features/report/report').then((m) => m.Report),
      },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./features/users/users').then((m) => m.Users),
      },
    ],
  },
  { path: '**', redirectTo: 'connexion' },
];
