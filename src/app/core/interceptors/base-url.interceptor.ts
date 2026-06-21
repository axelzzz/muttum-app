import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Rewrites the origin baked into orval-generated URLs so the app works
// in any environment — dev, staging, prod — without touching generated files.
const GENERATED_ORIGIN = 'http://localhost:3000';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(GENERATED_ORIGIN)) return next(req);
  const apiOrigin = new URL(environment.apiUrl).origin;
  return next(req.clone({ url: req.url.replace(GENERATED_ORIGIN, apiOrigin) }));
};
