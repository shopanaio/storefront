import { createHash } from 'node:crypto';

import { money } from './fixture-helpers.js';

/**
 * Automatic promotions of the mock store, by the rules of Pricing: what the storefront shows on a
 * variant (BR-sp01–BR-sp04), the cart progress to each threshold (BR-pg01–BR-pg04), and the
 * discounts and free shipping applied to a checkout.
 *
 * A fixture promotion is a `StorefrontPromotion` plus the fields the mock needs to apply it:
 * `targets` (`variantIds`, `productIds`, `categoryIds`) of a product discount or Buy X Get Y,
 * `sortOrder`, `priority` and `storefrontVisible` (false hides it and keeps it applied).
 */

const isActive = (promotion, at) =>
  Date.parse(promotion.startsAt) <= at &&
  (!promotion.endsAt || Date.parse(promotion.endsAt) > at);

const bySortOrder = (left, right) =>
  (left.sortOrder ?? 0) - (right.sortOrder ?? 0) ||
  (right.priority ?? 0) - (left.priority ?? 0) ||
  left.key.localeCompare(right.key);

const isVisible = (promotion) => promotion.storefrontVisible !== false;

const activePromotions = (store) =>
  store.state.promotions
    .filter((promotion) => isActive(promotion, store.clock))
    .sort(bySortOrder);

const hasTargets = (promotion) =>
  ['PRODUCT_DISCOUNT', 'BUY_X_GET_Y'].includes(promotion.kind);

const matchesVariant = (store, promotion, variant) => {
  if (!hasTargets(promotion)) return true;
  const {
    variantIds = [],
    productIds = [],
    categoryIds = [],
  } = promotion.targets ?? {};
  const product = store.get(variant.productId);
  return (
    variantIds.includes(variant.id) ||
    productIds.includes(variant.productId) ||
    (product?.categoryIds ?? []).some((id) => categoryIds.includes(id))
  );
};

/** Nearest future start or end of any published promotion: the visible set may change then. */
const nextBoundary = (store) => {
  const boundaries = store.state.promotions
    .filter(isVisible)
    .flatMap(({ startsAt, endsAt }) => [startsAt, endsAt])
    .filter((value) => value && Date.parse(value) > store.clock)
    .sort((left, right) => Date.parse(left) - Date.parse(right));
  return boundaries[0] ?? null;
};

/** `kinds: null` returns every kind, `kinds: []` none. */
export const promotionPresentation = (
  store,
  { kinds = null, variant } = {}
) => {
  const promotions = activePromotions(store).filter(
    (promotion) =>
      isVisible(promotion) &&
      (kinds == null || kinds.includes(promotion.kind)) &&
      (!variant || matchesVariant(store, promotion, variant))
  );
  return {
    promotions,
    evaluatedAt: new Date(store.clock).toISOString(),
    validUntil: nextBoundary(store),
    revision: createHash('sha1')
      .update(JSON.stringify(promotions))
      .digest('hex')
      .slice(0, 16),
  };
};

const round2 = (value) => Math.round(value * 100) / 100;

const requirementOf = (promotion, base, currencyCode) => {
  if (promotion.minimumSubtotal) {
    const required = Number(promotion.minimumSubtotal.amount);
    const remaining = Math.max(0, round2(required - base.subtotal));
    return {
      type: 'SUBTOTAL',
      required: money(required, currencyCode),
      current: money(base.subtotal, currencyCode),
      remaining: money(remaining, currencyCode),
      requiredQuantity: null,
      currentQuantity: null,
      remainingQuantity: null,
      ratio: ratio(base.subtotal, required),
    };
  }
  const required = promotion.minimumQuantity;
  return {
    type: 'QUANTITY',
    required: null,
    current: null,
    remaining: null,
    requiredQuantity: required,
    currentQuantity: base.quantity,
    remainingQuantity: Math.max(0, required - base.quantity),
    ratio: ratio(base.quantity, required),
  };
};

const ratio = (current, required) =>
  String(Math.floor(Math.min(1, current / required) * 10_000) / 10_000);

const hasMinimum = (promotion) =>
  Boolean(promotion.minimumSubtotal) || promotion.minimumQuantity > 0;

const remainingOf = ({ requirement }) =>
  requirement.type === 'SUBTOTAL'
    ? Number(requirement.remaining.amount)
    : requirement.remainingQuantity;

/** Subtotal thresholds first by the smallest remainder, then quantity ones by the largest ratio. */
const byNearest = (left, right) =>
  (left.requirement.type === 'SUBTOTAL' ? 0 : 1) -
    (right.requirement.type === 'SUBTOTAL' ? 0 : 1) ||
  (left.requirement.type === 'SUBTOTAL'
    ? remainingOf(left) - remainingOf(right)
    : Number(right.requirement.ratio) - Number(left.requirement.ratio)) ||
  byPriority(left, right);

const byPriority = (left, right) =>
  (right.promotion.priority ?? 0) - (left.promotion.priority ?? 0) ||
  left.promotion.key.localeCompare(right.promotion.key);

const discountOf = (promotion, base) => {
  const value = promotion.value;
  if (!value) return 0;
  let amount = 0;
  if (value.type === 'PERCENTAGE')
    amount = (base * Number(value.percentage)) / 100;
  if (value.type === 'FIXED_AMOUNT') amount = Number(value.amount.amount);
  if (value.maximumDiscount)
    amount = Math.min(amount, Number(value.maximumDiscount.amount));
  return round2(Math.min(amount, base));
};

/**
 * Evaluates the automatic promotions of a checkout before shipping is priced. The thresholds use
 * line subtotals before any discount (BR-pg02); a product discount counts only its target lines.
 * Buy X Get Y is shown on variants but neither applied nor tracked.
 */
export const evaluatePromotions = (store, checkout) => {
  const lines = checkout.lines;
  const baseOf = (matching) => ({
    subtotal: round2(
      matching.reduce(
        (sum, line) => sum + Number(line.cost.subtotalAmount.amount),
        0
      )
    ),
    quantity: matching.reduce((sum, line) => sum + line.quantity, 0),
  });
  const evaluations = [];
  for (const promotion of activePromotions(store)) {
    if (promotion.kind === 'BUY_X_GET_Y') continue;
    const matching = lines.filter((line) => {
      const variant = store.get(line.purchasableId);
      return variant && matchesVariant(store, promotion, variant);
    });
    if (promotion.kind === 'PRODUCT_DISCOUNT' && !matching.length) continue;
    const base = baseOf(matching);
    const blocked = lines.some(({ purchase }) =>
      purchase?.type === 'SUBSCRIPTION'
        ? !promotion.appliesOnSubscription
        : !promotion.appliesOnOneTimePurchase
    );
    const requirement = hasMinimum(promotion)
      ? requirementOf(promotion, base, checkout.currencyCode)
      : null;
    const met = requirement
      ? remainingOf({ requirement }) === 0
      : lines.length > 0;
    evaluations.push({
      promotion,
      base,
      requirement,
      status: blocked ? 'BLOCKED' : met ? 'SATISFIED' : 'IN_PROGRESS',
    });
  }

  checkout.promotionProgress = evaluations
    .filter(({ promotion, requirement }) => isVisible(promotion) && requirement)
    .map(({ promotion, status, requirement }) => ({
      promotion,
      status,
      requirement,
    }));

  const appliedPromotions = [];
  let productDiscount = 0;
  for (const evaluation of evaluations) {
    if (
      evaluation.promotion.kind !== 'PRODUCT_DISCOUNT' ||
      evaluation.status !== 'SATISFIED'
    )
      continue;
    const amount = discountOf(evaluation.promotion, evaluation.base.subtotal);
    if (amount === 0) continue;
    productDiscount += amount;
    appliedPromotions.push(
      applied(evaluation.promotion, 'PRODUCT', amount, checkout)
    );
  }
  let orderDiscount = 0;
  const subtotal = baseOf(lines).subtotal;
  for (const evaluation of evaluations) {
    if (
      evaluation.promotion.kind !== 'ORDER_DISCOUNT' ||
      evaluation.status !== 'SATISFIED'
    )
      continue;
    const amount = discountOf(
      evaluation.promotion,
      Math.max(0, subtotal - productDiscount - orderDiscount)
    );
    if (amount === 0) continue;
    orderDiscount += amount;
    appliedPromotions.push(
      applied(evaluation.promotion, 'ORDER', amount, checkout)
    );
  }
  checkout.appliedPromotions = appliedPromotions;

  const freeShipping = evaluations.filter(
    ({ promotion }) => promotion.kind === 'FREE_SHIPPING'
  );
  return {
    discount: round2(productDiscount + orderDiscount),
    freeShipping:
      freeShipping
        .filter(({ status }) => status === 'SATISFIED')
        .sort(byPriority)[0] ?? null,
    nextFreeShipping:
      freeShipping
        .filter(
          ({ promotion, status, requirement }) =>
            isVisible(promotion) && status === 'IN_PROGRESS' && requirement
        )
        .sort(byNearest)[0] ?? null,
  };
};

const applied = (promotion, discountClass, amount, checkout) => ({
  title: promotion.presentation.headline,
  discountClass,
  amount: money(amount, checkout.currencyCode),
  promotion: isVisible(promotion) ? promotion : null,
});

const optionCost = (group) =>
  Number(group.selection?.option?.cost?.amount ?? 0);

/**
 * Makes the selected delivery groups free and builds the free-shipping summary (BR-pg04): a
 * satisfied discount first, then a free-shipping reward of the buyer, then the nearest threshold.
 * A limit compares with the original option cost. Returns the shipping the buyer still pays.
 */
export const applyFreeShipping = (
  checkout,
  { freeShipping, nextFreeShipping },
  reward
) => {
  const groups = checkout.deliveryGroups.filter(
    (group) => group.selection?.option
  );
  for (const group of checkout.deliveryGroups) group.freeShipping = null;

  const source = freeShipping
    ? {
        source: 'DISCOUNT',
        title: freeShipping.promotion.presentation.headline,
        maximum: freeShipping.promotion.value?.maximumShippingPrice ?? null,
      }
    : reward
      ? { source: 'LOYALTY_REWARD', title: reward.headline, maximum: null }
      : null;

  let covered = 0;
  if (source) {
    for (const group of groups) {
      const cost = optionCost(group);
      if (source.maximum && cost > Number(source.maximum.amount)) continue;
      covered += cost;
      group.freeShipping = {
        source: source.source,
        title: source.title,
        code: null,
      };
    }
  }
  if (freeShipping && covered > 0) {
    checkout.appliedPromotions.push(
      applied(freeShipping.promotion, 'SHIPPING', covered, checkout)
    );
  }

  const appliesToSelectedDelivery =
    source && groups.length ? groups.some((group) => group.freeShipping) : null;
  if (freeShipping) {
    checkout.freeShippingProgress = {
      status: 'SATISFIED',
      source: 'DISCOUNT',
      title: source.title,
      // A hidden promotion still makes shipping free but is not shown.
      promotion: isVisible(freeShipping.promotion)
        ? freeShipping.promotion
        : null,
      requirement: freeShipping.requirement,
      nextRequirement: null,
      maximumShippingPrice: source.maximum,
      appliesToSelectedDelivery,
    };
  } else if (reward) {
    checkout.freeShippingProgress = {
      status: 'SATISFIED',
      source: 'LOYALTY_REWARD',
      title: source.title,
      promotion: null,
      requirement: null,
      nextRequirement: nextFreeShipping?.requirement ?? null,
      maximumShippingPrice: null,
      appliesToSelectedDelivery,
    };
  } else if (nextFreeShipping) {
    checkout.freeShippingProgress = {
      status: 'IN_PROGRESS',
      source: null,
      title: nextFreeShipping.promotion.presentation.headline,
      promotion: nextFreeShipping.promotion,
      requirement: nextFreeShipping.requirement,
      nextRequirement: null,
      maximumShippingPrice:
        nextFreeShipping.promotion.value?.maximumShippingPrice ?? null,
      appliesToSelectedDelivery: null,
    };
  } else {
    checkout.freeShippingProgress = null;
  }

  const shipping = groups.reduce((sum, group) => sum + optionCost(group), 0);
  return round2(shipping - covered);
};
