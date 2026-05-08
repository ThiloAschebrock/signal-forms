import {
  Component,
  computed,
  effect,
  linkedSignal,
  signal,
  resource,
  untracked,
  inject,
} from '@angular/core';
import { z } from 'zod';
import {
  debounce,
  FormField,
  required,
  readonly,
  disabled,
  validate,
  SchemaPath,
  PathKind,
  REQUIRED,
  LogicFn,
  hidden,
  minLength,
  maxLength,
  min,
  max,
  schema,
  apply,
  applyEach,
  validateStandardSchema,
  validateAsync,
  SchemaPathRules,
  metadata,
  form,
  FormRoot,
} from '@angular/forms/signals';
import { NxInputDirective } from '@allianz/ng-aquila/input';
import { QueryClient, queryOptions } from '@tanstack/angular-query-experimental';
import {
  NxDatefieldDirective,
  NxDatepickerComponent,
  NxDatepickerToggleComponent,
} from '@allianz/ng-aquila/datefield';
import {
  NxFormfieldComponent,
  NxFormfieldErrorDirective,
  NxFormfieldHintDirective,
  NxFormfieldSuffixDirective,
} from '@allianz/ng-aquila/formfield';
import { NxErrorComponent } from '@allianz/ng-aquila/base';
import { NxButtonComponent } from '@allianz/ng-aquila/button';
import { NxMessageComponent } from '@allianz/ng-aquila/message';
import { NxCheckboxComponent } from '@allianz/ng-aquila/checkbox';
import { NxSpinnerComponent } from '@allianz/ng-aquila/spinner';
import { YesNoComponent } from '../yes-no/yes-no.component';
import { ToggleComponent } from '../toggle/toggle.component';
import { NxMaskDirective } from '@allianz/ng-aquila/mask';
import { FamilyMember, FamilyMembersComponent } from '../family-members/family-members.component';
import { ErrorPipe } from '../error-pipe';
import { InputWithCharacterCountComponent } from '../input-with-character-count/input-with-character-count.component';
import { DropdownComponent, DropdownOption } from '../dropdown/dropdown.component';
import { AutocompleteComponent, AutocompleteOption } from '../autocomplete/autocomplete.component';
import { ReactiveFormsModule } from '@angular/forms';
import { omitHiddenFields } from './omit-hidden-fields';
import dayjs from 'dayjs';
import { NumberInputComponent } from '../number-input/number-input.component';

@Component({
  selector: 'app-form',
  imports: [
    AutocompleteComponent,
    DropdownComponent,
    ErrorPipe,
    FamilyMembersComponent,
    FormField,
    FormRoot,
    InputWithCharacterCountComponent,
    NxButtonComponent,
    NxCheckboxComponent,
    NxDatefieldDirective,
    NxDatepickerComponent,
    NxDatepickerToggleComponent,
    NxErrorComponent,
    NxFormfieldComponent,
    NxFormfieldErrorDirective,
    NxFormfieldHintDirective,
    NxFormfieldSuffixDirective,
    NxInputDirective,
    NxMaskDirective,
    NxMessageComponent,
    NxSpinnerComponent,
    ReactiveFormsModule,
    ToggleComponent,
    YesNoComponent,
    NumberInputComponent,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  private readonly initialState = signal<{
    firstName: string;
    lastName: string;
    same: boolean;
    postcode: string;
    birthday: string | null;
    married: boolean | null;
    employFamilyMembers: boolean | null;
    familyMembers: FamilyMember[];
    spouse?: Spouse;
    email: string;
    cars: string;
    city: AutocompleteOption | null;
  }>({
    firstName: '',
    lastName: '',
    postcode: '',
    birthday: '',
    same: false,
    married: null,
    employFamilyMembers: null,
    familyMembers: [],
    email: '',
    cars: '',
    city: null,
  });
  protected readonly model = linkedSignal(this.initialState);

  protected readonly carOptions: DropdownOption[] = [
    { label: 'BMW', value: 'BMW' },
    { label: 'Audi', value: 'Audi' },
    { label: 'VW', value: 'VW' },
    { label: 'Mercedes', value: 'Mercedes' },
    { label: 'Porsche', value: 'Porsche' },
    { label: 'Tesla', value: 'Tesla', disabled: true },
  ];

  protected readonly cityOptions: AutocompleteOption[] = [
    { label: 'Berlin', value: 'BER' },
    { label: 'Munich', value: 'MUC' },
    { label: 'Hamburg', value: 'HAM' },
    { label: 'Cologne', value: 'CGN' },
    { label: 'Frankfurt', value: 'FRA' },
    { label: 'Stuttgart', value: 'STR' },
    { label: 'Düsseldorf', value: 'DUS' },
    { label: 'Leipzig', value: 'LEJ', disabled: true },
  ];

  private readonly MAX_BIRTHDAY = dayjs().subtract(18, 'years').endOf('day');
  private readonly MIN_BIRTHDAY = dayjs().subtract(100, 'years').startOf('day');

  protected readonly maxBirthday = this.MAX_BIRTHDAY.format('YYYY-MM-DD');
  protected readonly minBirthday = this.MIN_BIRTHDAY.format('YYYY-MM-DD');

  protected readonly form = form(
    this.model,
    (path) => {
      disabled(path, () => this.form().submitting());
      readonly(path, () => this.readonly());

      debounce(path.postcode, 10_000);
      required(path.postcode, { message: 'Postcode is required' });
      minLength(path.postcode, 4, { message: 'Postcode is too short' });
      maxLength(path.postcode, 4, { message: 'Postcode is too long' });
      validatePostcode(path.postcode);
      maxLength(path.firstName, 20);
      required(path.lastName, {
        message: 'Last name is required when a first name was entered',
        when: (context) => !!context.valueOf(path.firstName).trim(),
      });
      maxLength(path.lastName, 25);
      readonly(path.lastName, (context) => context.valueOf(path.same));
      requireBoolean(path.married, { message: 'Answer if married' });

      required(path.birthday, { message: 'Birthday is required' });
      validateStandardSchema(
        path.birthday,
        z.coerce
          .date()
          .max(this.MAX_BIRTHDAY.toDate(), {
            message: 'Age must be at least 18 years',
          })
          .min(this.MIN_BIRTHDAY.toDate(), {
            message: 'Birthday cannot be more than 100 years ago',
          }),
      );

      if (path.spouse) {
        hidden(path.spouse, (context) => !context.valueOf(path.married));
        apply(path.spouse, spouseSchema);
      }

      requireBoolean(path.employFamilyMembers, {
        message: 'Answer if you employ family members',
      });
      hidden(path.familyMembers, (context) => !context.valueOf(path.employFamilyMembers));
      applyEach(path.familyMembers, FamilyMembersComponent.schema);

      requireBoolean(path.employFamilyMembers, {
        message: 'Answer if you employ family members',
        when: (context) => !!context.valueOf(path.married),
      });
      minLength(path.familyMembers, 2, {
        message: 'Minium two family members are required',
      });

      required(path.cars, { message: 'Please select a car' });
      required(path.city, { message: 'Please select a city' });
      maxLength(path.email, 128);
      required(path.email, { message: 'Enter an email' });
      validateStandardSchema(path.email, z.email({ error: 'Enter a valid email' }));
    },
    {
      submission: {
        action: async (form) => {
          const filteredValue = omitHiddenFields(form);
          console.log('Submitted', filteredValue);
          await new Promise((resolve) => setTimeout(resolve, 1_000));
        },
        onInvalid: (form) => {
          console.warn('Invalid submission', form().errorSummary());
        },
        ignoreValidators: 'none',
      },
    },
  );

  protected readonly readonly = signal(false);

  protected readonly isLastNameRequired = computed(() => this.form.lastName().required());

  protected reset(): void {
    this.initialState.update((value) => ({ ...value }));
    this.form().reset();
  }

  protected setName(): void {
    this.form.firstName().value.set('Thilo');
    this.form.lastName().value.set('Aschebrock');
    this.form.birthday().value.set('1989-04-04');
    this.form.married().value.set(false);
    this.form.employFamilyMembers().value.set(false);
    this.form.cars().value.set('BMW');
    this.form.postcode().value.set('3121');
    this.form.city().value.set({ label: 'Munich', value: 'MUC' });
    this.form.email().value.set('thilo.aschebrock@tngtech.com');
  }

  protected syncLastNameEffect = effect(() => {
    if (!this.form.same().value()) {
      return;
    }

    const firstName = this.form.firstName().value();

    untracked(() => {
      this.form.lastName().value.set(firstName);
    });
  });

  protected addSpouseWhenMarried = effect(() => {
    const married = this.form.married().value();

    untracked(() => {
      if (married) {
        this.model.update((model) => ({
          ...model,
          spouse: { income: null, abn: '' },
        }));
      } else {
        this.model.update((model) => ({
          ...model,
          spouse: undefined,
        }));
      }
    });
  });

  protected setEmployFamilyMembersToFalse(): void {
    this.form.employFamilyMembers().value.set(false);
  }

  protected cityFormatter = (option: AutocompleteOption) => `${option.label} (${option.value})`;
}

function requireBoolean<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
  {
    message,
    when = () => true,
  }: Partial<{
    message: string;
    when: NoInfer<LogicFn<TValue, boolean, TPathKind>>;
  }>,
): void {
  metadata(path, REQUIRED, when);
  validate(path, (context) =>
    when(context) && typeof context.value() !== 'boolean' ? { kind: 'required', message } : null,
  );
}

type Spouse = {
  income: number | null;
  abn: string;
};

const spouseSchema = schema<Spouse>((path) => {
  required(path.income, { message: 'Spouse income is required' });
  min(path.income, 1, { message: 'Minimum income is $1' });
  max(path.income, 999_999_999, { message: 'Maximum income is $999,999,999' });
  required(path.abn, { message: 'ABN is required' });
  minLength(path.abn, 11, { message: 'ABN is too short' });
});

async function isValidPostcode(postcode: string) {
  const validPostcodes = new Set(['3121', '3000', '2000', '1000']);
  console.log('Validating', postcode);
  await new Promise((resolve) => setTimeout(resolve, 3_000));

  if (postcode === '9999') {
    throw new Error('Simulated network error');
  }
  return validPostcodes.has(postcode);
}

const validatePostcode = <TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
) => {
  const queryClient = inject(QueryClient);
  const options = (postcode: string) =>
    queryOptions({
      queryKey: ['postcode', postcode],
      queryFn: () => isValidPostcode(postcode ?? ''),
      enabled: postcode?.length === 4,
    });

  validateAsync(path, {
    params: ({ value }) => {
      const postcode = value();
      return postcode.length === 4 ? postcode : undefined;
    },
    factory: (params) =>
      resource({
        params,
        loader: ({ params }) => queryClient.ensureQueryData(options(params)),
      }),
    debounce: 200,
    onError: () => ({
      kind: 'validation',
      message: 'Error validating postcode',
    }),
    onSuccess: (valid) =>
      valid
        ? null
        : {
            kind: 'invalid',
            message: 'Postcode does not exist',
          },
  });
};
