import { useCallback, useEffect, useRef } from 'react';
import useCreateCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useCreateCart';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useNow } from '#checkout/hooks/useNow';
import { CheckoutEvent, emitCheckoutEvent, onCheckoutEvent } from '#checkout/state/checkoutBus';
import { createAttemptJournal } from '#checkout/state/placement/attemptJournal';
import { isPlacementBusy, usePlacementStore } from '#checkout/state/placement/placementStore';
import { renewalInput, useRenewalStore } from '#checkout/state/renewal';
import type { Checkout } from '#checkout/types/entity';

/** Closed by the server: a checkout in this status can only be replaced. */
const isClosedByServer = (checkout: Checkout.Checkout) =>
  checkout.status === 'EXPIRED' || checkout.status === 'ABANDONED';

/**
 * Whether a placement attempt of this browser still owns the checkout: an unanswered request
 * is resent with its key, and a started payment can still complete. Replacing the checkout
 * then would leave the buyer with a second cart for an order that may already be paid.
 */
const hasLiveAttempt = (checkoutId: string) => {
  const attempt = createAttemptJournal().read(checkoutId);
  return attempt?.state === 'sent' || attempt?.state === 'resolved';
};

/**
 * Follows the checkout lifecycle status (plan, stage 5, task 2):
 * - `PLACED`: handled like `CHECKOUT_ALREADY_PLACED`, so the placement controller follows the
 *   placement of this browser or tells the buyer the order was already placed;
 * - `EXPIRED` or `ABANDONED` from the server, or a mutation rejected as expired or abandoned:
 *   a new checkout with the same lines replaces it (R5), once per checkout;
 * - `expiresAt` passed by the browser clock: the checkout is read again, and only the server
 *   answer decides (BR-tpm1): the browser clock may run ahead of the server one.
 * Nothing is replaced while a placement attempt of this browser owns the checkout.
 */
export function useCheckoutLifecycle(checkoutId: string | null) {
  const { checkout, refetch } = useCheckoutData();
  const { createCart } = useCreateCart();
  const setState = useRenewalStore((state) => state.setState);
  const setRetry = useRenewalStore((state) => state.setRetry);
  const current = checkout && checkout.id === checkoutId ? checkout : null;
  const expiresAt = current?.expiresAt ?? null;
  const now = useNow(expiresAt);
  const handledRef = useRef<string | null>(null);
  const refetchedRef = useRef<string | null>(null);

  // Lets a failed renewal be retried with the latest `renew`.
  const renewRef = useRef<(source: Checkout.Checkout) => void>(() => undefined);
  const renew = useCallback(
    (source: Checkout.Checkout) => {
      if (isPlacementBusy(usePlacementStore.getState().phase) || hasLiveAttempt(source.id)) {
        return;
      }
      handledRef.current = source.id;
      setState('renewing');
      setRetry(null);
      createCart(renewalInput(source)).then(
        () => setState('renewed'),
        (error: unknown) => {
          console.error('Failed to replace the expired checkout:', error);
          setState('failed');
          setRetry(() => renewRef.current(source));
        }
      );
    },
    [createCart, setRetry, setState]
  );
  useEffect(() => {
    renewRef.current = renew;
  }, [renew]);

  useEffect(() => {
    if (!current || handledRef.current === current.id) return;
    if (current.status === 'PLACED') {
      handledRef.current = current.id;
      void emitCheckoutEvent(CheckoutEvent.CheckoutClosed, { code: 'CHECKOUT_ALREADY_PLACED' });
      return;
    }
    if (isClosedByServer(current)) {
      renew(current);
      return;
    }
    if (!current.expiresAt) {
      return;
    }
    if (now >= current.expiresAt.getTime() && refetchedRef.current !== current.id) {
      // The server may have closed it already, or may still keep it open.
      refetchedRef.current = current.id;
      void refetch();
    }
  }, [current, now, renew, refetch]);

  useEffect(() => {
    const off = onCheckoutEvent(CheckoutEvent.CheckoutClosed, ({ code }) => {
      if (code === 'CHECKOUT_ALREADY_PLACED' || !current) return;
      if (handledRef.current !== current.id) renew(current);
    });
    return () => off();
  }, [current, renew]);

  // A renewal notice belongs to the checkout it was shown for.
  useEffect(() => () => setState('idle'), [setState]);
}
