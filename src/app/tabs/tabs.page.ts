import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrl: './tabs.page.scss',
  imports: [IonTabs, IonTabBar, IonTabButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPage {}
