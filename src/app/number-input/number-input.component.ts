import { NxErrorComponent } from '@allianz/ng-aquila/base';
import {
  NxFormfieldComponent,
  NxFormfieldErrorDirective,
  NxFormfieldPrefixDirective,
} from '@allianz/ng-aquila/formfield';
import { NxInputDirective } from '@allianz/ng-aquila/input';
import {
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import {
  maskitoNumberOptionsGenerator,
  MaskitoNumberParams,
  maskitoParseNumber,
  maskitoStringifyNumber,
} from '@maskito/kit';
import { MaskitoDirective } from '@maskito/angular';
import { ErrorPipe } from '../error-pipe';
import { ErrorStateMatcher } from '@allianz/ng-aquila/utils';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrl: './number-input.component.scss',
  imports: [
    ErrorPipe,
    FormsModule,
    MaskitoDirective,
    NxErrorComponent,
    NxFormfieldComponent,
    NxFormfieldErrorDirective,
    NxFormfieldPrefixDirective,
    NxInputDirective,
  ],
  providers: [{ provide: ErrorStateMatcher, useExisting: forwardRef(() => NumberInputComponent) }],
})
export class NumberInputComponent implements FormValueControl<number | null>, ErrorStateMatcher {
  readonly value = model.required<number | null>();
  readonly label = input.required<string>();
  readonly fractionDigits = input(0);

  readonly controlValue = computed(() => maskitoStringifyNumber(this.value(), this.numberConfig()));

  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly touched = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly pending = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly min = input<number>();
  readonly max = input<number>();

  readonly touch = output();

  public readonly isErrorState = computed(() => this.invalid() && this.touched());

  private readonly changeDetectionRef = inject(ChangeDetectorRef);

  protected readonly triggerChangeWhenInErrorStateEffect = effect(() => {
    this.isErrorState();

    untracked(() => this.changeDetectionRef.detectChanges());
  });

  protected handelValueChange(value: string): void {
    const numericValue = maskitoParseNumber(value ?? '', this.numberConfig());
    this.value.set(isNaN(numericValue) ? null : numericValue);
  }

  protected handleBlur(): void {
    this.touch.emit();
  }

  private readonly numberConfig = computed<MaskitoNumberParams>(() => {
    const fractionDigits = this.fractionDigits();

    return {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      max: this.max(),
      decimalSeparator: '.',
      thousandSeparator: ',',
    };
  });

  protected readonly maskitoOptions = computed(() =>
    maskitoNumberOptionsGenerator(this.numberConfig()),
  );
}
