import { useCallback, useEffect, useRef } from 'react';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useCheckoutTheme } from '#checkout/theme';
import {
  CheckoutEvent,
  emitCheckoutEvent,
  onCheckoutEvent,
} from '#checkout/state/checkoutBus';
import {
  attemptLocator,
  createAttemptJournal,
} from '#checkout/state/placement/attemptJournal';
import type { PlacementAttempt } from '#checkout/state/placement/attemptJournal';
import {
  IDEMPOTENCY_MISMATCH_CODE,
  NETWORK_ERROR_CODE,
  PLACEMENT_UNCONFIRMED_CODE,
  PlacementUnconfirmedError,
  resolvePlacementOutcome,
} from '#checkout/state/placement/outcome';
import {
  isPlacementBusy,
  usePlacementStore,
} from '#checkout/state/placement/placementStore';
import {
  buildReturnUrl,
  pollPlacement,
  useReadPlacement,
} from '#checkout/state/placement/recovery';
import {
  phaseForOutcome,
  recordOutcome,
} from '#checkout/state/placement/transitions';
import type { PlacementContext } from '#checkout/state/placement/transitions';
import { checkoutReadiness } from '#checkout/state/readiness';
import type {
  PlacementLocator,
  PlacementOutcome,
  PlacementResult,
} from '#checkout/state/placement/types';

/**
 * Drives order placement in the checkout (plan, stage 1): sends `placeOrder` with the journal's
 * idempotency key on `SubmitReady`, follows the outcome, polls pending payments, and resumes an
 * unfinished attempt of this checkout after a reload.
 *
 * Only answers for the active checkout are followed. An answer that arrives after unmount or
 * after the cart switched to another checkout is dropped: it touches neither the store, the
 * events nor the journal, so that attempt stays `sent` and is resent with the same key when its
 * checkout is opened again.
 */
export function usePlacementController(checkoutId: string | null) {
  const { checkout, loaded: checkoutLoaded } = useCheckoutData();
  const { submitCheckout } = useCheckoutApi();
  const readPlacement = useReadPlacement();
  const returnPath = useCheckoutTheme().useCheckoutReturnPath();
  const setPhase = usePlacementStore((state) => state.setPhase);
  const journalRef = useRef(createAttemptJournal());
  const pollRef = useRef<AbortController | null>(null);
  const resumedRef = useRef<string | null>(null);
  const activeCheckoutRef = useRef<string | null>(null);
  const isActive = useCallback(
    (attempt: PlacementAttempt) => activeCheckoutRef.current === attempt.checkoutId,
    []
  );

  // The active checkout changes on unmount and when the cart switches to another checkout.
  // A switch to another cart drops the old attempt's phase; a switch to no cart keeps it, since
  // the cart is cleared right after the order is accepted and the result stays on screen.
  const lastCheckoutRef = useRef<string | null>(null);
  useEffect(() => {
    const previous = lastCheckoutRef.current;
    activeCheckoutRef.current = checkoutId;
    if (checkoutId) lastCheckoutRef.current = checkoutId;
    if (previous && checkoutId && previous !== checkoutId) {
      usePlacementStore.getState().reset();
    }
    return () => {
      activeCheckoutRef.current = null;
      resumedRef.current = null;
      pollRef.current?.abort();
      pollRef.current = null;
    };
  }, [checkoutId]);

  const stopPolling = useCallback(() => {
    pollRef.current?.abort();
    pollRef.current = null;
  }, []);

  const follow = useCallback(
    (
      attempt: PlacementAttempt,
      result: PlacementResult,
      outcome: PlacementOutcome,
      context: PlacementContext
    ) => {
      if (!isActive(attempt)) return;
      recordOutcome(journalRef.current, attempt, result, outcome);
      setPhase(phaseForOutcome(outcome, context));
      if (outcome.kind === 'accepted') {
        void emitCheckoutEvent(CheckoutEvent.OrderAccepted, {
          checkoutId: attempt.checkoutId,
          orderId: outcome.orderId,
          orderNumber: outcome.orderNumber,
          status: outcome.status,
        });
      }
      if (outcome.kind === 'redirect' && context === 'submit') {
        window.location.assign(outcome.url);
      }
    },
    [isActive, setPhase]
  );

  const poll = useCallback(
    (
      attempt: PlacementAttempt,
      locator: PlacementLocator,
      context: PlacementContext
    ) => {
      stopPolling();
      const controller = new AbortController();
      pollRef.current = controller;
      setPhase({ name: 'awaiting-payment' });
      void pollPlacement({
        read: readPlacement,
        locator,
        flow: attempt.paymentFlow,
        signal: controller.signal,
        onResult: (result, outcome) => {
          if (outcome.kind !== 'awaiting-payment') {
            follow(attempt, result, outcome, context);
          }
        },
        onMissing: () => {
          if (!isActive(attempt)) return;
          journalRef.current.clear(attempt.checkoutId);
          setPhase({ name: 'rejected', code: 'CHECKOUT_PLACEMENT_NOT_FOUND' });
        },
      });
    },
    [follow, isActive, readPlacement, setPhase, stopPolling]
  );

  const send = useCallback(
    async (initial: PlacementAttempt, context: PlacementContext) => {
      const journal = journalRef.current;
      let attempt = initial;
      for (let rotations = 0; ; rotations += 1) {
        attempt = journal.markSent(attempt);
        setPhase({ name: 'placing' });
        void emitCheckoutEvent(CheckoutEvent.PlacementStarted, {});
        let result: PlacementResult;
        try {
          result = await submitCheckout({
            checkoutId: attempt.checkoutId,
            idempotencyKey: attempt.idempotencyKey,
            returnUrl: attempt.returnUrl,
          });
        } catch (error) {
          // The answer is lost or inconclusive: the attempt stays `sent`, the retry reuses the key.
          if (isActive(attempt)) {
            setPhase({
              name: 'rejected',
              code:
                error instanceof PlacementUnconfirmedError
                  ? PLACEMENT_UNCONFIRMED_CODE
                  : NETWORK_ERROR_CODE,
            });
          }
          return;
        }
        if (!isActive(attempt)) return;
        const outcome = resolvePlacementOutcome(
          result,
          attempt.paymentFlow,
          attemptLocator(attempt)
        );
        if (
          outcome.kind === 'rejected' &&
          outcome.code === IDEMPOTENCY_MISMATCH_CODE &&
          rotations === 0
        ) {
          attempt = journal.rotate(attempt);
          continue;
        }
        if (outcome.kind === 'awaiting-payment') {
          poll(journal.markResolved(attempt, result), outcome.locator, context);
          return;
        }
        follow(attempt, result, outcome, context);
        return;
      }
    },
    [follow, isActive, poll, setPhase, submitCheckout]
  );

  // Submit: place the order, or continue the attempt this checkout already has.
  useEffect(() => {
    const off = onCheckoutEvent(CheckoutEvent.SubmitReady, async () => {
      if (!checkout || isPlacementBusy(usePlacementStore.getState().phase)) {
        return;
      }
      const journal = journalRef.current;
      const current = journal.read(checkout.id);
      const locator = current?.state === 'resolved' ? attemptLocator(current) : null;
      if (current && locator) {
        // Pressing the button again continues the payment of the existing placement.
        poll(current, locator, 'submit');
        return;
      }
      // The backend places only a READY, valid checkout before it expires; the notices above
      // the button say what is missing (stage 5). An unanswered request for this snapshot is
      // resent with its key whatever the checkout shows: the key returns the placement it made.
      const resend =
        current?.state === 'sent' && current.resultRevision === checkout.resultRevision;
      if (!resend && !checkoutReadiness(checkout, Date.now()).canPlace) {
        return;
      }
      let returnUrl: string;
      try {
        returnUrl =
          current?.state === 'sent' || current?.state === 'created'
            ? current.returnUrl
            : buildReturnUrl(window.location.origin, returnPath, checkout.id);
      } catch (error) {
        // The return URL is over the provider limit: nothing is placed.
        console.error(error);
        setPhase({ name: 'rejected', code: 'PLACE_ORDER_RETURN_URL_TOO_LONG' });
        return;
      }
      const attempt = journal.begin({
        checkoutId: checkout.id,
        resultRevision: checkout.resultRevision,
        paymentFlow: checkout.payment.selection.method?.flow ?? null,
        returnUrl,
      });
      await send(attempt, 'submit');
    });
    return () => off();
  }, [checkout, poll, returnPath, send, setPhase]);

  // The checkout is already placed. A placement of this checkout is followed to its result; an
  // unanswered request of this browser is resent with its key, since the placement may be its
  // own; otherwise the customer is told the order was already placed. An expired or abandoned
  // checkout is replaced by the lifecycle controller instead (R5).
  useEffect(() => {
    const off = onCheckoutEvent(CheckoutEvent.CheckoutClosed, ({ code }) => {
      if (
        code !== 'CHECKOUT_ALREADY_PLACED' ||
        !checkoutId ||
        isPlacementBusy(usePlacementStore.getState().phase)
      ) {
        return;
      }
      const current = journalRef.current.read(checkoutId);
      const locator = attemptLocator(current);
      // A failed attempt did not place the checkout (a failed payment leaves it open): the
      // order came from another placement, which this browser does not know.
      if (current && locator && current.state !== 'failed') {
        poll(current, locator, 'recover');
        return;
      }
      if (
        current?.state === 'sent' &&
        (!checkout || checkout.resultRevision === current.resultRevision)
      ) {
        void send(current, 'recover');
        return;
      }
      setPhase({ name: 'rejected', code });
    });
    return () => off();
  }, [checkout, checkoutId, poll, send, setPhase]);

  // Reload: resume an unanswered request with the same key, or read the placement in progress.
  // Both work from the journal alone: the checkout may be unreadable once it became an order
  // (decision 1.2). A resumed answer is followed as a recovery: a pending redirect is offered as
  // "continue payment" instead of sending the buyer away unasked.
  // `undefined` while the checkout of `checkoutId` is loading; `null` when it is unreadable.
  const loadedCheckout =
    checkoutLoaded && (!checkout || checkout.id === checkoutId) ? checkout : undefined;
  useEffect(() => {
    if (!checkoutId || resumedRef.current === checkoutId) return;
    const current = journalRef.current.read(checkoutId);
    if (!current) {
      resumedRef.current = checkoutId;
      return;
    }
    const locator = attemptLocator(current);
    if (current.state === 'resolved' && locator) {
      resumedRef.current = checkoutId;
      poll(current, locator, 'recover');
      return;
    }
    if (current.state !== 'sent') {
      resumedRef.current = checkoutId;
      return;
    }
    // An unanswered request is resent only for the snapshot the buyer confirmed. After the cart
    // changed, the next press takes a new key; a placement the lost request made is then
    // returned through `CHECKOUT_ALREADY_PLACED`.
    if (loadedCheckout === undefined) return;
    resumedRef.current = checkoutId;
    if (loadedCheckout && loadedCheckout.resultRevision !== current.resultRevision) return;
    void send(current, 'recover');
  }, [checkoutId, loadedCheckout, poll, send]);

  /** The client SDK finished or was closed: the server decides, the checkout reads it. */
  const settleClientSdk = useCallback(() => {
    if (!checkoutId) return;
    const current = journalRef.current.read(checkoutId);
    const locator = attemptLocator(current);
    if (current && locator) {
      poll(current, locator, 'submit');
    } else {
      setPhase({ name: 'idle' });
    }
  }, [checkoutId, poll, setPhase]);

  return { settleClientSdk };
}
