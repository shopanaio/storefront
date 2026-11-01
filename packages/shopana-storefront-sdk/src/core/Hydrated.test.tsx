import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HydratedProvider, useHydrated } from './Hydrated';

const Flag = () => <span data-testid="flag">{String(useHydrated())}</span>;

describe('useHydrated', () => {
  it('is false in the server render', () => {
    expect(
      renderToString(
        <HydratedProvider>
          <Flag />
        </HydratedProvider>
      )
    ).toContain('false');
  });

  it('is true once the provider has mounted', async () => {
    await act(async () => {
      render(
        <HydratedProvider>
          <Flag />
        </HydratedProvider>
      );
    });
    expect(screen.getByTestId('flag').textContent).toBe('true');
  });

  it('is true without a provider: nothing to hydrate', () => {
    render(<Flag />);
    expect(screen.getByTestId('flag').textContent).toBe('true');
  });
});
