import { NxErrorComponent, NxLabelComponent } from '@allianz/ng-aquila/base';
import {
  NxCircleToggleComponent,
  NxCircleToggleGroupComponent,
} from '@allianz/ng-aquila/circle-toggle';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import {
  FormValueControl,
  ValidationError,
  WithOptionalField,
} from '@angular/forms/signals';

@Component({
  selector: 'app-toggle',
  imports: [
    NxCircleToggleComponent,
    NxCircleToggleGroupComponent,
    NxErrorComponent,
    NxLabelComponent,
  ],
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toggle implements FormValueControl<boolean | undefined> {
  readonly value = model<boolean | undefined>();
  readonly label = input.required<string>();
  readonly touched = model<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly dirty = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  protected readonly showError = computed(
    () => this.touched() && !!this.errors().length,
  );

  protected markAsTouched() {
    this.touched.set(true);
  }
}
