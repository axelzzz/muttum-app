import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonItem, IonLabel, IonInput, IonButton, IonNote, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);

  protected readonly isPasswordVisible = signal(false);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  protected get emailControl() { return this.form.get('email')!; }
  protected get passwordControl() { return this.form.get('password')!; }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update(v => !v);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Connexion…' });
    await loading.present();

    this.authService.login(this.form.value as { email: string; password: string }).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.router.navigate(['/tabs/search']);
      },
      error: async (err) => {
        await loading.dismiss();
        const message =
          err.status === 401 ? 'Email ou mot de passe incorrect.' : 'Une erreur est survenue.';
        const toast = await this.toastCtrl.create({ message, duration: 3000, color: 'danger', position: 'bottom' });
        await toast.present();
      },
    });
  }
}
