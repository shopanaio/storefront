import { productVariants } from "../catalog/product-variants.js";
import { customers } from "../customers/customers.js";
import { gid, money } from "../shared.js";

const variant = (productHandle, position = 0) =>
  productVariants.find(({ id }) => id === gid("ProductVariant", `${productHandle}-${position + 1}`));

const paymentMethods = [
  { handle: "card", code: "card", title: "Credit or debit card", providerCode: "stripe", flow: "ONLINE" },
  { handle: "paypal", code: "paypal", title: "PayPal", providerCode: "paypal", flow: "ONLINE" },
  { handle: "cash-on-delivery", code: "cod", title: "Pay on delivery", providerCode: "manual", flow: "ON_DELIVERY" },
];

const deliveryOptions = [
  {
    handle: "standard", code: "standard", title: "Standard delivery", description: "Arrives in 3–5 business days",
    deliveryMethodType: "SHIPPING", cost: money(8), estimatedMinDeliveryAt: "2026-08-06T18:00:00.000Z",
    estimatedMaxDeliveryAt: "2026-08-10T18:00:00.000Z", phoneRequired: false,
    customerInputContract: null, publicData: { carrier: "Paw Parcel" }, carrierCode: "paw-parcel",
  },
  {
    handle: "express", code: "express", title: "Express delivery", description: "Arrives in 1–2 business days",
    deliveryMethodType: "SHIPPING", cost: money(18), estimatedMinDeliveryAt: "2026-08-04T18:00:00.000Z",
    estimatedMaxDeliveryAt: "2026-08-05T18:00:00.000Z", phoneRequired: true,
    customerInputContract: null, publicData: { carrier: "Paw Express" }, carrierCode: "paw-express",
  },
];

const checkoutAddress = (customer) => {
  const source = customer.addresses.find(({ id }) => id === customer.defaultAddressId);
  return source ? { ...source, data: null } : null;
};

const checkoutLine = (checkoutKey, sourceVariant, quantity, position) => {
  const unit = Number(sourceVariant.price.amount);
  const compareAt = Number(sourceVariant.compareAtPrice?.amount ?? sourceVariant.price.amount);
  return {
    id: gid("CheckoutLine", `${checkoutKey}-${position + 1}`),
    title: sourceVariant.title,
    sku: sourceVariant.sku,
    imageId: sourceVariant.featuredMediaId,
    quantity,
    cost: {
      compareAtUnitPrice: money(compareAt),
      unitPrice: money(unit),
      discountAmount: money((compareAt - unit) * quantity),
      subtotalAmount: money(unit * quantity),
      taxAmount: money(unit * quantity * 0.08),
      totalAmount: money(unit * quantity * 1.08),
    },
    originalPrice: money(compareAt),
    priceConfig: null,
    children: [],
    parentId: null,
    componentItemId: null,
    purchasableId: sourceVariant.id,
    purchase: { type: "ONE_TIME" },
    attributes: {},
    tag: null,
  };
};

const createCheckout = ({
  key, customer = null, email, itemSelections, valid, issues = [], promo = null,
  selectedDelivery = "standard", selectedPayment = "card", createdAt, updatedAt,
}) => {
  const lines = itemSelections.map(([productHandle, position, quantity], lineIndex) =>
    checkoutLine(key, variant(productHandle, position), quantity, lineIndex));
  const subtotal = lines.reduce((sum, line) => sum + Number(line.cost.subtotalAmount.amount), 0);
  const productDiscount = lines.reduce((sum, line) => sum + Number(line.cost.discountAmount.amount), 0);
  const promoDiscount = promo ? subtotal * (promo.value / 100) : 0;
  const tax = (subtotal - promoDiscount) * 0.08;
  const shipping = customer ? deliveryOptions.find(({ handle }) => handle === selectedDelivery).cost : money(0);
  const shippingAmount = Number(shipping.amount);
  const deliveryAddress = customer ? checkoutAddress(customer) : null;

  return {
    id: gid("Checkout", key),
    channelCode: "online-store",
    localeCode: "en",
    currencyCode: "USD",
    version: 3,
    resultRevision: `checkout-${key}-r3`,
    valid,
    issues,
    createdAt,
    updatedAt,
    cost: {
      subtotalAmount: money(subtotal),
      totalDiscountAmount: money(productDiscount + promoDiscount),
      totalTaxAmount: money(tax),
      totalShippingAmount: money(shippingAmount),
      totalAmount: money(subtotal - promoDiscount + tax + shippingAmount),
    },
    customerIdentity: {
      countryCode: deliveryAddress?.countryCode ?? null,
      customerId: customer?.id ?? null,
      email,
      phone: customer?.phoneNumber?.phoneNumber ?? null,
      firstName: customer?.firstName ?? null,
      lastName: customer?.lastName ?? null,
      middleName: null,
    },
    customerNote: key === "gift-order" ? "Please leave the receipt out of the parcel." : null,
    billingAddress: deliveryAddress,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    lines,
    notifications: [],
    deliveryGroups: customer
      ? [{
          id: gid("CheckoutDeliveryGroup", key),
          checkoutLineIds: lines.map(({ id }) => id),
          deliveryAddress,
          recipient: {
            firstName: customer.firstName, lastName: customer.lastName, middleName: null,
            email, phone: customer.phoneNumber?.phoneNumber ?? null,
          },
          options: deliveryOptions,
          selection: {
            status: "SELECTED",
            option: deliveryOptions.find(({ handle }) => handle === selectedDelivery),
            previousOptionHandle: null,
            resetReason: null,
          },
        }]
      : [],
    appliedPromoCodes: promo
      ? [{ ...promo, appliedAt: updatedAt, discountType: "percentage", provider: "demo-promotions", conditions: { minimumSubtotal: 100 } }]
      : [],
    tags: [],
    payment: {
      methods: paymentMethods,
      selection: {
        status: selectedPayment ? "SELECTED" : "NONE",
        method: paymentMethods.find(({ handle }) => handle === selectedPayment) ?? null,
        previousMethodHandle: null,
        resetReason: null,
      },
      payableAmount: money(subtotal - promoDiscount + tax + shippingAmount),
    },
  };
};

export const checkouts = [
  createCheckout({
    key: "alex-active", customer: customers[0], email: "alex.morgan@example.com", valid: true,
    itemSelections: [["salmon-dog-kibble", 1, 2], ["gps-pet-tracker", 0, 1], ["waste-bag-dispenser", 0, 1]],
    promo: { code: "PETS10", value: 10 }, selectedDelivery: "standard", selectedPayment: "card",
    createdAt: "2026-08-01T14:20:00.000Z", updatedAt: "2026-08-03T08:15:00.000Z",
  }),
  createCheckout({
    key: "guest-incomplete", customer: null, email: "guest@example.com", valid: false,
    itemSelections: [["smart-pet-feeder", 1, 1], ["ceramic-pet-bowl-set", 0, 1]],
    issues: [{
      code: "DELIVERY_ADDRESS_REQUIRED", message: "Add a delivery address to continue.", severity: "ERROR",
      effect: "STOP", field: ["deliveryGroups", "deliveryAddress"], lineId: null, retryable: false,
    }],
    selectedDelivery: null, selectedPayment: null,
    createdAt: "2026-08-02T17:05:00.000Z", updatedAt: "2026-08-02T17:12:00.000Z",
  }),
  createCheckout({
    key: "gift-order", customer: customers[1], email: "jamie.chen@example.com", valid: true,
    itemSelections: [["odor-neutralizing-candle", 1, 2], ["engraved-pet-id-tag", 0, 1]],
    promo: null, selectedDelivery: "express", selectedPayment: "paypal",
    createdAt: "2026-08-03T07:30:00.000Z", updatedAt: "2026-08-03T09:10:00.000Z",
  }),
];
