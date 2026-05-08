import { NxErrorComponent, NxLabelComponent } from '@allianz/ng-aquila/base';
import {
  NxCircleToggleComponent,
  NxCircleToggleGroupComponent,
} from '@allianz/ng-aquila/circle-toggle';
import { booleanAttribute, Component, input, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { ErrorPipe } from '../shared/error-pipe';
import { FormsModule } from '@angular/forms';
import { ErrorStateBridge, provideErrorStateBridge } from '../core/error-state-bridge';

@Component({
  selector: 'app-toggle',
  imports: [
    ErrorPipe,
    FormsModule,
    NxCircleToggleComponent,
    NxCircleToggleGroupComponent,
    NxErrorComponent,
    NxLabelComponent,
  ],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
  providers: [provideErrorStateBridge(ToggleComponent)],
})
export class ToggleComponent extends ErrorStateBridge implements FormValueControl<boolean | null> {
  readonly value = model<boolean | null>(null);
  readonly label = input.required<string>();

  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly touched = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly pending = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
}
