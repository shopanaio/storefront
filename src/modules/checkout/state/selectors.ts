/**
 * Derived selectors for Checkout store.
 */
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';

export type { SectionKey, SectionId, ShippingSectionId, DeliveryGroupId } from '@src/modules/checkout/state/checkoutStore';

/**
 * Returns true if a specific section is valid according to store rules.
 */
export function useIsSectionValid(sectionKey: import('./checkoutStore').SectionKey): boolean {
  return useCheckoutStore((state) => {
    const entry = state.sections[sectionKey];
    if (!entry) return false;
    const isShipping = sectionKey.startsWith('shipping:');
    if (isShipping) {
      const groupId = sectionKey.slice('shipping:'.length);
      const selected = state.selectedShippingMethodByGroup[groupId] ?? null;
      if (!selected?.code) return false;
      const provider = state.providers[`shipping:${selected.vendor}@${groupId}` as const];
      return Boolean(provider && provider.active && provider.status === 'valid');
    }
    if (sectionKey === 'payment') {
      const sel = state.selectedPaymentMethod;
      if (!sel?.code) return false;
      const provider = state.providers[`payment:${sel.vendor}` as const];
      return Boolean(provider && provider.active && provider.status === 'valid');
    }
    return entry.status === 'valid';
  });
}

/**
 * Returns list of missing required sections considering delivery groups and providers state.
 */
export function useMissingRequiredSections(): Array<import('./checkoutStore').SectionKey> {
  return useCheckoutStore((state) => {
    const missing: Array<import('./checkoutStore').SectionKey> = [];

    for (const [key, entry] of Object.entries(state.sections)) {
      if (!entry) continue;
      if (!entry.required) continue;
      const k = key as import('./checkoutStore').SectionKey;
      const isShipping = k.startsWith('shipping:');
      if (isShipping) {
        const groupId = k.slice('shipping:'.length);
        const selected = state.selectedShippingMethodByGroup[groupId] ?? null;
        const code = selected?.code ?? null;
        const provider = code ? state.providers[`shipping:${selected!.vendor}@${groupId}` as const] : undefined;
        const ok = Boolean(code && provider && provider.active && provider.status === 'valid');
        if (!ok) missing.push(k);
        continue;
      }
      if (k === 'payment') {
        const sel = state.selectedPaymentMethod;
        const code = sel?.code ?? null;
        const provider = code ? state.providers[`payment:${sel!.vendor}` as const] : undefined;
        const ok = Boolean(code && provider && provider.active && provider.status === 'valid');
        if (!ok) missing.push('payment');
        continue;
      }
      if (entry.status !== 'valid') missing.push(k);
    }

    return missing;
  });
}

/**
 * Returns true when there are no missing required sections.
 */
export function useCanSubmit(): boolean {
  return useCheckoutStore((state) => {
    const missing: Array<string> = [];
    for (const [key, entry] of Object.entries(state.sections)) {
      if (!entry || !entry.required) continue;
      const k = key as import('./checkoutStore').SectionKey;
      const isShipping = k.startsWith('shipping:');
      if (isShipping) {
        const groupId = k.slice('shipping:'.length);
        const selection = state.selectedShippingMethodByGroup[groupId] ?? null;
        const provider = selection
          ? state.providers[`shipping:${selection.vendor}@${groupId}` as const]
          : undefined;
        if (!(selection?.code && provider && provider.active && provider.status === 'valid')) missing.push(k);
        continue;
      }
      if (k === 'payment') {
        const sel = state.selectedPaymentMethod ?? null;
        const provider = sel
          ? state.providers[`payment:${sel.vendor}` as const]
          : undefined;
        if (!(sel?.code && provider && provider.active && provider.status === 'valid')) missing.push('payment');
        continue;
      }
      if (entry.status !== 'valid') missing.push(k);
    }
    return missing.length === 0;
  });
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
