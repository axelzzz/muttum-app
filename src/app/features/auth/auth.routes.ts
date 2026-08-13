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
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
