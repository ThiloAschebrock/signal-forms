import { NxErrorComponent } from '@allianz/ng-aquila/base';
import { NxButtonComponent } from '@allianz/ng-aquila/button';
import {
  NxFormfieldComponent,
  NxFormfieldErrorDirective,
  NxFormfieldPrefixDirective,
} from '@allianz/ng-aquila/formfield';
import { NxInputDirective } from '@allianz/ng-aquila/input';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import { FormField, FieldTree, max, min, required, schema } from '@angular/forms/signals';
import { NgxMaskDirective } from 'ngx-mask';

export type FamilyMember = { name: string; income: number | null };

@Component({
  selector: 'app-family-members',
  imports: [
    FormField,
    NgxMaskDirective,
    NxButtonComponent,
    NxErrorComponent,
    NxFormfieldComponent,
    NxFormfieldErrorDirective,
    NxFormfieldPrefixDirective,
    NxInputDirective,
  ],
  templateUrl: './family-members.component.html',
  styleUrl: './family-members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FamilyMembers {
  static readonly schema = schema<FamilyMember>((path) => {
    required(path.name, { message: 'Family member name is required.' });
    required(path.income, { message: 'Family member income is required.' });
    min(path.income, 1, { message: 'Income must be greater than zero.' });
    max(path.income, 100_000, { message: 'Income must be less than $100,000' });
  });

  private readonly changeDetectionRef = inject(ChangeDetectorRef);

  readonly formField = input.required<FieldTree<FamilyMember[]>>();
  readonly lastRemoved = output<void>();

  // This is required show and hide and errors when submit/reset was triggered
  protected readonly triggerChangeWhenTouchedEffect = effect(() => {
    this.formField()().touched();
    this.formField()().valid();

    untracked(() => this.changeDetectionRef.detectChanges());
  });

  protected readonly addFamilyMembersEffect = effect(() => {
    if (!this.formField()().hidden()) {
      return;
    }

    if (this.formField()().value().length) {
      return;
    }

    untracked(() => {
      this.addFamilyMember();
    });
  });

  protected error = computed(() => {
    const errors = this.formField()().errors();
    const touched = this.formField()().touched();
    if (!touched) {
      return undefined;
    }

    return errors.at(0)?.message;
  });

  protected addFamilyMember(): void {
    this.formField()().value.update((members) => [...members, { name: '', income: null }]);
  }

  protected removeFamilyMember(indexToRemove: number): void {
    this.formField()().value.update((members) =>
      members.filter((__values, index) => index !== indexToRemove),
    );

    if (!this.formField()().value().length) {
      this.lastRemoved.emit();
    }
  }
}
