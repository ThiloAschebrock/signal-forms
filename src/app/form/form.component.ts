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
  max,
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
  NxFormfieldSuffixDirective,
} from '@allianz/ng-aquila/formfield';
import { NxErrorComponent } from '@allianz/ng-aquila/base';
import { NxButtonComponent } from '@allianz/ng-aquila/button';
import { NxMessageComponent } from '@allianz/ng-aquila/message';
import { NxCheckboxComponent } from '@allianz/ng-aquila/checkbox';
import { NxSpinnerComponent } from '@allianz/ng-aquila/spinner';
import { YesNo } from '../yes-no/yes-no';
import {
  NxCircleToggleComponent,
  NxCircleToggleGroupComponent,
} from '@allianz/ng-aquila/circle-toggle';
import { NxIsoDateModule } from '@allianz/ng-aquila/iso-date-adapter';
import { Toggle } from '../toggle/toggle';
import { NgxMaskDirective } from 'ngx-mask';
import { NxMaskDirective } from '@allianz/ng-aquila/mask';

@Component({
  selector: 'app-form',
  imports: [
    Control,
    JsonPipe,
    NxButtonComponent,
    NxCheckboxComponent,
    // NxCircleToggleComponent,
    // NxCircleToggleGroupComponent,
    NxDatefieldDirective,
    NxErrorComponent,
    NxFormfieldComponent,
    NxFormfieldErrorDirective,
    NxFormfieldHintDirective,
    NxFormfieldSuffixDirective,
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
    tooManyQuestions: boolean | null;
    spouse: {
      income: number;
      abn: string;
    };
  }>({
    firstName: '',
    lastName: '',
    birthday: '1989-04-04',
    same: false,
    married: null,
    tooManyQuestions: null,
    spouse: { income: NaN, abn: '' },
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
    requireBoolean(path.married, { message: 'Answer if married' });
    hidden(path.spouse, ({ valueOf }) => !valueOf(path.married));

    required(path.spouse.income, { message: 'Spouse income is required' });
    min(path.spouse.income, 1, { message: 'Minium income is 1' });

    required(path.spouse.abn, { message: 'ABN is required' });
    minLength(path.spouse.abn, 11, { message: 'ABN is too short' });

    requireBoolean(path.tooManyQuestions, {
      message: 'Answer if too many questions',
      when: ({ valueOf }) => !!valueOf(path.married),
    });
    readonly(path.lastName, ({ valueOf }) => valueOf(path.same));
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
    this.form.married().value.set(false);
    this.form.tooManyQuestions().value.set(false);
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
