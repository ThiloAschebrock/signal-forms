import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { FormComponent } from './form.component';
import {
  provideQueryClient,
  QueriesObserver,
  QueryClient,
} from '@tanstack/angular-query-experimental';

describe('FormComponent', () => {
  async function renderComponent() {
    return render(FormComponent, {
      providers: [provideQueryClient(new QueryClient())],
    });
  }

  it('should work', async () => {
    await renderComponent();

    expect(screen.getByLabelText('First name (optional)')).toBeInTheDocument();
  });
});
