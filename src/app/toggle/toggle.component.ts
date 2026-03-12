import { NxErrorComponent, NxLabelComponent } from '@allianz/ng-aquila/base';
import {
  NxCircleToggleComponent,
  NxCircleToggleGroupComponent,
} from '@allianz/ng-aquila/circle-toggle';
import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';

@Component({
  selector: 'app-toggle',
  imports: [
    NxCircleToggleComponent,
    NxCircleToggleGroupComponent,
    NxErrorComponent,
    NxLabelComponent,
  ],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent implements FormValueControl<boolean | null> {
  readonly value = model<boolean | null>(null);
  readonly label = input.required<string>();
  readonly touched = model<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly dirty = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  protected readonly showError = computed(() => this.touched() && !!this.errors().length);
}
