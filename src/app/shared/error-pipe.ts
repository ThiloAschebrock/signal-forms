import { Pipe, PipeTransform } from '@angular/core';
import { ValidationError } from '@angular/forms/signals';

@Pipe({ name: 'error', pure: true })
export class ErrorPipe implements PipeTransform {
  transform(value: readonly ValidationError.WithOptionalFieldTree[]): string {
    const error = value.at(0);

    if (!error) {
      return '';
    }

    if (error.message) {
      return error.message;
    }

    return error.kind;
  }
}
