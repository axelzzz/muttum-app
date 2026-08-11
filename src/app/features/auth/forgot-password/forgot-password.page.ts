import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { IonButton, IonContent, IonInput, IonItem, IonLabel } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import {
  AUTH_RATE_LIMIT_MESSAGE,
  hasFieldValidationError,
  isRateLimitError,
} from '../../../core/services/auth-http-error.util';
import { firstErrorMessage } from '../../../ui/field-error.util';
import { UiService } from '../../../ui/ui.service';

type FieldErrorKey = 'required' | 'email' | 'server';
type FieldErrors = Partial<Record<FieldErrorKey, boolean>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
  imports: [RouterLink, IonContent, IonItem, IonLabel, IonInput, IonButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly ui = inject(UiService);

  protected readonly isSubmitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly requestSent = signal(false);

  protected readonly email = signal('');
  protected readonly emailTouched = signal(false);
  protected readonly emailServerError = signal<string | null>(null);

  protected readonly emailErrors = computed<FieldErrors | null>(() => {
    const v = this.email().trim();
    if (!v) return { required: true };
    if (!EMAIL_REGEX.test(v)) return { email: true };
    if (this.emailServerError()) return { server: true };
    return null;
  });

  protected readonly emailErrorMessage = computed(() => {
    if (!this.submitted() && !this.emailTouched()) return undefined;
    return firstErrorMessage(this.emailErrors(), {
      required: "L'e-mail est requis.",
      email: "Format d'e-mail invalide.",
      server: this.emailServerError() ?? undefined,
    });
  });

  private readonly isFormValid = computed(() => !this.emailErrors());

  protected onEmailInput(value: string | null | undefined): void {
    this.email.set(value ?? '');
    this.emailServerError.set(null);
  }

  protected submit(): void {
    this.submitted.set(true);
    this.emailServerError.set(null);
    if (!this.isFormValid()) return;
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);

    this.ui
      .showLoading('Envoi en cours…')
      .pipe(
        switchMap((loading) =>
          this.authService.forgotPassword({ email: this.email().trim() }).pipe(
            tap(() => this.requestSent.set(true)),
            catchError((err: unknown) => {
              if (!(err instanceof HttpErrorResponse)) {
                return this.ui.showToast('Une erreur est survenue.');
              }
              if (isRateLimitError(err)) {
                return this.ui.showToast(AUTH_RATE_LIMIT_MESSAGE);
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
