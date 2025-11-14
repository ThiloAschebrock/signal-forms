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
- [ ] Dropdowns
- [ ] Autocomplete
- [x] NxMask, e.g., for ABN: works, however, no mask validation
- [x] ngxmask for numbers: works
- [ ] Try filtering hidden inputs on submit
- [ ] Try new debounce option

## What's not working

1. Effects that watch values changes of individual fields trigger on any change, this causes too many computed or effect executions and can lead to inifinite-effects, e.g., if they trigger a value change; -> https://github.com/angular/angular/issues/63627
   - Work-around: Stabilize using `computed`.
2. Required validator does not allow `false`, which is in conflict with the current old required valiation and an issue when using it with a nullable boolean, e.g., when a yes-no selection is required. -> https://github.com/angular/angular/issues/63624 (Closed as not planned)
   - Work-around: One can implement their own custom validator
3. NDBX components with field inputs do not update when the submitted status changes (e.g., when submitted or reset), unless one is listing to `touched`, e.g., by logging it in the template, or implements an effect to trigger change detection.
4. Touched flag on circular toggle needs a focus outside -> This is consisten with radio group and by desing unreleated to signal forms
5. Datepicker: Input is cleared completly when a value is change to have an invalid format -> Requires and NDBX bug ticket
6. Datepicker: Min and max validation via directives is not (yet) working? -> Signal forms will not support template driven validators according to Reddit
7. Min and max validators do not allow for null -> https://github.com/angular/angular/issues/63789 raised
   - Workaround: One can only use NaN to represent empty number
8. Standard-Schema validation does not forward the issue message as the formfield message; Workaround is using instanceof - see error pipe; Should I open an issue with Angular?
9. Need to use $any() to bind number fields to numeric input
10. Attributes such as reaodnly are not forwarded and cannot be bound to NG_VALUE_ACCESSOR in the template
11. compatForm is not exposed via public API in RC-2
