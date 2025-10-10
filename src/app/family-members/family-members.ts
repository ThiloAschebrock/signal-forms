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
import {
  Control,
  FieldTree,
  max,
  min,
  required,
  schema,
} from '@angular/forms/signals';
import { NgxMaskDirective } from 'ngx-mask';

export type FamilyMember = { name: string; income: number };

@Component({
  selector: 'app-family-members',
  imports: [
    NxFormfieldComponent,
    NxFormfieldPrefixDirective,
    NxInputDirective,
    NgxMaskDirective,
    NxErrorComponent,
    Control,
    NxButtonComponent,
    NxFormfieldErrorDirective,
  ],
  templateUrl: './family-members.html',
  styleUrl: './family-members.scss',
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

  readonly control = input.required<FieldTree<FamilyMember[]>>();
  readonly lastRemoved = output<void>();

  // This is required show and hide and errors when submit/reset was triggered
  protected readonly triggerChangeWhenTouchedEffect = effect(() => {
    this.control()().touched();
    this.control()().valid();

    untracked(() => this.changeDetectionRef.detectChanges());
  });

  protected readonly addFamilyMembersEffect = effect(() => {
    if (!this.control()().hidden()) {
      return;
    }

    if (this.control()().value().length) {
      return;
    }

    untracked(() => {
      this.addFamilyMember();
    });
  });

  protected error = computed(() => {
    const errors = this.control()().errors();
    const touched = this.control()().touched();
    if (!touched) {
      return undefined;
    }

    return errors.at(0)?.message;
  });

  protected addFamilyMember(): void {
    this.control()().value.update((members) => [
      ...members,
      { name: '', income: NaN },
    ]);
  }

  protected removeFamilyMember(indexToRemove: number): void {
    this.control()().value.update((members) =>
      members.filter((__values, index) => index !== indexToRemove)
    );

    if (!this.control()().value().length) {
      console.log('Emit');
      this.lastRemoved.emit();
    }
  }
}
