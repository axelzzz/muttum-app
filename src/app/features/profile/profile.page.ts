import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  user: User | null = null;
  isDark$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.isDark$ = this.themeService.isDark$;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });
  }

  onThemeToggle(event: CustomEvent): void {
    this.themeService.applyScheme(event.detail.checked ? 'dark' : 'light');
  }

  async confirmLogout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Se déconnecter ?',
      message: 'Vous devrez vous reconnecter pour accéder à votre dictionnaire.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Déconnexion',
          role: 'destructive',
          handler: () => this.logout(),
        },
      ],
    });
    await alert.present();
  }

  private async logout(): Promise<void> {
    this.authService.logout();
    await this.router.navigate(['/auth/login']);
  }
}
