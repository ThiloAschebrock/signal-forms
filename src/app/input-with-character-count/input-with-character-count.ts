import {
  NxFormfieldComponent,
  NxFormfieldErrorDirective,
  NxFormfieldHintDirective,
} from '@allianz/ng-aquila/formfield';
import { NxInputDirective } from '@allianz/ng-aquila/input';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import {
  FormValueControl,
  ValidationError,
  WithOptionalField,
} from '@angular/forms/signals';
import { ErrorPipe } from '../error-pipe';
import { FormsModule } from '@angular/forms';
import { NxErrorComponent } from '@allianz/ng-aquila/base';

@Component({
  selector: 'app-input-with-character-count',
  imports: [
    NxInputDirective,
    NxFormfieldComponent,
    NxFormfieldHintDirective,
    NxFormfieldErrorDirective,
    ErrorPipe,
    NxErrorComponent,
    FormsModule,
  ],
  templateUrl: './input-with-character-count.html',
  styleUrl: './input-with-character-count.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputWithCharacterCount implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly label = input.required<string>();
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly touched = output<boolean>();
  readonly dirty = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly minLength = input<number>();
  readonly maxLength = input<number>();

  protected readonly hint = computed(() => {
    const maxLength = this.maxLength();

    if (maxLength === undefined) {
      return undefined;
    }
    const currentLength = this.value().length;
    return currentLength
      ? `${currentLength}/${maxLength} characters`
      : `max ${maxLength} characters`;
  });

  protected markTouched() {
    this.touched.emit(true);
  }
}
