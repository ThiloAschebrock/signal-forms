# AGENTS.md

Development guidelines for this Angular 21 signals-based forms application using zoneless change detection.

## Build, Lint & Test Commands

```bash
pnpm start              # Start dev server (http://localhost:4200)
pnpm run build          # Production build to dist/signal-forms
pnpm test              # Run all tests (Vitest with @testing-library/angular)
pnpm run test:watch    # Run tests in watch mode
pnpm run format        # Format all files with Prettier
```

### Running Single Tests

```bash
# Run a single test file
pnpm vitest src/app/form/form.component.spec.ts

# Run tests matching a pattern
pnpm exec vitest --run --grep "should work"

# Run in watch mode with file filter
pnpm exec vitest --watch form.component.spec.ts
```

## Project Architecture

This project demonstrates Angular's modern reactive forms with signals:

- **Zoneless change detection** via `provideZonelessChangeDetection()`
- **Signals-based forms** using `@angular/forms/signals` (not `@angular/forms`)
- **Async validation** with TanStack Query (`queryOptions`, `resource`)
- **Legacy forms integration** through `compatForm()`
- **UI components** from `@allianz/ng-aquila` (Allianz design system)

## Code Style Guidelines

### Imports

- Group by type: Angular Core → Angular Common → Third-party → Internal
- Use named imports for better tree-shaking
- Example:
  ```ts
  import { Component, signal, computed } from '@angular/core';
  import { z } from 'zod';
  import { FormField, required } from '@angular/forms/signals';
  import { NxButtonComponent } from '@allianz/ng-aquila/button';
  ```

### Angular Component Setup

- All components are standalone (no NgModules)
- Always use `ChangeDetectionStrategy.OnPush`
- Use `imports` array for dependencies, `styleUrl: './file.scss'` for styles
- Use `templateUrl: './file.html'` for templates
- Use `input.required<T>()` for required inputs, `input<T>(default)` for optional inputs
- Use `model<T>(default)` for two-way binding on custom components
- Prefer signal inputs/outputs over `@Input()`/`@Output()` decorators

### Type System

- All code is strict TypeScript (strict mode enabled)
- Use `readonly` prefix for signals: `readonly value = signal<T>(initial)`
- Computed signals: `computed(() => ...)`
- Effects: `effect(() => { ... })` - name descriptively

### Signals & Change Detection

- This is a zoneless application (`provideZonelessChangeDetection()`)
- Use `untracked(() => { ... })` in effects to prevent signal dependencies
- Inject `ChangeDetectorRef` and call `.detectChanges()` in effects when form fields need manual reactivity (e.g., after submit/reset)
- Wrap form field access in effect: `protected readonly triggerChangeWhenTouchedEffect = effect(() => { this.formField()().touched(); })`

### Form Handling

- Use `@angular/forms/signals` for reactive forms
- Use `FormField` and `FieldTree` types for form controls
- Create schemas with `schema<T>((path) => { ... })` as static properties
- Validation functions: `required()`, `minLength()`, `maxLength()`, `min()`, `max()`
- Async validation with `validateAsync()` and `resource()` with TanStack Query
- Use `compatForm()` to integrate with legacy reactive forms
- Use `debounce(path, ms)` for debounced validation
- Conditional validation: use `when` in validation functions sync or async
- Hide/show fields: use `hidden(path, condition)` or `readonly(path, condition)`

### Naming Conventions

- Components: PascalCase (e.g., `FormComponent`, `InputWithCharacterCount`)
- Signals: camelCase with `readonly`/`protected`/`private` prefixes
- Functions: camelCase (e.g., `isValidPostcode`)
- Types/interfaces: PascalCase (e.g., `FamilyMember`)
- Constants: UPPER_SNAKE_CASE for schemas (e.g., `spouseSchema`)

### Error Handling

Async validation setup:

- Throw errors in validator functions
- Handle errors in `validateAsync` `onError` callback
- Error object shape: `{ kind: 'validation' | 'invalid', message: string }`

For form UI errors:

- Use `@testing-library/angular` with `page` object for DOM assertions
- Use custom pipes like `ErrorPipe` to extract error messages from validation arrays
- Access errors via `form.field().errors()` array

### Testing

Framework:

- Use Vitest with `@testing-library/angular`
- Use `describe`, `it`, `expect` from `vitest`
- Tests use async/await with page assertions: `await expect.element(input).toBeValid()`

Test setup:

- Provide required dependencies: `providers: [provideQueryClient(new QueryClient())]`
- Use `render()` function from `@testing-library/angular`
- Access DOM elements with `page.getByRole()`, `page.getByLabelText()`, etc.

### Styling

- SCSS with BEM-ish naming
- Import styles from `@allianz/ng-aquila` for consistent theming
