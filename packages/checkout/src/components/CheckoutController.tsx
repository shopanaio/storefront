'use client';

/**
 * CheckoutController: tracks checkout operations and drives order placement.
 */
import { useEffect } from 'react';
import { useOperationTracker } from '#checkout/state/hooks/useOperationTracker';
import { usePlacementController } from '#checkout/state/placement/usePlacementController';
import { usePlacementPhase } from '#checkout/state/placement/placementStore';
import { onCheckoutEvent, CheckoutEvent } from '#checkout/state/checkoutBus';
import type { OrderAcceptedEvent } from '#checkout/state/checkoutBus';
import { PaymentSdkHost } from '#checkout/components/result/PaymentSdkHost';

export function CheckoutController({
  checkoutId,
  onOrderAccepted,
}: {
  checkoutId: string | null;
  onOrderAccepted: (event: OrderAcceptedEvent) => void;
}) {
  // Track active operations for UI indicators
  useOperationTracker();
  // Handle the placement lifecycle
  const { settleClientSdk } = usePlacementController(checkoutId);
  const phase = usePlacementPhase();

  // Only an accepted order lets the host clear the cart (decision 1.6)
  useEffect(() => {
    const off = onCheckoutEvent(CheckoutEvent.OrderAccepted, onOrderAccepted);
    return () => off();
  }, [onOrderAccepted]);

  return phase.name === 'client-sdk' ? (
    <PaymentSdkHost action={phase.action} onSettled={settleClientSdk} />
  ) : null;
}
