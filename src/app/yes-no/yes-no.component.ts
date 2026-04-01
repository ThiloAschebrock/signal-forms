import { ChangeDetectorRef, Component, effect, inject, input, untracked } from '@angular/core';
import {
  NxCircleToggleComponent,
  NxCircleToggleGroupComponent,
} from '@allianz/ng-aquila/circle-toggle';
import { FormField, FieldTree } from '@angular/forms/signals';
import { NxErrorComponent, NxLabelComponent } from '@allianz/ng-aquila/base';

@Component({
  selector: 'app-yes-no',
  imports: [
    FormField,
    NxCircleToggleComponent,
    NxCircleToggleGroupComponent,
    NxErrorComponent,
    NxLabelComponent,
  ],
  templateUrl: './yes-no.component.html',
  styleUrl: './yes-no.component.scss',
})
export class YesNoComponent {
  readonly formField = input.required<FieldTree<boolean | null>>();

  private readonly changeDetectionRef = inject(ChangeDetectorRef);

  // This is required show and hide and errors when submit/reset was triggered
  protected readonly triggerChangeWhenTouchedEffect = effect(() => {
    this.formField()().touched();
    this.formField()().valid();

    untracked(() => this.changeDetectionRef.detectChanges());
  });
}
