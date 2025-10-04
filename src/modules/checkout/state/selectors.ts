/**
 * Derived selectors for Checkout store.
 */
import { useCheckoutStore, isSectionValid, computeMissingRequiredSections } from '@src/modules/checkout/state/checkoutStore';

export type { SectionKey, SectionId, ShippingSectionId, DeliveryGroupId } from '@src/modules/checkout/state/checkoutStore';

/**
 * Returns true if a specific section is valid according to store rules.
 */
export function useIsSectionValid(sectionKey: import('./checkoutStore').SectionKey): boolean {
  return useCheckoutStore((state) => isSectionValid(state, sectionKey));
}

/**
 * Returns list of missing required sections considering delivery groups and providers state.
 */
export function useMissingRequiredSections(): Array<import('./checkoutStore').SectionKey> {
  return useCheckoutStore((state) => computeMissingRequiredSections(state));
}

/**
 * Returns true when there are no missing required sections.
 */
export function useCanSubmit(): boolean {
  return useCheckoutStore((state) => computeMissingRequiredSections(state).length === 0);
}

/**
 * Returns the active shipping provider id for a given group, if any.
 */
export function useActiveShippingProvider(groupId: string): string | null {
  return useCheckoutStore((s) => {
    const sel = s.selectedShippingMethodByGroup[groupId];
    if (!sel) return null;
    const providerId = `shipping:${sel.vendor}@${groupId}` as const;
    return s.providers[providerId]?.active ? providerId : null;
  });
}

/**
 * Returns the active payment provider id, if any.
 */
export function useActivePaymentProvider(): string | null {
  return useCheckoutStore((s) => {
    const sel = s.selectedPaymentMethod;
    if (!sel) return null;
    const providerId = `payment:${sel.vendor}` as const;
    return s.providers[providerId]?.active ? providerId : null;
  });
}
