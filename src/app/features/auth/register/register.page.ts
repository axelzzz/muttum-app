import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../ui/ui.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  imports: [ReactiveFormsModule, RouterLink, IonContent, IonItem, IonLabel, IonInput, IonButton, IonNote, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ui = inject(UiService);

  protected readonly isPasswordVisible = signal(false);

  protected readonly form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  protected get usernameControl() { return this.form.get('username')!; }
  protected get emailControl() { return this.form.get('email')!; }
  protected get passwordControl() { return this.form.get('password')!; }
  protected get confirmPasswordControl() { return this.form.get('confirmPassword')!; }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update(v => !v);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const loading = await this.ui.showLoading('Création du compte…');
    try {
      const { confirmPassword: _, ...payload } = this.form.value as {
        username: string;
        email: string;
        password: string;
        confirmPassword: string;
      };
      await firstValueFrom(this.authService.register(payload));
      await this.router.navigate(['/tabs/search']);
    } catch (err: unknown) {
      const message = (err as { status?: number }).status === 409
        ? 'Cet e-mail est déjà utilisé.'
        : 'Une erreur est survenue.';
      await this.ui.showToast(message);
    } finally {
      await loading.dismiss();
    }
  }
}
