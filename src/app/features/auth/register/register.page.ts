import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { hasFieldValidationError } from '../../../core/services/auth-http-error.util';
import { fieldErrorMessage } from '../../../ui/field-error.util';
import { UiService } from '../../../ui/ui.service';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  confirmPasswordFieldErrors,
  emailFieldErrors,
  passwordFieldErrors,
} from '../field-validators.util';
import { createPasswordVisibility } from '../password-visibility.util';
import { submitAuthForm } from '../auth-form-submit.util';

type UsernameFieldError = 'required' | 'minlength' | 'maxlength' | 'server';

const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 50;

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

  private readonly passwordVisibility = createPasswordVisibility();
  protected readonly isPasswordVisible = this.passwordVisibility.isVisible;

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

  protected readonly usernameErrors = computed<Partial<Record<UsernameFieldError, boolean>> | null>(() => {
    const v = this.username().trim();
    if (!v) return { required: true };
    if (v.length < USERNAME_MIN_LENGTH) return { minlength: true };
    if (v.length > USERNAME_MAX_LENGTH) return { maxlength: true };
    if (this.usernameServerError()) return { server: true };
    return null;
  });

  protected readonly emailErrors = computed(() =>
    emailFieldErrors(this.email(), !!this.emailServerError()),
  );

  protected readonly passwordErrors = computed(() =>
    passwordFieldErrors(this.password(), { hasServerError: !!this.passwordServerError() }),
  );

  protected readonly confirmPasswordErrors = computed(() =>
    confirmPasswordFieldErrors(this.confirmPassword(), this.password()),
  );

  protected readonly usernameErrorMessage = computed(() =>
    fieldErrorMessage(this.submitted() || this.usernameTouched(), this.usernameErrors(), {
      required: "Le nom d'utilisateur est requis.",
      minlength: 'Minimum 2 caractères.',
      maxlength: 'Maximum 50 caractères.',
      server: this.usernameServerError() ?? undefined,
    }),
  );

  protected readonly emailErrorMessage = computed(() =>
    fieldErrorMessage(this.submitted() || this.emailTouched(), this.emailErrors(), {
      required: "L'e-mail est requis.",
      email: "Format d'e-mail invalide.",
      server: this.emailServerError() ?? undefined,
    }),
  );

  protected readonly passwordErrorMessage = computed(() =>
    fieldErrorMessage(this.submitted() || this.passwordTouched(), this.passwordErrors(), {
      required: 'Le mot de passe est requis.',
      minlength: 'Minimum 6 caractères.',
      maxlength: 'Maximum 128 caractères.',
      server: this.passwordServerError() ?? undefined,
    }),
  );

  protected readonly confirmPasswordErrorMessage = computed(() =>
    fieldErrorMessage(
      this.submitted() || this.confirmPasswordTouched(),
      this.confirmPasswordErrors(),
      {
        required: 'Le mot de passe de confirmation est requis.',
        mismatch: 'Les mots de passe ne correspondent pas.',
      },
    ),
  );

  private readonly isFormValid = computed(
    () =>
      !this.usernameErrors() &&
      !this.emailErrors() &&
      !this.passwordErrors() &&
      !this.confirmPasswordErrors(),
  );

  protected togglePasswordVisibility(): void {
    this.passwordVisibility.toggle();
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

    submitAuthForm({
      ui: this.ui,
      loadingMessage: 'Création du compte…',
      isSubmitting: this.isSubmitting,
      request: () =>
        this.authService.register({
          username: this.username().trim(),
          email: this.email().trim(),
          password: this.password(),
        }),
      onSuccess: () => this.router.navigate(['/tabs/search']),
      onError: (err) => {
        if (err.status === 409) {
          this.emailServerError.set('Cet e-mail est déjà utilisé.');
          return of(undefined);
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
        return undefined;
      },
    });
  }
}
