import type { Checkout } from '#checkout/types/entity';

/**
 * Limits of an amount the buyer types for a source, from the values the API gives: the program
 * minimum, the balance, the program limit per order and, when the maximum is applied, the limit
 * of this order. Nothing is calculated beyond picking the smallest upper bound.
 */
export interface RedemptionBounds {
  /** Points as an integer string, or an amount in the currency. */
  min: string;
  max: string | null;
}

const smallestPoints = (values: (string | null | undefined)[]): string | null =>
  values
    .filter(
      (value): value is string =>
        typeof value === 'string' && /^\d+$/.test(value)
    )
    .reduce<
      string | null
    >((smallest, value) => (smallest === null || BigInt(value) < BigInt(smallest) ? value : smallest), null);

const smallestAmount = (
  values: (number | null | undefined)[]
): string | null => {
  const known = values.filter(
    (value): value is number =>
      typeof value === 'number' && Number.isFinite(value)
  );
  return known.length > 0 ? String(Math.min(...known)) : null;
};

export function redemptionBounds(
  option: Checkout.LoyaltySourceOption,
  redemption: Checkout.LoyaltyRedemption | null
): RedemptionBounds {
  const orderMaximum =
    redemption?.source === option.source &&
    redemption.requestedPoints === null &&
    redemption.requestedAmount === null
      ? redemption
      : null;
  if (option.source === 'POINTS') {
    return {
      min: option.minimum.points ?? '1',
      max: smallestPoints([
        option.availablePoints,
        option.maximumPerOrder?.points,
        orderMaximum?.points,
      ]),
    };
  }
  return {
    min: String(option.minimum.amount.amount),
    max: smallestAmount([
      option.availableAmount.amount,
      option.maximumPerOrder?.amount.amount,
      orderMaximum?.discount.amount,
    ]),
  };
}

/** Whether a typed value reaches the upper bound: it is sent as the maximum, not as a number. */
export function reachesMaximum(
  source: Checkout.LoyaltySource,
  value: string,
  bounds: RedemptionBounds
): boolean {
  if (bounds.max === null) return false;
  return source === 'POINTS'
    ? BigInt(value) >= BigInt(bounds.max)
    : Number(value) >= Number(bounds.max);
}

/**
 * Whether the applied redemption is the most the buyer can use: the maximum was asked for, the
 * service lowered the request to the most the order allows, or the request reaches the known
 * upper bound. "Redeem the maximum" is not offered then.
 */
export function isAtMaximum(
  option: Checkout.LoyaltySourceOption,
  redemption: Checkout.LoyaltyRedemption
): boolean {
  if (
    redemption.requestedPoints === null &&
    redemption.requestedAmount === null
  )
    return true;
  const { max } = redemptionBounds(option, redemption);
  if (redemption.source === 'POINTS') {
    if (redemption.points === null) return false;
    const applied = BigInt(redemption.points);
    if (
      redemption.requestedPoints !== null &&
      applied < BigInt(redemption.requestedPoints)
    ) {
      return true;
    }
    return max !== null && applied >= BigInt(max);
  }
  const applied = redemption.discount.amount;
  if (
    redemption.requestedAmount !== null &&
    applied < redemption.requestedAmount.amount
  ) {
    return true;
  }
  return max !== null && applied >= Number(max);
}

export type AmountError =
  | { code: 'invalid' }
  | { code: 'too-small'; min: string }
  | { code: 'too-large'; max: string };

const POINTS_INPUT = /^\d+$/;
const AMOUNT_INPUT = /^\d+(?:[.,]\d{1,2})?$/;

/** Normalized value the buyer typed: points without leading zeros, or a decimal with a dot. */
export function parseRedemptionInput(
  source: Checkout.LoyaltySource,
  raw: string
): string | null {
  const value = raw.trim().replace(/\s/g, '');
  if (source === 'POINTS') {
    return POINTS_INPUT.test(value) && BigInt(value) > 0n
      ? BigInt(value).toString()
      : null;
  }
  if (!AMOUNT_INPUT.test(value)) return null;
  const normalized = value.replace(',', '.');
  return Number(normalized) > 0 ? normalized : null;
}

/** Why a typed value is outside the bounds, or `null` when it can be sent. */
export function checkRedemptionInput(
  source: Checkout.LoyaltySource,
  value: string | null,
  bounds: RedemptionBounds
): AmountError | null {
  if (value === null) return { code: 'invalid' };
  if (source === 'POINTS') {
    if (BigInt(value) < BigInt(bounds.min))
      return { code: 'too-small', min: bounds.min };
    if (bounds.max !== null && BigInt(value) > BigInt(bounds.max)) {
      return { code: 'too-large', max: bounds.max };
    }
    return null;
  }
  if (Number(value) < Number(bounds.min))
    return { code: 'too-small', min: bounds.min };
  if (bounds.max !== null && Number(value) > Number(bounds.max)) {
    return { code: 'too-large', max: bounds.max };
  }
  return null;
}
