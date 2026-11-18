import { createHash } from 'node:crypto';

import { money } from './fixture-helpers.js';

/**
 * Automatic promotions of the mock store, by the rules of Pricing: what the storefront shows on a
 * variant (BR-sp01–BR-sp04), the cart progress to each threshold (BR-pg01–BR-pg04), and the
 * discounts and free shipping applied to a checkout.
 *
 * A fixture promotion is a `StorefrontPromotion` plus the fields the mock needs to apply it:
 * `targets` (`variantIds`, `productIds`, `categoryIds`) of a product discount or the qualifier
 * items of Buy X Get Y, `benefitTargets` (the same shape) of Buy X Get Y with `benefitScope`
 * OTHER, `usesPerOrderLimit`, `sortOrder`, `priority` and `storefrontVisible` (false hides it
 * and keeps it applied).
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

const matchesVariant = (store, promotion, variant) =>
  !hasTargets(promotion) || matchesTargets(store, promotion.targets, variant);

const matchesTargets = (store, targets, variant) => {
  const { variantIds = [], productIds = [], categoryIds = [] } = targets ?? {};
  const product = store.get(variant.productId);
  return (
    variantIds.includes(variant.id) ||
    productIds.includes(variant.productId) ||
    (product?.categoryIds ?? []).some((id) => categoryIds.includes(id))
  );
};

/** What Buy X Get Y gives its benefit to; null for any other kind. */
export const benefitScopeOf = (promotion) =>
  promotion.kind === 'BUY_X_GET_Y'
    ? (promotion.benefitScope ?? 'SAME_AS_QUALIFIER')
    : null;

/**
 * Whether the variant has the role in the promotion (`ListingPromotionRole`): QUALIFIER is
 * counted by the requirement, BENEFIT is lowered by it. A product discount lowers what it
 * counts; Buy X Get Y with OTHER gives its benefit to `benefitTargets`.
 */
const hasRole = (store, promotion, variant, role) => {
  if (!hasTargets(promotion)) return false;
  if (role === 'BENEFIT' && benefitScopeOf(promotion) === 'OTHER') {
    return matchesTargets(store, promotion.benefitTargets, variant);
  }
  return matchesVariant(store, promotion, variant);
};

/**
 * Listing filters by the role of a variant in a promotion (`promotionId` with
 * `promotionRole`), for promotions of any placement: one role is combined with OR, different
 * roles with AND. Other filters are left to the facets.
 */
export const filterByPromotionRole = (store, products, filters = []) => {
  const byRole = new Map();
  for (const filter of filters) {
    if (!filter.promotionId || !filter.promotionRole) continue;
    byRole.set(filter.promotionRole, [
      ...(byRole.get(filter.promotionRole) ?? []),
      filter.promotionId,
    ]);
  }
  if (byRole.size === 0) return products;
  const promotions = activePromotions(store);
  return products.filter((product) =>
    [...byRole].every(([role, keys]) =>
      (product.variantIds ?? []).some((id) => {
        const variant = store.get(id);
        return (
          variant &&
          promotions.some(
            (promotion) =>
              keys.includes(promotion.key) &&
              hasRole(store, promotion, variant, role)
          )
        );
      })
    )
  );
};

/** One unit lowered as the benefit: free, by the percentage or by the fixed amount. */
const benefitUnitDiscount = (promotion, price) => {
  const value = promotion.value;
  if (!value) return 0;
  if (value.type === 'FREE_ITEM') return price;
  if (value.type === 'PERCENTAGE')
    return round2((price * Number(value.percentage)) / 100);
  if (value.type === 'FIXED_AMOUNT')
    return Math.min(price, Number(value.amount.amount));
  return 0;
};

/**
 * `ProductVariant.benefitPrice`: one unit of the variant once the published Buy X Get Y
 * promotion gives it as the benefit; null when it is not a benefit of the promotion.
 */
export const benefitPrice = (store, variant, promotionKey) => {
  const promotion = activePromotions(store).find(
    ({ key }) => key === promotionKey
  );
  if (
    !promotion ||
    promotion.kind !== 'BUY_X_GET_Y' ||
    !isVisible(promotion) ||
    !variant.price ||
    !hasRole(store, promotion, variant, 'BENEFIT')
  ) {
    return null;
  }
  const price = Number(variant.price.amount);
  return money(
    round2(price - benefitUnitDiscount(promotion, price)),
    variant.price.currencyCode
  );
};

/** The variants or products the merchant chose for the benefit of Buy X Get Y with OTHER. */
export const benefitVariantsOf = (store, promotion) =>
  benefitScopeOf(promotion) === 'OTHER' &&
  promotion.benefitTargets?.variantIds?.length
    ? promotion.benefitTargets.variantIds
        .map((id) => store.get(id))
        .filter(Boolean)
    : null;

export const benefitProductsOf = (store, promotion) =>
  benefitScopeOf(promotion) === 'OTHER' &&
  !promotion.benefitTargets?.variantIds?.length &&
  promotion.benefitTargets?.productIds?.length
    ? promotion.benefitTargets.productIds.map((id) => store.get(id) ?? null)
    : null;

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

const byPromotionPriority = (left, right) =>
  (right.priority ?? 0) - (left.priority ?? 0) ||
  left.key.localeCompare(right.key);

const byPriority = (left, right) =>
  byPromotionPriority(left.promotion, right.promotion);

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

const oneUnitMeetsMinimum = (promotion, unitPrice) =>
  (!promotion.minimumSubtotal ||
    Number(promotion.minimumSubtotal.amount) <= unitPrice) &&
  (promotion.minimumQuantity ?? 0) <= 1;

/**
 * A discount the offer price includes: unconditional, shown in the product price
 * (`priceDisplay`, absent means PRODUCT_PRICE), and a percentage without a cap. The mock cart
 * spreads a fixed amount over the matching lines once (ACROSS), so a fixed amount stays in the
 * cart, as a capped discount does.
 */
const inOfferPrice = (promotion) =>
  !hasMinimum(promotion) &&
  promotion.priceDisplay !== 'CART_ONLY' &&
  promotion.value?.type === 'PERCENTAGE' &&
  !promotion.value.maximumDiscount;

/**
 * The storefront price of a variant by the rules of Listing (plan §1): `price` is one unit after
 * the discounts in the offer price; `compareAtPrice` is the catalog price when one of them
 * applies, else the catalog compare-at price above the price, else null. The discount lists carry
 * the keys of published promotions only: those in the price and those the cart applies to one
 * unit on top of it. The fixture variant keeps its catalog prices for the cart.
 */
export const listingOffer = (store, variant) => {
  if (!variant.price) {
    return {
      price: null,
      compareAtPrice: null,
      appliedDiscountIds: [],
      cartOnlyDiscountIds: [],
    };
  }
  const catalogPrice = Number(variant.price.amount);
  const { currencyCode } = variant.price;
  const applying = activePromotions(store).filter(
    (promotion) =>
      promotion.kind === 'PRODUCT_DISCOUNT' &&
      promotion.appliesOnOneTimePurchase &&
      matchesVariant(store, promotion, variant) &&
      oneUnitMeetsMinimum(promotion, catalogPrice) &&
      discountOf(promotion, catalogPrice) > 0
  );
  const inPrice = applying.filter(inOfferPrice);
  const offerPrice = round2(
    Math.max(
      0,
      catalogPrice -
        inPrice.reduce(
          (sum, promotion) => sum + discountOf(promotion, catalogPrice),
          0
        )
    )
  );
  const catalogCompareAt = Number(variant.compareAtPrice?.amount);
  const compareAt = inPrice.length
    ? catalogPrice
    : catalogCompareAt > catalogPrice
      ? catalogCompareAt
      : null;
  const publishedKeys = (promotions) =>
    promotions.filter(isVisible).map(({ key }) => key);
  return {
    price: money(offerPrice, currencyCode),
    compareAtPrice: compareAt === null ? null : money(compareAt, currencyCode),
    appliedDiscountIds: publishedKeys(inPrice),
    cartOnlyDiscountIds: publishedKeys(
      applying.filter((promotion) => !inPrice.includes(promotion))
    ),
  };
};

/** Lowest and highest offer price of the product's priced variants; null without one. */
export const listingPriceRange = (store, product) => {
  const prices = (product.variantIds ?? [])
    .map((id) => store.get(id))
    .filter((variant) => variant?.price)
    .map((variant) => listingOffer(store, variant).price);
  if (!prices.length) return null;
  const amounts = prices.map(({ amount }) => Number(amount));
  const { currencyCode } = prices[0];
  return {
    minPrice: money(Math.min(...amounts), currencyCode),
    maxPrice: money(Math.max(...amounts), currencyCode),
  };
};

const quantityRequirement = (required, current) => ({
  type: 'QUANTITY',
  required: null,
  current: null,
  remaining: null,
  requiredQuantity: required,
  currentQuantity: Math.min(current, required),
  remainingQuantity: Math.max(0, required - current),
  ratio: ratio(current, required),
});

/**
 * The units of the lines one by one, the cheapest first: Buy X Get Y lowers those. `taken` is
 * how many units of a line are out of reach.
 */
const unitsOf = (lines, taken = new Map()) =>
  lines
    .flatMap((line) =>
      Array.from(
        { length: Math.max(0, line.quantity - (taken.get(line) ?? 0)) },
        () => ({ line, price: Number(line.cost.unitPrice.amount) })
      )
    )
    .sort((left, right) => left.price - right.price);

/** `taken` with the units added. */
const withUnits = (taken, units) => {
  const result = new Map(taken);
  for (const { line } of units) result.set(line, (result.get(line) ?? 0) + 1);
  return result;
};

/** The lines Buy X Get Y counts and lowers, and how often the mock uses it in an order. */
const buyXGetYRule = (store, checkout, promotion) => {
  const matches = (line, targets) => {
    const variant = store.get(line.purchasableId);
    return variant && matchesTargets(store, targets, variant);
  };
  const qualifiers = checkout.lines.filter((line) =>
    matches(line, promotion.targets)
  );
  return {
    qualifiers,
    benefitLines:
      benefitScopeOf(promotion) === 'SAME_AS_QUALIFIER'
        ? qualifiers
        : checkout.lines.filter((line) =>
            matches(line, promotion.benefitTargets)
          ),
    buy: promotion.value?.buyQuantity ?? 1,
    get: promotion.value?.getQuantity ?? 1,
    // A subtotal requirement is used once.
    limit: promotion.minimumSubtotal
      ? 1
      : (promotion.usesPerOrderLimit ?? Infinity),
  };
};

/**
 * The qualifier units the uses pay with, the most expensive first, so the benefit goes to the
 * cheapest ones; null when the units within reach do not cover the uses.
 */
const reserveQualifiers = (promotion, rule, taken, times) => {
  const units = unitsOf(rule.qualifiers, taken).reverse();
  if (!promotion.minimumSubtotal) {
    const count = times * rule.buy;
    return units.length >= count ? units.slice(0, count) : null;
  }
  const required = Number(promotion.minimumSubtotal.amount);
  const reserved = [];
  let subtotal = 0;
  for (const unit of units) {
    if (subtotal >= required) break;
    reserved.push(unit);
    subtotal = round2(subtotal + unit.price);
  }
  return subtotal >= required ? reserved : null;
};

/**
 * The complete uses of Buy X Get Y on the units the promotions before it left, by the rules of
 * Pricing: a unit takes part in one promotion and either pays for a use or receives its benefit.
 */
const planBuyXGetY = (promotion, rule, taken) => {
  const most = promotion.minimumSubtotal
    ? 1
    : Math.min(
        Math.floor(unitsOf(rule.qualifiers, taken).length / rule.buy),
        rule.limit
      );
  for (let times = most; times > 0; times -= 1) {
    const reserved = reserveQualifiers(promotion, rule, taken, times);
    if (!reserved) continue;
    const paid = withUnits(taken, reserved);
    const benefit = unitsOf(rule.benefitLines, paid).slice(0, times * rule.get);
    if (benefit.length === times * rule.get) {
      return { times, benefit, taken: withUnits(paid, benefit) };
    }
  }
  return { times: 0, benefit: [], taken };
};

/**
 * The use after the applied ones, on the units within reach of the promotion: its requirement
 * and, once it is met, the benefit units it still lacks. Once the uses-per-order limit is
 * reached the last use stays met.
 */
const nextBuyXGetYUse = (promotion, rule, outOfReach, times, currencyCode) => {
  const reached = times >= rule.limit;
  const units = unitsOf(rule.qualifiers, outOfReach);
  const requirement = promotion.minimumSubtotal
    ? requirementOf(
        promotion,
        {
          subtotal: reached
            ? Number(promotion.minimumSubtotal.amount)
            : round2(units.reduce((sum, { price }) => sum + price, 0)),
          quantity: 0,
        },
        currencyCode
      )
    : quantityRequirement(rule.buy, reached ? rule.buy : units.length);
  if (reached || remainingOf({ requirement }) > 0) {
    return { requirement, missing: 0 };
  }
  const paid = withUnits(
    outOfReach,
    reserveQualifiers(promotion, rule, outOfReach, 1)
  );
  return {
    requirement,
    missing: Math.max(0, rule.get - unitsOf(rule.benefitLines, paid).length),
  };
};

/**
 * Buy X Get Y promotions of the checkout, used in the order of Pricing (by priority, then by
 * key) on the units the promotions before left. The progress of a promotion (BR-pg06) counts
 * only the units within its reach: not those a promotion before it took and not those any
 * promotion made free, so a gifted unit is never a purchase. A promotion without a qualifier
 * line within reach has no evaluation. `freeUnits` are the units made free, by line.
 */
const evaluateBuyXGetYPromotions = (store, checkout, promotions, isBlocked) => {
  let taken = new Map();
  const turns = [];
  for (const promotion of [...promotions].sort(byPromotionPriority)) {
    const rule = buyXGetYRule(store, checkout, promotion);
    const plan = isBlocked(promotion)
      ? { times: 0, benefit: [], taken }
      : planBuyXGetY(promotion, rule, taken);
    turns.push({
      promotion,
      rule,
      plan,
      before: taken,
      free: plan.benefit.filter(
        ({ price }) => benefitUnitDiscount(promotion, price) >= price
      ),
    });
    taken = plan.taken;
  }
  const evaluations = new Map();
  turns.forEach(({ promotion, rule, plan, before }, index) => {
    const laterFree = turns.slice(index + 1).flatMap(({ free }) => free);
    const byOthers = withUnits(before, laterFree);
    const qualifiers = rule.qualifiers.filter(
      (line) => line.quantity > (byOthers.get(line) ?? 0)
    );
    if (!qualifiers.length) return;
    const blocked = isBlocked(promotion);
    const next = nextBuyXGetYUse(
      promotion,
      rule,
      withUnits(plan.taken, laterFree),
      plan.times,
      checkout.currencyCode
    );
    // The cheapest units of the benefit lines, as many as the uses give.
    const lowered = new Map();
    for (const unit of plan.benefit) {
      const amount = benefitUnitDiscount(promotion, unit.price);
      const current = lowered.get(unit.line) ?? { units: 0, amount: 0 };
      lowered.set(unit.line, {
        units: current.units + 1,
        amount: round2(current.amount + amount),
      });
    }
    evaluations.set(promotion, {
      promotion,
      requirement: next.requirement,
      status: blocked
        ? 'BLOCKED'
        : remainingOf(next) === 0
          ? 'SATISFIED'
          : 'IN_PROGRESS',
      qualifierLineIds: qualifiers.map(({ id }) => id),
      benefitLineIds: [...lowered.keys()].map(({ id }) => id),
      timesApplied: plan.times,
      missingBenefitQuantity: blocked ? 0 : next.missing,
      lowered,
    });
  });
  return {
    evaluations,
    freeUnits: withUnits(
      new Map(),
      turns.flatMap(({ free }) => free)
    ),
  };
};

/** Puts the benefit of Buy X Get Y on its lines, unit by unit; returns the discount. */
const lowerBenefitLines = (evaluation, checkout) => {
  const { promotion, lowered } = evaluation;
  const free = promotion.value?.type === 'FREE_ITEM';
  let total = 0;
  for (const [line, { units, amount }] of lowered) {
    if (amount === 0) continue;
    line.discountAllocations.push({
      discountedAmount: money(amount, checkout.currencyCode),
      quantity: units,
      freeQuantity: free ? units : 0,
      discountApplication: {
        method: 'AUTOMATIC',
        discountClass: 'PRODUCT',
        title: promotion.presentation.headline,
        code: null,
        promotion: isVisible(promotion) ? promotion : null,
      },
    });
    const discount = round2(Number(line.cost.discountAmount.amount) + amount);
    line.cost.discountAmount = money(discount, checkout.currencyCode);
    line.cost.totalAmount = money(
      round2(Number(line.cost.totalAmount.amount) - amount),
      checkout.currencyCode
    );
    total += amount;
  }
  return round2(total);
};

/**
 * Evaluates the automatic promotions of a checkout before shipping is priced. The thresholds use
 * line subtotals before any discount without the units Buy X Get Y made free (BR-pg02); a
 * product discount counts only its target lines. Buy X Get Y lowers its benefit units line by
 * line (`discountAllocations`).
 */
export const evaluatePromotions = (store, checkout) => {
  const lines = checkout.lines;
  const promotions = activePromotions(store);
  const isBlocked = (promotion) =>
    lines.some(({ purchase }) =>
      purchase?.type === 'SUBSCRIPTION'
        ? !promotion.appliesOnSubscription
        : !promotion.appliesOnOneTimePurchase
    );
  const buyXGetY = evaluateBuyXGetYPromotions(
    store,
    checkout,
    promotions.filter(({ kind }) => kind === 'BUY_X_GET_Y'),
    isBlocked
  );
  // A gifted unit is not a purchase: no threshold counts it.
  const freeUnitsOf = (line) => buyXGetY.freeUnits.get(line) ?? 0;
  const baseOf = (matching) => ({
    subtotal: round2(
      matching.reduce(
        (sum, line) =>
          sum +
          Number(line.cost.subtotalAmount.amount) -
          freeUnitsOf(line) * Number(line.cost.unitPrice.amount),
        0
      )
    ),
    quantity: matching.reduce(
      (sum, line) => sum + line.quantity - freeUnitsOf(line),
      0
    ),
  });
  const evaluations = [];
  for (const promotion of promotions) {
    const blocked = isBlocked(promotion);
    if (promotion.kind === 'BUY_X_GET_Y') {
      const evaluation = buyXGetY.evaluations.get(promotion);
      if (evaluation) evaluations.push(evaluation);
      continue;
    }
    const matching = lines.filter((line) => {
      const variant = store.get(line.purchasableId);
      return variant && matchesVariant(store, promotion, variant);
    });
    if (promotion.kind === 'PRODUCT_DISCOUNT' && !matching.length) continue;
    const base = baseOf(matching);
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
      qualifierLineIds:
        promotion.kind === 'PRODUCT_DISCOUNT'
          ? matching.map(({ id }) => id)
          : [],
      benefitLineIds: [],
      timesApplied: 0,
      missingBenefitQuantity: 0,
    });
  }

  const appliedPromotions = [];
  let productDiscount = 0;
  for (const evaluation of evaluations) {
    if (
      evaluation.promotion.kind !== 'BUY_X_GET_Y' ||
      evaluation.timesApplied === 0
    )
      continue;
    const amount = lowerBenefitLines(evaluation, checkout);
    if (amount === 0) continue;
    productDiscount += amount;
    appliedPromotions.push(
      applied(evaluation.promotion, 'PRODUCT', amount, checkout)
    );
  }
  for (const evaluation of evaluations) {
    if (
      evaluation.promotion.kind !== 'PRODUCT_DISCOUNT' ||
      evaluation.status !== 'SATISFIED'
    )
      continue;
    const amount = discountOf(evaluation.promotion, evaluation.base.subtotal);
    if (amount === 0) continue;
    productDiscount += amount;
    evaluation.timesApplied = 1;
    evaluation.benefitLineIds = evaluation.qualifierLineIds;
    appliedPromotions.push(
      applied(evaluation.promotion, 'PRODUCT', amount, checkout)
    );
  }
  let orderDiscount = 0;
  const subtotal = round2(
    lines.reduce(
      (sum, line) => sum + Number(line.cost.subtotalAmount.amount),
      0
    )
  );
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
    evaluation.timesApplied = 1;
    appliedPromotions.push(
      applied(evaluation.promotion, 'ORDER', amount, checkout)
    );
  }
  checkout.appliedPromotions = appliedPromotions;

  checkout.promotionProgress = evaluations
    .filter(({ promotion, requirement }) => isVisible(promotion) && requirement)
    .map((evaluation) => ({
      promotion: evaluation.promotion,
      status: evaluation.status,
      requirement: evaluation.requirement,
      qualifierLineIds: evaluation.qualifierLineIds,
      benefitLineIds: evaluation.benefitLineIds,
      timesApplied: evaluation.timesApplied,
      missingBenefitQuantity: evaluation.missingBenefitQuantity,
    }));

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
