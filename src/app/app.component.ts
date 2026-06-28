import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonApp,
  IonContent,
  IonIcon,
  IonMenu,
  IonRouterOutlet,
  MenuController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookOutline, menuOutline, personOutline, searchOutline } from 'ionicons/icons';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonContent,
    IonIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly isMenuEnabled = signal(false);

  private readonly router = inject(Router);
  private readonly menuCtrl = inject(MenuController);

  constructor() {
    inject(ThemeService).initialize();
    addIcons({ searchOutline, bookOutline, personOutline, menuOutline });

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e: NavigationEnd) => {
        const onAuthRoute = e.urlAfterRedirects.startsWith('/auth');
        this.isMenuEnabled.set(!onAuthRoute);
        this.menuCtrl.close();
      });
  }
}
