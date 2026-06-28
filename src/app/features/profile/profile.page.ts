import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { filter, tap } from 'rxjs';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  logOutOutline,
  mailOutline,
  moonOutline,
  personOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { UiService } from '../../ui/ui.service';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  imports: [
    DatePipe,
    IonHeader,
    IonToolbar,
    IonButton,
    IonButtons,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonToggle,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  protected readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly ui = inject(UiService);
  private readonly router = inject(Router);

  protected readonly user = this.authService.currentUser;
  protected readonly isDark = this.themeService.isDark;

  constructor() {
    addIcons({
      moonOutline,
      personOutline,
      mailOutline,
      calendarOutline,
      logOutOutline,
    });
  }

  protected onThemeToggle(event: CustomEvent): void {
    this.themeService.applyScheme(event.detail.checked ? 'dark' : 'light');
  }

  protected confirmLogout(): void {
    this.ui
      .confirmAction(
        'Se déconnecter ?',
        'Vous devrez vous reconnecter pour accéder à votre dictionnaire.',
        'Déconnexion',
      )
      .pipe(
        filter((confirmed) => confirmed),
        tap(() => {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }),
      )
      .subscribe();
  }
}
