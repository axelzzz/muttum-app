import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { fieldErrorMessage } from '../../../ui/field-error.util';
import { UiService } from '../../../ui/ui.service';
import { emailFieldErrors, passwordFieldErrors } from '../field-validators.util';
import { createPasswordVisibility } from '../password-visibility.util';
import { submitAuthForm } from '../auth-form-submit.util';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  imports: [IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ui = inject(UiService);

  private readonly passwordVisibility = createPasswordVisibility();
  protected readonly isPasswordVisible = this.passwordVisibility.isVisible;

  protected readonly isSubmitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly email = signal('');
  protected readonly password = signal('');

  protected readonly emailTouched = signal(false);
  protected readonly passwordTouched = signal(false);

  protected readonly emailErrors = computed(() => emailFieldErrors(this.email()));

  protected readonly passwordErrors = computed(() =>
    passwordFieldErrors(this.password(), { checkMaxLength: false }),
  );

  protected readonly emailErrorMessage = computed(() =>
    fieldErrorMessage(this.submitted() || this.emailTouched(), this.emailErrors(), {
      required: "L'e-mail est requis.",
      email: "Format d'e-mail invalide.",
    }),
  );

  protected readonly passwordErrorMessage = computed(() =>
    fieldErrorMessage(this.submitted() || this.passwordTouched(), this.passwordErrors(), {
      required: 'Le mot de passe est requis.',
      minlength: 'Minimum 6 caractères.',
    }),
  );

  private readonly isFormValid = computed(
    () => !this.emailErrors() && !this.passwordErrors(),
  );

  protected togglePasswordVisibility(): void {
    this.passwordVisibility.toggle();
  }

  protected submit(): void {
    this.submitted.set(true);
    if (!this.isFormValid()) return;
    if (this.isSubmitting()) return;

    submitAuthForm({
      ui: this.ui,
      loadingMessage: 'Connexion…',
      isSubmitting: this.isSubmitting,
      request: () =>
        this.authService.login({
          email: this.email().trim(),
          password: this.password(),
        }),
      onSuccess: () => this.router.navigate(['/tabs/search']),
      onError: (err) =>
        err.status === 401 ? this.ui.showToast('Email ou mot de passe incorrect.') : undefined,
    });
  }
}
