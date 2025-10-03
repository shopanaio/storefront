/**
 * Provider controller hook for Checkout providers.
 * Registers provider lifecycle in the store and exposes active flag and publish/reset helpers.
 */
import { useEffect, useMemo } from 'react';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';

export function useProviderController(
  providerId: import('../checkoutStore').ProviderId,
  type: import('../checkoutStore').ProviderType
) {
  const {
    registerProvider,
    unregisterProvider,
    providerValid,
    providerInvalid,
    resetProvider,
  } = useCheckoutStore((s) => ({
    registerProvider: s.registerProvider,
    unregisterProvider: s.unregisterProvider,
    providerValid: s.providerValid,
    providerInvalid: s.providerInvalid,
    resetProvider: s.resetProvider,
  }));

  const isActive = useCheckoutStore((s) => s.providers[providerId]?.active === true);

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
      publishInvalid: (errors?: Record<string, string>) => providerInvalid(providerId, errors),
      reset: () => resetProvider(providerId),
    }),
    [isActive, providerValid, providerInvalid, resetProvider, providerId]
  );
}
