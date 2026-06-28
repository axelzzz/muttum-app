import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, switchMap, tap } from 'rxjs';
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  imports: [RouterLink, IonContent, IonItem, IonLabel, IonInput, IonButton, IonNote, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ui = inject(UiService);

  protected readonly isPasswordVisible = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly email = signal('');
  protected readonly password = signal('');

  protected readonly emailTouched = signal(false);
  protected readonly passwordTouched = signal(false);

  protected readonly emailErrors = computed(() => {
    const v = this.email().trim();
    if (!v) return { required: true };
    if (!EMAIL_REGEX.test(v)) return { email: true };
    return null;
  });

  protected readonly passwordErrors = computed(() => {
    const v = this.password();
    if (!v) return { required: true };
    if (v.length < 6) return { minlength: true };
    return null;
  });

  private readonly isFormValid = computed(
    () => !this.emailErrors() && !this.passwordErrors(),
  );

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((v) => !v);
  }

  protected submit(): void {
    this.submitted.set(true);
    if (!this.isFormValid()) return;
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);

    this.ui
      .showLoading('Connexion…')
      .pipe(
        switchMap((loading) =>
          this.authService
            .login({
              email: this.email().trim(),
              password: this.password(),
            })
            .pipe(
              tap(() => this.router.navigate(['/tabs/search'])),
              catchError((err: unknown) => {
                const message =
                  (err as { status?: number }).status === 401
                    ? 'Email ou mot de passe incorrect.'
                    : 'Une erreur est survenue.';
                return this.ui.showToast(message);
              }),
              finalize(() => {
                loading.dismiss();
                this.isSubmitting.set(false);
              }),
            ),
        ),
      )
      .subscribe();
  }
}
