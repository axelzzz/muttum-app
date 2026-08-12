import { WritableSignal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, switchMap, tap } from 'rxjs';
import { UiService } from '../../ui/ui.service';
import { AUTH_RATE_LIMIT_MESSAGE, isRateLimitError } from '../../core/services/auth-http-error.util';

const GENERIC_ERROR_MESSAGE = 'Une erreur est survenue.';

interface SubmitAuthFormOptions<T> {
  ui: UiService;
  loadingMessage: string;
  isSubmitting: WritableSignal<boolean>;
  request: () => Observable<T>;
  onSuccess: (value: T) => void;
  onError?: (err: HttpErrorResponse) => Observable<unknown> | undefined;
}

export function submitAuthForm<T>({
  ui,
  loadingMessage,
  isSubmitting,
  request,
  onSuccess,
  onError,
}: SubmitAuthFormOptions<T>): void {
  isSubmitting.set(true);

  ui.showLoading(loadingMessage)
    .pipe(
      switchMap((loading) =>
        request().pipe(
          tap(onSuccess),
          catchError((err: unknown) => {
            if (!(err instanceof HttpErrorResponse)) {
              return ui.showToast(GENERIC_ERROR_MESSAGE);
            }
            if (isRateLimitError(err)) {
              return ui.showToast(AUTH_RATE_LIMIT_MESSAGE);
            }
            return onError?.(err) ?? ui.showToast(GENERIC_ERROR_MESSAGE);
          }),
          finalize(() => {
            loading.dismiss();
            isSubmitting.set(false);
          }),
        ),
      ),
    )
    .subscribe();
}
