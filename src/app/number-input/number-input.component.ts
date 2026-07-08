import { NxErrorComponent } from '@allianz/ng-aquila/base';
import {
  NxFormfieldComponent,
  NxFormfieldErrorDirective,
  NxFormfieldPrefixDirective,
} from '@allianz/ng-aquila/formfield';
import { NxInputDirective } from '@allianz/ng-aquila/input';
import { booleanAttribute, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import {
  maskitoNumber,
  MaskitoNumberParams,
  maskitoParseNumber,
  maskitoStringifyNumber,
} from '@maskito/kit';
import { MaskitoDirective } from '@maskito/angular';
import { ErrorPipe } from '../shared/error-pipe';
import { ErrorStateBridge, provideErrorStateBridge } from '../core/error-state-bridge';

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
  providers: [provideErrorStateBridge(NumberInputComponent)],
})
export class NumberInputComponent
  extends ErrorStateBridge
  implements FormValueControl<number | null>
{
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

  protected handelValueChange(value: string): void {
    const numericValue = maskitoParseNumber(value, this.numberConfig());
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

  protected readonly maskitoOptions = computed(() => maskitoNumber(this.numberConfig()));
}
