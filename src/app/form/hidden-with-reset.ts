import { computed, effect, untracked } from '@angular/core';
import {
  createManagedMetadataKey,
  hidden,
  LogicFn,
  metadata,
  PathKind,
  SchemaPath,
  SchemaPathRules,
} from '@angular/forms/signals';

const RESET_WHEN = createManagedMetadataKey<void, { when: boolean; resetValue: unknown }>(
  (state, data) => {
    const shouldReset = computed(() => data()?.when ?? false);

    effect(() => {
      if (!shouldReset()) {
        return;
      }

      untracked(() => {
        const reset = data();
        if (reset) {
          state.value.set(reset.resetValue);
        }
      });
    });
  },
);

/**
 * Hides a field like `hidden()` and resets its value to `resetValue` whenever the `when` condition
 * becomes true. Hiding the field for other reasons, e.g. a hidden parent, does not reset it.
 * The reset runs in an effect, so the model is updated on the next change detection cycle.
 */
export function hiddenWithReset<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  resetValue: NoInfer<TValue>,
  config?: { when?: NoInfer<LogicFn<TValue, boolean, TPathKind>> },
): void {
  hidden(path, config);
  metadata(path, RESET_WHEN, (context) => ({
    when: config?.when?.(context) ?? true,
    resetValue,
  }));
}
