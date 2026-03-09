# Testing Signal Forms

https://github.com/angular/angular/blob/prototype/signal-forms/packages/forms/signals/docs/signal-forms.md

## TODO

- [x] Regular validation
- [x] Custom validator
- [x] Conditional validation
- [x] Disabled the hole state on condtion
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
- [ ] Validation with Vest -> Vest does not implement standard schema and would require a custom validation function
- [x] Async validation on a single input field
- [ ] Async validation on submit
- [x] Date inputs with build-in validators
  - [x] Dropdowns
  - [ ] Autocomplete -> Not yet working well, especially if the full option needs to be stored
  - [x] NxMask, e.g., for ABN: works, however, no mask validation
- [x] ngxmask for numbers: works
- [ ] Try filtering hidden inputs on submit
- [x] Try new debounce option
- [x] Try new compatForm with datepicker
- [ ] Try to focus first input with error
- [ ] Try maskito
- [ ] Numeric text mode inputs require $any to accept number type
- [ ] Oxfmt does not format TS in HTML

## What's not working

1. Required validator does not allow `false`, which is in conflict with the current old required validation and an issue when using it with a nullable boolean, e.g., when a yes-no selection is required. -> https://github.com/angular/angular/issues/63624 (Closed as not planned)
   - Work-around: One can implement their own custom validator
2. NDBX components with field inputs do not update when the submitted status changes (e.g., when submitted or reset), unless one is listing to `touched`, e.g., by logging it in the template, or implements an effect to trigger change detection.
3. Datepicker: Resetting the input to null does not work, only '' works -> Can this be reproduced with Angular Material?
4. Datepicker: Min and max validation via directives is not (yet) working? -> Signal forms will not support template driven validators according to Reddit - works with compatForm
5. Debounced values do not automatically contribute to pending state
6. Compat fields are not disabled
7. ngmask output transform is working different (it's always returning string even it the number is converted to number - strange but "works"). An alternative could be Maskito.
