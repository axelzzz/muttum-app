import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ForgotPasswordPage } from './forgot-password.page';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../ui/ui.service';
import { MessageResponse } from '../../../core/models/user.model';

const VALID_RESPONSE: MessageResponse = { message: 'ok' };

describe('ForgotPasswordPage', () => {
  let component: ForgotPasswordPage;
  let fixture: ComponentFixture<ForgotPasswordPage>;
  let authService: jest.Mocked<Pick<AuthService, 'forgotPassword'>>;
  let uiService: jest.Mocked<Pick<UiService, 'showLoading' | 'showToast'>>;

  beforeEach(async () => {
    authService = { forgotPassword: jest.fn() };
    uiService = { showLoading: jest.fn(), showToast: jest.fn() };
    uiService.showLoading.mockReturnValue(
      of({ dismiss: jest.fn() } as unknown as HTMLIonLoadingElement),
    );
    uiService.showToast.mockReturnValue(of(undefined));
    authService.forgotPassword.mockReturnValue(of(VALID_RESPONSE));

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: UiService, useValue: uiService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPage);
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
  });

  describe('error display', () => {
    it('shows no errors before any interaction', () => {
      expect(errorTexts().length).toBe(0);
    });

    it('shows a required error when submit is clicked with an empty form', () => {
      submit();
      expect(errorTexts()).toContain("L'e-mail est requis.");
    });

    it('shows an email format error when the email is invalid after submit', () => {
      field('email').set('notanemail');
      submit();
      expect(errorTexts()).toContain("Format d'e-mail invalide.");
    });
  });

  describe('submit behaviour', () => {
    it('does not call authService.forgotPassword when the form is invalid', () => {
      submit();
      expect(authService.forgotPassword).not.toHaveBeenCalled();
    });

    it('calls authService.forgotPassword with the trimmed email when the form is valid', () => {
      field('email').set('  alice@example.com  ');
      submit();
      expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
      expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'alice@example.com' });
    });

    it('shows the confirmation message after a successful request', () => {
      field('email').set('alice@example.com');
      submit();
      expect(field('requestSent')()).toBe(true);
    });

    it('shows a rate-limit toast when the request fails with 429', () => {
      authService.forgotPassword.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 429 })),
      );
      field('email').set('alice@example.com');
      submit();
      expect(uiService.showToast).toHaveBeenCalledWith('Trop de tentatives. Réessayez dans quelques minutes.');
    });

    it('shows the email format error under the field when the server rejects it with a 400 detail', () => {
      authService.forgotPassword.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              error: { error: 'Validation failed', details: [{ field: 'email', message: 'Invalid value' }] },
            }),
        ),
      );
      field('email').set('alice@example.com');
      submit();
      expect(errorTexts()).toContain("Format d'e-mail invalide.");
      expect(uiService.showToast).not.toHaveBeenCalled();
    });
  });
});
