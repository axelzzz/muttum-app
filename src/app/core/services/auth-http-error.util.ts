import { HttpErrorResponse } from '@angular/common/http';

export const AUTH_RATE_LIMIT_MESSAGE = 'Trop de tentatives. Réessayez dans quelques minutes.';

interface AuthValidationErrorDetail {
  field: string;
  message: string;
}

interface AuthValidationErrorBody {
  error?: string;
  details?: AuthValidationErrorDetail[];
}

export function isRateLimitError(err: HttpErrorResponse): boolean {
  return err.status === 429;
}

export function hasFieldValidationError(err: HttpErrorResponse, field: string): boolean {
  const body = err.error as AuthValidationErrorBody | null;
  return err.status === 400 && (body?.details ?? []).some((detail) => detail.field === field);
}
