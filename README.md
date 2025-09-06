# Testing Signal Forms

- [x] Regular validation
- [x] Custom validator
- [x] Conditional validation
- [x] Disabled the hole state on condtion
- [ ] Optional fields on the model (MaybeField)
- [ ] Hide inputs
- [x] Readonly inputs
- [x] Conditionally sync values
- [x] Extracting into simple input component by passing control
- [x] Extracting into simple input component by implementing FormValueControl
- [ ] Extracting into complex input components
- [ ] Validation with Zod -> StandardSchema is not yet exposed
- [ ] Validation with Vest -> StandardSchema is not yet exposed
- [ ] Async validation on a single input field
- [ ] Async validation on submit
- [x] Date inputs with build-in validators
- [ ] Dropdowns
- [ ] Autocomplete
- [ ] NxMask

## What's not working

1. Effects that watch values changes of individual fields trigger on any change, this causes too many computed or effect executions and can lead to inifinite-effects, e.g., if they trigger a value change; -> https://github.com/angular/angular/issues/63627
2. Required validator does not allow `false`, which is in conflict with the current old required valiation and an issue when using it with a nullable boolean, e.g., when a yes-no selection is required. -> https://github.com/angular/angular/issues/63624
3. NDBX components with field inputs do not update when the submitted status changes (e.g., when submitted or reset), unless one is listing to `touched`, e.g., by logging it in the template, or implements an effect to trigger change detection.
4. Dirty/Touched flags does not change when circular-toggle changes the value -> NDBX or Angular bug? TODO: Try with Reactive Form -> https://github.com/angular/angular/blob/main/packages/forms/signals/src/controls/control.ts#L323 - implementation is missing - for touched, a NDBX bug should be confirmed and raised.
5. Datepicker: Input is cleared completly when a value is change to have an invalid format -> Requires and NDBX bug
6. Datepicker: Min and max validation via directives is not (yet) working?
7. FormValueControl cannot change to dirty -> https://github.com/angular/angular/issues/63623
