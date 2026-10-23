import { create } from 'zustand';
import type { CreateCartInput } from '@shopana/storefront-sdk/modules/cart/core/types';
import type { AddToCartAttribute } from '@shopana/storefront-sdk/modules/cart/core/types';
import type { Checkout } from '#checkout/types/entity';

/**
 * Replacement of an expired or abandoned checkout (R5): a new checkout with the same lines.
 * The buyer checks delivery again; contacts and promo codes are not carried over.
 * - `renewing`: the new checkout is being created;
 * - `renewed`: the checkout on screen replaced an expired one;
 * - `failed`: creating it failed; the buyer can retry.
 */
export type RenewalState = 'idle' | 'renewing' | 'renewed' | 'failed';

interface RenewalStore {
  state: RenewalState;
  /** Creates the new checkout again after a failure; set by the lifecycle controller. */
  retry: (() => void) | null;
  setState: (state: RenewalState) => void;
  setRetry: (retry: (() => void) | null) => void;
}

export const useRenewalStore = create<RenewalStore>((set) => ({
  state: 'idle',
  retry: null,
  setState: (state) => set({ state }),
  setRetry: (retry) => set({ retry }),
}));

/** Input of the new checkout: lines with their purchase, attributes, tags and components. */
export function renewalInput(checkout: Checkout.Checkout): CreateCartInput {
  const tags = new Map<string, boolean>();
  for (const line of checkout.lines) {
    if (line.tag) tags.set(line.tag.slug, line.tag.unique);
  }
  return {
    currencyCode: checkout.currencyCode,
    localeCode: checkout.localeCode,
    tags: [...tags].map(([slug, unique]) => ({ slug, unique })),
    items: checkout.lines.map((line) => ({
      purchasableId: line.purchasableId,
      quantity: line.quantity,
      purchase: line.purchase,
      attributes: line.attributes ?? undefined,
      tagSlug: line.tag?.slug,
      children: line.children.length
        ? line.children.flatMap((child) =>
            child.componentItemId
              ? [
                  {
                    componentItemId: child.componentItemId,
                    purchasableId: child.purchasableId,
                    quantity: child.quantity,
                    // Passed back as the API returned them.
                    attributes: (child.attributes ?? undefined) as
                      | AddToCartAttribute[]
                      | undefined,
                  },
                ]
              : []
          )
        : undefined,
    })),
  };
}
