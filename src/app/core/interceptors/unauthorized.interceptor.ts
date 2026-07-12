import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const UNAUTHENTICATED_ENDPOINTS = ['/auth/login', '/auth/register'];

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isAuthEndpoint = UNAUTHENTICATED_ENDPOINTS.some((path) => req.url.includes(path));

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
