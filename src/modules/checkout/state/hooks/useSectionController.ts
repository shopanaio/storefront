/**
 * Section controller hook for Checkout sections.
 * Registers section lifecycle in the Checkout store and exposes methods to publish validation.
 */
import { useEffect, useMemo, useCallback, useRef } from 'react';
import {
  CheckoutEvent,
  onCheckoutEvent,
} from '@src/modules/checkout/state/checkoutBus';
import type { SectionDtoFor } from '@src/modules/checkout/state/checkoutBus';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import { SectionId } from '@src/modules/checkout/state/types';

/**
 * Register a section and control its validation lifecycle.
 * @param sectionId - Section key (static or dynamic delivery:<groupId>)
 * @param options - Options including whether the section is required
 */
export function useSectionController(
  sectionId: SectionId,
  options: { required: boolean }
) {
  // Store sectionId and required in refs to avoid effect re-runs
  const sectionIdRef = useRef(sectionId);
  const requiredRef = useRef(options.required);

  // Update refs if values change
  sectionIdRef.current = sectionId;
  requiredRef.current = options.required;

  const busy = useCheckoutStore(
    (state) => state.sections[sectionId]?.busy ?? false
  );

  useEffect(() => {
    const id = sectionIdRef.current;
    const required = requiredRef.current;

    // Get store actions directly to avoid dependencies
    const store = useCheckoutStore.getState();
    store.registerSection(id, required);

    // Subscribe to operation lifecycle to reflect busy state
    const offStart = onCheckoutEvent(
      CheckoutEvent.OperationStart,
      ({ sectionId: sid }) => {
        if (sid === id) {
          useCheckoutStore.getState().setSectionBusy(id, true);
        }
      }
    );
    const offEnd = onCheckoutEvent(
      CheckoutEvent.OperationEnd,
      ({ sectionId: sid }) => {
        if (sid === id) {
          useCheckoutStore.getState().setSectionBusy(id, false);
        }
      }
    );

    return () => {
      useCheckoutStore.getState().unregisterSection(id);
      offStart();
      offEnd();
    };
    // Empty deps array - effect runs once on mount and cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publishValid = useCallback(
    (dto: SectionDtoFor<SectionId>) => {
      useCheckoutStore
        .getState()
        .sectionValid(sectionId, dto as SectionDtoFor<SectionId>);
    },
    [sectionId]
  );

  const publishInvalid = useCallback(
    (errors?: Record<string, string>) => {
      useCheckoutStore.getState().sectionInvalid(sectionId, undefined, errors);
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

  return useMemo(() => {
    console.log('useSectionController', sectionId);
    return {
      busy,
      publishValid,
      publishInvalid,
      reset,
      setBusy,
    };
  }, [busy, publishValid, publishInvalid, reset, setBusy, sectionId]);
}
