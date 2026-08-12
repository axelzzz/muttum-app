import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
    canActivate: [guestGuard],
    title: 'Muttum — Votre dictionnaire personnel — Page de connexion',
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage),
    canActivate: [guestGuard],
    title: 'Muttum — Votre dictionnaire personnel — Créer un compte',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
    canActivate: [guestGuard],
    title: 'Muttum — Votre dictionnaire personnel — Mot de passe oublié',
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password/reset-password.page').then(m => m.ResetPasswordPage),
    canActivate: [guestGuard],
    title: 'Muttum — Votre dictionnaire personnel — Nouveau mot de passe',
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
