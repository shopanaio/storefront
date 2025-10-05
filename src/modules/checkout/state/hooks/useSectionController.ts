/**
 * Section controller hook for Checkout sections.
 * Registers section lifecycle in the Checkout store and exposes methods to publish validation.
 */
import { useEffect, useMemo } from 'react';
import { onCheckoutEvent } from '@src/modules/checkout/state/checkoutBus';
import type { SectionDtoFor } from '@src/modules/checkout/state/checkoutBus';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';

/**
 * Register a section and control its validation lifecycle.
 * @param sectionId - Section key (static or dynamic delivery:<groupId>)
 * @param options - Options including whether the section is required
 */
export function useSectionController<K extends import('../checkoutStore').SectionKey>(
  sectionId: K,
  options: { required: boolean }
) {
  const {
    registerSection,
    unregisterSection,
    sectionValid,
    sectionInvalid,
    resetSection,
    setSectionBusy,
  } = useCheckoutStore.getState();

  const busy = useCheckoutStore(
    (state) => state.sections[sectionId]?.busy ?? false
  );

  useEffect(() => {
    registerSection(sectionId, options.required);
    // Subscribe to operation lifecycle to reflect busy state
    const offStart = onCheckoutEvent(
      'operation/start',
      ({ sectionId: sid }) => {
        if (sid === sectionId) setSectionBusy(sectionId, true);
      }
    );
    const offEnd = onCheckoutEvent('operation/end', ({ sectionId: sid }) => {
      if (sid === sectionId) setSectionBusy(sectionId, false);
    });
    return () => {
      unregisterSection(sectionId);
      offStart();
      offEnd();
    };
  }, [
    registerSection,
    unregisterSection,
    sectionId,
    options.required,
    setSectionBusy,
  ]);

  return useMemo(
    () => ({
      busy,
      publishValid: (dto: SectionDtoFor<K>) => sectionValid(sectionId, dto as SectionDtoFor<K>),
      publishInvalid: (errors?: Record<string, string>) =>
        sectionInvalid(sectionId, undefined, errors),
      reset: () => resetSection(sectionId),
      setBusy: (isBusy: boolean) => setSectionBusy(sectionId, isBusy),
    }),
    [
      busy,
      sectionValid,
      sectionInvalid,
      resetSection,
      setSectionBusy,
      sectionId,
    ]
  );
}
