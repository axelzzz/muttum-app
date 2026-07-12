import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, switchMap, tap } from 'rxjs';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonNote } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../ui/ui.service';

const MIN_PASSWORD_LENGTH = 6;

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
  imports: [RouterLink, IonContent, IonItem, IonLabel, IonInput, IonButton, IonNote, IonIcon],
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

  protected readonly passwordErrors = computed(() => {
    const v = this.password();
    if (!v) return { required: true };
    if (v.length < MIN_PASSWORD_LENGTH) return { minlength: true };
    return null;
  });

  protected readonly confirmPasswordErrors = computed(() => {
    if (!this.confirmPassword()) return { required: true };
    if (this.confirmPassword() !== this.password()) return { mismatch: true };
    return null;
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

  protected submit(): void {
    this.submitted.set(true);
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
              const message =
                (err as { status?: number }).status === 400
                  ? 'Ce lien est invalide ou a expiré.'
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
