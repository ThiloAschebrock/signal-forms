# AGENTS.md

Development guidelines for this Angular 22 signals-based forms application using zoneless change detection.

## Build, Lint & Test Commands

```bash
pnpm start              # Start dev server (http://localhost:4200)
pnpm run build          # Production build to dist/signal-forms
pnpm test               # Run all tests once (ng test with Vitest in Chromium)
pnpm run tsc            # Type-check
pnpm run lint           # Lint with oxlint and ESLint
pnpm run lint:fix       # Lint and apply fixes
pnpm run format         # Format all files with oxfmt
pnpm run format:check   # Check formatting
pnpm run test:all       # Type-check, lint, format check and test
```

Browser tests need Playwright's Chromium. Run `pnpm exec playwright install chromium` after installing or updating Playwright.

### Running Single Tests

Run tests through `ng test`, not plain `vitest`, so the Angular test environment and `src/test-providers.ts` are set up.

```bash
# Run a single test file
pnpm test --include src/app/form/form.component.spec.ts

# Run tests whose name matches a pattern (pnpm would treat a plain --filter as its own flag)
pnpm ng test --watch=false --filter "should work"

# Run in watch mode with a file filter
pnpm ng test --include src/app/form/form.component.spec.ts
```

### Tooling

- Lint: oxlint (type-aware, including `typescript/no-deprecated`) followed by ESLint (angular-eslint)
- Git hooks (lefthook): pre-commit formats and lints staged files; pre-push runs `tsc` and tests

## Project Architecture

This project demonstrates Angular's modern reactive forms with signals:

- **Zoneless change detection** (Angular's default since v21, no provider needed)
- **Signals-based forms** using `@angular/forms/signals` (not `@angular/forms`)
- **Async validation** with TanStack Query (`queryOptions`, `resource`)
- **UI components** from `@allianz/ng-aquila` (Allianz design system)

## Code Style Guidelines

### Imports

- Group by type: Angular Core → Angular Common → Third-party → Internal
- Use named imports for better tree-shaking
- Example:
  ```ts
  import { Component, signal, computed } from '@angular/core';
  import { FormField, required } from '@angular/forms/signals';
  import { NxButtonComponent } from '@allianz/ng-aquila/button';
  import { z } from 'zod';
  import { ErrorPipe } from '../shared/error-pipe';
  ```

### Angular Component Setup

- All components are standalone (no NgModules)
- Use `@Service()` for services, or `@Service({ autoProvided: false })` for manually provided ones; `@Injectable` is disallowed by lint
- Keep decorator keys in angular-eslint's `sort-keys-in-type-decorator` order (auto-fixable with `pnpm run lint:fix`)
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

- This is a zoneless application (Angular's default; don't add `provideZoneChangeDetection()`)
- Use `untracked(() => { ... })` in effects to prevent signal dependencies
- Inject `ChangeDetectorRef` and call `.detectChanges()` in effects when form fields need manual reactivity (e.g., after submit/reset)
- Wrap form field access in effect: `protected readonly triggerChangeWhenTouchedEffect = effect(() => { this.formField()().touched(); })`

### Form Handling

- Use `@angular/forms/signals` for reactive forms
- Use `FormField` and `FieldTree` types for form controls
- Create schemas with `schema<T>((path) => { ... })` as static properties
- Validation functions: `required()`, `minLength()`, `maxLength()`, `min()`, `max()`
- Async validation with `validateAsync()` and `resource()` with TanStack Query; debounce it with its `debounce: ms` option
- Conditional validation: use `when` in validation functions sync or async
- Hide/show fields: use `hidden(path, { when })` or `readonly(path, { when })`; omit `when` to always apply. Passing the condition function directly is deprecated
- Use `hiddenWithReset(path, resetValue, { when })` to hide a field and reset its value when its condition becomes true

### Naming Conventions

- Components: PascalCase (e.g., `FormComponent`, `InputWithCharacterCount`)
- Signals: camelCase with `readonly`/`protected`/`private` prefixes
- Functions: camelCase (e.g., `isValidPostcode`)
- Types/interfaces: PascalCase (e.g., `FamilyMember`)
- Schemas: camelCase with a `Schema` suffix (e.g., `spouseSchema`)
- Constants: UPPER_SNAKE_CASE (e.g., metadata keys like `RESET_WHEN`)

### Error Handling

Async validation setup:

- Throw errors in validator functions
- Handle errors in `validateAsync` `onError` callback
- Error object shape: `{ kind: string, message: string }`, e.g. `kind: 'validation'` for failed requests and `kind: 'invalid'` for invalid values

For form UI errors:

- Use `ErrorPipe` to show a field's error; it prefers the first error that has a message
- Access errors via `form.field().errors()` array

### Testing

Framework:

- Use Vitest browser mode (Chromium via Playwright) with `@testing-library/angular`
- Use `describe`, `it`, `expect` from `vitest`
- Tests use async/await with page assertions: `await expect.element(input).toBeValid()`
- Locators match text exactly by default; pass `{ exact: false }` for partial matches

Test setup:

- Shared providers for every spec live in `src/test-providers.ts` (date locale, ngx-mask)
- Provide component-specific dependencies: `providers: [provideTanStackQuery(() => new QueryClient())]`
- Use `render()` from `@testing-library/angular/zoneless`
- Access DOM elements with `page` from `vitest/browser`: `page.getByRole()`, `page.getByLabelText()`, etc.

### Styling

- SCSS with BEM-ish naming
- Aquila theme and utility CSS are registered globally in `angular.json`; don't import them per component
