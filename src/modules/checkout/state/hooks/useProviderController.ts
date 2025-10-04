/**
 * Provider controller hook for Checkout providers.
 * Registers provider lifecycle in the store and exposes active flag and publish/reset helpers.
 */
import { useEffect, useMemo } from 'react';
import { useCheckoutStore } from '@checkout/state/checkoutStore';
import { ProviderId, ProviderType } from '@checkout/state/checkoutBus';

export function useProviderController(
  providerId: ProviderId,
  type: ProviderType
) {
  const {
    registerProvider,
    unregisterProvider,
    providerValid,
    providerInvalid,
    resetProvider,
  } = useCheckoutStore.getState();

  const isActive = useCheckoutStore(
    (s) => s.providers[providerId]?.active === true
  );

  useEffect(() => {
    registerProvider(providerId, type);
    return () => {
      // On unmount, unregister provider to keep store clean
      unregisterProvider(providerId);
    };
  }, [registerProvider, unregisterProvider, providerId, type]);

  return useMemo(
    () => ({
      active: isActive,
      publishValid: (data: unknown) => providerValid(providerId, data),
      publishInvalid: (errors?: Record<string, string>) =>
        providerInvalid(providerId, errors),
      reset: () => resetProvider(providerId),
    }),
    [isActive, providerValid, providerInvalid, resetProvider, providerId]
  );
}
