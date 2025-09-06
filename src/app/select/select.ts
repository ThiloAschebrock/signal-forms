import { Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.scss',
})
export class Select implements FormValueControl<boolean | undefined> {
  readonly value = model<boolean | undefined>();

  readonly touched = model<boolean>(false);
}
