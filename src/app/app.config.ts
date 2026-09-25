import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query';
import { withDevtools } from '@tanstack/angular-query-devtools';
import { provideLocaleDate } from './core/date.provider';
import { provideMask } from './core/mask.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideLocaleDate(),
    provideMask(),
    provideTanStackQuery(() => new QueryClient(), withDevtools()),
  ],
};
