import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterPage } from './register.page';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../ui/ui.service';
import { AuthResponse } from '../../../core/models/user.model';

const VALID_AUTH_RESPONSE: AuthResponse = {
  token: 'token',
  user: { _id: '1', email: 'alice@example.com', username: 'alice', createdAt: '', updatedAt: '' },
};

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let authService: jest.Mocked<Pick<AuthService, 'register'>>;
  let uiService: jest.Mocked<Pick<UiService, 'showLoading' | 'showToast'>>;
  let router: Router;

  beforeEach(async () => {
    authService = { register: jest.fn() };
    uiService = { showLoading: jest.fn(), showToast: jest.fn() };
    uiService.showLoading.mockReturnValue(
      of({ dismiss: jest.fn() } as unknown as HTMLIonLoadingElement),
    );
    uiService.showToast.mockReturnValue(of(undefined));
    authService.register.mockReturnValue(of(VALID_AUTH_RESPONSE));

    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: UiService, useValue: uiService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const field = (name: string) => (component as any)[name];

  function submit(): void {
    (component as unknown as { submit: () => void }).submit();
    fixture.detectChanges();
  }

  function errorTexts(): string[] {
    return Array.from<Element>(fixture.nativeElement.querySelectorAll('.field-error-text')).map(
      (el) => el.textContent?.trim() ?? '',
    );
  }

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('computed validation', () => {
    describe('usernameErrors', () => {
      it('returns { required: true } when username is empty', () => {
        expect(field('usernameErrors')()).toEqual({ required: true });
      });

      it('returns { minlength: true } when username is 1 character', () => {
        field('username').set('a');
        expect(field('usernameErrors')()).toEqual({ minlength: true });
      });

      it('returns null when username is valid', () => {
        field('username').set('alice');
        expect(field('usernameErrors')()).toBeNull();
      });

      it('returns { maxlength: true } when username is longer than 50 characters', () => {
        field('username').set('a'.repeat(51));
        expect(field('usernameErrors')()).toEqual({ maxlength: true });
      });
    });

    describe('emailErrors', () => {
      it('returns { required: true } when email is empty', () => {
        expect(field('emailErrors')()).toEqual({ required: true });
      });

      it('returns { email: true } when email format is invalid', () => {
        field('email').set('notanemail');
        expect(field('emailErrors')()).toEqual({ email: true });
      });

      it('returns null when email is valid', () => {
        field('email').set('alice@example.com');
        expect(field('emailErrors')()).toBeNull();
      });

      it('returns { server: true } when the server rejected the email', () => {
        field('email').set('alice@example.com');
        field('emailServerError').set('Cet e-mail est déjà utilisé.');
        expect(field('emailErrors')()).toEqual({ server: true });
      });
    });

    describe('passwordErrors', () => {
      it('returns { required: true } when password is empty', () => {
        expect(field('passwordErrors')()).toEqual({ required: true });
      });

      it('returns { minlength: true } when password is too short', () => {
        field('password').set('abc');
        expect(field('passwordErrors')()).toEqual({ minlength: true });
      });

      it('returns null when password is at least 6 characters', () => {
        field('password').set('secret');
        expect(field('passwordErrors')()).toBeNull();
      });

      it('returns { maxlength: true } when password is longer than 128 characters', () => {
        field('password').set('a'.repeat(129));
        expect(field('passwordErrors')()).toEqual({ maxlength: true });
      });
    });

    describe('confirmPasswordErrors', () => {
      it('returns { required: true } when confirmPassword is empty', () => {
        expect(field('confirmPasswordErrors')()).toEqual({ required: true });
      });

      it('returns { mismatch: true } when passwords do not match', () => {
        field('password').set('secret');
        field('confirmPassword').set('different');
        expect(field('confirmPasswordErrors')()).toEqual({ mismatch: true });
      });

      it('returns null when passwords match', () => {
        field('password').set('secret');
        field('confirmPassword').set('secret');
        expect(field('confirmPasswordErrors')()).toBeNull();
      });

      it('updates reactively when password changes after confirmPassword is set', () => {
        field('confirmPassword').set('secret');
        field('password').set('secret');
        expect(field('confirmPasswordErrors')()).toBeNull();

        field('password').set('changed');
        expect(field('confirmPasswordErrors')()).toEqual({ mismatch: true });
      });
    });
  });

  describe('error display', () => {
    it('shows no errors before any interaction', () => {
      expect(errorTexts().length).toBe(0);
    });

    it('shows required errors for all fields when submit is clicked with empty form', () => {
      submit();
      const errors = errorTexts();
      expect(errors).toContain('Le nom d\'utilisateur est requis.');
      expect(errors).toContain('L\'e-mail est requis.');
      expect(errors).toContain('Le mot de passe est requis.');
      expect(errors).toContain('Le mot de passe de confirmation est requis.');
    });

    it('shows minlength error for username when too short after submit', () => {
      field('username').set('a');
      submit();
      expect(errorTexts()).toContain('Minimum 2 caractères.');
    });

    it('shows email format error when email is invalid after submit', () => {
      field('email').set('notanemail');
      submit();
      expect(errorTexts()).toContain('Format d\'e-mail invalide.');
    });

    it('shows mismatch error when passwords do not match after submit', () => {
      field('password').set('secret1');
      field('confirmPassword').set('secret2');
      submit();
      expect(errorTexts()).toContain('Les mots de passe ne correspondent pas.');
    });

    it('shows required error for username after blur without typing', () => {
      field('usernameTouched').set(true);
      fixture.detectChanges();
      expect(errorTexts()).toContain('Le nom d\'utilisateur est requis.');
    });

    it('hides errors once the field becomes valid after submit', () => {
      submit();
      expect(errorTexts()).toContain('Le nom d\'utilisateur est requis.');

      field('username').set('alice');
      fixture.detectChanges();
      expect(errorTexts()).not.toContain('Le nom d\'utilisateur est requis.');
    });
  });

  describe('submit behaviour', () => {
    it('does not call authService.register when form is invalid', () => {
      submit();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('calls authService.register with trimmed values when form is valid', () => {
      field('username').set('  alice  ');
      field('email').set('  alice@example.com  ');
      field('password').set('secret123');
      field('confirmPassword').set('secret123');
      submit();
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(authService.register).toHaveBeenCalledWith({
        username: 'alice',
        email: 'alice@example.com',
        password: 'secret123',
      });
    });

    it('navigates to /tabs/search after successful register', () => {
      field('username').set('alice');
      field('email').set('alice@example.com');
      field('password').set('secret123');
      field('confirmPassword').set('secret123');
      submit();
      expect(router.navigate).toHaveBeenCalledWith(['/tabs/search']);
    });

    it('shows the email-taken error under the email field when register fails with 409', () => {
      authService.register.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 409 })),
      );
      field('username').set('alice');
      field('email').set('alice@example.com');
      field('password').set('secret123');
      field('confirmPassword').set('secret123');
      submit();

      expect(errorTexts()).toContain('Cet e-mail est déjà utilisé.');
      expect(router.navigate).not.toHaveBeenCalled();
      expect(uiService.showToast).not.toHaveBeenCalled();
    });

    it('shows a generic toast when register fails with a non-409 error', () => {
      authService.register.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500 })),
      );
      field('username').set('alice');
      field('email').set('alice@example.com');
      field('password').set('secret123');
      field('confirmPassword').set('secret123');
      submit();

      expect(uiService.showToast).toHaveBeenCalledWith('Une erreur est survenue.');
      expect(errorTexts()).not.toContain('Cet e-mail est déjà utilisé.');
    });

    it('clears the email-taken error once the user edits the email again', () => {
      authService.register.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 409 })),
      );
      field('username').set('alice');
      field('email').set('alice@example.com');
      field('password').set('secret123');
      field('confirmPassword').set('secret123');
      submit();
      expect(errorTexts()).toContain('Cet e-mail est déjà utilisé.');

      (component as unknown as { onEmailInput: (value: string) => void }).onEmailInput(
        'alice2@example.com',
      );
      fixture.detectChanges();
      expect(errorTexts()).not.toContain('Cet e-mail est déjà utilisé.');
    });

    it('shows a rate-limit toast when register fails with 429', () => {
      authService.register.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 429 })),
      );
      field('username').set('alice');
      field('email').set('alice@example.com');
      field('password').set('secret123');
      field('confirmPassword').set('secret123');
      submit();

      expect(uiService.showToast).toHaveBeenCalledWith('Trop de tentatives. Réessayez dans quelques minutes.');
    });

    it('shows the username error under the field when the server rejects it with a 400 detail', () => {
      authService.register.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              error: { error: 'Validation failed', details: [{ field: 'username', message: 'Invalid value' }] },
            }),
        ),
      );
      field('username').set('alice');
      field('email').set('alice@example.com');
      field('password').set('secret123');
      field('confirmPassword').set('secret123');
      submit();

      expect(errorTexts()).toContain("Le nom d'utilisateur doit contenir entre 2 et 50 caractères.");
      expect(uiService.showToast).not.toHaveBeenCalled();
    });

    it('shows the password error under the field when the server rejects it with a 400 detail', () => {
      authService.register.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              error: { error: 'Validation failed', details: [{ field: 'password', message: 'Invalid value' }] },
            }),
        ),
      );
      field('username').set('alice');
      field('email').set('alice@example.com');
      field('password').set('secret123');
      field('confirmPassword').set('secret123');
      submit();

      expect(errorTexts()).toContain('Le mot de passe doit contenir entre 6 et 128 caractères.');
      expect(uiService.showToast).not.toHaveBeenCalled();
    });
  });
});
