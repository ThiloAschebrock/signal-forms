import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { withDevtools } from '@tanstack/angular-query-experimental/devtools';
import { NxIsoDateModule } from '@allianz/ng-aquila/iso-date-adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    importProvidersFrom(NxIsoDateModule),
    provideEnvironmentNgxMask({
      outputTransformFn: (value) => (typeof value === 'string' ? null : value),
    }),
    provideTanStackQuery(new QueryClient(), withDevtools()),
  ],
};
