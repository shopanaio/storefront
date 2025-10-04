'use client';

import { useProviderController } from '@src/modules/checkout/state/hooks/useProviderController';
import { ProviderControllerProvider } from '@src/modules/checkout/state/context/ProviderControllerContext';
import { ProviderId } from '@src/modules/checkout/state/checkoutBus';

export function ProviderBoundary({
  providerId,
  type,
  children,
}: {
  providerId: ProviderId;
  type: 'payment' | 'shipping';
  children: React.ReactNode;
}) {
  const controller = useProviderController(providerId, type);

  return (
    <ProviderControllerProvider value={controller}>
      {children}
    </ProviderControllerProvider>
  );
}
