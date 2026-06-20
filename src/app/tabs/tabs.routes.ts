import { Routes } from '@angular/router';

export const tabsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'search',
        loadComponent: () => import('../features/search/search.page').then(m => m.SearchPage),
      },
      {
        path: 'dictionary',
        loadComponent: () => import('../features/dictionary/dictionary.page').then(m => m.DictionaryPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('../features/profile/profile.page').then(m => m.ProfilePage),
      },
      { path: '', redirectTo: 'search', pathMatch: 'full' },
    ],
  },
];
