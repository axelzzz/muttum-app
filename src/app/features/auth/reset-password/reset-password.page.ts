import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel } from '@ionic/angular/standalone';
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

type FieldErrorKey = 'required' | 'minlength' | 'maxlength' | 'mismatch' | 'server';
type FieldErrors = Partial<Record<FieldErrorKey, boolean>>;

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;

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

  protected readonly isPasswordVisible = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');

  protected readonly passwordTouched = signal(false);
  protected readonly confirmPasswordTouched = signal(false);
  protected readonly passwordServerError = signal<string | null>(null);

  protected readonly passwordErrors = computed<FieldErrors | null>(() => {
    const v = this.password();
    if (!v) return { required: true };
    if (v.length < MIN_PASSWORD_LENGTH) return { minlength: true };
    if (v.length > MAX_PASSWORD_LENGTH) return { maxlength: true };
    if (this.passwordServerError()) return { server: true };
    return null;
  });

  protected readonly confirmPasswordErrors = computed<FieldErrors | null>(() => {
    if (!this.confirmPassword()) return { required: true };
    if (this.confirmPassword() !== this.password()) return { mismatch: true };
    return null;
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
    () => !this.passwordErrors() && !this.confirmPasswordErrors() && this.hasToken(),
  );

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((v) => !v);
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
    this.isSubmitting.set(true);

    this.ui
      .showLoading('Réinitialisation…')
      .pipe(
        switchMap((loading) =>
          this.authService.resetPassword({ token: this.token(), password: this.password() }).pipe(
            tap(() => this.router.navigate(['/auth/login'])),
            catchError((err: unknown) => {
              if (!(err instanceof HttpErrorResponse)) {
                return this.ui.showToast('Une erreur est survenue.');
              }
              if (isRateLimitError(err)) {
                return this.ui.showToast(AUTH_RATE_LIMIT_MESSAGE);
              }
              if (hasFieldValidationError(err, 'password')) {
                this.passwordServerError.set(
                  `Le mot de passe doit contenir entre ${MIN_PASSWORD_LENGTH} et ${MAX_PASSWORD_LENGTH} caractères.`,
                );
                return of(undefined);
              }
              if (err.status === 400) {
                return this.ui.showToast('Ce lien est invalide ou a expiré.');
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
