import { computed, Directive, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Directive({
  selector: '[appTracking]',
  host: {
    '[attr.trackId]': 'trackId()',
  },
})
export class TrackingDirective {
  readonly appTracking = input.required<string | FieldTree<unknown>>();
  protected readonly trackId = computed(() => {
    const trackingValue = this.appTracking();
    if (typeof trackingValue === 'string') {
      return trackingValue;
    }

    return normalizeTrackingValue(trackingValue?.().name());
  });
}

function normalizeTrackingValue(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return value.replace(/^ng\.form\d+\./, '');
}
