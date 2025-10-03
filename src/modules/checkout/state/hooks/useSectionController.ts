/**
 * Section controller hook for Checkout sections.
 * Registers section lifecycle in the Checkout store and exposes methods to publish validation.
 */
import { useEffect, useMemo } from 'react';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';

/**
 * Register a section and control its validation lifecycle.
 * @param sectionId - Section key (static or dynamic shipping:<groupId>)
 * @param options - Options including whether the section is required
 */
export function useSectionController(
  sectionId: import('../checkoutStore').SectionKey,
  options: { required: boolean }
) {
  const {
    registerSection,
    unregisterSection,
    sectionValid,
    sectionInvalid,
    resetSection,
  } = useCheckoutStore((s) => ({
    registerSection: s.registerSection,
    unregisterSection: s.unregisterSection,
    sectionValid: s.sectionValid,
    sectionInvalid: s.sectionInvalid,
    resetSection: s.resetSection,
  }));

  useEffect(() => {
    registerSection(sectionId, options.required);
    return () => {
      unregisterSection(sectionId);
    };
  }, [registerSection, unregisterSection, sectionId, options.required]);

  return useMemo(
    () => ({
      publishValid: (data: unknown) => sectionValid(sectionId, data),
      publishInvalid: (errors?: Record<string, string>) => sectionInvalid(sectionId, errors),
      reset: () => resetSection(sectionId),
    }),
    [sectionValid, sectionInvalid, resetSection, sectionId]
  );
}
