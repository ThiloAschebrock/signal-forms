import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, hidden, required } from '@angular/forms/signals';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackErrorState } from './error-state-tracker';

describe('trackErrorState', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('tracks errors for touched invalid fields', () => {
    const formTree = TestBed.runInInjectionContext(() =>
      form(signal({ email: '' }), (path) => {
        required(path.email, { message: 'Email is required' });
      }),
    );
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    formTree.email().markAsTouched();
    const tracker = TestBed.runInInjectionContext(() => trackErrorState(formTree));
    TestBed.tick();

    expect(consoleWarn).toHaveBeenCalledWith(
      'Showing form field error for field "email": Email is required',
    );

    tracker.destroy();
  });

  it('does not track errors for untouched fields', () => {
    const formTree = TestBed.runInInjectionContext(() =>
      form(signal({ email: '' }), (path) => {
        required(path.email, { message: 'Email is required' });
      }),
    );
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const tracker = TestBed.runInInjectionContext(() => trackErrorState(formTree));
    TestBed.tick();

    expect(consoleWarn).not.toHaveBeenCalled();

    tracker.destroy();
  });

  it('omits hidden fields from validation and the tracked error summary', () => {
    const formTree = TestBed.runInInjectionContext(() =>
      form(signal({ email: '', internalReference: '' }), (path) => {
        required(path.email, { message: 'Email is required' });
        required(path.internalReference, { message: 'Internal reference is required' });
        hidden(path.internalReference, { when: () => true });
      }),
    );
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    formTree.email().markAsTouched();
    formTree.internalReference().markAsTouched();

    expect(formTree.internalReference().errors()).toEqual([]);
    expect(formTree().errorSummary()).toEqual([
      expect.objectContaining({ message: 'Email is required' }),
    ]);

    const tracker = TestBed.runInInjectionContext(() => trackErrorState(formTree));
    TestBed.tick();

    expect(consoleWarn).toHaveBeenCalledWith(
      'Showing form field error for field "email": Email is required',
    );
    expect(consoleWarn).not.toHaveBeenCalledWith(
      'Showing form field error for field "internalReference": Internal reference is required',
    );

    tracker.destroy();
  });
});
