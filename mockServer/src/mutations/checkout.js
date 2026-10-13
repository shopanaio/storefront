import { gid, money } from "../fixture-helpers.js";
import {
  checkoutError,
  createCheckoutLine,
  formatAddress,
} from "../helpers.js";

const successful = (checkout) => ({ checkout, userErrors: [] });
const failed = (...userErrors) => ({ checkout: null, userErrors });

const findCheckout = (store, id) => store.state.checkouts.find((checkout) => checkout.id === id);

const guardCheckout = (store, input) => {
  const checkout = findCheckout(store, input.checkoutId);
  if (!checkout) {
    return { error: checkoutError("CHECKOUT_NOT_FOUND", "The checkout does not exist.", ["checkoutId"]) };
  }
  if (Date.parse(checkout.expiresAt) <= store.clock && ["OPEN", "READY"].includes(checkout.status)) {
    checkout.status = "EXPIRED";
  }
  return { checkout };
};

const withCheckout = (store, input, update) => {
  const { checkout, error } = guardCheckout(store, input);
  if (error) return failed(error);
  if (["PLACED", "EXPIRED", "ABANDONED"].includes(checkout.status)) {
    return failed(checkoutError("CHECKOUT_NOT_OPEN", "The checkout is no longer editable.", ["checkoutId"]));
  }
  const updateErrors = update(checkout) ?? [];
  if (updateErrors.length) return failed(...updateErrors);
  refreshCheckout(store, checkout);
  return successful(store.touchCheckout(checkout));
};

const updateMoneyCurrency = (value, currencyCode, visited = new WeakSet()) => {
  if (!value || typeof value !== "object" || visited.has(value)) return;
  visited.add(value);
  if (Object.hasOwn(value, "amount") && Object.hasOwn(value, "currencyCode")) value.currencyCode = currencyCode;
  for (const nested of Object.values(value)) updateMoneyCurrency(nested, currencyCode, visited);
};

const getDeliveryOptions = (store) => store.state.checkouts
  .flatMap(({ deliveryGroups }) => deliveryGroups)
  .find(({ options }) => options.length)?.options ?? [];

const getPaymentMethods = (store) => store.state.checkouts
  .map(({ payment }) => payment.methods)
  .find((methods) => methods.length) ?? [];

const createLine = (store, checkout, input, parentId = null) => {
  const variant = store.get(input.purchasableId);
  if (!variant || variant.__typename !== "ProductVariant") return null;
  const line = createCheckoutLine({
    checkoutKey: checkout.id.split("/").at(-1),
    position: store.next("checkout-line"),
    variant,
    quantity: input.quantity,
    attributes: input.attributes,
    purchase: input.purchase,
    tag: checkout.tags.find(({ slug }) => slug === input.tagSlug) ?? null,
  });
  line.parentId = parentId;
  line.children = (input.children ?? []).map((child) => createLine(store, checkout, child, line.id)).filter(Boolean);
  return line;
};

const refreshLine = (store, checkout, line) => {
  const variant = store.get(line.purchasableId);
  if (!variant) return;
  const refreshed = createCheckoutLine({
    checkoutKey: checkout.id.split("/").at(-1),
    position: line.id.split("/").at(-1),
    variant,
    quantity: line.quantity,
    attributes: line.attributes,
    purchase: line.purchase,
    tag: line.tag,
  });
  const children = line.children;
  Object.assign(line, refreshed, { id: line.id, parentId: line.parentId, children });
  for (const child of children) refreshLine(store, checkout, child);
  updateMoneyCurrency(line, checkout.currencyCode);
};

export const refreshCheckout = (store, checkout) => {
  checkout.issues = [];
  for (const line of checkout.lines) {
    refreshLine(store, checkout, line);
    const variant = store.get(line.purchasableId);
    if (!variant?.availableForSale) {
      checkout.issues.push({
        code: "ITEM_UNAVAILABLE", message: `${line.title} is not available.`, severity: "ERROR",
        effect: "STOP", field: ["lines"], lineId: line.id, retryable: false,
      });
    } else if (line.quantity > variant.quantityAvailable) {
      checkout.issues.push({
        code: "NOT_ENOUGH_STOCK", message: `Only ${variant.quantityAvailable} units of ${line.title} are available.`,
        severity: "ERROR", effect: "STOP", field: ["lines", "quantity"], lineId: line.id, retryable: true,
      });
    }
  }

  const subtotal = checkout.lines.reduce((sum, line) => sum + Number(line.cost.subtotalAmount.amount), 0);
  const catalogDiscount = checkout.lines.reduce((sum, line) => sum + Number(line.cost.discountAmount.amount), 0);
  const promoDiscount = checkout.appliedPromoCodes.reduce((sum, promo) =>
    sum + (String(promo.discountType).toLowerCase().includes("percent")
      ? subtotal * Number(promo.value) / 100
      : Number(promo.value)), 0);
  const shipping = checkout.deliveryGroups.reduce((sum, group) =>
    sum + Number(group.selection?.option?.cost?.amount ?? 0), 0);
  const tax = Math.max(0, subtotal - promoDiscount) * 0.08;
  const total = Math.max(0, subtotal - promoDiscount + tax + shipping);

  checkout.totalQuantity = checkout.lines.reduce((sum, line) => sum + line.quantity, 0);
  checkout.cost = {
    subtotalAmount: money(subtotal, checkout.currencyCode),
    totalDiscountAmount: money(catalogDiscount + promoDiscount, checkout.currencyCode),
    totalTaxAmount: money(tax, checkout.currencyCode),
    totalShippingAmount: money(shipping, checkout.currencyCode),
    totalAmount: money(total, checkout.currencyCode),
  };
  if (checkout.loyaltyRedemption) {
    const redemption = checkout.loyaltyRedemption;
    const pointValue = store.state.loyaltyProgram?.pointValue ?? 0.01;
    redemption.redeemablePoints = Math.min(redemption.redeemablePoints, Math.floor(total / pointValue));
    redemption.discount = money(redemption.redeemablePoints * pointValue, checkout.currencyCode);
    redemption.payableAfterLoyalty = money(Math.max(0, total - Number(redemption.discount.amount)), checkout.currencyCode);
  }
  checkout.payment.payableAmount = checkout.loyaltyRedemption?.payableAfterLoyalty ?? money(total, checkout.currencyCode);
  checkout.valid = checkout.lines.length > 0 && !checkout.issues.some(({ effect }) => effect === "STOP");
  if (["OPEN", "READY"].includes(checkout.status)) checkout.status = checkout.valid ? "READY" : "OPEN";
  return checkout;
};

export const createCheckout = (store, input) => {
  const key = `runtime-${store.next("checkout")}`;
  const now = store.now();
  const checkout = {
    id: gid("Checkout", key),
    channelCode: input.channelCode,
    localeCode: input.localeCode,
    currencyCode: input.currencyCode,
    status: "OPEN",
    expiresAt: new Date(Date.parse(now) + 24 * 3_600_000).toISOString(),
    loyaltyRedemption: null,
    loyaltyRewardEntitlementId: null,
    resultRevision: `checkout-${key}-r1`,
    valid: true,
    issues: [],
    createdAt: now,
    updatedAt: now,
    cost: {
      subtotalAmount: money(0, input.currencyCode), totalDiscountAmount: money(0, input.currencyCode),
      totalTaxAmount: money(0, input.currencyCode), totalShippingAmount: money(0, input.currencyCode),
      totalAmount: money(0, input.currencyCode),
    },
    customerIdentity: {
      countryCode: null, customerId: null, email: null, phone: null,
      firstName: null, lastName: null, middleName: null,
    },
    customerNote: null,
    billingAddress: null,
    totalQuantity: 0,
    lines: [],
    notifications: [],
    deliveryGroups: [],
    appliedPromoCodes: [],
    tags: (input.tags ?? []).map((tag) => ({
      id: gid("CheckoutTag", `${key}-${store.next("checkout-tag")}`),
      ...tag,
      createdAt: now,
      updatedAt: now,
    })),
    payment: {
      methods: structuredClone(getPaymentMethods(store)),
      selection: { status: "NONE", method: null, previousMethodHandle: null, resetReason: null },
      payableAmount: money(0, input.currencyCode),
    },
  };
  checkout.lines = input.items.map((item) => createLine(store, checkout, item)).filter(Boolean);
  if (checkout.lines.length !== input.items.length) {
    return failed(checkoutError("PURCHASABLE_NOT_FOUND", "One or more purchasable items do not exist.", ["items"]));
  }
  store.state.checkouts.push(checkout);
  refreshCheckout(store, checkout);
  store.reindex();
  return successful(checkout);
};

export const checkoutMutations = (store) => ({
  checkoutCreate: (_, { input }) => createCheckout(store, input),

  checkoutLoyaltyRedemptionUpdate: (_, { input }) => withCheckout(store, input, (checkout) => {
    const program = store.state.loyaltyProgram;
    if (!program || (input.programId && input.programId !== program.id)) {
      return [checkoutError("LOYALTY_PROGRAM_NOT_FOUND", "The loyalty program is unavailable.", ["programId"])];
    }
    if (!checkout.customerIdentity.customerId) {
      return [checkoutError("CUSTOMER_REQUIRED", "Loyalty redemption requires a customer.")];
    }
    if (input.rewardEntitlementId) {
      return [checkoutError("LOYALTY_REWARD_NOT_FOUND", "The reward entitlement is unavailable.", ["rewardEntitlementId"])];
    }
    if (input.requestedPoints != null && Number(input.requestedPoints) < 0) {
      return [checkoutError("INVALID_POINTS", "Requested points must not be negative.", ["requestedPoints"])];
    }
    const availablePoints = program.availablePoints ?? 0;
    const total = Number(checkout.cost.totalAmount.amount);
    const pointValue = program.pointValue ?? 0.01;
    const redeemablePoints = input.redeemPoints === false ? 0 : Math.min(
      Number(input.requestedPoints ?? availablePoints), availablePoints, Math.floor(total / pointValue),
    );
    const discount = redeemablePoints * pointValue;
    checkout.loyaltyRedemption = {
      quoteId: `mock-loyalty-${store.next("loyalty-quote")}`,
      revision: checkout.resultRevision,
      accountId: gid("LoyaltyAccount", checkout.customerIdentity.customerId.split("/").at(-1)),
      programId: program.id,
      programCode: program.code ?? "mock-loyalty",
      programVersion: program.version ?? 1,
      requestedPoints: input.requestedPoints ?? null,
      redeemablePoints,
      availablePoints,
      discount: money(discount, checkout.currencyCode),
      payableAfterLoyalty: money(Math.max(0, total - discount), checkout.currencyCode),
      expiresAt: checkout.expiresAt,
    };
    return [];
  }),

  checkoutLoyaltyRedemptionRemove: (_, { input }) => withCheckout(store, input, (checkout) => {
    checkout.loyaltyRedemption = null;
    checkout.loyaltyRewardEntitlementId = null;
    return [];
  }),

  checkoutLinesAdd: (_, { input }) => withCheckout(store, input, (checkout) => {
    const additions = input.lines.map((line) => createLine(store, checkout, line));
    if (additions.some((line) => !line)) {
      return [checkoutError("PURCHASABLE_NOT_FOUND", "A purchasable item does not exist.", ["lines"] )];
    }
    for (const addition of additions) {
      const existing = checkout.lines.find((line) =>
        line.purchasableId === addition.purchasableId
        && JSON.stringify(line.attributes) === JSON.stringify(addition.attributes)
        && line.tag?.id === addition.tag?.id);
      if (existing) existing.quantity += addition.quantity;
      else checkout.lines.push(addition);
    }
    return [];
  }),

  checkoutLinesUpdate: (_, { input }) => withCheckout(store, input, (checkout) => {
    const errors = [];
    for (const update of input.lines) {
      const line = checkout.lines.find(({ id }) => id === update.lineId);
      if (!line) errors.push(checkoutError("LINE_NOT_FOUND", "The checkout line does not exist.", ["lines"]));
      else if (update.quantity < 1) errors.push(checkoutError("INVALID_QUANTITY", "Quantity must be at least one.", ["lines", "quantity"]));
      else line.quantity = update.quantity;
    }
    return errors;
  }),

  checkoutLinesReplace: (_, { input }) => withCheckout(store, input, (checkout) => {
    const errors = [];
    for (const replacement of input.lines) {
      const index = checkout.lines.findIndex(({ id }) => id === replacement.lineId);
      const variant = store.get(replacement.purchasableId);
      if (index < 0) {
        errors.push(checkoutError("LINE_NOT_FOUND", "The checkout line does not exist.", ["lines"]));
        continue;
      }
      if (variant?.__typename !== "ProductVariant") {
        errors.push(checkoutError("PURCHASABLE_NOT_FOUND", "The replacement variant does not exist.", ["lines", "purchasableId"]));
        continue;
      }
      const source = checkout.lines[index];
      const quantity = replacement.quantity ?? source.quantity;
      const target = checkout.lines.find((line) => line.purchasableId === variant.id && line.id !== source.id);
      if (target) target.quantity += quantity;
      else checkout.lines[index] = createLine(store, checkout, { ...source, purchasableId: variant.id, quantity });
    }
    return errors;
  }),

  checkoutLinesDelete: (_, { input }) => withCheckout(store, input, (checkout) => {
    const found = new Set(checkout.lines.map(({ id }) => id));
    const missing = input.lineIds.filter((id) => !found.has(id));
    if (missing.length) return [checkoutError("LINE_NOT_FOUND", `Unknown checkout line: ${missing[0]}.`, ["lineIds"])];
    checkout.lines = checkout.lines.filter(({ id }) => !input.lineIds.includes(id));
    for (const group of checkout.deliveryGroups) {
      group.checkoutLineIds = group.checkoutLineIds.filter((id) => !input.lineIds.includes(id));
    }
    return [];
  }),

  checkoutLinesClear: (_, { input }) => withCheckout(store, input, (checkout) => {
    checkout.lines = [];
    checkout.deliveryGroups = [];
    return [];
  }),

  checkoutCustomerIdentityUpdate: (_, { input }) => withCheckout(store, input, (checkout) => {
    for (const field of ["email", "phone", "countryCode", "firstName", "lastName", "middleName"]) {
      if (Object.hasOwn(input, field)) checkout.customerIdentity[field] = input[field];
    }
    return [];
  }),

  checkoutCustomerNoteUpdate: (_, { input }) => withCheckout(store, input, (checkout) => {
    checkout.customerNote = input.note?.trim() || null;
    return [];
  }),

  checkoutLanguageCodeUpdate: (_, { input }) => withCheckout(store, input, (checkout) => {
    checkout.localeCode = input.localeCode;
    return [];
  }),

  checkoutCurrencyCodeUpdate: (_, { input }) => withCheckout(store, input, (checkout) => {
    checkout.currencyCode = input.currencyCode;
    updateMoneyCurrency(checkout, input.currencyCode);
    return [];
  }),

  checkoutBillingAddressUpdate: (_, { input }) => withCheckout(store, input, (checkout) => {
    checkout.billingAddress = input.billingAddress
      ? { ...formatAddress(null, input.billingAddress), data: input.billingAddress.data ?? null }
      : null;
    return [];
  }),

  checkoutDeliveryAddressesAdd: (_, { input }) => withCheckout(store, input, (checkout) => {
    const lineIds = new Set(checkout.lines.map(({ id }) => id));
    if (input.addresses.some(({ checkoutLineIds }) => checkoutLineIds.some((id) => !lineIds.has(id)))) {
      return [checkoutError("LINE_NOT_FOUND", "A delivery destination refers to an unknown line.", ["addresses", "checkoutLineIds"])];
    }
    for (const destination of input.addresses) {
      const number = store.next("checkout-delivery-group");
      const id = gid("CheckoutDeliveryGroup", `runtime-${number}`);
      checkout.deliveryGroups.push({
        id,
        checkoutLineIds: destination.checkoutLineIds,
        deliveryAddress: { ...formatAddress(gid("CheckoutDeliveryAddress", `runtime-${number}`), destination.address), data: destination.address.data ?? null },
        recipient: null,
        options: structuredClone(getDeliveryOptions(store)),
        selection: { status: "NONE", option: null, previousOptionHandle: null, resetReason: null },
      });
    }
    return [];
  }),

  checkoutDeliveryAddressesUpdate: (_, { input }) => withCheckout(store, input, (checkout) => {
    const groups = new Map(checkout.deliveryGroups.map((group) => [group.deliveryAddress?.id, group]));
    const errors = [];
    for (const update of input.updates) {
      const group = groups.get(update.addressId);
      if (!group) errors.push(checkoutError("DELIVERY_ADDRESS_NOT_FOUND", "The delivery address does not exist.", ["updates", "addressId"]));
      else group.deliveryAddress = { ...formatAddress(update.addressId, update.address), data: update.address.data ?? null };
    }
    return errors;
  }),

  checkoutDeliveryAddressesRemove: (_, { input }) => withCheckout(store, input, (checkout) => {
    checkout.deliveryGroups = checkout.deliveryGroups.filter(({ deliveryAddress }) => !input.addressIds.includes(deliveryAddress?.id));
    return [];
  }),

  checkoutDeliveryMethodUpdate: (_, { input }) => withCheckout(store, input, (checkout) => {
    const group = checkout.deliveryGroups.find(({ id }) => id === input.deliveryGroupId);
    if (!group) return [checkoutError("DELIVERY_GROUP_NOT_FOUND", "The delivery group does not exist.", ["deliveryGroupId"])];
    const option = group.options.find(({ handle }) => handle === input.optionHandle);
    if (!option) return [checkoutError("DELIVERY_OPTION_NOT_FOUND", "The delivery option is not available.", ["optionHandle"])];
    group.selection = {
      status: "SELECTED", option, previousOptionHandle: group.selection.option?.handle ?? null, resetReason: null,
    };
    return [];
  }),

  checkoutDeliveryRecipientsAdd: (_, { input }) => withCheckout(store, input, (checkout) =>
    updateRecipients(checkout, input.recipients)),

  checkoutDeliveryRecipientsUpdate: (_, { input }) => withCheckout(store, input, (checkout) =>
    updateRecipients(checkout, input.updates)),

  checkoutDeliveryRecipientsRemove: (_, { input }) => withCheckout(store, input, (checkout) => {
    for (const group of checkout.deliveryGroups) {
      if (input.deliveryGroupIds.includes(group.id)) group.recipient = null;
    }
    return [];
  }),

  checkoutPromoCodeAdd: (_, { input }) => withCheckout(store, input, (checkout) => {
    const code = input.code.trim().toUpperCase();
    if (checkout.appliedPromoCodes.some((promo) => promo.code === code)) return [];
    const numeric = Number.parseInt(code.match(/\d+/u)?.[0] ?? "10", 10);
    checkout.appliedPromoCodes.push({
      code,
      appliedAt: store.now(),
      discountType: "percentage",
      value: Math.min(Math.max(numeric, 1), 50),
      provider: "mock-promotions",
      conditions: null,
    });
    return [];
  }),

  checkoutPromoCodeRemove: (_, { input }) => withCheckout(store, input, (checkout) => {
    checkout.appliedPromoCodes = checkout.appliedPromoCodes.filter(({ code }) => code !== input.code.trim().toUpperCase());
    return [];
  }),

  checkoutTagCreate: (_, { input }) => withCheckout(store, input, (checkout) => {
    if (checkout.tags.some(({ slug }) => slug === input.tag.slug)) {
      return [checkoutError("TAG_ALREADY_EXISTS", "A checkout tag with this slug already exists.", ["tag", "slug"])];
    }
    const now = store.now();
    checkout.tags.push({
      id: gid("CheckoutTag", `runtime-${store.next("checkout-tag")}`), ...input.tag, createdAt: now, updatedAt: now,
    });
    return [];
  }),

  checkoutTagUpdate: (_, { input }) => withCheckout(store, input, (checkout) => {
    const tag = checkout.tags.find(({ id }) => id === input.tagId);
    if (!tag) return [checkoutError("TAG_NOT_FOUND", "The checkout tag does not exist.", ["tagId"])];
    if (input.slug !== null && input.slug !== undefined) tag.slug = input.slug;
    if (input.unique !== null && input.unique !== undefined) tag.unique = input.unique;
    tag.updatedAt = store.now();
    return [];
  }),

  checkoutTagDelete: (_, { input }) => withCheckout(store, input, (checkout) => {
    checkout.tags = checkout.tags.filter(({ id }) => id !== input.tagId);
    for (const line of checkout.lines) if (line.tag?.id === input.tagId) line.tag = null;
    return [];
  }),

  checkoutPaymentMethodUpdate: (_, { input }) => withCheckout(store, input, (checkout) => {
    const method = checkout.payment.methods.find(({ handle }) => handle === input.methodHandle);
    if (!method) return [checkoutError("PAYMENT_METHOD_NOT_FOUND", "The payment method is not available.", ["methodHandle"])];
    checkout.payment.selection = {
      status: "SELECTED", method, previousMethodHandle: checkout.payment.selection.method?.handle ?? null, resetReason: null,
    };
    return [];
  }),
});

const updateRecipients = (checkout, updates) => {
  const errors = [];
  for (const update of updates) {
    const group = checkout.deliveryGroups.find(({ id }) => id === update.deliveryGroupId);
    if (!group) errors.push(checkoutError("DELIVERY_GROUP_NOT_FOUND", "The delivery group does not exist.", ["deliveryGroupId"]));
    else group.recipient = { ...update.recipient };
  }
  return errors;
};
