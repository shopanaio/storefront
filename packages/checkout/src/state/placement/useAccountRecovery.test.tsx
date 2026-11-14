import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlacementPhase } from './placementStore';
import { useAccountRecovery } from './useAccountRecovery';
import { placementErrorMessageKey } from '../../components/result/placementMessages';

const mocks = vi.hoisted(() => ({
  claim: vi.fn(),
  refetch: vi.fn(),
  changed: vi.fn(),
  phase: { name: 'idle' } as PlacementPhase,
}));
vi.mock('@shopana/storefront-sdk/modules/cart/react', () => ({
  useClaimAccountCart: () => mocks.claim,
}));
vi.mock('#checkout/context/CheckoutDataContext', () => ({
  useCheckoutData: () => ({ refetch: mocks.refetch }),
}));
vi.mock('#checkout/state/placement/placementStore', () => ({
  usePlacementPhase: () => mocks.phase,
  usePlacementStore: {
    getState: () => ({
      phase: mocks.phase,
      setPhase: (phase: PlacementPhase) => {
        mocks.phase = phase;
        mocks.changed(phase);
      },
    }),
  },
}));

beforeEach(() => {
  mocks.claim.mockReset();
  mocks.refetch.mockReset();
  mocks.changed.mockReset();
  mocks.phase = { name: 'rejected', code: 'CHECKOUT_CLAIM_REQUIRED' };
});

describe('восстановление корзины аккаунта', () => {
  it('снимает прежний отказ после успешной привязки без автоматического размещения заказа', async () => {
    mocks.claim.mockResolvedValue({
      checkoutId: 'account-cart',
      mergedFromCheckoutId: null,
    });
    renderHook(() => useAccountRecovery());
    await waitFor(() =>
      expect(mocks.changed).toHaveBeenCalledWith({ name: 'idle' })
    );
    expect(mocks.claim).toHaveBeenCalledTimes(1);
  });
  it.each([false, true])(
    'показывает ошибку привязки вместо сообщения о ценах, rejected=%s',
    async (reject) => {
      if (reject)
        mocks.claim.mockRejectedValue(
          new Error('CHECKOUT_SNAPSHOT_QUARANTINED')
        );
      else mocks.claim.mockResolvedValue(null);
      renderHook(() => useAccountRecovery());
      await waitFor(() =>
        expect(mocks.changed).toHaveBeenCalledWith({
          name: 'rejected',
          code: 'CHECKOUT_ACCOUNT_RECOVERY_FAILED',
        })
      );
      expect(mocks.claim).toHaveBeenCalledTimes(1);
      expect(placementErrorMessageKey('CHECKOUT_ACCOUNT_RECOVERY_FAILED')).toBe(
        'account-cart-error'
      );
    }
  );
  it('завершение прежней привязки не стирает более новый результат', async () => {
    let resolve!: (value: unknown) => void;
    mocks.claim.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      })
    );
    renderHook(() => useAccountRecovery());
    mocks.phase = { name: 'rejected', code: 'CHECKOUT_ABANDONED' };
    await act(async () => resolve({ checkoutId: 'account-cart' }));
    expect(mocks.changed).not.toHaveBeenCalled();
  });
  it('требование привязки само по себе не означает изменение цены', () => {
    expect(placementErrorMessageKey('CHECKOUT_CLAIM_REQUIRED')).toBe(
      'account-cart-preparing'
    );
  });
});
