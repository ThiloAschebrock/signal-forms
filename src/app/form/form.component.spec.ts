import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/angular';
import { page } from 'vitest/browser';
import { FormComponent } from './form.component';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { importProvidersFrom } from '@angular/core';
import { NxIsoDateModule } from '@allianz/ng-aquila/iso-date-adapter';

describe('FormComponent', () => {
  async function renderComponent() {
    return render(FormComponent, {
      providers: [provideQueryClient(new QueryClient()), importProvidersFrom(NxIsoDateModule)],
    });
  }

  it('should work', async () => {
    await renderComponent();

    const firstNameInput = page.getByLabelText(/First name/);
    const lastNameInput = page.getByRole('textbox', { name: 'Last name' });

    await expect.element(lastNameInput).toBeValid();
    await firstNameInput.fill('John');
    await expect.element(firstNameInput).toHaveValue('John');
    await expect.element(lastNameInput).toBeInvalid();
    await lastNameInput.fill('Doe');
    await expect.element(lastNameInput).toHaveValue('Doe');
  });
});
