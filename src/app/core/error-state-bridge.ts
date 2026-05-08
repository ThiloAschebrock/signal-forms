import { ErrorStateMatcher } from '@allianz/ng-aquila/utils';
import {
  computed,
  ChangeDetectorRef,
  effect,
  untracked,
  inject,
  InputSignalWithTransform,
  Provider,
  forwardRef,
} from '@angular/core';

export abstract class ErrorStateBridge implements ErrorStateMatcher {
  public abstract readonly touched: InputSignalWithTransform<boolean, unknown>;
  public abstract readonly invalid: InputSignalWithTransform<boolean, unknown>;

  public readonly isErrorState = computed(() => this.invalid() && this.touched());

  protected readonly changeDetectionRef = inject(ChangeDetectorRef);

  protected readonly triggerChangeWhenInErrorStateEffect = effect(() => {
    this.isErrorState();

    untracked(() => this.changeDetectionRef.detectChanges());
  });
}

export function provideErrorStateBridge(bridge: typeof ErrorStateBridge): Provider {
  return { provide: ErrorStateMatcher, useExisting: forwardRef(() => bridge) };
}
