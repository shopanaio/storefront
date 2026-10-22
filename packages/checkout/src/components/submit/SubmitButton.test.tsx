import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubmitButton } from './SubmitButton';

const state = vi.hoisted(() => ({ saving: false, placing: false }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('#checkout/state/selectors', () => ({
  useHasActiveOperations: () => state.saving,
}));
vi.mock('#checkout/state/placement/placementStore', () => ({
  useIsPlacementBusy: () => state.placing,
}));
vi.mock('#checkout/hooks/useUndeliverableLines', () => ({
  useUndeliverableLines: () => [],
}));
vi.mock('#checkout/hooks/useCheckoutReadiness', () => ({
  useCheckoutReadiness: () => ({ expired: false }),
}));
vi.mock('#checkout/context/CheckoutDataContext', () => ({
  useCheckoutData: () => ({ checkout: null }),
}));

describe('SubmitButton', () => {
  beforeEach(() => {
    state.saving = false;
    state.placing = false;
  });

  it('BR-awbl: lets a click start placement while the order note is saving', () => {
    state.saving = true;
    const onClick = vi.fn();
    render(<SubmitButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'confirm-order' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('blocks another click once placement has started', () => {
    state.placing = true;
    const onClick = vi.fn();
    render(<SubmitButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /confirm-order/ }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
