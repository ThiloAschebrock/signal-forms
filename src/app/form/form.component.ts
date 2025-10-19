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
  customError,
  FieldPath,
  PathKind,
  aggregateProperty,
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
} from '@angular/forms/signals';
import { NxInputDirective } from '@allianz/ng-aquila/input';
import {
  NxDatefieldDirective,
  NxDatepickerComponent,
  NxDatepickerToggleComponent,
} from '@allianz/ng-aquila/datefield';
import {
  NxFormfieldAppendixDirective,
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

@Component({
  selector: 'app-form',
  imports: [
    Field,
    JsonPipe,
    NxButtonComponent,
    // NxCheckboxComponent,
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
    // YesNo,
    NxDatepickerComponent,
    NxDatepickerToggleComponent,
    // Toggle,
    NgxMaskDirective,
    NxMaskDirective,
    FamilyMembers,
    ErrorPipe,
    InputWithCharacterCount,
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
    birthday: string | null;
    married: boolean | null;
    employFamilyMembers: boolean | null;
    familyMembers: FamilyMember[];
    spouse?: Spouse;
    email: string;
  }>({
    firstName: '',
    lastName: '',
    postcode: '',
    birthday: '1989-04-01',
    same: false,
    married: null,
    employFamilyMembers: null,
    familyMembers: [],
    email: '',
  });
  protected readonly model = linkedSignal(this.initalState);
  protected readonly form = form(this.model, (path) => {
    disabled(path, () => this.form().submitting());
    readonly(path, () => this.readonly());
    required(path.birthday, { message: 'Enter a birthday' });
    required(path.postcode, { message: 'Postcode is required' });
    minLength(path.postcode, 4, { message: 'Postcode is too short' });
    maxLength(path.postcode, 4, { message: 'Postcode is too long' });
    validatePostcode(path.postcode);
    maxLength(path.firstName, 20);
    validateStandardSchema(
      path.birthday,
      z.coerce
        .date()
        .max(new Date(), { error: 'Birthdate cannot be in the past' }),
    );
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

    required(path.email, { message: 'Enter an email' });
    validateStandardSchema(
      path,
      z.object({ email: z.email({ error: 'Enter a valid email' }) }),
    );
  });

  protected readonly readonly = signal(false);

  protected readonly isLastNameRequired = computed(() =>
    this.form.lastName().property(REQUIRED)(),
  );

  private readonly firstName = computed(() => this.form.firstName().value());
  private readonly same = computed(() => this.form.same().value());
  private readonly married = computed(() => this.form.married().value());

  protected submit(): void {
    this.form.email().errors;
    submit(this.form, async () => {
      // TODO: Conditional remove data that has been hidden -> Can this be abstracted into a function?
      console.log('Submitted', this.model());
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
          spouse: { income: NaN, abn: '' },
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
  path: FieldPath<TValue, TPathKind>,
  {
    message,
    when = () => true,
  }: Partial<{
    message: string;
    when: NoInfer<LogicFn<TValue, boolean, TPathKind>>;
  }>,
): void {
  aggregateProperty(path, REQUIRED, when);
  validate(path, (context) =>
    when(context) && typeof context.value() !== 'boolean'
      ? customError({ kind: 'required', message })
      : null,
  );
}

type Spouse = {
  income: number;
  abn: string;
};

const spouseSchema = schema<Spouse>((path) => {
  required(path.income, { message: 'Spouse income is required' });
  min(path.income, 1, { message: 'Minium income is 1' });
  required(path.abn, { message: 'ABN is required' });
  minLength(path.abn, 11, { message: 'ABN is too short' });
});

function validatePostcode<TPathKind extends PathKind = PathKind.Root>(
  path: FieldPath<string, TPathKind>,
) {
  validateAsync(path, {
    params: ({ value }) => {
      return value().length === 4 ? value() : undefined;
    },
    factory: (params) =>
      resource({
        params,
        loader: ({ params }) =>
          params ? isValidPostcode(params) : Promise.resolve(true),
      }),
    errors: (result) =>
      result
        ? null
        : customError({ kind: 'invalid', message: 'Postcode does not exist' }),
  });
}

async function isValidPostcode(postcode: string) {
  const validPostcodes = new Set(['3121', '3000', '2000', '1000']);
  console.log('Validating', postcode);
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  return validPostcodes.has(postcode);
}
