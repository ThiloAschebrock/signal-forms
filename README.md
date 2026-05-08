# Testing Signal Forms

https://github.com/angular/angular/blob/prototype/signal-forms/packages/forms/signals/docs/signal-forms.md

## TODO

- [x] Regular validation
- [x] Custom validator
- [x] Conditional validation
- [x] Disabled the hole state on condition
- [x] Optional fields on the model (MaybeField)
- [x] Hide inputs
- [x] Readonly inputs
- [x] Conditionally sync values
- [x] Extracting into simple input component by passing control
- [x] Extracting into simple input component by implementing FormValueControl
- [x] Extracting into complex input components
- [x] Min and max validation
- [x] Length validation
- [x] Validation with Zod
- [x] Async validation on a single input field
- [x] Async validation on submit
- [x] Date inputs with build-in validators
- [x] Dropdowns
- [x] Autocomplete -> Not yet working well, especially if the full option needs to be stored
- [x] NxMask, e.g., for ABN: works, however, no mask validation
- [x] ngxmask for numbers: works
- [x] Try filtering hidden inputs on submit
- [x] Try new debounce option
- [x] Try new compatForm with datepicker
- [x] Try to focus first input with error
- [x] Try maskito -> Nice, found one bug - it's half the bundle size, but usage is a complicated
- [ ] Autocomplete supporting string inputs as well
- [ ] Autocomplete with query - can this be abstracted?
- [x] Number input component that works with number
- [x] Tracking form value errors only when visible
- [x] Can we derive the tracking id from the fieldTree Name?
- [x] Are protected inputs now possible? At least the language server is blocking it

## What's not working

1. Required validator does not allow `false`, which is in conflict with the current old required validation and an issue when using it with a nullable boolean, e.g., when a yes-no selection is required. -> https://github.com/angular/angular/issues/63624 (Closed as not planned)
   - Work-around: One can implement their own custom validator
2. NDBX components with field inputs do not update when the submitted status changes (e.g., when submitted or reset), unless one is listing to `touched`, e.g., by logging it in the template, or implements an effect to trigger change detection.
3. Datepicker: Resetting the input to null does not work, only '' works -> Can this be reproduced with Angular Material?
4. Debounced values do not automatically contribute to pending state -> one can use async validator
5. Compat fields are not disabled when parent is disabled
6. ngmask output transform is working different (it's always returning string even it the number is converted to number - strange but "works"). An alternative could be Maskito.
7. Oxfmt does not format TS in HTML unless the component is suffixed with component.html, see https://github.com/oxc-project/oxc/issues/17852
8. nx-brand-kit: The label is only moving the position delayed
9. Maskito for Angular only works with strings
10. Focusing first control does not work with NDBX natively
