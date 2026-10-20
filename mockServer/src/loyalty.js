import { gid, money } from "./fixture-helpers.js";

/**
 * Loyalty of the mock store, by the rules of the Loyalty and Checkout services: one active
 * program, points or store credit as a source of payment, rewards bound to Pricing discounts,
 * and the estimate of what an order earns. Points and amounts are strings in the API.
 */

const program = (store) => {
  const value = store.state.loyaltyProgram;
  return value?.status === "ACTIVE" ? value : null;
};

const account = (store, customerId) => {
  const value = program(store);
  if (!value || !customerId) return null;
  store.state.loyaltyAccounts ??= {};
  store.state.loyaltyAccounts[customerId] ??= structuredClone(value.account ?? {});
  return store.state.loyaltyAccounts[customerId];
};

const round2 = (value) => Math.round(value * 100) / 100;

const sourceOption = (value, balance, source, currencyCode) => {
  const pointValue = value.pointValue ?? 0.1;
  if (source === "POINTS") {
    return {
      source,
      availablePoints: String(balance.availablePoints ?? 0),
      availableAmount: money(round2((balance.availablePoints ?? 0) * pointValue), currencyCode),
      minimum: {
        points: String(value.minimumRedeemPoints ?? 1),
        amount: money(round2((value.minimumRedeemPoints ?? 1) * pointValue), currencyCode),
      },
      maximumPerOrder: value.maximumRedeemPointsPerOrder
        ? {
          points: String(value.maximumRedeemPointsPerOrder),
          amount: money(round2(value.maximumRedeemPointsPerOrder * pointValue), currencyCode),
        }
        : null,
    };
  }
  return {
    source,
    availablePoints: null,
    availableAmount: money(balance.storeCredit ?? 0, currencyCode),
    minimum: { points: null, amount: money(value.minimumRedeemAmount ?? 1, currencyCode) },
    maximumPerOrder: value.maximumRedeemAmount
      ? { points: null, amount: money(value.maximumRedeemAmount, currencyCode) }
      : null,
  };
};

/** `Customer.loyaltyAccount` of the signed-in customer. */
export const loyaltyAccount = (store, customer) => {
  const value = program(store);
  const balance = account(store, customer?.id);
  if (!value || !balance) return null;
  const currencyCode = value.currencyCode ?? "UAH";
  const sources = [];
  if (value.pointsRedemptionEnabled !== false && balance.availablePoints > 0) sources.push("POINTS");
  if (value.storeCreditRedemptionEnabled && balance.storeCredit > 0) sources.push("STORE_CREDIT");
  const tier = value.tier ?? null;
  const rewards = (balance.rewards ?? []).filter(({ used }) => !used);
  return {
    __typename: "LoyaltyAccount",
    id: gid("LoyaltyAccount", customer.id.split("/").at(-1)),
    status: "ACTIVE",
    balance: {
      pendingPoints: String(balance.pendingPoints ?? 0),
      availablePoints: String(balance.availablePoints ?? 0),
      reservedPoints: "0",
      debtPoints: "0",
    },
    tier: tier && {
      code: tier.code,
      name: tier.name,
      rank: tier.rank ?? 1,
      effectiveFrom: store.initialNow,
      effectiveTo: null,
      earnMultiplierBps: tier.earnMultiplierBps ?? 10_000,
      progress: tier.next
        ? {
          nextTier: { code: tier.next.code, name: tier.next.name, rank: (tier.rank ?? 1) + 1 },
          presentation: copy(tier.next.headline),
        }
        : null,
    },
    opportunities: {
      primaryOpportunity: null,
      opportunities: [],
      evaluatedAt: store.initialNow,
      validUntil: null,
      revision: "mock-loyalty-account",
    },
    // Connection fields take the node list; the resolvers page it.
    availableRewards: rewards.map((reward) => ({
      __typename: "LoyaltyAvailableReward",
      id: reward.id,
      reward: {
        __typename: reward.kind === "VOUCHER" ? "LoyaltyVoucherRewardPresentation" : "LoyaltyFreeShippingRewardPresentation",
        kind: reward.kind,
        copy: copy(reward.headline),
        ...(reward.kind === "VOUCHER" ? { code: reward.code } : {}),
      },
      presentation: copy(reward.headline, reward.description),
      issuedAt: store.initialNow,
      validUntil: reward.validUntil ?? null,
      revision: `mock-reward:${reward.id}`,
    })),
    upcomingExpirations: (balance.expirations ?? []).map(({ points, expiresAt }) => ({
      points: String(points), expiresAt,
    })),
    transactions: [],
    redemptionSources: sources.map((source) => sourceOption(value, balance, source, currencyCode)),
    storeCredit: balance.storeCredit > 0
      ? {
          availableAmount: money(balance.storeCredit, currencyCode),
          pendingAmount: money(balance.pendingStoreCredit ?? 0, currencyCode),
          upcomingExpirations: (balance.storeCreditExpirations ?? []).map(({ amount, expiresAt }) => ({
            amount: money(amount, currencyCode), expiresAt,
          })),
        }
      : null,
  };
};

const copy = (headline, description = null) => ({
  __typename: "LoyaltyOpportunityCopy",
  headline,
  description,
  badge: null,
  accessibilityLabel: headline,
  terms: [],
});


const issue = (code, message, effect, field = ["loyaltyRedemption"], retryable = false) => ({
  code,
  message,
  severity: effect === "STOP" ? "ERROR" : "WARNING",
  effect,
  field,
  lineId: null,
  retryable,
});

/**
 * Discount of the chosen reward before the redemption is quoted: Pricing applies the reward's
 * discount, Loyalty checks that it did. A voucher works only with its code entered.
 */
export const applyLoyaltyReward = (store, checkout, { shipping }) => {
  const intent = checkout.loyaltyIntent;
  checkout.loyaltyRewardId = null;
  if (!intent?.rewardId) return 0;
  const balance = account(store, checkout.customerIdentity.customerId);
  const reward = (balance?.rewards ?? []).find(({ id, used }) => id === intent.rewardId && !used);
  if (!reward) {
    checkout.issues.push(issue("ENTITLEMENT_NOT_AVAILABLE", "The selected reward is no longer available.", "STOP"));
    return 0;
  }
  checkout.loyaltyRewardId = reward.id;
  if (reward.kind === "VOUCHER") {
    const entered = checkout.promoCodes.some(({ code }) => code.toUpperCase() === reward.code.toUpperCase());
    if (!entered) {
      checkout.issues.push(issue("REWARD_DISCOUNT_NOT_APPLIED", "The reward discount is not applied.", "STOP"));
      return 0;
    }
    // The code's own promotion gives the discount, as Pricing does for a CODE discount.
    return 0;
  }
  if (reward.kind === "FREE_SHIPPING") return shipping;
  return reward.amount ?? 0;
};

/**
 * Quotes the chosen source on the total after promotions and rewards: the request is cut to the
 * order limit with a warning, a request above the balance is refused, a limit below the minimum
 * drops the redemption with a warning (BR-xt3k).
 */
export const quoteLoyaltyRedemption = (store, checkout, total) => {
  const value = program(store);
  const intent = checkout.loyaltyIntent;
  checkout.loyaltyRedemption = null;
  if (!value || !intent?.source) return 0;
  const customerId = checkout.customerIdentity.customerId;
  if (!customerId) {
    checkout.issues.push(issue("CUSTOMER_REQUIRED", "Sign in to use loyalty.", "STOP"));
    return 0;
  }
  const balance = account(store, customerId);
  const currencyCode = checkout.currencyCode;
  const pointValue = value.pointValue ?? 0.1;
  const percent = (value.maximumOrderPercentageBps ?? 10_000) / 10_000;
  const field = ["loyaltyRedemption", intent.source === "STORE_CREDIT" ? "amount" : "points"];
  if (intent.source === "POINTS") {
    const available = balance.availablePoints ?? 0;
    const minimum = value.minimumRedeemPoints ?? 1;
    const limit = Math.min(available, value.maximumRedeemPointsPerOrder ?? Infinity, Math.floor(total * percent / pointValue));
    const requested = intent.points === null ? null : Number(intent.points);
    if (available <= 0) {
      checkout.issues.push(issue("NO_AVAILABLE_POINTS", "No points are available.", "STOP"));
      return 0;
    }
    if (requested !== null && requested > available) {
      checkout.issues.push(issue("REQUEST_EXCEEDS_AVAILABLE_POINTS", "The request exceeds the available points.", "STOP"));
      return 0;
    }
    if (requested !== null && requested < minimum) {
      checkout.issues.push(issue("BELOW_MINIMUM_REDEMPTION", "The request is below the minimum.", "STOP"));
      return 0;
    }
    if (limit < minimum) {
      checkout.issues.push(issue("LOYALTY_REDEMPTION_REDUCED", "This order total is below the program minimum.", "CONTINUE", field));
      return 0;
    }
    const points = requested === null ? limit : Math.min(requested, limit);
    if (requested !== null && points < requested) {
      checkout.issues.push(issue("LOYALTY_REDEMPTION_REDUCED", "The redemption was reduced to the most this order allows.", "CONTINUE", field));
    }
    const discount = round2(points * pointValue);
    checkout.loyaltyRedemption = redemption(store, checkout, value, {
      source: "POINTS",
      requestedPoints: intent.points,
      requestedAmount: null,
      points: String(points),
      availablePoints: String(available),
      availableAmount: money(round2(available * pointValue), currencyCode),
      discount: money(discount, currencyCode),
      payableAfterLoyalty: money(Math.max(0, total - discount), currencyCode),
    });
    return discount;
  }
  const available = balance.storeCredit ?? 0;
  const minimum = value.minimumRedeemAmount ?? 1;
  const limit = round2(Math.min(available, value.maximumRedeemAmount ?? Infinity, total * percent));
  const requested = intent.amount === null ? null : Number(intent.amount);
  if (!value.storeCreditRedemptionEnabled) {
    checkout.issues.push(issue("REDEMPTION_DISABLED", "Store credit is not accepted.", "STOP"));
    return 0;
  }
  if (available <= 0) {
    checkout.issues.push(issue("NO_AVAILABLE_BALANCE", "No store credit is available.", "STOP"));
    return 0;
  }
  if (requested !== null && requested > available) {
    checkout.issues.push(issue("REQUEST_EXCEEDS_AVAILABLE_AMOUNT", "The request exceeds the store credit.", "STOP"));
    return 0;
  }
  if (limit < minimum) {
    checkout.issues.push(issue("LOYALTY_REDEMPTION_REDUCED", "This order total is below the program minimum.", "CONTINUE", field));
    return 0;
  }
  const amount = requested === null ? limit : Math.min(requested, limit);
  if (requested !== null && amount < requested) {
    checkout.issues.push(issue("LOYALTY_REDEMPTION_REDUCED", "The redemption was reduced to the most this order allows.", "CONTINUE", field));
  }
  checkout.loyaltyRedemption = redemption(store, checkout, value, {
    source: "STORE_CREDIT",
    requestedPoints: null,
    requestedAmount: requested === null ? null : money(requested, currencyCode),
    points: null,
    availablePoints: null,
    availableAmount: money(available, currencyCode),
    discount: money(amount, currencyCode),
    payableAfterLoyalty: money(Math.max(0, total - amount), currencyCode),
  });
  return amount;
};

const redemption = (store, checkout, value, quote) => ({
  quoteId: `mock-loyalty-${store.next("loyalty-quote")}`,
  revision: checkout.resultRevision,
  accountId: gid("LoyaltyAccount", checkout.customerIdentity.customerId.split("/").at(-1)),
  programId: value.id,
  programCode: value.code ?? "mock-loyalty",
  programVersion: value.version ?? 1,
  ...quote,
  expiresAt: new Date(store.clock + 60 * 60_000).toISOString(),
});

/** What the order earns: purchase points by the tier multiplier; a guest is invited to sign in. */
export const estimateLoyaltyEarning = (store, checkout, payable) => {
  const value = program(store);
  if (!value || payable <= 0) return null;
  const customerId = checkout.customerIdentity.customerId;
  const multiplier = customerId ? (value.tier?.earnMultiplierBps ?? 10_000) / 10_000 : 1;
  const points = Math.floor(payable * (value.earnPointsPerUnit ?? 0.1) * multiplier);
  if (points <= 0) return null;
  return {
    state: customerId ? "AVAILABLE" : "AUTHENTICATION_REQUIRED",
    points: String(points),
    amount: null,
    presentation: {
      headline: customerId
        ? `Нарахуємо +${points} балів після отримання${value.tier ? ` · з урахуванням ${value.tier.name}` : ""}`
        : `Увійдіть і отримайте +${points} балів за це замовлення`,
      description: null,
    },
  };
};

/** The saved choice as `Checkout.loyaltySelection` returns it, whether it applied or not. */
export const loyaltySelection = (checkout) => {
  const intent = checkout.loyaltyIntent;
  if (!intent) return null;
  return {
    source: intent.source,
    points: intent.points,
    amount: intent.amount === null ? null : money(Number(intent.amount), checkout.currencyCode),
    rewardId: intent.rewardId,
  };
};

/** Validates and stores the buyer's selection; a source replaces the previous one. */
export const updateLoyaltyIntent = (checkout, input, checkoutError) => {
  if (!checkout.customerIdentity.customerId) {
    return checkoutError("LOYALTY_CUSTOMER_REQUIRED", "Sign in before applying loyalty points.");
  }
  const source = input.source ?? null;
  if (source === null && !input.rewardId) {
    return checkoutError("LOYALTY_SELECTION_REQUIRED", "Select a redemption source, a reward, or both.");
  }
  const points = input.points ?? null;
  const amount = input.amount ?? null;
  const valid = source === null
    ? points === null && amount === null
    : source === "POINTS"
      ? amount === null && (points === null || /^[1-9]\d*$/.test(String(points)))
      : points === null && (amount === null || Number(amount) > 0);
  if (!valid) {
    return checkoutError("LOYALTY_REQUEST_INVALID", "Send points for POINTS or amount for STORE_CREDIT, as a positive value.");
  }
  checkout.loyaltyIntent = {
    source,
    points: source === "POINTS" && points !== null ? String(points) : null,
    amount: source === "STORE_CREDIT" && amount !== null ? String(amount) : null,
    rewardId: input.rewardId ?? null,
  };
  return null;
};

/** Spends the redemption and the reward of a placed order and records what it earns. */
export const commitOrderLoyalty = (store, checkout) => {
  const balance = account(store, checkout.customerIdentity.customerId);
  const quote = checkout.loyaltyRedemption;
  if (balance && quote) {
    if (quote.source === "POINTS") balance.availablePoints -= Number(quote.points);
    else balance.storeCredit = round2(balance.storeCredit - Number(quote.discount.amount));
  }
  const reward = balance?.rewards?.find(({ id }) => id === checkout.loyaltyRewardId);
  if (reward) reward.used = true;
  const earning = checkout.loyaltyEarning?.state === "AVAILABLE" ? checkout.loyaltyEarning : null;
  if (balance && earning) balance.pendingPoints = (balance.pendingPoints ?? 0) + Number(earning.points);
  return {
    loyaltyRedemption: quote
      ? { source: quote.source, points: quote.points, amount: quote.discount }
      : null,
    loyaltyEarning: earning
      ? { points: earning.points, amount: earning.amount, status: "PENDING", availableAt: null }
      : null,
  };
};
