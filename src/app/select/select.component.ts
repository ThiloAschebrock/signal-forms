import { Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent implements FormValueControl<boolean | undefined> {
  readonly value = model<boolean | undefined>();

  readonly touched = input<boolean>(false);
}
