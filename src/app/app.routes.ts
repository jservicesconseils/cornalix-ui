import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

// Chemins d'URL en anglais (demande explicite) -- distinct des libelles
// affiches (navigation, titres), qui restent traduits via ngx-translate.
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'confirm-signup',
    loadComponent: () => import('./features/confirm-signup/confirm-signup').then((m) => m.ConfirmSignup),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'portfolio',
        loadComponent: () => import('./features/portfolio/portfolio').then((m) => m.Portfolio),
      },
      {
        path: 'questionnaire',
        loadComponent: () => import('./features/questionnaire/questionnaire').then((m) => m.Questionnaire),
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/report/report').then((m) => m.Report),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users').then((m) => m.Users),
      },
      {
        // Invitations recues par un Consultant (acces a une organisation
        // cliente, a accepter/refuser) -- lien envoye par courriel au
        // consultant pointe directement vers cette route.
        path: 'invitations',
        loadComponent: () => import('./features/invitations/invitations').then((m) => m.Invitations),
      },
      {
        // Ecran d'administration du catalogue de questions -- disponible
        // a tout le monde pour l'instant (tests), sera restreint au role
        // OWNER plus tard.
        path: 'settings/questions',
        loadComponent: () => import('./features/settings/questions-admin/questions-admin').then((m) => m.QuestionsAdmin),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
