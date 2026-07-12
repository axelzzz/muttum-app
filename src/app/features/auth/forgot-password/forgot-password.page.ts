import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, switchMap, tap } from 'rxjs';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonNote } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../ui/ui.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
  imports: [RouterLink, IonContent, IonItem, IonLabel, IonInput, IonButton, IonNote],
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

  protected readonly emailErrors = computed(() => {
    const v = this.email().trim();
    if (!v) return { required: true };
    if (!EMAIL_REGEX.test(v)) return { email: true };
    return null;
  });

  private readonly isFormValid = computed(() => !this.emailErrors());

  protected submit(): void {
    this.submitted.set(true);
    if (!this.isFormValid()) return;
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);

    this.ui
      .showLoading('Envoi en cours…')
      .pipe(
        switchMap((loading) =>
          this.authService.forgotPassword({ email: this.email().trim() }).pipe(
            tap(() => this.requestSent.set(true)),
            catchError(() => this.ui.showToast('Une erreur est survenue.')),
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
