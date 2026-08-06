import { productVariants } from "../catalog/product-variants.js";
import { customers } from "../customers/customers.js";
import { gid, money } from "../shared.js";

const variant = (productHandle, position = 0) =>
  productVariants.find(({ id }) => id === gid("ProductVariant", `${productHandle}-${position + 1}`));

const orderSpecs = [
  {
    number: "1001", customerIndex: 0, currencyCode: "USD", countryCode: "US",
    status: "CLOSED", fulfillmentStatus: "FULFILLED", deliveryStatus: "DELIVERED", paymentStatus: "PAID",
    placedAt: "2026-04-12T15:20:00.000Z", items: [["salmon-dog-kibble", 0, 2], ["waste-bag-dispenser", 1, 1]],
  },
  {
    number: "1002", customerIndex: 2, currencyCode: "GBP", countryCode: "GB",
    status: "ACTIVE", fulfillmentStatus: "FULFILLED", deliveryStatus: "IN_TRANSIT", paymentStatus: "PAID",
    placedAt: "2026-07-29T09:10:00.000Z", items: [["orthopedic-dog-bed", 2, 1], ["portable-pet-water-bottle", 0, 1]],
  },
  {
    number: "1003", customerIndex: 1, currencyCode: "USD", countryCode: "US",
    status: "ACTIVE", fulfillmentStatus: "UNFULFILLED", deliveryStatus: "NOT_SHIPPED", paymentStatus: "PAID",
    placedAt: "2026-08-02T19:45:00.000Z", items: [["self-cleaning-litter-box", 0, 1], ["automatic-water-fountain", 1, 1]],
  },
  {
    number: "1004", customerIndex: 3, currencyCode: "EUR", countryCode: "DE",
    status: "CANCELLED", fulfillmentStatus: "CANCELLED", deliveryStatus: "CANCELLED", paymentStatus: "REFUNDED",
    placedAt: "2026-06-18T11:30:00.000Z", closedAt: "2026-06-18T13:05:00.000Z",
    items: [["smart-pet-feeder", 2, 1], ["washable-pet-blanket", 0, 1]],
  },
  {
    number: "1005", customerIndex: 0, currencyCode: "USD", countryCode: "US",
    status: "CLOSED", fulfillmentStatus: "FULFILLED", deliveryStatus: "DELIVERED", paymentStatus: "PARTIALLY_REFUNDED",
    placedAt: "2026-05-20T16:50:00.000Z", closedAt: "2026-06-02T10:00:00.000Z",
    items: [["gps-pet-tracker", 1, 1], ["interactive-treat-camera", 0, 1]],
  },
  {
    number: "1006", customerIndex: 2, currencyCode: "GBP", countryCode: "GB",
    status: "ACTIVE", fulfillmentStatus: "ON_HOLD", deliveryStatus: "NOT_SHIPPED", paymentStatus: "FAILED",
    placedAt: "2026-08-01T08:25:00.000Z", items: [["pet-travel-carrier", 0, 1], ["retractable-dog-leash", 1, 1]],
  },
  {
    number: "1007", customerIndex: 1, currencyCode: "USD", countryCode: "US",
    status: "ACTIVE", fulfillmentStatus: "FULFILLED", deliveryStatus: "DELIVERED", paymentStatus: "PAID",
    placedAt: "2026-07-04T13:15:00.000Z", items: [["chicken-cat-kibble", 2, 1], ["engraved-pet-id-tag", 0, 1]],
  },
  {
    number: "1008", customerIndex: 0, currencyCode: "USD", countryCode: "US",
    status: "ACTIVE", fulfillmentStatus: "SCHEDULED", deliveryStatus: "NOT_SHIPPED", paymentStatus: "PAID",
    placedAt: "2026-08-03T08:20:00.000Z", promo: { code: "PETS10", value: 10 },
    items: [["salmon-dog-kibble", 1, 2], ["gps-pet-tracker", 0, 1], ["waste-bag-dispenser", 0, 1]],
  },
];

const orderLine = (spec, sourceVariant, quantity, index) => {
  const unitPrice = Number(sourceVariant.price.amount);
  const compareAtPrice = Number(sourceVariant.compareAtPrice?.amount ?? sourceVariant.price.amount);
  const discount = (compareAtPrice - unitPrice) * quantity;
  const subtotal = unitPrice * quantity;
  const tax = subtotal * 0.08;

  return {
    id: gid("OrderLine", `${spec.number}-${index + 1}`),
    title: sourceVariant.title,
    sku: sourceVariant.sku,
    imageUrl: "/images/placeholders/product.svg",
    quantity,
    cost: {
      unitCompareAtPrice: money(compareAtPrice, spec.currencyCode),
      unitPrice: money(unitPrice, spec.currencyCode),
      discountAmount: money(discount, spec.currencyCode),
      subtotalAmount: money(subtotal, spec.currencyCode),
      taxAmount: money(tax, spec.currencyCode),
      totalAmount: money(subtotal + tax, spec.currencyCode),
    },
    purchasableId: sourceVariant.id,
    purchasableSnapshot: {
      productId: sourceVariant.productId,
      variantId: sourceVariant.id,
      title: sourceVariant.title,
      sku: sourceVariant.sku,
      selectedOptions: sourceVariant.selectedOptions.map(({ name, value }) => ({ name, value })),
    },
    returnEligibility: {
      eligible: spec.deliveryStatus === "DELIVERED",
      maxQuantity: spec.deliveryStatus === "DELIVERED" ? quantity : 0,
      unavailableReasonCode: spec.deliveryStatus === "DELIVERED" ? null : "NOT_DELIVERED",
      unavailableReason: spec.deliveryStatus === "DELIVERED" ? null : "The item must be delivered before it can be returned.",
      expiresAt: spec.deliveryStatus === "DELIVERED" ? "2026-09-01T23:59:59.000Z" : null,
    },
    createdAt: spec.placedAt,
    updatedAt: spec.closedAt ?? spec.placedAt,
  };
};

const orderAddress = (spec, customer) => {
  const address = customer.addresses.find(({ id }) => id === customer.defaultAddressId);
  return {
    id: gid("OrderDeliveryAddress", spec.number),
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    countryCode: address.countryCode,
    provinceCode: address.provinceCode,
    postalCode: address.zip,
  };
};

const action = (available, unavailableReasonCode = null, unavailableReason = null) => ({
  available,
  unavailableReasonCode,
  unavailableReason,
  expiresAt: available ? "2026-09-01T23:59:59.000Z" : null,
});

export const orders = orderSpecs.map((spec) => {
  const customer = customers[spec.customerIndex];
  const lines = spec.items.map(([handle, position, quantity], index) =>
    orderLine(spec, variant(handle, position), quantity, index));
  const subtotal = lines.reduce((sum, line) => sum + Number(line.cost.subtotalAmount.amount), 0);
  const catalogDiscount = lines.reduce((sum, line) => sum + Number(line.cost.discountAmount.amount), 0);
  const promoDiscount = spec.promo ? subtotal * (spec.promo.value / 100) : 0;
  const tax = (subtotal - promoDiscount) * 0.08;
  const shipping = spec.number === "1008" ? 0 : 8;
  const total = subtotal - promoDiscount + tax + shipping;
  const delivered = spec.deliveryStatus === "DELIVERED";
  const shipped = !["NOT_SHIPPED", "CANCELLED"].includes(spec.deliveryStatus);
  const paymentFailed = spec.paymentStatus === "FAILED";
  const fullyRefunded = spec.paymentStatus === "REFUNDED";
  const partiallyRefunded = spec.paymentStatus === "PARTIALLY_REFUNDED";
  const refunded = fullyRefunded ? total : partiallyRefunded ? Number(lines[1].cost.subtotalAmount.amount) : 0;
  const address = orderAddress(spec, customer);
  const lineIds = lines.map(({ id }) => id);
  const updatedAt = spec.closedAt ?? (delivered
    ? new Date(Date.parse(spec.placedAt) + 4 * 86_400_000).toISOString()
    : "2026-08-03T09:00:00.000Z");

  const fulfillment = shipped || delivered
    ? {
        id: gid("OrderFulfillment", spec.number),
        status: "SUCCESS",
        lines: lines.map((line) => ({ orderLineId: line.id, quantity: line.quantity })),
        shipments: [{
          id: gid("OrderShipment", spec.number),
          status: delivered ? "DELIVERED" : "IN_TRANSIT",
          carrierCode: "paw-parcel",
          carrierName: "Paw Parcel",
          serviceCode: "standard",
          tracking: [{
            number: `NST${spec.number}2026`,
            url: `https://example.com/track/NST${spec.number}2026`,
            company: "Paw Parcel",
          }],
          events: [
            {
              id: gid("OrderTrackingEvent", `${spec.number}-1`), status: "LABEL_CREATED",
              message: "Shipping label created", location: "Paw & Whisker fulfillment center", happenedAt: spec.placedAt,
            },
            ...(shipped ? [{
              id: gid("OrderTrackingEvent", `${spec.number}-2`), status: "IN_TRANSIT",
              message: "Parcel is moving through the carrier network", location: "Regional hub",
              happenedAt: new Date(Date.parse(spec.placedAt) + 86_400_000).toISOString(),
            }] : []),
            ...(delivered ? [{
              id: gid("OrderTrackingEvent", `${spec.number}-3`), status: "DELIVERED",
              message: "Delivered", location: address.city,
              happenedAt: new Date(Date.parse(spec.placedAt) + 4 * 86_400_000).toISOString(),
            }] : []),
          ],
          shippedAt: new Date(Date.parse(spec.placedAt) + 86_400_000).toISOString(),
          estimatedDeliveryAt: new Date(Date.parse(spec.placedAt) + 5 * 86_400_000).toISOString(),
          deliveredAt: delivered ? new Date(Date.parse(spec.placedAt) + 4 * 86_400_000).toISOString() : null,
          createdAt: spec.placedAt,
          updatedAt,
        }],
        createdAt: spec.placedAt,
        updatedAt,
      }
    : null;

  const transactions = [{
    id: gid("OrderPaymentTransaction", `${spec.number}-sale`),
    kind: "SALE",
    status: paymentFailed ? "FAILURE" : "SUCCESS",
    amount: money(total, spec.currencyCode),
    providerCode: "stripe",
    reference: paymentFailed ? null : `pi_demo_${spec.number}`,
    failureCode: paymentFailed ? "CARD_DECLINED" : null,
    failureMessage: paymentFailed ? "The card was declined." : null,
    createdAt: spec.placedAt,
    processedAt: spec.placedAt,
  }];

  if (refunded) {
    transactions.push({
      id: gid("OrderPaymentTransaction", `${spec.number}-refund`),
      kind: "REFUND",
      status: "SUCCESS",
      amount: money(refunded, spec.currencyCode),
      providerCode: "stripe",
      reference: `re_demo_${spec.number}`,
      failureCode: null,
      failureMessage: null,
      createdAt: updatedAt,
      processedAt: updatedAt,
    });
  }

  return {
    id: gid("Order", spec.number),
    status: spec.status,
    fulfillmentStatus: spec.fulfillmentStatus,
    deliveryStatus: spec.deliveryStatus,
    number: spec.number,
    channelCode: "online-store",
    localeCode: "en",
    currencyCode: spec.currencyCode,
    customerIdentity: {
      customerId: customer.id,
      email: customer.emailAddress.emailAddress,
      phone: customer.phoneNumber?.phoneNumber ?? null,
      countryCode: spec.countryCode,
      firstName: customer.firstName,
      middleName: null,
      lastName: customer.lastName,
    },
    customerNote: spec.number === "1008" ? "Leave the parcel with the concierge if needed." : null,
    cost: {
      subtotalAmount: money(subtotal, spec.currencyCode),
      totalDiscountAmount: money(catalogDiscount + promoDiscount, spec.currencyCode),
      totalTaxAmount: money(tax, spec.currencyCode),
      totalShippingAmount: money(shipping, spec.currencyCode),
      totalAmount: money(total, spec.currencyCode),
    },
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    lines,
    appliedPromoCodes: spec.promo
      ? [{
          code: spec.promo.code, discountType: "percentage", value: String(spec.promo.value),
          provider: "demo-promotions", conditions: { minimumSubtotal: 100 }, appliedAt: spec.placedAt,
        }]
      : [],
    deliveryGroups: [{
      id: gid("OrderDeliveryGroup", spec.number),
      lineIds,
      address,
      recipient: {
        firstName: customer.firstName, middleName: null, lastName: customer.lastName,
        email: customer.emailAddress.emailAddress, phone: customer.phoneNumber?.phoneNumber ?? null,
      },
      method: { code: "standard", providerCode: "paw-parcel", type: "SHIPPING", paymentModel: "MERCHANT_COLLECTED" },
      createdAt: spec.placedAt,
      updatedAt,
    }],
    fulfillments: fulfillment ? [fulfillment] : [],
    payment: {
      status: spec.paymentStatus,
      method: { code: "card", providerCode: "stripe", flow: "ONLINE" },
      authorizedAmount: money(paymentFailed ? 0 : total, spec.currencyCode),
      capturedAmount: money(paymentFailed ? 0 : total, spec.currencyCode),
      refundedAmount: money(refunded, spec.currencyCode),
      outstandingAmount: money(paymentFailed ? total : 0, spec.currencyCode),
      transactions,
      refunds: refunded
        ? [{
            id: gid("OrderRefund", spec.number), status: "SUCCEEDED", amount: money(refunded, spec.currencyCode),
            reason: fullyRefunded ? "Order cancelled before fulfillment" : "Returned item",
            note: null,
            lines: (fullyRefunded ? lines : [lines[1]]).map((line) => ({
              orderLineId: line.id,
              quantity: line.quantity,
              amount: money(Number(line.cost.subtotalAmount.amount), spec.currencyCode),
            })),
            createdAt: updatedAt,
            processedAt: updatedAt,
          }]
        : [],
      voids: [],
      retry: {
        available: paymentFailed,
        unavailableReasonCode: paymentFailed ? null : "PAYMENT_NOT_FAILED",
        unavailableReason: paymentFailed ? null : "This order does not require another payment attempt.",
        expiresAt: paymentFailed ? "2026-08-08T23:59:59.000Z" : null,
      },
    },
    selfService: {
      cancel: spec.status === "ACTIVE" && !shipped
        ? action(true)
        : action(false, "ORDER_ALREADY_PROCESSED", "This order can no longer be cancelled."),
      reorder: action(true),
      requestReturn: delivered
        ? action(true)
        : action(false, "ORDER_NOT_DELIVERED", "Returns become available after delivery."),
      retryPayment: paymentFailed
        ? action(true)
        : action(false, "PAYMENT_NOT_FAILED", "No failed payment is available to retry."),
    },
    returnRequestIds: ["1005", "1007"].includes(spec.number) ? [gid("OrderReturnRequest", spec.number)] : [],
    placedAt: spec.placedAt,
    closedAt: spec.closedAt ?? (spec.status === "CLOSED" ? updatedAt : null),
    expiresAt: paymentFailed ? "2026-08-08T23:59:59.000Z" : null,
    createdAt: spec.placedAt,
    updatedAt,
  };
});
