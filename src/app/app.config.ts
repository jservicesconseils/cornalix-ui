import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { providePrimeNG } from 'primeng/config';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { CornalixPreset } from './core/theme/cornalix-preset';
import { authFeature } from './core/state/auth/auth.reducer';
import { tenantFeature } from './core/state/tenant/tenant.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideStore({
      [authFeature.name]: authFeature.reducer,
      [tenantFeature.name]: tenantFeature.reducer,
    }),
    provideEffects([]),
    provideStoreDevtools({ maxAge: 25, logOnly: false }),
    providePrimeNG({
      theme: {
        preset: CornalixPreset,
        options: { darkModeSelector: false },
      },
    }),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http, '/i18n/', '.json'),
        deps: [HttpClient],
      },
      defaultLanguage: 'fr',
    }),
  ],
};
