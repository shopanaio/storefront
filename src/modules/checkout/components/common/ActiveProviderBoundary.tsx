'use client';

import { useEffect } from 'react';
import { useProviderController } from '@src/modules/checkout/state/hooks/useProviderController';
import { ProviderControllerProvider } from '@src/modules/checkout/state/context/ProviderControllerContext';
import { ProviderId } from '@src/modules/checkout/state/checkoutBus';

/**
 * Boundary component that wraps provider content and manages its active state.
 * Renders children only when the provider is active and provides controller context.
 *
 * @param providerId - Provider identifier (e.g., "payment:bank_transfer" or "shipping:novaposta@group1")
 * @param type - Provider type: "payment" or "shipping"
 * @param autoPublish - If true, automatically publishes valid state on mount (useful for methods without forms)
 * @param children - Content to render when provider is active
 */
export function ActiveProviderBoundary({
  providerId,
  type,
  autoPublish,
  children,
}: {
  providerId: ProviderId;
  type: 'payment' | 'shipping';
  autoPublish?: boolean;
  children: React.ReactNode;
}) {
  const controller = useProviderController(providerId, type);

  // Auto-publish valid state for methods without forms when active
  useEffect(() => {
    if (autoPublish) {
      controller.publishValid({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!controller.active) {
    return null;
  }

  return (
    <ProviderControllerProvider
      value={{
        publishValid: controller.publishValid,
        publishInvalid: controller.publishInvalid,
        reset: controller.reset,
      }}
    >
      {children}
    </ProviderControllerProvider>
  );
}
