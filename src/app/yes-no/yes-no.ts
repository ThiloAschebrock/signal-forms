import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import {
  NxCircleToggleComponent,
  NxCircleToggleGroupComponent,
} from '@allianz/ng-aquila/circle-toggle';
import { Field, FieldTree } from '@angular/forms/signals';
import { NxErrorComponent, NxLabelComponent } from '@allianz/ng-aquila/base';

@Component({
  selector: 'app-yes-no',
  imports: [
    NxCircleToggleComponent,
    NxCircleToggleGroupComponent,
    Field,
    NxErrorComponent,
    NxLabelComponent,
  ],
  templateUrl: './yes-no.html',
  styleUrl: './yes-no.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YesNo {
  readonly field = input.required<FieldTree<boolean | null>>();

  private readonly changeDetectionRef = inject(ChangeDetectorRef);

  protected markDirty(): void {
    // Workaround as this is not happning out of the box
    this.field()().markAsDirty();
  }

  // This is required show and hide and errors when submit/reset was triggered
  protected readonly triggerChangeWhenTouchedEffect = effect(() => {
    this.field()().touched();
    this.field()().valid();

    untracked(() => this.changeDetectionRef.detectChanges());
  });
}
