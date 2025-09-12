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
  }>({
    firstName: '',
    lastName: '',
    birthday: '1989-04-04',
    same: false,
    married: null,
    tooManyQuestions: null,
  });
  protected readonly model = linkedSignal(this.initalState);
  protected readonly form = form(this.model, (path) => {
    disabled(path, () => this.isPending());
    readonly(path, () => this.readonly());
    required(path.birthday);
    required(path.lastName, {
      message: 'Last name is required when a first name was entered',
      when: ({ valueOf }) => !!valueOf(path.firstName).trim(),
    });
    requireNonNull(path.married, { message: 'Answer if married' });
    requireNonNull(path.tooManyQuestions, {
      message: 'Answer if too many questions',
      when: ({ valueOf }) => !!valueOf(path.married),
    });
    readonly(path.lastName, ({ valueOf }) => valueOf(path.same));
  });

  protected readonly isPending = signal(false);
  protected readonly readonly = signal(false);

  private readonly firstName = computed(() => this.form.firstName().value());
  private readonly same = computed(() => this.form.same().value());

  protected submit(): void {
    submit(this.form, async () => {
      this.isPending.set(true);
      console.log('Submitted', this.model());
      setTimeout(() => {
        this.isPending.set(false);
      }, 1_000);
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

function requireNonNull<TValue, TPathKind extends PathKind = PathKind.Root>(
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
    when(context) && context.value() === null
      ? customError({ kind: 'required', message })
      : null
  );
}
