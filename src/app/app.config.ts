import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { PreloadAllModules, RouteReuseStrategy, provideRouter, withPreloading } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import localeFr from '@angular/common/locales/fr';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { baseUrlInterceptor } from './core/interceptors/base-url.interceptor';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'fr' },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([baseUrlInterceptor, authInterceptor])),
  ],
};
