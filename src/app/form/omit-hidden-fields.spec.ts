import { describe, expect, it } from 'vitest';
import { linkedSignal, signal } from '@angular/core';
import { form, hidden, schema } from '@angular/forms/signals';
import { compatForm } from '@angular/forms/signals/compat';
import { omitHiddenFields } from './omit-hidden-fields';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

describe('omitHiddenFields', () => {
  it('should return value for a primitive field', () => {
    const formTree = TestBed.runInInjectionContext(() => form(signal<string>('test')));
    const result = omitHiddenFields(formTree);
    expect(result).toBe('test');
  });

  it('should omit hidden top-level primitive field', () => {
    const formTree = TestBed.runInInjectionContext(() =>
      form(signal<string>('test'), (path) => {
        hidden(path, () => true);
      }),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toBeUndefined();
  });

  it('should return undefined for hidden number field', () => {
    const formTree = TestBed.runInInjectionContext(() =>
      form(signal<number>(42), (path) => {
        hidden(path, () => true);
      }),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toBeUndefined();
  });

  it('should return undefined for hidden boolean field', () => {
    const formTree = TestBed.runInInjectionContext(() =>
      form(signal<boolean>(true), (path) => {
        hidden(path, () => true);
      }),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toBeUndefined();
  });

  it('should return value for number field', () => {
    const formTree = TestBed.runInInjectionContext(() => form(signal<number>(42)));
    const result = omitHiddenFields(formTree);
    expect(result).toBe(42);
  });

  it('should return value for boolean field', () => {
    const formTree = TestBed.runInInjectionContext(() => form(signal<boolean>(true)));
    const result = omitHiddenFields(formTree);
    expect(result).toBe(true);
  });

  it('should include all fields when none are hidden', () => {
    interface TestForm {
      name: string;
      age: number;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(signal({ name: 'John', age: 30 })),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      name: 'John',
      age: 30,
    });
  });

  it('should omit hidden field from form', () => {
    interface TestForm {
      name: string;
      age: number;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(signal({ name: 'John', age: 30 }), (path) => {
        hidden(path.age, () => true);
      }),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      name: 'John',
    });
    expect(result).not.toHaveProperty('age');
  });

  it('should omit multiple hidden fields', () => {
    interface TestForm {
      name: string;
      age: number;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(signal({ name: 'John', age: 30 }), (path) => {
        hidden(path.name, () => true);
        hidden(path.age, () => true);
      }),
    );
    const result = omitHiddenFields(formTree) as Partial<TestForm>;
    expect(result).toEqual({});
  });

  it('should include all fields in nested object when none are hidden', () => {
    interface Address {
      street: string;
      city: string;
    }
    interface TestForm {
      name: string;
      address: Address;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(
        signal({
          name: 'John',
          address: { street: '123 Main St', city: 'New York' },
        }),
      ),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      name: 'John',
      address: { street: '123 Main St', city: 'New York' },
    });
  });

  it('should omit hidden field in nested object', () => {
    interface Address {
      street: string;
      city: string;
    }
    interface TestForm {
      name: string;
      address: Address;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(
        signal({
          name: 'John',
          address: { street: '123 Main St', city: 'New York' },
        }),
        (path) => {
          hidden(path.address.city, () => true);
        },
      ),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      name: 'John',
      address: { street: '123 Main St' },
    });
  });

  it('should omit entire nested object when all fields are hidden', () => {
    interface Address {
      street: string;
      city: string;
    }
    interface TestForm {
      name: string;
      address: Address;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(
        signal({
          name: 'John',
          address: { street: '123 Main St', city: 'New York' },
        }),
        (path) => {
          hidden(path.address.street, () => true);
          hidden(path.address.city, () => true);
        },
      ),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      name: 'John',
      address: {},
    });
  });

  it('should handle mixed hidden states at different nesting levels', () => {
    interface Address {
      street: string;
      city: string;
      zip: string;
    }
    interface TestForm {
      firstName: string;
      lastName: string;
      address: Address;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(
        signal({
          firstName: 'John',
          lastName: 'Doe',
          address: { street: '123 Main St', city: 'New York', zip: '10001' },
        }),
        (path) => {
          hidden(path.lastName, () => true);
          hidden(path.address.city, () => true);
        },
      ),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      firstName: 'John',
      address: { street: '123 Main St', zip: '10001' },
    });
  });

  it('should handle deep nesting with hidden fields at various levels', () => {
    interface Contact {
      phone: string;
      email: string;
    }
    interface Address {
      street: string;
      city: string;
      contact: Contact;
    }
    interface TestForm {
      name: string;
      address: Address;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(
        signal({
          name: 'John',
          address: {
            street: '123 Main St',
            city: 'New York',
            contact: { phone: '555-1234', email: 'john@example.com' },
          },
        }),
        (path) => {
          hidden(path.address.street, () => true);
          hidden(path.address.contact.email, () => true);
        },
      ),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      name: 'John',
      address: {
        city: 'New York',
        contact: { phone: '555-1234' },
      },
    });
  });

  it('should handle optional nested fields', () => {
    interface Address {
      street: string;
      city: string;
    }
    interface TestForm {
      name: string;
      address?: Address;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(
        signal({
          name: 'John',
          address: { street: '123 Main St', city: 'New York' },
        }),
      ),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      name: 'John',
      address: { street: '123 Main St', city: 'New York' },
    });
  });

  it('should return value of FormControl when using compat form', () => {
    interface TestForm {
      name: string;
      age: number;
    }
    const model = signal({ name: 'John', age: new FormControl(30) });
    const formTree = TestBed.runInInjectionContext(() => compatForm(model));
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      name: 'John',
      age: 30,
    });
  });

  it('should omit hidden array field', () => {
    interface TestForm {
      names: string[];
      age: number;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(signal({ names: ['John', 'Jane'], age: 30 }), (path) => {
        hidden(path.names, () => true);
      }),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      age: 30,
    });
    expect(result).not.toHaveProperty('names');
  });

  it('should include all array items when array is not hidden', () => {
    interface TestForm {
      names: string[];
      age: number;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(signal({ names: ['John', 'Jane'], age: 30 })),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      names: ['John', 'Jane'],
      age: 30,
    });
  });

  it('should handle object with numeric keys as object not array', () => {
    interface TestForm {
      data: Record<string, string>;
      age: number;
    }
    const formTree = TestBed.runInInjectionContext(() =>
      form<TestForm>(
        signal({
          data: { 1: 'one', 2: 'two' } as Record<string, string>,
          age: 30,
        }),
      ),
    );
    const result = omitHiddenFields(formTree);
    expect(result).toEqual({
      data: { 1: 'one', 2: 'two' },
      age: 30,
    });
    expect(result && 'data' in result && !Array.isArray(result.data)).toBe(true);
  });
});
