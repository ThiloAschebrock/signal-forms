import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, hidden } from '@angular/forms/signals';
import { describe, expect, it } from 'vitest';
import { hiddenWithReset } from './hidden-with-reset';

describe('hiddenWithReset', () => {
  it('resets a field when it becomes hidden and keeps it hidden in the form state', () => {
    const model = signal({ showDetails: true, details: 'original' });
    const formTree = TestBed.runInInjectionContext(() =>
      form(model, (path) => {
        hiddenWithReset(path.details, '(hidden)', {
          when: (context) => !context.valueOf(path.showDetails),
        });
      }),
    );

    TestBed.tick();
    expect(formTree.details().hidden()).toBe(false);
    expect(formTree.details().value()).toBe('original');

    formTree.showDetails().value.set(false);
    TestBed.tick();
    expect(formTree.details().hidden()).toBe(true);
    expect(formTree.details().value()).toBe('(hidden)');
    expect(model().details).toBe('(hidden)');

    formTree.showDetails().value.set(true);
    TestBed.tick();
    expect(formTree.details().hidden()).toBe(false);
    expect(formTree.details().value()).toBe('(hidden)');
  });

  it('resets an initially hidden array and again after it is shown and changed', () => {
    const model = signal({ showMembers: false, members: ['first'], name: 'kept' });
    const formTree = TestBed.runInInjectionContext(() =>
      form(model, (path) => {
        hiddenWithReset(path.members, [], {
          when: (context) => !context.valueOf(path.showMembers),
        });
      }),
    );

    TestBed.tick();
    expect(formTree.members().hidden()).toBe(true);
    expect(model()).toEqual({ showMembers: false, members: [], name: 'kept' });

    formTree.showMembers().value.set(true);
    formTree.members().value.set(['second']);
    TestBed.tick();
    expect(formTree.members().value()).toEqual(['second']);

    formTree.showMembers().value.set(false);
    TestBed.tick();
    expect(model()).toEqual({ showMembers: false, members: [], name: 'kept' });
  });

  it('always hides and resets the field when no condition is given', () => {
    const model = signal({ details: 'original' });
    const formTree = TestBed.runInInjectionContext(() =>
      form(model, (path) => {
        hiddenWithReset(path.details, '');
      }),
    );

    TestBed.tick();
    expect(formTree.details().hidden()).toBe(true);
    expect(model().details).toBe('');
  });

  it('does not reset when the field is hidden for another reason', () => {
    const model = signal({
      showDetails: true,
      hideForOtherReason: false,
      address: { show: true, street: 'original' },
      details: 'original',
    });
    const formTree = TestBed.runInInjectionContext(() =>
      form(model, (path) => {
        hiddenWithReset(path.details, '(hidden)', {
          when: (context) => !context.valueOf(path.showDetails),
        });
        hidden(path.details, { when: (context) => context.valueOf(path.hideForOtherReason) });
        hidden(path.address, { when: (context) => !context.valueOf(path.address.show) });
        hiddenWithReset(path.address.street, '(hidden)', {
          when: (context) => !context.valueOf(path.showDetails),
        });
      }),
    );

    formTree.hideForOtherReason().value.set(true);
    formTree.address.show().value.set(false);
    TestBed.tick();
    expect(formTree.details().hidden()).toBe(true);
    expect(formTree.address.street().hidden()).toBe(true);
    expect(model().details).toBe('original');
    expect(model().address.street).toBe('original');
  });
});
