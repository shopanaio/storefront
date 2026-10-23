import { createHash } from 'node:crypto';

import { gid, money } from '../fixture-helpers.js';
import {
  checkoutError,
  createCheckoutLine,
  formatAddress,
} from '../helpers.js';
import {
  applyLoyaltyReward,
  estimateLoyaltyEarning,
  loyaltySelection,
  quoteLoyaltyRedemption,
  updateLoyaltyIntent,
} from '../loyalty.js';

const successful = (checkout) => ({ checkout, userErrors: [] });
const failed = (...userErrors) => ({ checkout: null, userErrors });

/** Checkout addresses carry `postalCode` and no company. */
const checkoutAddress = (id, input) => {
  const { company, zip, ...address } = formatAddress(id, {
    ...input,
    zip: input.postalCode ?? null,
  });
  return { ...address, postalCode: zip || null, data: input.data ?? null };
};

const findCheckout = (store, id) =>
  store.state.checkouts.find((checkout) => checkout.id === id);

const guardCheckout = (store, input) => {
  const checkout = findCheckout(store, input.checkoutId);
  if (!checkout) {
    return {
      error: checkoutError(
        'CHECKOUT_NOT_FOUND',
        'The checkout does not exist.',
        ['checkoutId']
      ),
    };
  }
  if (
    Date.parse(checkout.expiresAt) <= store.clock &&
    ['OPEN', 'READY'].includes(checkout.status)
  ) {
    checkout.status = 'EXPIRED';
  }
  return { checkout };
};

const withCheckout = (store, input, update) => {
  const { checkout, error } = guardCheckout(store, input);
  if (error) return failed(error);
  if (['PLACED', 'EXPIRED', 'ABANDONED'].includes(checkout.status)) {
    return failed(
      checkoutError(
        'CHECKOUT_NOT_OPEN',
        'The checkout is no longer editable.',
        ['checkoutId']
      )
    );
  }
  const updateErrors = update(checkout) ?? [];
  if (updateErrors.length) return failed(...updateErrors);
  refreshCheckout(store, checkout);
  return successful(store.touchCheckout(checkout));
};

const updateMoneyCurrency = (value, currencyCode, visited = new WeakSet()) => {
  if (!value || typeof value !== 'object' || visited.has(value)) return;
  visited.add(value);
  if (Object.hasOwn(value, 'amount') && Object.hasOwn(value, 'currencyCode'))
    value.currencyCode = currencyCode;
  for (const nested of Object.values(value))
    updateMoneyCurrency(nested, currencyCode, visited);
};

const getDeliveryOptions = (store) =>
  store.state.checkouts
    .flatMap(({ deliveryGroups }) => deliveryGroups)
    .find(({ options }) => options.length)?.options ?? [];

const getPaymentMethods = (store) =>
  store.state.checkouts
    .map(({ payment }) => payment.methods)
    .find((methods) => methods.length) ?? [];

const createLine = (store, checkout, input, parentId = null) => {
  const variant = store.get(input.purchasableId);
  if (!variant || variant.__typename !== 'ProductVariant') return null;
  const line = createCheckoutLine({
    checkoutKey: checkout.id.split('/').at(-1),
    position: store.next('checkout-line'),
    variant,
    quantity: input.quantity,
    attributes: input.attributes,
    purchase: input.purchase,
    tag: checkout.tags.find(({ slug }) => slug === input.tagSlug) ?? null,
  });
  line.parentId = parentId;
  line.children = (input.children ?? [])
    .map((child) => createLine(store, checkout, child, line.id))
    .filter(Boolean);
  return line;
};

const refreshLine = (store, checkout, line) => {
  const variant = store.get(line.purchasableId);
  if (!variant) return;
  const refreshed = createCheckoutLine({
    checkoutKey: checkout.id.split('/').at(-1),
    position: line.id.split('/').at(-1),
    variant,
    quantity: line.quantity,
    attributes: line.attributes,
    purchase: line.purchase,
    tag: line.tag,
  });
  const children = line.children;
  Object.assign(line, refreshed, {
    id: line.id,
    parentId: line.parentId,
    children,
  });
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
        code: 'ITEM_UNAVAILABLE',
        message: `${line.title} is not available.`,
        severity: 'ERROR',
        effect: 'STOP',
        field: ['lines'],
        lineId: line.id,
        retryable: false,
      });
    } else if (line.quantity > variant.quantityAvailable) {
      checkout.issues.push({
        code: 'NOT_ENOUGH_STOCK',
        message: `Only ${variant.quantityAvailable} units of ${line.title} are available.`,
        severity: 'ERROR',
        effect: 'STOP',
        field: ['lines', 'quantity'],
        lineId: line.id,
        retryable: true,
      });
    }
  }

  const subtotal = checkout.lines.reduce(
    (sum, line) => sum + Number(line.cost.subtotalAmount.amount),
    0
  );
  const catalogDiscount = checkout.lines.reduce(
    (sum, line) => sum + Number(line.cost.discountAmount.amount),
    0
  );
  const promoDiscount = checkout.promoCodes
    .filter(({ status }) => status === 'APPLIED')
    .reduce(
      (sum, promo) =>
        sum +
        (String(promo.discountType).toLowerCase().includes('percent')
          ? (subtotal * Number(promo.value)) / 100
          : Number(promo.value)),
      0
    );
  const shipping = checkout.deliveryGroups.reduce(
    (sum, group) => sum + Number(group.selection?.option?.cost?.amount ?? 0),
    0
  );
  const rewardDiscount = applyLoyaltyReward(store, checkout, { shipping });
  const tax = Math.max(0, subtotal - promoDiscount - rewardDiscount) * 0.08;
  const totalBeforeLoyalty = Math.max(
    0,
    subtotal - promoDiscount - rewardDiscount + tax + shipping
  );
  // Loyalty pays after Pricing: it is a tender, not a discount (A6).
  const loyaltyAmount = quoteLoyaltyRedemption(
    store,
    checkout,
    totalBeforeLoyalty
  );
  const total = Math.max(0, totalBeforeLoyalty - loyaltyAmount);

  checkout.totalQuantity = checkout.lines.reduce(
    (sum, line) => sum + line.quantity,
    0
  );
  checkout.cost = {
    subtotalAmount: money(subtotal, checkout.currencyCode),
    totalDiscountAmount: money(
      catalogDiscount + promoDiscount + rewardDiscount,
      checkout.currencyCode
    ),
    merchandiseDiscountAmount: money(
      catalogDiscount + promoDiscount + rewardDiscount,
      checkout.currencyCode
    ),
    totalTaxAmount: money(tax, checkout.currencyCode),
    totalShippingAmount: money(shipping, checkout.currencyCode),
    totalAmount: money(total, checkout.currencyCode),
    loyaltyAmount: money(loyaltyAmount, checkout.currencyCode),
  };
  checkout.loyaltySelection = loyaltySelection(checkout);
  checkout.loyaltyEarning = estimateLoyaltyEarning(store, checkout, total);
  checkout.payment.payableAmount = money(total, checkout.currencyCode);
  checkout.valid =
    checkout.lines.length > 0 &&
    !checkout.issues.some(({ effect }) => effect === 'STOP');
  if (['OPEN', 'READY'].includes(checkout.status))
    checkout.status = checkout.valid ? 'READY' : 'OPEN';
  return checkout;
};

export const createCheckout = (store, input, customer = null) => {
  // S3: a signed-in buyer with an account cart adds to it instead of opening a second one.
  const existingCart = accountCheckout(store, customer);
  if (existingCart) {
    return checkoutMutations(store).checkoutLinesAdd(null, {
      input: { checkoutId: existingCart.id, lines: input.items },
    });
  }
  const key = `runtime-${store.next('checkout')}`;
  const now = store.now();
  const checkout = {
    id: gid('Checkout', key),
    channelCode: input.channelCode,
    localeCode: input.localeCode,
    currencyCode: input.currencyCode,
    status: 'OPEN',
    expiresAt: new Date(Date.parse(now) + 24 * 3_600_000).toISOString(),
    loyaltyIntent: null,
    loyaltyRedemption: null,
    loyaltyRewardId: null,
    loyaltySelection: null,
    loyaltyEarning: null,
    resultRevision: `checkout-${key}-r1`,
    valid: true,
    issues: [],
    createdAt: now,
    updatedAt: now,
    cost: {
      subtotalAmount: money(0, input.currencyCode),
      totalDiscountAmount: money(0, input.currencyCode),
      merchandiseDiscountAmount: money(0, input.currencyCode),
      totalTaxAmount: money(0, input.currencyCode),
      totalShippingAmount: money(0, input.currencyCode),
      totalAmount: money(0, input.currencyCode),
      loyaltyAmount: money(0, input.currencyCode),
    },
    customerIdentity: {
      countryCode: null,
      customerId: null,
      email: null,
      phone: null,
      firstName: null,
      lastName: null,
      middleName: null,
    },
    customerNote: null,
    billingAddress: null,
    totalQuantity: 0,
    lines: [],
    notifications: [],
    deliveryGroups: [],
    promoCodes: [],
    tags: (input.tags ?? []).map((tag) => ({
      id: gid('CheckoutTag', `${key}-${store.next('checkout-tag')}`),
      ...tag,
      createdAt: now,
      updatedAt: now,
    })),
    payment: {
      methods: structuredClone(getPaymentMethods(store)),
      selection: {
        status: 'NONE',
        method: null,
        previousMethodHandle: null,
        resetReason: null,
      },
      payableAmount: money(0, input.currencyCode),
    },
  };
  checkout.lines = input.items
    .map((item) => createLine(store, checkout, item))
    .filter(Boolean);
  if (checkout.lines.length !== input.items.length) {
    return failed(
      checkoutError(
        'PURCHASABLE_NOT_FOUND',
        'One or more purchasable items do not exist.',
        ['items']
      )
    );
  }
  if (customer) {
    checkout.ownerCustomerId = customer.id;
    checkout.customerIdentity.customerId = customer.id;
  }
  store.state.checkouts.push(checkout);
  refreshCheckout(store, checkout);
  store.reindex();
  return successful(checkout);
};

export const checkoutMutations = (store) => ({
  checkoutCreate: (_, { input }, context) =>
    createCheckout(store, input, context?.customer),
  ...checkoutClaimMutation(store),

  checkoutLoyaltyRedemptionUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const error = updateLoyaltyIntent(checkout, input, checkoutError);
      return error ? [error] : [];
    }),

  checkoutLoyaltyRedemptionRemove: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      checkout.loyaltyIntent = null;
      return [];
    }),

  checkoutLinesAdd: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const additions = input.lines.map((line) =>
        createLine(store, checkout, line)
      );
      if (additions.some((line) => !line)) {
        return [
          checkoutError(
            'PURCHASABLE_NOT_FOUND',
            'A purchasable item does not exist.',
            ['lines']
          ),
        ];
      }
      for (const addition of additions) {
        const existing = checkout.lines.find(
          (line) =>
            line.purchasableId === addition.purchasableId &&
            JSON.stringify(line.attributes) ===
              JSON.stringify(addition.attributes) &&
            line.tag?.id === addition.tag?.id
        );
        if (existing) existing.quantity += addition.quantity;
        else checkout.lines.push(addition);
      }
      return [];
    }),

  checkoutLinesUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const errors = [];
      for (const update of input.lines) {
        const line = checkout.lines.find(({ id }) => id === update.lineId);
        if (!line)
          errors.push(
            checkoutError(
              'LINE_NOT_FOUND',
              'The checkout line does not exist.',
              ['lines']
            )
          );
        else if (update.quantity < 1)
          errors.push(
            checkoutError(
              'INVALID_QUANTITY',
              'Quantity must be at least one.',
              ['lines', 'quantity']
            )
          );
        else line.quantity = update.quantity;
      }
      return errors;
    }),

  checkoutLinesReplace: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const errors = [];
      for (const replacement of input.lines) {
        const index = checkout.lines.findIndex(
          ({ id }) => id === replacement.lineId
        );
        const variant = store.get(replacement.purchasableId);
        if (index < 0) {
          errors.push(
            checkoutError(
              'LINE_NOT_FOUND',
              'The checkout line does not exist.',
              ['lines']
            )
          );
          continue;
        }
        if (variant?.__typename !== 'ProductVariant') {
          errors.push(
            checkoutError(
              'PURCHASABLE_NOT_FOUND',
              'The replacement variant does not exist.',
              ['lines', 'purchasableId']
            )
          );
          continue;
        }
        const source = checkout.lines[index];
        const quantity = replacement.quantity ?? source.quantity;
        const target = checkout.lines.find(
          (line) => line.purchasableId === variant.id && line.id !== source.id
        );
        if (target) target.quantity += quantity;
        else
          checkout.lines[index] = createLine(store, checkout, {
            ...source,
            purchasableId: variant.id,
            quantity,
          });
      }
      return errors;
    }),

  checkoutLinesDelete: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const found = new Set(checkout.lines.map(({ id }) => id));
      const missing = input.lineIds.filter((id) => !found.has(id));
      if (missing.length)
        return [
          checkoutError(
            'LINE_NOT_FOUND',
            `Unknown checkout line: ${missing[0]}.`,
            ['lineIds']
          ),
        ];
      checkout.lines = checkout.lines.filter(
        ({ id }) => !input.lineIds.includes(id)
      );
      for (const group of checkout.deliveryGroups) {
        group.checkoutLineIds = group.checkoutLineIds.filter(
          (id) => !input.lineIds.includes(id)
        );
      }
      return [];
    }),

  checkoutLinesClear: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      checkout.lines = [];
      checkout.deliveryGroups = [];
      return [];
    }),

  checkoutCustomerIdentityUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      for (const field of [
        'email',
        'phone',
        'countryCode',
        'firstName',
        'lastName',
        'middleName',
      ]) {
        if (Object.hasOwn(input, field))
          checkout.customerIdentity[field] = input[field];
      }
      return [];
    }),

  checkoutCustomerNoteUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      checkout.customerNote = input.note?.trim() || null;
      return [];
    }),

  checkoutLanguageCodeUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      checkout.localeCode = input.localeCode;
      return [];
    }),

  checkoutCurrencyCodeUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      checkout.currencyCode = input.currencyCode;
      updateMoneyCurrency(checkout, input.currencyCode);
      return [];
    }),

  checkoutBillingAddressUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      checkout.billingAddress = input.billingAddress
        ? checkoutAddress(null, input.billingAddress)
        : null;
      return [];
    }),

  checkoutDeliveryAddressesAdd: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const lineIds = new Set(checkout.lines.map(({ id }) => id));
      if (
        input.addresses.some(({ checkoutLineIds }) =>
          checkoutLineIds.some((id) => !lineIds.has(id))
        )
      ) {
        return [
          checkoutError(
            'LINE_NOT_FOUND',
            'A delivery destination refers to an unknown line.',
            ['addresses', 'checkoutLineIds']
          ),
        ];
      }
      for (const destination of input.addresses) {
        const number = store.next('checkout-delivery-group');
        const id = gid('CheckoutDeliveryGroup', `runtime-${number}`);
        checkout.deliveryGroups.push({
          id,
          replacesGroupIds: [],
          checkoutLineIds: destination.checkoutLineIds,
          deliveryAddress: checkoutAddress(
            gid('CheckoutDeliveryAddress', `runtime-${number}`),
            destination.address
          ),
          recipient: null,
          options: structuredClone(getDeliveryOptions(store)),
          selection: {
            status: 'NONE',
            option: null,
            previousOptionHandle: null,
            resetReason: null,
            customerInput: null,
          },
          // Customer input saved per option handle; the selected option's input is returned.
          deliveryInputs: {},
        });
      }
      return [];
    }),

  checkoutDeliveryAddressesUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const groups = new Map(
        checkout.deliveryGroups.map((group) => [
          group.deliveryAddress?.id,
          group,
        ])
      );
      const errors = [];
      for (const update of input.updates) {
        const group = groups.get(update.addressId);
        if (!group) {
          errors.push(
            checkoutError(
              'DELIVERY_ADDRESS_NOT_FOUND',
              'The delivery address does not exist.',
              ['updates', 'addressId']
            )
          );
          continue;
        }
        const previous = group.deliveryAddress;
        group.deliveryAddress = checkoutAddress(
          update.addressId,
          update.address
        );
        // A new country, province or city drops the delivery input saved for the old one.
        if (
          ['countryCode', 'provinceCode', 'city'].some(
            (field) => previous?.[field] !== group.deliveryAddress[field]
          )
        ) {
          group.deliveryInputs = {};
          group.selection.customerInput = null;
        }
      }
      return errors;
    }),

  checkoutDeliveryAddressesRemove: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      checkout.deliveryGroups = checkout.deliveryGroups.filter(
        ({ deliveryAddress }) => !input.addressIds.includes(deliveryAddress?.id)
      );
      return [];
    }),

  checkoutDeliveryMethodUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const group = checkout.deliveryGroups.find(
        ({ id }) => id === input.deliveryGroupId
      );
      if (!group)
        return [
          checkoutError(
            'DELIVERY_GROUP_NOT_FOUND',
            'The delivery group does not exist.',
            ['deliveryGroupId']
          ),
        ];
      const option = group.options.find(
        ({ handle }) => handle === input.optionHandle
      );
      if (!option)
        return [
          checkoutError(
            'DELIVERY_OPTION_NOT_FOUND',
            'The delivery option is not available.',
            ['optionHandle']
          ),
        ];
      group.deliveryInputs ??= {};
      // Omitted or null input keeps the input saved for the option.
      if (input.customerInput !== undefined && input.customerInput !== null) {
        group.deliveryInputs[option.handle] = input.customerInput;
      }
      group.selection = {
        status: 'SELECTED',
        option,
        previousOptionHandle: group.selection.option?.handle ?? null,
        resetReason: null,
        customerInput: group.deliveryInputs[option.handle] ?? null,
      };
      return [];
    }),

  checkoutDeliveryCustomerInputClear: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const group = checkout.deliveryGroups.find(
        ({ id }) => id === input.deliveryGroupId
      );
      if (!group)
        return [
          checkoutError(
            'DELIVERY_GROUP_NOT_FOUND',
            'The delivery group does not exist.',
            ['deliveryGroupId']
          ),
        ];
      if (group.deliveryInputs) delete group.deliveryInputs[input.optionHandle];
      if (group.selection.option?.handle === input.optionHandle)
        group.selection.customerInput = null;
      return [];
    }),

  checkoutDeliveryRecipientsAdd: (_, { input }) =>
    withCheckout(store, input, (checkout) =>
      updateRecipients(checkout, input.recipients)
    ),

  checkoutDeliveryRecipientsUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) =>
      updateRecipients(checkout, input.updates)
    ),

  checkoutDeliveryRecipientsRemove: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      for (const group of checkout.deliveryGroups) {
        if (input.deliveryGroupIds.includes(group.id)) group.recipient = null;
      }
      return [];
    }),

  checkoutPromoCodeAdd: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const code = input.code.trim().toUpperCase();
      if (checkout.promoCodes.some((promo) => promo.code === code)) return [];
      const numeric = Number.parseInt(code.match(/\d+/u)?.[0] ?? '10', 10);
      checkout.promoCodes.push({
        code,
        status: 'APPLIED',
        reason: null,
        message: null,
        appliedAt: store.now(),
        discountType: 'percentage',
        value: Math.min(Math.max(numeric, 1), 50),
        provider: 'mock-promotions',
        conditions: null,
      });
      return [];
    }),

  checkoutPromoCodeRemove: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      checkout.promoCodes = checkout.promoCodes.filter(
        ({ code }) => code !== input.code.trim().toUpperCase()
      );
      return [];
    }),

  checkoutTagCreate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      if (checkout.tags.some(({ slug }) => slug === input.tag.slug)) {
        return [
          checkoutError(
            'TAG_ALREADY_EXISTS',
            'A checkout tag with this slug already exists.',
            ['tag', 'slug']
          ),
        ];
      }
      const now = store.now();
      checkout.tags.push({
        id: gid('CheckoutTag', `runtime-${store.next('checkout-tag')}`),
        ...input.tag,
        createdAt: now,
        updatedAt: now,
      });
      return [];
    }),

  checkoutTagUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const tag = checkout.tags.find(({ id }) => id === input.tagId);
      if (!tag)
        return [
          checkoutError('TAG_NOT_FOUND', 'The checkout tag does not exist.', [
            'tagId',
          ]),
        ];
      if (input.slug !== null && input.slug !== undefined)
        tag.slug = input.slug;
      if (input.unique !== null && input.unique !== undefined)
        tag.unique = input.unique;
      tag.updatedAt = store.now();
      return [];
    }),

  checkoutTagDelete: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      checkout.tags = checkout.tags.filter(({ id }) => id !== input.tagId);
      for (const line of checkout.lines)
        if (line.tag?.id === input.tagId) line.tag = null;
      return [];
    }),

  checkoutPaymentMethodUpdate: (_, { input }) =>
    withCheckout(store, input, (checkout) => {
      const method = checkout.payment.methods.find(
        ({ handle }) => handle === input.methodHandle
      );
      if (!method)
        return [
          checkoutError(
            'PAYMENT_METHOD_NOT_FOUND',
            'The payment method is not available.',
            ['methodHandle']
          ),
        ];
      checkout.payment.selection = {
        status: 'SELECTED',
        method,
        previousMethodHandle: checkout.payment.selection.method?.handle ?? null,
        resetReason: null,
      };
      return [];
    }),
});

const updateRecipients = (checkout, updates) => {
  const errors = [];
  for (const update of updates) {
    const group = checkout.deliveryGroups.find(
      ({ id }) => id === update.deliveryGroupId
    );
    if (!group)
      errors.push(
        checkoutError(
          'DELIVERY_GROUP_NOT_FOUND',
          'The delivery group does not exist.',
          ['deliveryGroupId']
        )
      );
    else group.recipient = { ...update.recipient };
  }
  return errors;
};

/** S7 switch of the mock store: `MOCK_GUEST_CHECKOUT=false` requires signing in to check out. */
export const guestCheckoutEnabled = () =>
  process.env.MOCK_GUEST_CHECKOUT !== 'false';

const TERMS_ACCEPTANCE_MODES = ['NOTICE', 'CHECKBOX'];

/**
 * How the buyer accepts the checkout disclosures: `MOCK_CHECKOUT_TERMS_ACCEPTANCE` (NOTICE or
 * CHECKBOX) overrides `checkoutSettings.termsAcceptanceMode` of the fixtures; NOTICE by default.
 */
export const termsAcceptanceMode = (store) => {
  const mode =
    process.env.MOCK_CHECKOUT_TERMS_ACCEPTANCE ??
    store.state.checkoutSettings?.termsAcceptanceMode;
  return TERMS_ACCEPTANCE_MODES.includes(mode) ? mode : 'NOTICE';
};

/** Policies the notice links to, in reading order. */
const DISCLOSURE_POLICY_TYPES = ['TERMS_OF_SERVICE', 'PRIVACY_POLICY'];

/**
 * Notice templates by language and acceptance mode, for both policies or only one of them.
 * `{terms_of_service}` and `{privacy_policy}` become links to the published policies.
 */
const DISCLOSURE_TEMPLATES = {
  en: {
    NOTICE: {
      BOTH: 'By placing your order, you agree to the {terms_of_service} and acknowledge the {privacy_policy}.',
      TERMS_OF_SERVICE:
        'By placing your order, you agree to the {terms_of_service}.',
      PRIVACY_POLICY:
        'By placing your order, you acknowledge the {privacy_policy}.',
    },
    CHECKBOX: {
      BOTH: 'I agree to the {terms_of_service} and acknowledge the {privacy_policy}.',
      TERMS_OF_SERVICE: 'I agree to the {terms_of_service}.',
      PRIVACY_POLICY: 'I acknowledge the {privacy_policy}.',
    },
  },
  uk: {
    NOTICE: {
      BOTH: 'Оформлюючи замовлення, ви погоджуєтеся з {terms_of_service} та підтверджуєте, що ознайомилися з {privacy_policy}.',
      TERMS_OF_SERVICE:
        'Оформлюючи замовлення, ви погоджуєтеся з {terms_of_service}.',
      PRIVACY_POLICY:
        'Оформлюючи замовлення, ви підтверджуєте, що ознайомилися з {privacy_policy}.',
    },
    CHECKBOX: {
      BOTH: 'Я погоджуюся з {terms_of_service} та підтверджую ознайомлення з {privacy_policy}.',
      TERMS_OF_SERVICE: 'Я погоджуюся з {terms_of_service}.',
      PRIVACY_POLICY: 'Я підтверджую ознайомлення з {privacy_policy}.',
    },
  },
};

const templateLanguage = (locale) => {
  const language = String(locale ?? '')
    .toLowerCase()
    .split(/[-_]/u)[0];
  return Object.hasOwn(DISCLOSURE_TEMPLATES, language) ? language : null;
};

/**
 * `Checkout.disclosures`: the notice in the checkout locale (the store default locale, then
 * English, when the locale has no template) with links to the published terms of service and
 * privacy policy; null when neither is published. The version changes with the mode, the
 * locale, the notice and the published policy versions.
 */
export const checkoutDisclosures = (store, checkout) => {
  const published = store.all('StorePolicy');
  const policies = DISCLOSURE_POLICY_TYPES.map((type) =>
    published.find((policy) => policy.type === type)
  ).filter(Boolean);
  if (!policies.length) return null;

  const acceptanceMode = termsAcceptanceMode(store);
  const language =
    templateLanguage(checkout.localeCode) ??
    templateLanguage(store.state.store?.defaultLocale) ??
    'en';
  const templates = DISCLOSURE_TEMPLATES[language][acceptanceMode];
  const notice =
    policies.length === DISCLOSURE_POLICY_TYPES.length
      ? templates.BOTH
      : templates[policies[0].type];
  const parts = notice
    .split(/(\{\w+\})/u)
    .filter(Boolean)
    .map((piece) => {
      const policy = policies.find(
        ({ type }) => piece === `{${type.toLowerCase()}}`
      );
      return policy
        ? {
            __typename: 'CheckoutDisclosurePolicyLink',
            policyType: policy.type,
            handle: policy.handle,
            title: policy.title,
            path: policy.path,
          }
        : { __typename: 'CheckoutDisclosureText', text: piece };
    });
  const version = createHash('sha256')
    .update(
      JSON.stringify([
        acceptanceMode,
        checkout.localeCode,
        notice,
        policies.map(
          (policy) => `${policy.type}:${policy.id}:${policy.version}`
        ),
      ])
    )
    .digest('hex');
  return { version, acceptanceMode, parts };
};

/**
 * Acceptance check of `placeOrder`: the buyer confirms the current disclosures version, and
 * ticks the checkbox in CHECKBOX mode. Null when the checkout has no disclosures.
 */
export const disclosuresPlacementError = (store, checkout, input) => {
  const disclosures = checkoutDisclosures(store, checkout);
  if (!disclosures) return null;
  if (input.disclosuresVersion !== disclosures.version) {
    return checkoutError(
      'DISCLOSURES_CHANGED',
      'The checkout disclosures changed; the buyer reviews them before placing.',
      ['input', 'disclosuresVersion'],
      true
    );
  }
  if (
    disclosures.acceptanceMode === 'CHECKBOX' &&
    input.termsAccepted !== true
  ) {
    return checkoutError(
      'TERMS_NOT_ACCEPTED',
      'The buyer must accept the terms before placing the order.',
      ['input', 'termsAccepted']
    );
  }
  return null;
};

/** D2: an account checkout is visible only to its account; a guest checkout to anyone here. */
export const canAccessCheckout = (checkout, customer) =>
  !checkout.ownerCustomerId || checkout.ownerCustomerId === customer?.id;

/** D5: the one open cart of the account. */
export const accountCheckout = (store, customer) =>
  customer
    ? (store.state.checkouts.find(
        (checkout) =>
          checkout.ownerCustomerId === customer.id &&
          ['OPEN', 'READY'].includes(checkout.status)
      ) ?? null)
    : null;

const claimFailed = (code, message) => ({
  checkout: null,
  mergedFromCheckoutId: null,
  userErrors: [checkoutError(code, message, ['checkoutId'])],
});

/** D9: the profile fills only the contacts the buyer left empty. */
const fillEmptyContacts = (identity, values) => {
  for (const [field, value] of Object.entries(values)) {
    if (value && !identity[field]) identity[field] = value;
  }
};

const profileContacts = (customer) => ({
  email: customer.emailAddress?.emailAddress ?? null,
  phone: customer.phoneNumber?.phoneNumber ?? null,
  firstName: customer.firstName ?? null,
  lastName: customer.lastName ?? null,
});

export const checkoutClaimMutation = (store) => ({
  checkoutClaim: (_, { input }, context) => {
    const customer = context.customer;
    if (!customer)
      return claimFailed('CUSTOMER_REQUIRED', 'Signing in is required.');
    const { checkout: guest, error } = guardCheckout(store, input);
    if (error || !canAccessCheckout(guest, customer)) {
      return claimFailed('CHECKOUT_NOT_FOUND', 'The checkout does not exist.');
    }
    if (guest.ownerCustomerId === customer.id) {
      return { checkout: guest, mergedFromCheckoutId: null, userErrors: [] };
    }
    if (!['OPEN', 'READY'].includes(guest.status)) {
      return claimFailed(
        'CHECKOUT_NOT_OPEN',
        'The checkout is no longer editable.'
      );
    }

    const target = accountCheckout(store, customer);
    if (!target) {
      // S1: the guest checkout passes to the account.
      guest.ownerCustomerId = customer.id;
      guest.customerIdentity.customerId = customer.id;
      fillEmptyContacts(guest.customerIdentity, profileContacts(customer));
      refreshCheckout(store, guest);
      return {
        checkout: store.touchCheckout(guest),
        mergedFromCheckoutId: null,
        userErrors: [],
      };
    }

    // S2 / D7: the guest lines and input join the account cart; the guest checkout closes.
    for (const line of guest.lines) {
      const same = target.lines.find(
        (existing) =>
          existing.purchasableId === line.purchasableId &&
          JSON.stringify(existing.attributes ?? null) ===
            JSON.stringify(line.attributes ?? null)
      );
      if (same) same.quantity += line.quantity;
      else target.lines.push(line);
    }
    fillEmptyContacts(target.customerIdentity, guest.customerIdentity);
    fillEmptyContacts(target.customerIdentity, profileContacts(customer));
    if (!target.customerNote) target.customerNote = guest.customerNote;
    guest.status = 'ABANDONED';
    refreshCheckout(store, target);
    store.reindex();
    return {
      checkout: store.touchCheckout(target),
      mergedFromCheckoutId: guest.id,
      userErrors: [],
    };
  },
});
