import type { Checkout } from '#checkout/types/entity';

/**
 * Promo codes the mock API knows, as the pricing would treat them. Any other code is refused
 * as invalid. Try them in the field of the order summary.
 */
export const PROMO_CODES: Record<
  string,
  { status: Checkout.PromoCodeStatus; message: string | null; percent: number }
> = {
  /** 10% off the goods. */
  WELCOME10: { status: 'APPLIED', message: null, percent: 10 },
  /** Waits for a delivery method that allows it. */
  FREESHIP: { status: 'PENDING', message: null, percent: 0 },
  /** Entered, but the order does not meet its condition. */
  SUMMER25: {
    status: 'REJECTED',
    message: 'The code works on orders from 1 500 UAH.',
    percent: 0,
  },
  /** Code of the loyalty voucher reward `reward-voucher`; its discount comes with the reward. */
  GOLD100: { status: 'APPLIED', message: null, percent: 0 },
};

/** A promo code entry of the checkout, as the API lists it. */
export function promoCode(code: string): Checkout.PromoCode {
  const known = PROMO_CODES[code];
  const applied = known?.status === 'APPLIED';
  return {
    code,
    status: known?.status ?? 'REJECTED',
    reason: applied
      ? null
      : known?.status === 'PENDING'
        ? 'AWAITING_DELIVERY'
        : 'CONDITION_NOT_MET',
    message: known?.message ?? null,
    appliedAt: applied ? new Date('2026-10-21T10:04:00Z') : null,
    discountType: applied && known.percent > 0 ? 'PERCENTAGE' : null,
    provider: applied ? 'shopana' : null,
    value: applied && known.percent > 0 ? known.percent : null,
  };
}

/** What the applied codes take off the goods, in the checkout currency. */
export function promoDiscount(checkout: Checkout.Checkout): number {
  const subtotal = checkout.cost.subtotalAmount.amount;
  return checkout.promoCodes
    .filter((entry) => entry.status === 'APPLIED')
    .reduce(
      (sum, entry) =>
        sum + (subtotal * (PROMO_CODES[entry.code]?.percent ?? 0)) / 100,
      0
    );
}
