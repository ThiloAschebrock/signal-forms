import { inject, Inject, Injectable, InjectionToken } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  PreloadingStrategy,
  Route,
  Router,
} from '@angular/router';
import {
  delay,
  distinct,
  distinctUntilChanged,
  filter,
  first,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MyStrategy extends PreloadingStrategy {
  private readonly router = inject(Router);
  private readonly navigationEvents = this.router.events.pipe(
    startWith(undefined),
    map(() => this.router.url),
    distinctUntilChanged()
  );

  override preload(
    route: Route,
    load: () => Observable<unknown>
  ): Observable<unknown> {
    const preload =
      (typeof route.data === 'object' &&
        typeof route.data['preload'] === 'string' &&
        route.data['preload']) ||
      null;

    if (!preload) {
      return of(null);
    }

    return this.navigationEvents.pipe(
      first((url) => url.startsWith(preload)),
      tap(() => {
        console.log('Loading', route.path);
      }),
      switchMap(load)
    );
  }
}
