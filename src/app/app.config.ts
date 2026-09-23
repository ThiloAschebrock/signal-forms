import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query';
import { withDevtools } from '@tanstack/angular-query-devtools';
import { provideLocaleDate } from './core/date.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideLocaleDate(),
    provideEnvironmentNgxMask({
      outputTransformFn: (value) => (value === '' ? null : value),
    }),
    provideTanStackQuery(() => new QueryClient(), withDevtools()),
  ],
};
