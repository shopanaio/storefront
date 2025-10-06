/**
 * Section controller hook for Checkout sections.
 * Registers section lifecycle in the Checkout store and exposes methods to publish validation.
 */
import { useEffect, useMemo, useCallback, useRef } from 'react';
import { onCheckoutEvent } from '@src/modules/checkout/state/checkoutBus';
import type { SectionDtoFor } from '@src/modules/checkout/state/checkoutBus';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';

/**
 * Register a section and control its validation lifecycle.
 * @param sectionId - Section key (static or dynamic delivery:<groupId>)
 * @param options - Options including whether the section is required
 */
export function useSectionController<
  K extends import('../checkoutStore').SectionKey,
>(sectionId: K, options: { required: boolean }) {
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
      'operation/start',
      ({ sectionId: sid }) => {
        if (sid === id) {
          useCheckoutStore.getState().setSectionBusy(id, true);
        }
      }
    );
    const offEnd = onCheckoutEvent('operation/end', ({ sectionId: sid }) => {
      if (sid === id) {
        useCheckoutStore.getState().setSectionBusy(id, false);
      }
    });

    return () => {
      useCheckoutStore.getState().unregisterSection(id);
      offStart();
      offEnd();
    };
    // Empty deps array - effect runs once on mount and cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publishValid = useCallback(
    (dto: SectionDtoFor<K>) => {
      useCheckoutStore
        .getState()
        .sectionValid(sectionId, dto as SectionDtoFor<K>);
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
  }, [busy, publishValid, publishInvalid, reset, setBusy]);
}
