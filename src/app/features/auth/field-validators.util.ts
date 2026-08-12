const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;

type EmailFieldError = 'required' | 'email' | 'server';
type PasswordFieldError = 'required' | 'minlength' | 'maxlength' | 'server';
type ConfirmPasswordFieldError = 'required' | 'mismatch';

interface PasswordFieldOptions {
  checkMaxLength?: boolean;
  hasServerError?: boolean;
}

export function emailFieldErrors(
  value: string,
  hasServerError = false,
): Partial<Record<EmailFieldError, boolean>> | null {
  const trimmed = value.trim();
  if (!trimmed) return { required: true };
  if (!EMAIL_REGEX.test(trimmed)) return { email: true };
  if (hasServerError) return { server: true };
  return null;
}

export function passwordFieldErrors(
  value: string,
  { checkMaxLength = true, hasServerError = false }: PasswordFieldOptions = {},
): Partial<Record<PasswordFieldError, boolean>> | null {
  if (!value) return { required: true };
  if (value.length < PASSWORD_MIN_LENGTH) return { minlength: true };
  if (checkMaxLength && value.length > PASSWORD_MAX_LENGTH) return { maxlength: true };
  if (hasServerError) return { server: true };
  return null;
}

export function confirmPasswordFieldErrors(
  confirmValue: string,
  passwordValue: string,
): Partial<Record<ConfirmPasswordFieldError, boolean>> | null {
  if (!confirmValue) return { required: true };
  if (confirmValue !== passwordValue) return { mismatch: true };
  return null;
}
