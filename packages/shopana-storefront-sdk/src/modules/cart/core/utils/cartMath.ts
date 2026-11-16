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

const scaleMoney = (money: model.Money, factor: number): model.Money => ({
  amount: parseAmount(money.amount) * factor,
  currencyCode: money.currencyCode,
});

/**
 * Compute costs of a line that has no server calculation yet: price per unit only, no discounts.
 */
export const computeLineTotals = (
  line: LineWithPrice
): LineWithPrice['cost'] => {
  const unit = parseAmount(line.cost.unitPrice?.amount ?? 0);
  const subtotal = unit * parseAmount(line.quantity);
  const currencyCode =
    line.cost.unitPrice?.currencyCode || line.cost.totalAmount.currencyCode;

  return {
    unitPrice: { amount: unit, currencyCode },
    compareAtUnitPrice: line.cost.compareAtUnitPrice || null,
    subtotalAmount: { amount: subtotal, currencyCode },
    discountAmount: { amount: 0, currencyCode },
    totalAmount: { amount: subtotal, currencyCode },
  };
};

/**
 * Change the quantity of a line keeping the server calculation: subtotal, discount and total
 * scale with the quantity, so a confirmed line never loses its discount before the server answers.
 * A non-linear promotion is corrected by the confirmed cart.
 */
export const withQuantity = <L extends LineWithPrice>(
  line: L,
  quantity: number
): L => {
  const previous = parseAmount(line.quantity);
  if (line.isOptimistic || previous <= 0) {
    return {
      ...line,
      quantity,
      cost: computeLineTotals({ ...line, quantity }),
    };
  }
  const factor = quantity / previous;
  return {
    ...line,
    quantity,
    cost: {
      ...line.cost,
      subtotalAmount: scaleMoney(line.cost.subtotalAmount, factor),
      discountAmount: scaleMoney(line.cost.discountAmount, factor),
      totalAmount: scaleMoney(line.cost.totalAmount, factor),
    },
  };
};

const sumLines = (
  lines: model.Cart['lines'],
  pick: (line: LineWithPrice) => model.Money
) => lines.reduce((acc, l) => acc + parseAmount(pick(l).amount), 0);

/**
 * Compute cart totals from all lines. The discount follows the change of the line discounts,
 * so discounts the server applied to the whole cart are kept.
 */
export const computeCartTotals = (
  cart: model.Cart,
  previous: model.Cart
): model.Cart['cost'] => {
  const currency =
    cart.cost.totalAmount.currencyCode || cart.cost.subtotalAmount.currencyCode;
  const subtotal = sumLines(cart.lines, (l) => l.cost.subtotalAmount);
  const lineDiscountChange =
    sumLines(cart.lines, (l) => l.cost.discountAmount) -
    sumLines(previous.lines, (l) => l.cost.discountAmount);
  const discount = Math.max(
    0,
    parseAmount(previous.cost.totalDiscountAmount.amount) + lineDiscountChange
  );
  const merchandiseDiscount = Math.max(
    0,
    parseAmount(previous.cost.merchandiseDiscountAmount.amount) +
      lineDiscountChange
  );
  const shipping = parseAmount(cart.cost.totalShippingAmount.amount);
  const tax = parseAmount(cart.cost.totalTaxAmount.amount);
  const total = subtotal - discount + shipping + tax;

  return {
    subtotalAmount: { amount: subtotal, currencyCode: currency },
    totalAmount: { amount: total, currencyCode: currency },
    totalDiscountAmount: { amount: discount, currencyCode: currency },
    totalTaxAmount: { amount: tax, currencyCode: currency },
    totalShippingAmount: { amount: shipping, currencyCode: currency },
    merchandiseDiscountAmount: {
      amount: merchandiseDiscount,
      currencyCode: currency,
    },
    // Not known locally: kept from the last server calculation.
    loyaltyAmount: cart.cost.loyaltyAmount,
  };
};

/**
 * Recalculate cart totals based on line items
 * Used for optimistic updates on the client; `previous` is the cart before the change.
 */
export const recalcCart = (
  cart: model.Cart,
  previous: model.Cart
): model.Cart => {
  const lines = cart.lines.map((line) =>
    line.isOptimistic ? { ...line, cost: computeLineTotals(line) } : line
  );
  const totalQuantity = lines.reduce(
    (acc, l) => acc + parseAmount(l.quantity),
    0
  );
  const cost = computeCartTotals({ ...cart, lines, totalQuantity }, previous);
  return { ...cart, lines, totalQuantity, cost };
};
