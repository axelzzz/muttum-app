import { Routes } from '@angular/router';

export const tabsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'search',
        loadComponent: () => import('../features/search/search.page').then(m => m.SearchPage),
        title: 'Muttum — Votre dictionnaire personnel — Recherche',
      },
      {
        path: 'dictionary',
        loadComponent: () => import('../features/dictionary/dictionary.page').then(m => m.DictionaryPage),
        title: 'Muttum — Votre dictionnaire personnel — Mon dictionnaire',
      },
      {
        path: 'profile',
        loadComponent: () => import('../features/profile/profile.page').then(m => m.ProfilePage),
        title: 'Muttum — Votre dictionnaire personnel — Mon profil',
      },
      { path: '', redirectTo: 'search', pathMatch: 'full' },
    ],
  },
];
