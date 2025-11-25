'use client';

import type { model } from "@shopana/storefront-sdk";

/**
 * Compute bundle price by applying group items pricing rules on top of base price.
 */
export function computeBundlePrice(
  basePrice: model.Money,
  groups: model.ProductGroup[] | undefined,
  selectionsByGroupId: Record<
    string,
    { purchasableId: string; quantity: number }[]
  >
): model.Money {
  let total = basePrice.amount;
  const currencyCode = basePrice.currencyCode;

  if (!groups || groups.length === 0) {
    return { amount: total, currencyCode };
  }

  const groupById = new Map(groups.map((g) => [g.id, g] as const));
  for (const [groupId, items] of Object.entries(selectionsByGroupId)) {
    const group = groupById.get(groupId);
    if (!group) continue;

    for (const sel of items) {
      const item = group.items.find((x) => x.node.id === sel.purchasableId);
      if (!item) continue;

      const qty = Math.max(0, sel.quantity || 0);
      if (qty === 0) continue;

      const priceCfg = item.price;
      // Default behavior mirrors BASE when nothing specified
      const type = ((): model.ProductGroupPriceType => {
        // Infer type by present fields
        const hasPercent = (priceCfg as any)?.percentage != null;
        const hasAmount = (priceCfg as any)?.amount != null;
        if (hasPercent) return 'PERCENT';
        if (hasAmount) return 'FIXED';
        return 'BASE';
      })();

      switch (type) {
        case 'FREE':
          // no-op
          break;
        case 'FIXED': {
          const amount = (priceCfg as any)?.amount?.amount ?? 0;
          total += amount * qty;
          break;
        }
        case 'PERCENT': {
          const percent = (priceCfg as any)?.percentage ?? 0;
          total += basePrice.amount * (percent / 100) * qty;
          break;
        }
        case 'BASE':
        default: {
          const childBase = item.node.price?.amount ?? 0;
          total += childBase * qty;
          break;
        }
      }
    }
  }

  return { amount: total, currencyCode };
}
