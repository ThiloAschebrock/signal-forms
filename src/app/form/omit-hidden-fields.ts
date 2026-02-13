import { FieldTree } from '@angular/forms/signals';

type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

export function omitHiddenFields<T>(form: FieldTree<T>): DeepPartial<T> | undefined {
  const fieldState = form();

  if (fieldState.hidden()) {
    return undefined;
  }

  const childKeys = Object.keys(form).filter((key) => key !== 'value');

  if (!childKeys.length) {
    return fieldState.value() as DeepPartial<T>;
  }

  const fieldValue = fieldState.value();

  if (Array.isArray(fieldValue)) {
    const result: unknown[] = [];
    for (const key of childKeys) {
      const processed = processChildField(key, form);
      if (processed !== undefined) {
        result.push(processed);
      }
    }
    return result as DeepPartial<T>;
  }

  const result: Record<string, unknown> = {};
  for (const key of childKeys) {
    const processed = processChildField(key, form);
    if (processed !== undefined) {
      result[key] = processed;
    }
  }
  return result as DeepPartial<T>;
}

function processChildField<T>(
  key: string,
  fieldTree: FieldTree<T>,
): DeepPartial<unknown> | undefined {
  const childField = (fieldTree as Record<string, unknown>)[key];
  if (!childField) {
    return undefined;
  }
  return omitHiddenFields(childField as FieldTree<unknown>);
}

export type { DeepPartial };
