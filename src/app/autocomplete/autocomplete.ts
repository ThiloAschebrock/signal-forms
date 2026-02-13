import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  input,
  signal,
  inject,
  untracked,
} from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { NxErrorComponent } from '@allianz/ng-aquila/base';
import {
  NxFormfieldComponent,
  NxFormfieldErrorDirective,
  NxFormfieldHintDirective,
} from '@allianz/ng-aquila/formfield';
import { NxInputDirective } from '@allianz/ng-aquila/input';
import {
  NxAutocompleteComponent,
  NxAutocompleteOptionComponent,
  NxAutocompleteTriggerDirective,
} from '@allianz/ng-aquila/autocomplete';
import { ErrorPipe } from '../error-pipe';

export interface AutocompleteOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-autocomplete',
  imports: [
    ErrorPipe,
    FormField,
    NxAutocompleteComponent,
    NxAutocompleteOptionComponent,
    NxAutocompleteTriggerDirective,
    NxErrorComponent,
    NxFormfieldComponent,
    NxFormfieldErrorDirective,
    NxFormfieldHintDirective,
    NxInputDirective,
  ],
  templateUrl: './autocomplete.html',
  styleUrl: './autocomplete.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Autocomplete {
  readonly formField = input.required<FieldTree<string>>();

  readonly options = input.required<AutocompleteOption[]>();
  readonly placeholder = input<string>('');
  readonly label = input.required<string>();
  readonly hint = input<string>('');

  private readonly changeDetectionRef = inject(ChangeDetectorRef);

  private readonly filterText = signal('');

  protected readonly filteredOptions = computed(() => {
    const text = this.filterText().toLowerCase();
    const allOptions = this.options();
    if (!text) return allOptions;
    return allOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(text) || option.value.toLowerCase().includes(text),
    );
  });

  protected readonly triggerChangeWhenTouchedEffect = effect(() => {
    this.formField()().touched();
    this.formField()().valid();

    untracked(() => this.changeDetectionRef.detectChanges());
  });

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterText.set(target.value);
  }

  protected onBlur(): void {
    setTimeout(() => {
      const currentValue = this.formField()().value();
      const allOptions = this.options();
      const isValidOption = allOptions.some(
        (option) => option.value === currentValue || option.label === currentValue,
      );
      if (!isValidOption) {
        untracked(() => {
          this.formField()().value.set('');
          this.changeDetectionRef.detectChanges();
          this.filterText.set('');
        });
      }
    });
  }
}
