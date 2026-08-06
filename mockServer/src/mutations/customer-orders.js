import { gid, money } from "../fixture-helpers.js";
import { customerError, formatAddress, orderError } from "../helpers.js";
import { createCheckout, refreshCheckout } from "./checkout.js";

const customerFailure = (field, ...userErrors) => ({ [field]: null, userErrors });
const orderFailure = (fields, ...userErrors) => ({
  ...Object.fromEntries(fields.map((field) => [field, null])),
  userErrors,
});

const requireCustomer = (context) => context.customer;

const findOwnedOrder = (store, customer, id) => {
  const order = store.state.orders.find((candidate) => candidate.id === id);
  return store.owns(customer, order) ? order : null;
};

const addressPayload = (store, customer, input, id) => {
  const existing = id ? customer.addresses.find((address) => address.id === id) : null;
  const merged = { ...(existing ?? {}), ...(input ?? {}) };
  return formatAddress(id ?? gid("CustomerAddress", `runtime-${store.next("customer-address")}`), merged);
};

const customerMutations = (store) => ({
  customerUpdate: (_, { input }, context) => {
    const customer = requireCustomer(context);
    if (!customer) return customerFailure("customer", customerError("AUTHENTICATION_REQUIRED", "A customer session is required."));
    if (Object.hasOwn(input, "firstName")) customer.firstName = input.firstName?.trim() || null;
    if (Object.hasOwn(input, "lastName")) customer.lastName = input.lastName?.trim() || null;
    customer.displayName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.emailAddress?.emailAddress;
    store.reindex();
    return { customer, userErrors: [] };
  },

  customerAddressCreate: (_, { address, defaultAddress }, context) => {
    const customer = requireCustomer(context);
    if (!customer) return customerFailure("customerAddress", customerError("AUTHENTICATION_REQUIRED", "A customer session is required."));
    const created = addressPayload(store, customer, address);
    customer.addresses.push(created);
    if (defaultAddress || !customer.defaultAddressId) customer.defaultAddressId = created.id;
    store.reindex();
    return { customerAddress: created, userErrors: [] };
  },

  customerAddressUpdate: (_, { addressId, address, defaultAddress }, context) => {
    const customer = requireCustomer(context);
    const index = customer?.addresses.findIndex(({ id }) => id === addressId) ?? -1;
    if (index < 0) {
      return customerFailure("customerAddress", customerError("ADDRESS_NOT_FOUND", "The customer address does not exist.", ["addressId"]));
    }
    const updated = addressPayload(store, customer, address, addressId);
    customer.addresses[index] = updated;
    if (defaultAddress === true) customer.defaultAddressId = addressId;
    if (defaultAddress === false && customer.defaultAddressId === addressId) {
      customer.defaultAddressId = customer.addresses.find(({ id }) => id !== addressId)?.id ?? addressId;
    }
    store.reindex();
    return { customerAddress: updated, userErrors: [] };
  },

  customerAddressDelete: (_, { addressId }, context) => {
    const customer = requireCustomer(context);
    const index = customer?.addresses.findIndex(({ id }) => id === addressId) ?? -1;
    if (index < 0) {
      return { deletedAddressId: null, userErrors: [customerError("ADDRESS_NOT_FOUND", "The customer address does not exist.", ["addressId"])] };
    }
    customer.addresses.splice(index, 1);
    if (customer.defaultAddressId === addressId) customer.defaultAddressId = customer.addresses[0]?.id ?? null;
    store.reindex();
    return { deletedAddressId: addressId, userErrors: [] };
  },

  customerEmailMarketingSubscribe: (_, __, context) => updateMarketing(context.customer, "SUBSCRIBED"),
  customerEmailMarketingUnsubscribe: (_, __, context) => updateMarketing(context.customer, "UNSUBSCRIBED"),
});

const updateMarketing = (customer, state) => {
  if (!customer?.emailAddress) {
    return { emailAddress: null, userErrors: [customerError("EMAIL_NOT_FOUND", "The customer has no email address.")] };
  }
  customer.emailAddress.marketingConsent = { state };
  return { emailAddress: customer.emailAddress, userErrors: [] };
};

const action = (available, code = null, message = null) => ({
  available,
  unavailableReasonCode: code,
  unavailableReason: message,
  expiresAt: available ? "2026-09-01T23:59:59.000Z" : null,
});

const createOrderFromCheckout = (store, checkout, customer) => {
  const sequence = 9000 + store.next("order");
  const number = String(sequence);
  const now = store.now();
  const lines = checkout.lines.map((line, index) => {
    const variant = store.get(line.purchasableId);
    const product = store.get(variant?.productId);
    const image = store.get(line.imageId);
    return {
      id: gid("OrderLine", `${number}-${index + 1}`),
      title: line.title,
      sku: line.sku,
      imageUrl: image?.image?.url ?? null,
      quantity: line.quantity,
      cost: {
        unitCompareAtPrice: line.cost.compareAtUnitPrice,
        unitPrice: line.cost.unitPrice,
        discountAmount: line.cost.discountAmount,
        subtotalAmount: line.cost.subtotalAmount,
        taxAmount: line.cost.taxAmount,
        totalAmount: line.cost.totalAmount,
      },
      purchasableId: line.purchasableId,
      purchasableSnapshot: {
        productId: product?.id ?? null,
        variantId: variant?.id ?? null,
        title: line.title,
        sku: line.sku,
        selectedOptions: variant?.selectedOptions ?? [],
      },
      returnEligibility: {
        eligible: true, maxQuantity: line.quantity, unavailableReasonCode: null, unavailableReason: null,
        expiresAt: "2026-09-02T23:59:59.000Z",
      },
      createdAt: now,
      updatedAt: now,
    };
  });
  const deliveryGroups = checkout.deliveryGroups.map((group, index) => ({
    id: gid("OrderDeliveryGroup", `${number}-${index + 1}`),
    lineIds: group.checkoutLineIds.map((checkoutLineId) => {
      const position = checkout.lines.findIndex(({ id }) => id === checkoutLineId);
      return lines[position]?.id;
    }).filter(Boolean),
    address: group.deliveryAddress ? {
      id: gid("OrderDeliveryAddress", `${number}-${index + 1}`),
      address1: group.deliveryAddress.address1,
      address2: group.deliveryAddress.address2,
      city: group.deliveryAddress.city,
      countryCode: group.deliveryAddress.countryCode,
      provinceCode: group.deliveryAddress.provinceCode,
      postalCode: group.deliveryAddress.zip,
    } : null,
    recipient: group.recipient,
    method: group.selection.option ? {
      code: group.selection.option.code,
      providerCode: group.selection.option.carrierCode ?? "mock-carrier",
      type: group.selection.option.deliveryMethodType,
      paymentModel: "MERCHANT_COLLECTED",
    } : null,
    createdAt: now,
    updatedAt: now,
  }));
  const paymentMethod = checkout.payment.selection.method;
  const total = checkout.cost.totalAmount;
  const order = {
    id: gid("Order", number),
    status: "ACTIVE",
    fulfillmentStatus: "UNFULFILLED",
    deliveryStatus: "NOT_SHIPPED",
    number,
    channelCode: checkout.channelCode,
    localeCode: checkout.localeCode,
    currencyCode: checkout.currencyCode,
    customerIdentity: { ...checkout.customerIdentity, customerId: customer?.id ?? checkout.customerIdentity.customerId },
    customerNote: checkout.customerNote,
    cost: structuredClone(checkout.cost),
    totalQuantity: checkout.totalQuantity,
    lines,
    appliedPromoCodes: structuredClone(checkout.appliedPromoCodes),
    deliveryGroups,
    fulfillments: [],
    payment: {
      status: "PAID",
      method: paymentMethod ? { code: paymentMethod.code, providerCode: paymentMethod.providerCode, flow: paymentMethod.flow } : null,
      authorizedAmount: total,
      capturedAmount: total,
      refundedAmount: money(0, checkout.currencyCode),
      outstandingAmount: money(0, checkout.currencyCode),
      transactions: [{
        id: gid("OrderPaymentTransaction", `${number}-sale`), kind: "SALE", status: "SUCCESS", amount: total,
        providerCode: paymentMethod?.providerCode ?? "mock", reference: `mock_${number}`, failureCode: null,
        failureMessage: null, createdAt: now, processedAt: now,
      }],
      refunds: [],
      voids: [],
      retry: { available: false, unavailableReasonCode: "PAYMENT_NOT_FAILED", unavailableReason: "Payment succeeded.", expiresAt: null },
    },
    paymentMethod: paymentMethod ? { code: paymentMethod.code, providerCode: paymentMethod.providerCode, flow: paymentMethod.flow } : null,
    selfService: {
      cancel: action(true), reorder: action(true),
      requestReturn: action(false, "ORDER_NOT_DELIVERED", "Returns become available after delivery."),
      retryPayment: action(false, "PAYMENT_NOT_FAILED", "No failed payment is available to retry."),
    },
    returnRequestIds: [],
    placedAt: now,
    closedAt: null,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
  };
  store.state.orders.push(order);
  if (customer) customer.orderIds.unshift(order.id);
  return order;
};

const placeOrder = (store, input, context) => store.replay("placeOrder", input.idempotencyKey, () => {
  const checkout = store.state.checkouts.find(({ id }) => id === input.checkoutId);
  const userErrors = [];
  if (!checkout) userErrors.push(orderError("CHECKOUT_NOT_FOUND", "The checkout does not exist.", ["checkoutId"]));
  else {
    if (checkout.version !== input.expectedCheckoutVersion) {
      userErrors.push(orderError("VERSION_CONFLICT", "The checkout version is stale.", ["expectedCheckoutVersion"], true));
    }
    if (checkout.resultRevision !== input.expectedResultRevision) {
      userErrors.push(orderError("REVISION_CONFLICT", "The checkout result revision is stale.", ["expectedResultRevision"], true));
    }
    if (!checkout.valid) userErrors.push(orderError("CHECKOUT_INVALID", "Resolve checkout issues before placing the order."));
    if (!checkout.payment.selection.method) userErrors.push(orderError("PAYMENT_METHOD_REQUIRED", "Select a payment method."));
    if (checkout.deliveryGroups.some(({ selection }) => !selection.option)) {
      userErrors.push(orderError("DELIVERY_METHOD_REQUIRED", "Select a delivery method."));
    }
  }
  if (!checkout || userErrors.length) return { userErrors, placementId: null };

  const placementId = gid("CheckoutPlacement", `runtime-${store.next("checkout-placement")}`);
  const onlineRedirect = checkout.payment.selection.method.flow === "ONLINE"
    && checkout.payment.selection.method.providerCode === "paypal";
  const order = onlineRedirect ? null : createOrderFromCheckout(store, checkout, context.customer);
  const placement = {
    placementId,
    checkoutId: checkout.id,
    checkoutVersion: checkout.version,
    resultRevision: checkout.resultRevision,
    orderId: order?.id ?? null,
    status: onlineRedirect ? "REQUIRES_ACTION" : "PAID",
    paymentCollectionId: gid("PaymentCollection", placementId.split("/").at(-1)),
    paymentSessionId: gid("PaymentSession", placementId.split("/").at(-1)),
    paymentOperationId: gid("PaymentOperation", placementId.split("/").at(-1)),
    customerAction: onlineRedirect ? {
      type: "REDIRECT",
      url: input.returnUrl ?? `https://example.com/mock-pay/${placementId.split("/").at(-1)}`,
      title: "Complete payment",
      instructions: null,
      expiresAt: "2026-08-03T13:00:00.000Z",
      data: {},
    } : null,
    paymentFailure: null,
    userErrors: [],
  };
  store.state.checkoutPlacements.push(placement);
  store.reindex();
  return placement;
});

const orderMutations = (store) => ({
  placeOrder: (_, { input }, context) => placeOrder(store, input, context),

  orderCancel: (_, { input }, context) => store.replay("orderCancel", input.idempotencyKey, () => {
    const order = findOwnedOrder(store, context.customer, input.orderId);
    if (!order) return orderFailure(["order"], orderError("ORDER_NOT_FOUND", "The order is unavailable.", ["orderId"]));
    if (order.updatedAt !== input.expectedOrderUpdatedAt) {
      return orderFailure(["order"], orderError("VERSION_CONFLICT", "The order has changed.", ["expectedOrderUpdatedAt"], true));
    }
    if (!order.selfService.cancel.available) {
      return orderFailure(["order"], orderError("ORDER_CANNOT_BE_CANCELLED", "This order can no longer be cancelled."));
    }
    const now = store.now();
    order.status = "CANCELLED";
    order.fulfillmentStatus = "CANCELLED";
    order.deliveryStatus = "CANCELLED";
    order.closedAt = now;
    order.updatedAt = now;
    order.selfService.cancel = action(false, "ORDER_CANCELLED", "This order is already cancelled.");
    store.reindex();
    return { order, userErrors: [] };
  }),

  orderReorder: (_, { input }, context) => store.replay("orderReorder", input.idempotencyKey, () => {
    const order = findOwnedOrder(store, context.customer, input.orderId);
    if (!order) return { checkout: null, skippedLines: [], userErrors: [orderError("ORDER_NOT_FOUND", "The order is unavailable.")] };
    const requested = input.lines?.length
      ? input.lines.map((selection) => ({ ...selection, line: order.lines.find(({ id }) => id === selection.orderLineId) }))
      : order.lines.map((line) => ({ line, quantity: line.quantity }));
    const skippedLines = [];
    const items = [];
    for (const selection of requested) {
      const line = selection.line;
      const variant = line && store.get(line.purchasableId);
      if (!line || !variant?.availableForSale) {
        if (line) skippedLines.push({ orderLine: line, code: "ITEM_UNAVAILABLE", message: `${line.title} is unavailable.` });
        continue;
      }
      items.push({ purchasableId: variant.id, quantity: selection.quantity, purchase: { type: "ONE_TIME" } });
    }
    if (!items.length) {
      return { checkout: null, skippedLines, userErrors: [orderError("NO_PURCHASABLE_LINES", "No order lines can be reordered.")] };
    }
    const result = createCheckout(store, {
      idempotencyKey: `reorder-${input.idempotencyKey}`,
      channelCode: order.channelCode ?? "online-store",
      localeCode: order.localeCode ?? "en",
      currencyCode: order.currencyCode,
      items,
      tags: [],
    });
    if (result.checkout) {
      result.checkout.customerIdentity = structuredClone(order.customerIdentity);
      refreshCheckout(store, result.checkout);
    }
    return { checkout: result.checkout, skippedLines, userErrors: result.userErrors };
  }),

  orderReturnRequestCreate: (_, { input }, context) => store.replay("orderReturnRequestCreate", input.idempotencyKey, () => {
    const order = findOwnedOrder(store, context.customer, input.orderId);
    if (!order) return orderFailure(["order", "returnRequest"], orderError("ORDER_NOT_FOUND", "The order is unavailable."));
    if (order.updatedAt !== input.expectedOrderUpdatedAt) {
      return orderFailure(["order", "returnRequest"], orderError("VERSION_CONFLICT", "The order has changed.", ["expectedOrderUpdatedAt"], true));
    }
    const errors = input.lines.flatMap((requested) => {
      const line = order.lines.find(({ id }) => id === requested.orderLineId);
      if (!line) return [orderError("ORDER_LINE_NOT_FOUND", "An order line does not exist.", ["lines", "orderLineId"])];
      if (!line.returnEligibility.eligible || requested.quantity > line.returnEligibility.maxQuantity) {
        return [orderError("RETURN_QUANTITY_UNAVAILABLE", "The requested return quantity is unavailable.", ["lines", "quantity"])];
      }
      return [];
    });
    if (errors.length) return orderFailure(["order", "returnRequest"], ...errors);
    const now = store.now();
    const returnRequest = {
      id: gid("OrderReturnRequest", `runtime-${store.next("return-request")}`),
      orderId: order.id,
      status: "REQUESTED",
      revision: 1,
      lines: input.lines.map((line) => ({ ...line })),
      customerNote: input.customerNote ?? null,
      canCancel: true,
      requestedAt: now,
      resolvedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    store.state.orderReturnRequests.push(returnRequest);
    order.returnRequestIds.push(returnRequest.id);
    store.reindex();
    return { order, returnRequest, userErrors: [] };
  }),

  orderReturnRequestCancel: (_, { input }, context) => store.replay("orderReturnRequestCancel", input.idempotencyKey, () => {
    const request = store.state.orderReturnRequests.find(({ id }) => id === input.returnRequestId);
    const order = request && findOwnedOrder(store, context.customer, request.orderId);
    if (!request || !order) return orderFailure(["returnRequest"], orderError("RETURN_REQUEST_NOT_FOUND", "The return request is unavailable."));
    if (request.revision !== input.expectedRevision) {
      return orderFailure(["returnRequest"], orderError("VERSION_CONFLICT", "The return request has changed.", ["expectedRevision"], true));
    }
    if (!request.canCancel) return orderFailure(["returnRequest"], orderError("RETURN_CANNOT_BE_CANCELLED", "The return request cannot be cancelled."));
    request.status = "CANCELLED";
    request.canCancel = false;
    request.revision += 1;
    request.resolvedAt = store.now();
    request.updatedAt = request.resolvedAt;
    store.reindex();
    return { returnRequest: request, userErrors: [] };
  }),

  orderPaymentRetry: (_, { input }, context) => store.replay("orderPaymentRetry", input.idempotencyKey, () => {
    const order = findOwnedOrder(store, context.customer, input.orderId);
    if (!order) return { order: null, attemptId: null, status: null, customerAction: null, userErrors: [orderError("ORDER_NOT_FOUND", "The order is unavailable.")] };
    if (order.updatedAt !== input.expectedOrderUpdatedAt) {
      return { order: null, attemptId: null, status: null, customerAction: null, userErrors: [orderError("VERSION_CONFLICT", "The order has changed.", ["expectedOrderUpdatedAt"], true)] };
    }
    if (!order.payment.retry.available) {
      return { order: null, attemptId: null, status: null, customerAction: null, userErrors: [orderError("PAYMENT_RETRY_UNAVAILABLE", "This payment cannot be retried.")] };
    }
    const attemptId = gid("OrderPaymentAttempt", `runtime-${store.next("payment-attempt")}`);
    return {
      order,
      attemptId,
      status: "REQUIRES_ACTION",
      customerAction: {
        type: "REDIRECT",
        url: input.returnUrl ?? `https://example.com/mock-payment/${attemptId.split("/").at(-1)}`,
        title: "Complete payment",
        instructions: null,
        expiresAt: "2026-08-03T13:00:00.000Z",
        data: {},
      },
      userErrors: [],
    };
  }),
});

export const customerOrderMutations = (store) => ({
  ...customerMutations(store),
  ...orderMutations(store),
});
