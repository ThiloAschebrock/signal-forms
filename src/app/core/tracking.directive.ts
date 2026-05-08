import { computed, Directive, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Directive({
  selector: '[appTracking]',
  host: {
    '[attr.trackId]': 'name()',
  },
})
export class TrackingDirective {
  readonly formField = input<FieldTree<unknown>>();
  readonly appTracking = input<string>();
  protected readonly name = computed(() => this.formField()?.().name() ?? this.appTracking());
}
