import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { IonButton, IonContent, IonInput, IonItem, IonLabel } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { hasFieldValidationError } from '../../../core/services/auth-http-error.util';
import { fieldErrorMessage } from '../../../ui/field-error.util';
import { UiService } from '../../../ui/ui.service';
import { emailFieldErrors } from '../field-validators.util';
import { submitAuthForm } from '../auth-form-submit.util';

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

  protected readonly emailErrors = computed(() =>
    emailFieldErrors(this.email(), !!this.emailServerError()),
  );

  protected readonly emailErrorMessage = computed(() =>
    fieldErrorMessage(this.submitted() || this.emailTouched(), this.emailErrors(), {
      required: "L'e-mail est requis.",
      email: "Format d'e-mail invalide.",
      server: this.emailServerError() ?? undefined,
    }),
  );

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

    submitAuthForm({
      ui: this.ui,
      loadingMessage: 'Envoi en cours…',
      isSubmitting: this.isSubmitting,
      request: () => this.authService.forgotPassword({ email: this.email().trim() }),
      onSuccess: () => this.requestSent.set(true),
      onError: (err) => {
        if (hasFieldValidationError(err, 'email')) {
          this.emailServerError.set("Format d'e-mail invalide.");
          return of(undefined);
        }
        return undefined;
      },
    });
  }
}
