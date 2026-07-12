import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage),
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password/reset-password.page').then(m => m.ResetPasswordPage),
    canActivate: [guestGuard],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
