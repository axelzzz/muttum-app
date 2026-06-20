import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'search',
        loadChildren: () =>
          import('../features/search/search.module').then(m => m.SearchModule),
      },
      {
        path: 'dictionary',
        loadChildren: () =>
          import('../features/dictionary/dictionary.module').then(m => m.DictionaryModule),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../features/profile/profile.module').then(m => m.ProfileModule),
      },
      { path: '', redirectTo: 'search', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
