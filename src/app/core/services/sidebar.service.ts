import { Injectable, inject } from '@angular/core';
import { MenuController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly menuCtrl = inject(MenuController);

  toggle(): void {
    this.menuCtrl.toggle('main-menu');
  }
}
