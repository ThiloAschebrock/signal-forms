import { Pipe, PipeTransform } from '@angular/core';
import {
  StandardSchemaValidationError,
  ValidationError,
  WithOptionalField,
} from '@angular/forms/signals';

@Pipe({
  name: 'error',
  pure: true,
})
export class ErrorPipe implements PipeTransform {
  transform(value: readonly WithOptionalField<ValidationError>[]): string {
    const error = value.at(0);

    if (!error) {
      return '';
    }

    return error.message ?? 'Unkown error';
  }
}
