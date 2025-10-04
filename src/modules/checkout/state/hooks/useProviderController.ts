/**
 * Provider controller hook for Checkout providers.
 * Registers provider lifecycle in the store and exposes active flag and publish/reset helpers.
 */
import { useEffect, useMemo } from 'react';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import { ProviderId, ProviderType } from '@src/modules/checkout/state/checkoutBus';

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
    setProviderBusy,
  } = useCheckoutStore.getState();

  const isActive = useCheckoutStore(
    (s) => s.providers[providerId]?.active === true
  );

  const busy = useCheckoutStore(
    (s) => s.providers[providerId]?.busy ?? false
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
      busy,
      publishValid: (data: unknown) => providerValid(providerId, data),
      publishInvalid: (errors?: Record<string, string>) =>
        providerInvalid(providerId, errors),
      reset: () => resetProvider(providerId),
      setBusy: (isBusy: boolean) => setProviderBusy(providerId, isBusy),
    }),
    [isActive, busy, providerValid, providerInvalid, resetProvider, setProviderBusy, providerId]
  );
}
