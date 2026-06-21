import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../ui/ui.service';

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
  private readonly ui = inject(UiService);

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

    const loading = await this.ui.showLoading('Connexion…');
    try {
      await firstValueFrom(this.authService.login(this.form.value as { email: string; password: string }));
      await this.router.navigate(['/tabs/search']);
    } catch (err: unknown) {
      const message = (err as { status?: number }).status === 401
        ? 'Email ou mot de passe incorrect.'
        : 'Une erreur est survenue.';
      await this.ui.showToast(message);
    } finally {
      await loading.dismiss();
    }
  }
}
