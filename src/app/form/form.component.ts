import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
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
  form,
  Field,
  required,
  submit,
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
  schema,
  apply,
  applyEach,
  validateStandardSchema,
  validateAsync,
  aggregateMetadata,
  SchemaPathRules,
} from '@angular/forms/signals';
import { compatForm } from '@angular/forms/signals/compat';
import { NxInputDirective } from '@allianz/ng-aquila/input';
import {
  QueryClient,
  queryOptions,
} from '@tanstack/angular-query-experimental';
import {
  NxDatefieldDirective,
  NxDatepickerComponent,
  NxDatepickerToggleComponent,
} from '@allianz/ng-aquila/datefield';
import {
  NxFormfieldComponent,
  NxFormfieldErrorDirective,
  NxFormfieldHintDirective,
  NxFormfieldPrefixDirective,
  NxFormfieldSuffixDirective,
} from '@allianz/ng-aquila/formfield';
import { NxErrorComponent } from '@allianz/ng-aquila/base';
import { NxButtonComponent } from '@allianz/ng-aquila/button';
import { NxMessageComponent } from '@allianz/ng-aquila/message';
import { NxCheckboxComponent } from '@allianz/ng-aquila/checkbox';
import { NxSpinnerComponent } from '@allianz/ng-aquila/spinner';
import { YesNo } from '../yes-no/yes-no';
import { NxIsoDateModule } from '@allianz/ng-aquila/iso-date-adapter';
import { Toggle } from '../toggle/toggle';
import { NgxMaskDirective } from 'ngx-mask';
import { NxMaskDirective } from '@allianz/ng-aquila/mask';
import { FamilyMember, FamilyMembers } from '../family-members/family-members';
import { ErrorPipe } from '../error-pipe';
import { InputWithCharacterCount } from '../input-with-character-count/input-with-character-count';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [
    Field,
    JsonPipe,
    NxButtonComponent,
    NxCheckboxComponent,
    NxDatefieldDirective,
    NxErrorComponent,
    NxFormfieldComponent,
    NxFormfieldErrorDirective,
    NxFormfieldHintDirective,
    NxFormfieldSuffixDirective,
    NxFormfieldPrefixDirective,
    NxInputDirective,
    NxIsoDateModule,
    NxMessageComponent,
    NxSpinnerComponent,
    YesNo,
    NxDatepickerComponent,
    NxDatepickerToggleComponent,
    Toggle,
    NgxMaskDirective,
    NxMaskDirective,
    FamilyMembers,
    ErrorPipe,
    InputWithCharacterCount,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  private readonly initalState = signal<{
    firstName: string;
    lastName: string;
    same: boolean;
    postcode: string;
    birthday: FormControl<string | null>;
    married: boolean | null;
    employFamilyMembers: boolean | null;
    familyMembers: FamilyMember[];
    spouse?: Spouse;
    email: string;
  }>({
    firstName: '',
    lastName: '',
    postcode: '',
    birthday: new FormControl<string | null>(null, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    same: false,
    married: null,
    employFamilyMembers: null,
    familyMembers: [],
    email: '',
  });
  protected readonly model = linkedSignal(this.initalState);
  private readonly validatePostcode = postcodeValidator();
  protected readonly form = compatForm(this.model, (path) => {
    disabled(path, () => this.form().submitting());
    readonly(path, () => this.readonly());

    required(path.postcode, { message: 'Postcode is required' });
    minLength(path.postcode, 4, { message: 'Postcode is too short' });
    maxLength(path.postcode, 4, { message: 'Postcode is too long' });
    this.validatePostcode(path.postcode);
    maxLength(path.firstName, 20);
    required(path.lastName, {
      message: 'Last name is required when a first name was entered',
      when: ({ valueOf }) => !!valueOf(path.firstName).trim(),
    });
    maxLength(path.lastName, 25);
    readonly(path.lastName, ({ valueOf }) => valueOf(path.same));
    requireBoolean(path.married, { message: 'Answer if married' });

    if (path.spouse) {
      hidden(path.spouse, ({ valueOf }) => !valueOf(path.married));
      apply(path.spouse, spouseSchema);
    }

    requireBoolean(path.employFamilyMembers, {
      message: 'Answer if you employ family members',
    });
    hidden(
      path.familyMembers,
      ({ valueOf }) => !valueOf(path.employFamilyMembers),
    );
    applyEach(path.familyMembers, FamilyMembers.schema);

    requireBoolean(path.employFamilyMembers, {
      message: 'Answer if you employ family members',
      when: ({ valueOf }) => !!valueOf(path.married),
    });
    minLength(path.familyMembers, 2, {
      message: 'Minium two family members are required',
    });

    maxLength(path.email, 128);
    required(path.email, { message: 'Enter an email' });
    validateStandardSchema(
      path,
      z.object({ email: z.email({ error: 'Enter a valid email' }) }),
    );
  });

  protected readonly readonly = signal(false);

  protected readonly isLastNameRequired = computed(() =>
    this.form.lastName().metadata(REQUIRED)(),
  );

  private readonly firstName = computed(() => this.form.firstName().value());
  private readonly same = computed(() => this.form.same().value());
  private readonly married = computed(() => this.form.married().value());

  protected submit(): void {
    this.form.email().errors;
    submit(this.form, async (form) => {
      // TODO: Conditional remove data that has been hidden -> Can this be abstracted into a function?
      console.log('Submitted', form().value());
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    });
  }

  protected reset(): void {
    this.initalState.update((value) => ({ ...value }));
    this.form().reset();
  }

  protected setName(): void {
    this.form.firstName().value.set('Thilo');
    this.form.lastName().value.set('Aschebrock');
    this.form.birthday().value.set('1989-04-04');
    this.form.married().value.set(false);
    this.form.employFamilyMembers().value.set(false);
  }

  protected syncLastNameEffect = effect(() => {
    // Note: Using this.model().firstName or
    // this.form.firstName().value()
    // would result in an infinite effect.

    if (!this.same()) {
      return;
    }

    const firstName = this.firstName();

    untracked(() => {
      this.form.lastName().value.set(firstName);
    });
  });

  protected addSpouseWhenMarried = effect(() => {
    const married = this.married();

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
  aggregateMetadata(path, REQUIRED, when);
  validate(path, (context) =>
    when(context) && typeof context.value() !== 'boolean'
      ? { kind: 'required', message }
      : null,
  );
}

type Spouse = {
  income: number | null;
  abn: string;
};

const spouseSchema = schema<Spouse>((path) => {
  required(path.income, { message: 'Spouse income is required' });
  min(path.income, 1, { message: 'Minium income is 1' });
  required(path.abn, { message: 'ABN is required' });
  minLength(path.abn, 11, { message: 'ABN is too short' });
});

async function isValidPostcode(postcode: string) {
  const validPostcodes = new Set(['3121', '3000', '2000', '1000']);
  console.log('Validating', postcode);
  await new Promise((resolve) => setTimeout(resolve, 1_000));

  if (postcode === '9999') {
    throw new Error('Simulated network error');
  }
  return validPostcodes.has(postcode);
}

function postcodeValidator() {
  const queryClient = inject(QueryClient);
  const options = (postcode: string) =>
    queryOptions({
      queryKey: ['postcode', postcode],
      queryFn: () => isValidPostcode(postcode ?? ''),
      enabled: postcode?.length === 4,
    });

  return <TPathKind extends PathKind = PathKind.Root>(
    path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
  ) => {
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
}
