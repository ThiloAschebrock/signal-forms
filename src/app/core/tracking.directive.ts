import { computed, Directive, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Directive({
  selector: '[appTracking]',
  host: {
    '[attr.trackId]': 'name()',
  },
})
export class TrackingDirective {
  readonly appTracking = input.required<string | FieldTree<unknown>>();
  protected readonly name = computed(() => {
    const trackingValue = this.appTracking();
    if (typeof trackingValue === 'string') {
      return trackingValue;
    }

    return trackingValue?.().name;
  });
}
