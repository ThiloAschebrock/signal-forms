import { NxErrorComponent } from '@allianz/ng-aquila/base';
import {
  NxFormfieldComponent,
  NxFormfieldErrorDirective,
  NxFormfieldSuffixDirective,
} from '@allianz/ng-aquila/formfield';
import {
  NxAutocompleteComponent,
  NxAutocompleteOptionComponent,
  NxAutocompleteTriggerDirective,
} from '@allianz/ng-aquila/autocomplete';
import {
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  computed,
  debounced,
  effect,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { NxInputDirective } from '@allianz/ng-aquila/input';
import { FormsModule } from '@angular/forms';
import { ErrorPipe } from '../error-pipe';
import { ErrorStateMatcher } from '@allianz/ng-aquila/utils';
import { injectQuery, keepPreviousData } from '@tanstack/angular-query-experimental';
import { NxSpinnerComponent } from '@allianz/ng-aquila/spinner';

export type AutocompleteOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type AutocompleteFormatter = (option: AutocompleteOption) => string;

@Component({
  selector: 'app-autocomplete',
  imports: [
    ErrorPipe,
    FormsModule,
    NxAutocompleteComponent,
    NxAutocompleteOptionComponent,
    NxAutocompleteTriggerDirective,
    NxErrorComponent,
    NxFormfieldComponent,
    NxFormfieldErrorDirective,
    NxInputDirective,
    NxSpinnerComponent,
    NxFormfieldSuffixDirective,
  ],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  providers: [{ provide: ErrorStateMatcher, useExisting: forwardRef(() => AutocompleteComponent) }],
})
export class AutocompleteComponent
  implements FormValueControl<AutocompleteOption | null>, ErrorStateMatcher
{
  readonly value = model.required<AutocompleteOption | null>();
  readonly label = input.required<string>();
  readonly inputOptions = input.required<AutocompleteOption[]>();

  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly touched = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly pending = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly formatter = input<AutocompleteFormatter>(({ label }) => label);

  readonly touch = output();

  private readonly changeDetectionRef = inject(ChangeDetectorRef);
  private readonly trigger = viewChild.required(NxAutocompleteTriggerDirective);
  private readonly input = viewChild.required('input', { read: HTMLInputElement });

  public readonly isErrorState = computed(() => this.invalid() && this.touched());

  protected readonly triggerChangeWhenTouchedEffect = effect(() => {
    this.isErrorState();

    untracked(() => this.changeDetectionRef.detectChanges());
  });

  protected readonly controlValue = linkedSignal<AutocompleteOption | string>(
    () => this.value() || '',
  );

  protected readonly valueFormatter = computed(() => {
    const formatter = this.formatter();

    return untracked(() => (option: AutocompleteOption | string | null): string => {
      if (!option) {
        return '';
      }

      if (typeof option === 'string') {
        return option;
      }

      return formatter(option);
    });
  });

  private readonly searchString = debounced(() => this.valueFormatter()(this.controlValue()), 200)
    .value;

  protected readonly query = injectQuery(() => ({
    queryKey: ['autocomplete', this.searchString()],
    queryFn: async () => {
      const searchString = this.searchString();

      if (!searchString) {
        return [];
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      return this.inputOptions().filter((option) =>
        this.valueFormatter()(option).toLowerCase().includes(searchString.toLowerCase()),
      );
    },
    placeholderData: keepPreviousData,
  }));

  protected readonly options = computed(() => this.query.data() || []);

  protected handleBlur(): void {
    const controlValue = this.controlValue();

    if (typeof controlValue === 'string') {
      this.controlValue.set('');
      this.value.set(null);
    }

    this.touch.emit();
  }

  protected handleEnter(event: Event): void {
    event.preventDefault();

    this.trigger().closePanel();
    this.handleBlur();
  }

  protected handelValueChange(value: AutocompleteOption | string): void {
    this.controlValue.set(value);

    if (typeof value !== 'string') {
      this.value.set(value);
    }
  }

  protected syncValueEffect = effect(() => {
    const value = this.controlValue();

    if (typeof value !== 'string') {
      return;
    }

    const formatter = this.formatter();
    const matchingOption = this.options().filter((option) => formatter(option) === value);
    if (matchingOption.length === 1) {
      this.value.set(matchingOption[0]);
    }
  });

  public focus(options?: FocusOptions): void {
    this.input().focus(options);
  }
}
