import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/tabs/search', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.tabsRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'word/:id',
    loadComponent: () => import('./features/word-detail/word-detail.page').then(m => m.WordDetailPage),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '/tabs/search' },
];
