import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
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
import {
  AUTH_RATE_LIMIT_MESSAGE,
  hasFieldValidationError,
  isRateLimitError,
} from '../../../core/services/auth-http-error.util';
import { firstErrorMessage } from '../../../ui/field-error.util';
import { UiService } from '../../../ui/ui.service';

type FieldErrorKey = 'required' | 'minlength' | 'maxlength' | 'email' | 'mismatch' | 'server';
type FieldErrors = Partial<Record<FieldErrorKey, boolean>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 128;

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
  imports: [
    RouterLink,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ui = inject(UiService);

  protected readonly isPasswordVisible = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly username = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');

  protected readonly usernameTouched = signal(false);
  protected readonly emailTouched = signal(false);
  protected readonly passwordTouched = signal(false);
  protected readonly confirmPasswordTouched = signal(false);

  protected readonly usernameServerError = signal<string | null>(null);
  protected readonly emailServerError = signal<string | null>(null);
  protected readonly passwordServerError = signal<string | null>(null);

  protected readonly usernameErrors = computed<FieldErrors | null>(() => {
    const v = this.username().trim();
    if (!v) return { required: true };
    if (v.length < USERNAME_MIN_LENGTH) return { minlength: true };
    if (v.length > USERNAME_MAX_LENGTH) return { maxlength: true };
    if (this.usernameServerError()) return { server: true };
    return null;
  });

  protected readonly emailErrors = computed<FieldErrors | null>(() => {
    const v = this.email().trim();
    if (!v) return { required: true };
    if (!EMAIL_REGEX.test(v)) return { email: true };
    if (this.emailServerError()) return { server: true };
    return null;
  });

  protected readonly passwordErrors = computed<FieldErrors | null>(() => {
    const v = this.password();
    if (!v) return { required: true };
    if (v.length < PASSWORD_MIN_LENGTH) return { minlength: true };
    if (v.length > PASSWORD_MAX_LENGTH) return { maxlength: true };
    if (this.passwordServerError()) return { server: true };
    return null;
  });

  protected readonly confirmPasswordErrors = computed<FieldErrors | null>(() => {
    if (!this.confirmPassword()) return { required: true };
    if (this.confirmPassword() !== this.password()) return { mismatch: true };
    return null;
  });

  protected readonly usernameErrorMessage = computed(() => {
    if (!this.submitted() && !this.usernameTouched()) return undefined;
    return firstErrorMessage(this.usernameErrors(), {
      required: "Le nom d'utilisateur est requis.",
      minlength: 'Minimum 2 caractères.',
      maxlength: 'Maximum 50 caractères.',
      server: this.usernameServerError() ?? undefined,
    });
  });

  protected readonly emailErrorMessage = computed(() => {
    if (!this.submitted() && !this.emailTouched()) return undefined;
    return firstErrorMessage(this.emailErrors(), {
      required: "L'e-mail est requis.",
      email: "Format d'e-mail invalide.",
      server: this.emailServerError() ?? undefined,
    });
  });

  protected readonly passwordErrorMessage = computed(() => {
    if (!this.submitted() && !this.passwordTouched()) return undefined;
    return firstErrorMessage(this.passwordErrors(), {
      required: 'Le mot de passe est requis.',
      minlength: 'Minimum 6 caractères.',
      maxlength: 'Maximum 128 caractères.',
      server: this.passwordServerError() ?? undefined,
    });
  });

  protected readonly confirmPasswordErrorMessage = computed(() => {
    if (!this.submitted() && !this.confirmPasswordTouched()) return undefined;
    return firstErrorMessage(this.confirmPasswordErrors(), {
      required: 'Le mot de passe de confirmation est requis.',
      mismatch: 'Les mots de passe ne correspondent pas.',
    });
  });

  private readonly isFormValid = computed(
    () =>
      !this.usernameErrors() &&
      !this.emailErrors() &&
      !this.passwordErrors() &&
      !this.confirmPasswordErrors(),
  );

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((v) => !v);
  }

  protected onUsernameInput(value: string | null | undefined): void {
    this.username.set(value ?? '');
    this.usernameServerError.set(null);
  }

  protected onEmailInput(value: string | null | undefined): void {
    this.email.set(value ?? '');
    this.emailServerError.set(null);
  }

  protected onPasswordInput(value: string | null | undefined): void {
    this.password.set(value ?? '');
    this.passwordServerError.set(null);
  }

  protected submit(): void {
    this.submitted.set(true);
    this.usernameServerError.set(null);
    this.emailServerError.set(null);
    this.passwordServerError.set(null);
    if (!this.isFormValid()) return;
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);

    this.ui
      .showLoading('Création du compte…')
      .pipe(
        switchMap((loading) =>
          this.authService
            .register({
              username: this.username().trim(),
              email: this.email().trim(),
              password: this.password(),
            })
            .pipe(
              tap(() => this.router.navigate(['/tabs/search'])),
              catchError((err: unknown) => {
                if (!(err instanceof HttpErrorResponse)) {
                  return this.ui.showToast('Une erreur est survenue.');
                }
                if (err.status === 409) {
                  this.emailServerError.set('Cet e-mail est déjà utilisé.');
                  return of(undefined);
                }
                if (isRateLimitError(err)) {
                  return this.ui.showToast(AUTH_RATE_LIMIT_MESSAGE);
                }
                if (hasFieldValidationError(err, 'username')) {
                  this.usernameServerError.set(
                    `Le nom d'utilisateur doit contenir entre ${USERNAME_MIN_LENGTH} et ${USERNAME_MAX_LENGTH} caractères.`,
                  );
                  return of(undefined);
                }
                if (hasFieldValidationError(err, 'password')) {
                  this.passwordServerError.set(
                    `Le mot de passe doit contenir entre ${PASSWORD_MIN_LENGTH} et ${PASSWORD_MAX_LENGTH} caractères.`,
                  );
                  return of(undefined);
                }
                if (hasFieldValidationError(err, 'email')) {
                  this.emailServerError.set("Format d'e-mail invalide.");
                  return of(undefined);
                }
                return this.ui.showToast('Une erreur est survenue.');
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
