import { effect, EffectRef, linkedSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

type ErrorMap = Partial<Record<string, string>>;
type Error = { field: string; error: string };

export function trackErrorState(
  fieldTree: FieldTree<unknown, string | number, 'readonly'>,
): EffectRef {
  const errors = linkedSignal<ErrorMap, Error[]>({
    source: () => {
      const summary = fieldTree().errorSummary();
      const baseName = fieldTree().name();

      return summary.reduce<ErrorMap>((acc, error) => {
        if (error.fieldTree().touched() && error.fieldTree().invalid()) {
          const fieldName = normalizeFieldName(baseName, error.fieldTree().name());

          return { [fieldName]: error.message, ...acc };
        }
        return acc;
      }, {});
    },
    computation: (source, previous) => {
      return Object.entries(source)
        .map(([field, error]) => ({ field, error }))
        .filter(hasError)
        .filter(({ field, error }) => error !== previous?.source?.[field]);
    },
  });

  return effect(() => {
    for (const error of errors()) {
      console.warn(`Showing form field error for field "${error.field}": ${error.error}`);
    }
  });
}

function hasError(error: { field: string; error: string | undefined }): error is Error {
  return error.error !== undefined;
}

function normalizeFieldName(baseName: string, fieldName: string): string {
  if (fieldName.startsWith(baseName)) {
    return fieldName.slice(baseName.length + 1);
  }
  return fieldName;
}
