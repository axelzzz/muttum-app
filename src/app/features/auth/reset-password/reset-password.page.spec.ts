import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ResetPasswordPage } from './reset-password.page';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../ui/ui.service';
import { MessageResponse } from '../../../core/models/user.model';

const VALID_RESPONSE: MessageResponse = { message: 'ok' };

describe('ResetPasswordPage', () => {
  let component: ResetPasswordPage;
  let fixture: ComponentFixture<ResetPasswordPage>;
  let authService: jest.Mocked<Pick<AuthService, 'resetPassword'>>;
  let uiService: jest.Mocked<Pick<UiService, 'showLoading' | 'showToast'>>;
  let router: Router;

  async function setup(token: string | null): Promise<void> {
    authService = { resetPassword: jest.fn() };
    uiService = { showLoading: jest.fn(), showToast: jest.fn() };
    uiService.showLoading.mockReturnValue(of({ dismiss: jest.fn() } as any));
    authService.resetPassword.mockReturnValue(of(VALID_RESPONSE));

    await TestBed.configureTestingModule({
      imports: [ResetPasswordPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: UiService, useValue: uiService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(token ? { token } : {}) } },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ResetPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const field = (name: string) => (component as any)[name];

  function submit(): void {
    (component as any).submit();
    fixture.detectChanges();
  }

  function errorTexts(): string[] {
    return Array.from<Element>(fixture.nativeElement.querySelectorAll('ion-note[slot="error"]')).map(
      (el) => el.textContent?.trim() ?? '',
    );
  }

  describe('with a valid token in the URL', () => {
    beforeEach(async () => {
      await setup('reset-token-123');
    });

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    describe('computed validation', () => {
      it('returns { required: true } for an empty password', () => {
        expect(field('passwordErrors')()).toEqual({ required: true });
      });

      it('returns { minlength: true } for a password shorter than 6 characters', () => {
        field('password').set('abc');
        expect(field('passwordErrors')()).toEqual({ minlength: true });
      });

      it('returns { mismatch: true } when the confirmation differs from the password', () => {
        field('password').set('secret123');
        field('confirmPassword').set('other123');
        expect(field('confirmPasswordErrors')()).toEqual({ mismatch: true });
      });
    });

    describe('error display', () => {
      it('shows required errors for both fields when submit is clicked with an empty form', () => {
        submit();
        const errors = errorTexts();
        expect(errors).toContain('Le mot de passe est requis.');
        expect(errors).toContain('Le mot de passe de confirmation est requis.');
      });
    });

    describe('submit behaviour', () => {
      it('does not call authService.resetPassword when the form is invalid', () => {
        submit();
        expect(authService.resetPassword).not.toHaveBeenCalled();
      });

      it('calls authService.resetPassword with the token and password when the form is valid', () => {
        field('password').set('secret123');
        field('confirmPassword').set('secret123');
        submit();
        expect(authService.resetPassword).toHaveBeenCalledWith({
          token: 'reset-token-123',
          password: 'secret123',
        });
      });

      it('navigates to /auth/login after a successful reset', () => {
        field('password').set('secret123');
        field('confirmPassword').set('secret123');
        submit();
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      });
    });
  });

  describe('without a token in the URL', () => {
    beforeEach(async () => {
      await setup(null);
    });

    it('does not render the form', () => {
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('does not call authService.resetPassword on submit', () => {
      submit();
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });
  });
});
