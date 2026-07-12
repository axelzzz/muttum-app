import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { unauthorizedInterceptor } from './unauthorized.interceptor';
import { AuthService } from '../services/auth.service';

describe('unauthorizedInterceptor', () => {
  let authService: jest.Mocked<Pick<AuthService, 'logout'>>;
  let router: Router;

  beforeEach(() => {
    authService = { logout: jest.fn() };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    });

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  function runInterceptor(url: string, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const req = new HttpRequest('GET', url);
    return TestBed.runInInjectionContext(() => unauthorizedInterceptor(req, next));
  }

  it('passes through a successful response unchanged', (done) => {
    const response = new HttpResponse({ status: 200, body: 'ok' });
    const next = jest.fn().mockReturnValue(of(response));

    runInterceptor('http://localhost:3000/api/words', next).subscribe((value) => {
      expect(value).toBe(response);
      expect(authService.logout).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('logs out and redirects to login on a 401 from a protected endpoint', (done) => {
    const error = new HttpErrorResponse({ status: 401 });
    const next = jest.fn().mockReturnValue(throwError(() => error));

    runInterceptor('http://localhost:3000/api/words', next).subscribe({
      error: (thrown: unknown) => {
        expect(thrown).toBe(error);
        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
        done();
      },
    });
  });

  it('does not log out or redirect on a 401 from the login endpoint', (done) => {
    const error = new HttpErrorResponse({ status: 401 });
    const next = jest.fn().mockReturnValue(throwError(() => error));

    runInterceptor('http://localhost:3000/api/auth/login', next).subscribe({
      error: () => {
        expect(authService.logout).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('leaves non-401 errors untouched', (done) => {
    const error = new HttpErrorResponse({ status: 500 });
    const next = jest.fn().mockReturnValue(throwError(() => error));

    runInterceptor('http://localhost:3000/api/words', next).subscribe({
      error: (thrown: unknown) => {
        expect(thrown).toBe(error);
        expect(authService.logout).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
