import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  input,
  inject,
  untracked,
} from '@angular/core';
import { FormField, FieldTree } from '@angular/forms/signals';
import { NxErrorComponent } from '@allianz/ng-aquila/base';
import { NxFormfieldComponent, NxFormfieldErrorDirective } from '@allianz/ng-aquila/formfield';
import { NxDropdownComponent, NxDropdownItemComponent } from '@allianz/ng-aquila/dropdown';
import { ErrorPipe } from '../error-pipe';

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown',
  imports: [
    ErrorPipe,
    FormField,
    NxDropdownComponent,
    NxDropdownItemComponent,
    NxErrorComponent,
    NxFormfieldComponent,
    NxFormfieldErrorDirective,
  ],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dropdown {
  readonly formField = input.required<FieldTree<string>>();

  readonly options = input.required<DropdownOption[]>();
  readonly placeholder = input<string>('');
  readonly label = input.required<string>();

  private readonly changeDetectionRef = inject(ChangeDetectorRef);

  protected readonly triggerChangeWhenTouchedEffect = effect(() => {
    this.formField()().touched();
    this.formField()().valid();

    untracked(() => this.changeDetectionRef.detectChanges());
  });
}
