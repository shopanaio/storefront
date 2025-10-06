/**
 * Derived selectors for Checkout store.
 */
import { useCheckoutStore, isSectionValid, computeMissingRequiredSections } from '@src/modules/checkout/state/checkoutStore';

export type { SectionKey, SectionId, DeliverySectionId, DeliveryGroupId } from '@src/modules/checkout/state/checkoutStore';

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
 * Returns true if there are any active operations (mutations in-flight).
 */
export function useHasActiveOperations(): boolean {
  return useCheckoutStore((state) => state.activeOperationsCount > 0);
}
