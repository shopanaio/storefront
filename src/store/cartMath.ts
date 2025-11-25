import type { model } from "@shopana/storefront-sdk";

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

export const computeLineTotals = (line: LineWithPrice): LineWithPrice['cost'] => {
  const unit = parseAmount(line.cost.unitPrice?.amount ?? 0);
  const quantity = parseAmount(line.quantity);
  const subtotal = unit * quantity;
  const total = subtotal; // локально скидки неизвестны
  return {
    unitPrice: {
      amount: unit,
      currencyCode: line.cost.unitPrice?.currencyCode || line.cost.totalAmount.currencyCode,
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

export const computeCartTotals = (cart: model.Cart): model.Cart['cost'] => {
  const currency = cart.cost.totalAmount.currencyCode || cart.cost.subtotalAmount.currencyCode;
  const subtotal = cart.lines.reduce((acc, l) => acc + parseAmount(l.cost.subtotalAmount.amount), 0);
  const localDiscount = cart.lines.reduce(
    (acc, l) => acc + Math.max(parseAmount(l.cost.subtotalAmount.amount) - parseAmount(l.cost.totalAmount.amount), 0),
    0
  );
  const discount = parseAmount(cart.cost.totalDiscountAmount?.amount ?? localDiscount);
  const shipping = parseAmount(cart.cost.totalShippingAmount?.amount ?? 0);
  const tax = parseAmount(cart.cost.totalTaxAmount?.amount ?? 0);
  const total = subtotal - discount + shipping + tax;
  return {
    subtotalAmount: { amount: subtotal, currencyCode: currency },
    totalAmount: { amount: total, currencyCode: currency },
    totalDiscountAmount: cart.cost.totalDiscountAmount ? { amount: discount, currencyCode: currency } : { amount: 0, currencyCode: currency },
    totalTaxAmount: cart.cost.totalTaxAmount ? { amount: tax, currencyCode: currency } : { amount: 0, currencyCode: currency },
    totalShippingAmount: cart.cost.totalShippingAmount ? { amount: shipping, currencyCode: currency } : { amount: 0, currencyCode: currency },
  };
};

export const recalcCart = (cart: model.Cart): model.Cart => {
  const lines = cart.lines.map((line) => ({
    ...line,
    cost: computeLineTotals(line),
  }));
  const totalQuantity = lines.reduce((acc, l) => acc + parseAmount(l.quantity), 0);
  const cost = computeCartTotals({ ...cart, lines, totalQuantity } as model.Cart);
  return { ...cart, lines, totalQuantity, cost };
};
