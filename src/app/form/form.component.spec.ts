import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/angular/zoneless';
import { page } from 'vitest/browser';
import { FormComponent } from './form.component';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query';

describe('FormComponent', () => {
  async function renderComponent() {
    return render(FormComponent, {
      providers: [provideTanStackQuery(() => new QueryClient())],
    });
  }

  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2024-02-03') }).setTimerTickMode('nextTimerAsync');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should work', async () => {
    await renderComponent();

    const firstNameInput = page.getByLabelText(/First name/);
    const lastNameInput = page.getByRole('textbox', { name: 'Last name', exact: false });
    const birthdayInput = page.getByLabelText('Birthday');

    await expect.element(lastNameInput).toBeValid();
    await firstNameInput.fill('John');
    await expect.element(firstNameInput).toHaveValue('John');
    await expect.element(lastNameInput).toBeInvalid();
    await lastNameInput.fill('Doe');
    await expect.element(lastNameInput).toHaveValue('Doe');
    await expect.element(lastNameInput).toBeValid();
    await expect.element(birthdayInput).toBeInvalid();
    await birthdayInput.fill('31/01/2000');
    await expect.element(birthdayInput).toHaveValue('31/01/2000');
    await expect.element(birthdayInput).toBeValid();
  });

  it('requires to be at least 18 years old', async () => {
    await renderComponent();

    const birthdayInput = page.getByLabelText('Birthday');
    const birthdayError = page.getByText('Age must be at least 18 years');
    await birthdayInput.fill('04/02/2026');
    await page.getByLabelText('Postcode').click();
    await expect.element(birthdayError).toBeVisible();

    await birthdayInput.fill('03/02/2006');
    await expect.element(birthdayError).not.toBeInTheDocument();
  });

  it('requires to be at most 100 years old', async () => {
    await renderComponent();

    const birthdayInput = page.getByLabelText('Birthday');
    const birthdayError = page.getByText('Birthday cannot be more than 100 years ago');

    await birthdayInput.fill('02/02/1924');
    await page.getByLabelText('Postcode').click();
    await expect.element(birthdayError).toBeVisible();

    await birthdayInput.fill('03/02/1924');
    await expect.element(birthdayError).not.toBeInTheDocument();
  });
});
