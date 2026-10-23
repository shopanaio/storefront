/**
 * Section controller hook for Checkout sections.
 * Registers section lifecycle in the Checkout store and exposes methods to publish validation.
 */
import { useEffect, useMemo, useCallback, useRef } from 'react';
import { CheckoutEvent, onCheckoutEvent } from '#checkout/state/checkoutBus';
import { useCheckoutStore } from '#checkout/state/checkoutStore';
import { SectionId } from '#checkout/state/interface';

/**
 * Register a section and control its validation lifecycle.
 * @param sectionId - Section key (static or dynamic delivery:<groupId>)
 * @param options - Options including whether the section is required
 */
export function useSectionController(
  sectionId: SectionId,
  options: { required: boolean }
) {
  const busy = useCheckoutStore(
    (state) => state.sections[sectionId]?.busy ?? false
  );

  useEffect(() => {
    const id = sectionId;
    const required = options.required;

    // Get store actions directly to avoid dependencies
    const store = useCheckoutStore.getState();
    store.registerSection(id, required);

    // Subscribe to operation lifecycle to reflect busy state.
    // Operations of one section can overlap, so busy is cleared only when the last one ends.
    // SectionContainer re-validates the section once it is no longer busy.
    let activeOperations = 0;
    const offStart = onCheckoutEvent(
      CheckoutEvent.OperationStart,
      ({ sectionId: sid }) => {
        if (sid === id) {
          activeOperations += 1;
          useCheckoutStore.getState().sectionInvalid(sid);
          useCheckoutStore.getState().setSectionBusy(id, true);
        }
      }
    );
    const offEnd = onCheckoutEvent(
      CheckoutEvent.OperationEnd,
      ({ sectionId: sid }) => {
        if (sid === id) {
          activeOperations = Math.max(0, activeOperations - 1);
          if (activeOperations === 0) {
            useCheckoutStore.getState().setSectionBusy(id, false);
          }
        }
      }
    );

    return () => {
      useCheckoutStore.getState().unregisterSection(id);
      offStart();
      offEnd();
    };
  }, [sectionId, options.required]);

  const publishValid = useCallback(() => {
    useCheckoutStore.getState().sectionValid(sectionId);
  }, [sectionId]);

  const publishInvalid = useCallback(
    (errors?: Record<string, string>) => {
      useCheckoutStore.getState().sectionInvalid(sectionId, errors);
    },
    [sectionId]
  );

  const reset = useCallback(() => {
    useCheckoutStore.getState().resetSection(sectionId);
  }, [sectionId]);

  const setBusy = useCallback(
    (isBusy: boolean) => {
      useCheckoutStore.getState().setSectionBusy(sectionId, isBusy);
    },
    [sectionId]
  );

  return useMemo(
    () => ({
      busy,
      publishValid,
      publishInvalid,
      reset,
      setBusy,
    }),
    [busy, publishValid, publishInvalid, reset, setBusy]
  );
}
