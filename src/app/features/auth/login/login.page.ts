import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, switchMap, tap } from 'rxjs';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { AUTH_RATE_LIMIT_MESSAGE, isRateLimitError } from '../../../core/services/auth-http-error.util';
import { firstErrorMessage } from '../../../ui/field-error.util';
import { UiService } from '../../../ui/ui.service';

type FieldErrorKey = 'required' | 'minlength' | 'email';
type FieldErrors = Partial<Record<FieldErrorKey, boolean>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  imports: [RouterLink, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon],
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

  protected readonly emailErrors = computed<FieldErrors | null>(() => {
    const v = this.email().trim();
    if (!v) return { required: true };
    if (!EMAIL_REGEX.test(v)) return { email: true };
    return null;
  });

  protected readonly passwordErrors = computed<FieldErrors | null>(() => {
    const v = this.password();
    if (!v) return { required: true };
    if (v.length < 6) return { minlength: true };
    return null;
  });

  protected readonly emailErrorMessage = computed(() => {
    if (!this.submitted() && !this.emailTouched()) return undefined;
    return firstErrorMessage(this.emailErrors(), {
      required: "L'e-mail est requis.",
      email: "Format d'e-mail invalide.",
    });
  });

  protected readonly passwordErrorMessage = computed(() => {
    if (!this.submitted() && !this.passwordTouched()) return undefined;
    return firstErrorMessage(this.passwordErrors(), {
      required: 'Le mot de passe est requis.',
      minlength: 'Minimum 6 caractères.',
    });
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
                if (!(err instanceof HttpErrorResponse)) {
                  return this.ui.showToast('Une erreur est survenue.');
                }
                if (isRateLimitError(err)) {
                  return this.ui.showToast(AUTH_RATE_LIMIT_MESSAGE);
                }
                const message =
                  err.status === 401 ? 'Email ou mot de passe incorrect.' : 'Une erreur est survenue.';
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
