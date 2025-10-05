import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import {
  form,
  Control,
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
  min,
  schema,
  apply,
  applyEach,
} from '@angular/forms/signals';
import { NxInputDirective } from '@allianz/ng-aquila/input';
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

@Component({
  selector: 'app-form',
  imports: [
    Control,
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
    birthday: string | null;
    married: boolean | null;
    employFamilyMembers: boolean | null;
    familyMembers: FamilyMember[];
    spouse: Spouse;
  }>({
    firstName: '',
    lastName: '',
    birthday: '1989-04-01',
    same: false,
    married: null,
    employFamilyMembers: null,
    spouse: { income: NaN, abn: '' },
    familyMembers: [],
  });
  protected readonly model = linkedSignal(this.initalState);
  protected readonly form = form(this.model, (path) => {
    disabled(path, () => this.form().submitting());
    readonly(path, () => this.readonly());
    required(path.birthday);
    required(path.lastName, {
      message: 'Last name is required when a first name was entered',
      when: ({ valueOf }) => !!valueOf(path.firstName).trim(),
    });
    readonly(path.lastName, ({ valueOf }) => valueOf(path.same));
    requireBoolean(path.married, { message: 'Answer if married' });

    hidden(path.spouse, ({ valueOf }) => !valueOf(path.married));
    apply(path.spouse, spouseSchema);

    requireBoolean(path.employFamilyMembers, {
      message: 'Answer if you employ family members',
    });
    hidden(
      path.familyMembers,
      ({ valueOf }) => !valueOf(path.employFamilyMembers)
    );
    applyEach(path.familyMembers, FamilyMembers.schema);

    requireBoolean(path.employFamilyMembers, {
      message: 'Answer if you employ family members',
      when: ({ valueOf }) => !!valueOf(path.married),
    });
  });

  protected readonly readonly = signal(false);

  protected readonly isLastNameRequired = computed(() =>
    this.form.lastName().property(REQUIRED)()
  );

  private readonly firstName = computed(() => this.form.firstName().value());
  private readonly same = computed(() => this.form.same().value());

  protected submit(): void {
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
  }>
): void {
  aggregateProperty(path, REQUIRED, when);
  validate(path, (context) =>
    when(context) && typeof context.value() !== 'boolean'
      ? customError({ kind: 'required', message })
      : null
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
