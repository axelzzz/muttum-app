import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { hasFieldValidationError } from '../../../core/services/auth-http-error.util';
import { fieldErrorMessage } from '../../../ui/field-error.util';
import { UiService } from '../../../ui/ui.service';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  confirmPasswordFieldErrors,
  passwordFieldErrors,
} from '../field-validators.util';
import { createPasswordVisibility } from '../password-visibility.util';
import { submitAuthForm } from '../auth-form-submit.util';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
  imports: [RouterLink, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ui = inject(UiService);

  private readonly token = signal(this.route.snapshot.queryParamMap.get('token') ?? '');
  protected readonly hasToken = computed(() => this.token().length > 0);

  private readonly passwordVisibility = createPasswordVisibility();
  protected readonly isPasswordVisible = this.passwordVisibility.isVisible;

  protected readonly isSubmitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');

  protected readonly passwordTouched = signal(false);
  protected readonly confirmPasswordTouched = signal(false);
  protected readonly passwordServerError = signal<string | null>(null);

  protected readonly passwordErrors = computed(() =>
    passwordFieldErrors(this.password(), { hasServerError: !!this.passwordServerError() }),
  );

  protected readonly confirmPasswordErrors = computed(() =>
    confirmPasswordFieldErrors(this.confirmPassword(), this.password()),
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
    () => !this.passwordErrors() && !this.confirmPasswordErrors() && this.hasToken(),
  );

  protected togglePasswordVisibility(): void {
    this.passwordVisibility.toggle();
  }

  protected onPasswordInput(value: string | null | undefined): void {
    this.password.set(value ?? '');
    this.passwordServerError.set(null);
  }

  protected submit(): void {
    this.submitted.set(true);
    this.passwordServerError.set(null);
    if (!this.isFormValid()) return;
    if (this.isSubmitting()) return;

    submitAuthForm({
      ui: this.ui,
      loadingMessage: 'Réinitialisation…',
      isSubmitting: this.isSubmitting,
      request: () =>
        this.authService.resetPassword({ token: this.token(), password: this.password() }),
      onSuccess: () => this.router.navigate(['/auth/login']),
      onError: (err) => {
        if (hasFieldValidationError(err, 'password')) {
          this.passwordServerError.set(
            `Le mot de passe doit contenir entre ${PASSWORD_MIN_LENGTH} et ${PASSWORD_MAX_LENGTH} caractères.`,
          );
          return of(undefined);
        }
        if (err.status === 400) {
          return this.ui.showToast('Ce lien est invalide ou a expiré.');
        }
        return undefined;
      },
    });
  }
}
