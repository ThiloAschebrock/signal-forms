# Testing Signal Forms

- [x] Regular validation
- [x] Custom validator
- [x] Conditional validation
- [x] Disabled the hole state on condtion
- [ ] Optional fields on the model (MaybeField)
- [ ] Hide inputs
- [x] Readonly inputs
- [x] Conditionally sync values
- [x] Extracting into simple input components
- [ ] Extracting into complex input components
- [ ] Validation with Zod
- [ ] Validation with Vest
- [ ] Async validation on a single input field
- [ ] Async validation on submit
- [x] Date inputs with build-in validators
- [ ] Dropdowns
- [ ] Autocomplete
- [ ] NxMask

## What's not working

1. Effects that watch values changes of individual fields trigger on any change, this causes too many computed or effect executions and can lead to inifinite-effects, e.g., if they trigger a value change;
2. Required validator does not allow `false`, which is in conflict with the current old required valiation and an issue when using it with a nullable boolean, e.g., when a yes-no selection is required.
3. NDBX components with field inputs do not update when the submitted status chagnes (e.g., when submitted or reset), unless one is listing to `touched`, e.g., by logging it in the template, or implements an effect to trigger change detection.
4. Dirty flags does not change when circular-toggle changes the value -> NDBX or Angular bug?
5. Datepicker: Input is cleared completly when a value is change to have an invalid format
6. Datepicker: Min and max validation via directives is not (yet) working?
