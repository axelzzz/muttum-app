import { HttpErrorResponse } from '@angular/common/http';
import { hasFieldValidationError, isRateLimitError } from './auth-http-error.util';

describe('isRateLimitError', () => {
  it('returns true when the response status is 429', () => {
    const err = new HttpErrorResponse({ status: 429 });
    expect(isRateLimitError(err)).toBe(true);
  });

  it('returns false when the response status is not 429', () => {
    const err = new HttpErrorResponse({ status: 400 });
    expect(isRateLimitError(err)).toBe(false);
  });
});

describe('hasFieldValidationError', () => {
  it('returns true when the response is a 400 with a matching field in details', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: { error: 'Validation failed', details: [{ field: 'password', message: 'Invalid value' }] },
    });
    expect(hasFieldValidationError(err, 'password')).toBe(true);
  });

  it('returns false when details does not contain the field', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: { error: 'Validation failed', details: [{ field: 'username', message: 'Invalid value' }] },
    });
    expect(hasFieldValidationError(err, 'password')).toBe(false);
  });

  it('returns false when the response has no details array (e.g. invalid/expired token)', () => {
    const err = new HttpErrorResponse({ status: 400, error: { error: 'Invalid or expired token' } });
    expect(hasFieldValidationError(err, 'password')).toBe(false);
  });

  it('returns false for a non-400 status', () => {
    const err = new HttpErrorResponse({
      status: 409,
      error: { error: 'Duplicate key' },
    });
    expect(hasFieldValidationError(err, 'email')).toBe(false);
  });
});
