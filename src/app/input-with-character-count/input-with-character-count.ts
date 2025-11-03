import {
  NxFormfieldComponent,
  NxFormfieldErrorDirective,
  NxFormfieldHintDirective,
} from '@allianz/ng-aquila/formfield';
import { NxInputDirective } from '@allianz/ng-aquila/input';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import {
  Field,
  FieldTree,
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
    Field,
    ErrorPipe,
    NxErrorComponent,
    FormsModule,
  ],
  templateUrl: './input-with-character-count.html',
  styleUrl: './input-with-character-count.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputWithCharacterCount {
  readonly field = input.required<FieldTree<string>>();
  readonly label = input.required<string>();
  protected readonly fieldState = computed(() => this.field()());

  protected readonly hint = computed(() => {
    const maxLength = this.fieldState().maxLength?.();

    if (maxLength === undefined) {
      return undefined;
    }
    const currentLength = this.fieldState().value().length;
    return currentLength
      ? `${currentLength}/${maxLength} characters`
      : `max ${maxLength} characters`;
  });

  private readonly changeDetectionRef = inject(ChangeDetectorRef);

  // This is required show and hide and errors when submit/reset was triggered
  protected readonly triggerChangeWhenTouchedEffect = effect(() => {
    this.fieldState().touched();
    this.fieldState().valid();

    untracked(() => this.changeDetectionRef.detectChanges());
  });
}
