import type { model } from '../../../../model/namespace';

/**
 * Parse amount from various types to number
 */
export const parseAmount = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const p = parseFloat(value);
    return Number.isNaN(p) ? 0 : p;
  }
  if (typeof value === 'bigint') return Number(value);
  if (value == null) return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
};

export type LineWithPrice = model.Cart['lines'][number];

/**
 * Compute totals for a single cart line
 */
export const computeLineTotals = (
  line: LineWithPrice
): LineWithPrice['cost'] => {
  const unit = parseAmount(line.cost.unitPrice?.amount ?? 0);
  const quantity = parseAmount(line.quantity);
  const subtotal = unit * quantity;
  const total = subtotal; // discounts are unknown locally

  return {
    unitPrice: {
      amount: unit,
      currencyCode:
        line.cost.unitPrice?.currencyCode || line.cost.totalAmount.currencyCode,
    },
    compareAtUnitPrice: line.cost.compareAtUnitPrice || null,
    subtotalAmount: {
      amount: subtotal,
      currencyCode: line.cost.totalAmount.currencyCode,
    },
    totalAmount: {
      amount: total,
      currencyCode: line.cost.totalAmount.currencyCode,
    },
  };
};

/**
 * Compute cart totals from all lines
 */
export const computeCartTotals = (cart: model.Cart): model.Cart['cost'] => {
  const currency =
    cart.cost.totalAmount.currencyCode || cart.cost.subtotalAmount.currencyCode;
  const subtotal = cart.lines.reduce(
    (acc, l) => acc + parseAmount(l.cost.subtotalAmount.amount),
    0
  );
  const discount = parseAmount(cart.cost.totalDiscountAmount.amount);
  const shipping = parseAmount(cart.cost.totalShippingAmount.amount);
  const tax = parseAmount(cart.cost.totalTaxAmount.amount);
  const total = subtotal - discount + shipping + tax;

  return {
    subtotalAmount: { amount: subtotal, currencyCode: currency },
    totalAmount: { amount: total, currencyCode: currency },
    totalDiscountAmount: { amount: discount, currencyCode: currency },
    totalTaxAmount: { amount: tax, currencyCode: currency },
    totalShippingAmount: { amount: shipping, currencyCode: currency },
    // Not known locally: kept from the last server calculation.
    merchandiseDiscountAmount: cart.cost.merchandiseDiscountAmount,
    loyaltyAmount: cart.cost.loyaltyAmount,
  };
};

/**
 * Recalculate cart totals based on line items
 * Used for optimistic updates on the client
 */
export const recalcCart = (cart: model.Cart): model.Cart => {
  const lines = cart.lines.map((line) => ({
    ...line,
    cost: computeLineTotals(line),
  }));
  const totalQuantity = lines.reduce(
    (acc, l) => acc + parseAmount(l.quantity),
    0
  );
  const cost = computeCartTotals({
    ...cart,
    lines,
    totalQuantity,
  } as model.Cart);
  return { ...cart, lines, totalQuantity, cost };
};
