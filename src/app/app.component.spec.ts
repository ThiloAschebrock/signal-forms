import { render, screen } from '@testing-library/angular';
import { Component } from '@angular/core';
import { describe, it, expect } from 'vitest';

@Component({
  selector: 'app-root',
  template: `<h1>
    <span> Hello </span>
    <strong> World! </strong>
  </h1>`,
})
class AppComponent {}

describe('AppComponent', () => {
  it('should find title', async () => {
    await render(AppComponent);
    expect(
      screen.getByRole('heading', { name: 'Hello World!' }),
    ).toBeInTheDocument();
  });
});
