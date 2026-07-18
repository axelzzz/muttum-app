import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { LoginPage } from './login.page';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../ui/ui.service';
import { AuthResponse } from '../../../core/models/user.model';

const VALID_AUTH_RESPONSE: AuthResponse = {
  token: 'token',
  user: { _id: '1', email: 'alice@example.com', username: 'alice', createdAt: '', updatedAt: '' },
};

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authService: jest.Mocked<Pick<AuthService, 'login'>>;
  let uiService: jest.Mocked<Pick<UiService, 'showLoading' | 'showToast'>>;
  let router: Router;

  beforeEach(async () => {
    authService = { login: jest.fn() };
    uiService = { showLoading: jest.fn(), showToast: jest.fn() };
    uiService.showLoading.mockReturnValue(
      of({ dismiss: jest.fn() } as unknown as HTMLIonLoadingElement),
    );
    authService.login.mockReturnValue(of(VALID_AUTH_RESPONSE));

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: UiService, useValue: uiService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginPage);
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
    return Array.from<Element>(
      fixture.nativeElement.querySelectorAll('ion-note[slot="error"]')
    ).map((el) => el.textContent?.trim() ?? '');
  }

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('computed validation', () => {
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
    });
  });

  describe('error display', () => {
    it('shows no errors before any interaction', () => {
      expect(errorTexts().length).toBe(0);
    });

    it('shows required errors for both fields when submit is clicked with empty form', () => {
      submit();
      const errors = errorTexts();
      expect(errors).toContain('L\'e-mail est requis.');
      expect(errors).toContain('Le mot de passe est requis.');
    });

    it('shows email format error when email is invalid after submit', () => {
      field('email').set('notanemail');
      submit();
      expect(errorTexts()).toContain('Format d\'e-mail invalide.');
    });

    it('shows password minlength error when password is too short after submit', () => {
      field('password').set('abc');
      submit();
      expect(errorTexts()).toContain('Minimum 6 caractères.');
    });

    it('shows required error for email after blur without typing', () => {
      field('emailTouched').set(true);
      fixture.detectChanges();
      expect(errorTexts()).toContain('L\'e-mail est requis.');
    });

    it('hides the error once the field becomes valid after submit', () => {
      submit();
      expect(errorTexts()).toContain('L\'e-mail est requis.');

      field('email').set('alice@example.com');
      fixture.detectChanges();
      expect(errorTexts()).not.toContain('L\'e-mail est requis.');
    });
  });

  describe('submit behaviour', () => {
    it('does not call authService.login when form is invalid', () => {
      submit();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('calls authService.login with trimmed values when form is valid', () => {
      field('email').set('  alice@example.com  ');
      field('password').set('secret123');
      submit();
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'secret123',
      });
    });

    it('navigates to /tabs/search after successful login', () => {
      field('email').set('alice@example.com');
      field('password').set('secret123');
      submit();
      expect(router.navigate).toHaveBeenCalledWith(['/tabs/search']);
    });
  });
});
