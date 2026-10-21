import type { model } from '@shopana/storefront-sdk';
import type { Checkout } from '#checkout/types/entity';

export const uah = (amount: number): model.Money => ({
  amount,
  currencyCode: 'UAH',
});

export function makeLine({
  id,
  title,
  productTitle,
  quantity = 1,
  unitPrice,
  imageSrc = null,
}: {
  id: string;
  title: string;
  productTitle: string;
  quantity?: number;
  unitPrice: number;
  imageSrc?: string | null;
}): Checkout.Line {
  return {
    id,
    quantity,
    title,
    sku: null,
    cost: {
      compareAtUnitPrice: uah(unitPrice),
      discountAmount: uah(0),
      subtotalAmount: uah(unitPrice * quantity),
      taxAmount: uah(0),
      totalAmount: uah(unitPrice * quantity),
      unitPrice: uah(unitPrice),
    },
    originalPrice: uah(unitPrice),
    priceConfig: null,
    imageSrc,
    // Only what the summary reads of the variant.
    purchasable: {
      id: `variant-${id}`,
      title,
      product: { title: productTitle },
      cover: null,
    } as unknown as Checkout.Purchasable,
    purchasableId: `variant-${id}`,
    purchase: { type: 'ONE_TIME' },
    attributes: null,
    tag: null,
    componentItemId: null,
    children: [],
  };
}

const LINES: Checkout.Line[] = [
  makeLine({
    id: 'line-1',
    title: 'Large, 32 cm',
    productTitle: 'Pepperoni pizza',
    quantity: 2,
    unitPrice: 289,
    imageSrc: 'https://picsum.photos/seed/pepperoni/200',
  }),
  makeLine({
    id: 'line-2',
    title: 'Medium, 28 cm',
    productTitle: 'Four cheese pizza',
    unitPrice: 319,
    imageSrc: 'https://picsum.photos/seed/cheese/200',
  }),
  makeLine({
    id: 'line-3',
    title: '0.5 l',
    productTitle: 'Cola',
    quantity: 2,
    unitPrice: 45,
  }),
];

const SUBTOTAL = LINES.reduce(
  (sum, line) => sum + line.cost.totalAmount.amount,
  0
);
const SHIPPING = 80;

const NOVA_POSHTA: Checkout.DeliveryMethod = {
  handle: 'nova-poshta-branch',
  code: 'nova-poshta-branch',
  title: 'Nova Poshta, branch',
  description: '1–2 days',
  deliveryMethodType: 'PICKUP_POINT',
  carrierCode: 'NOVA_POSHTA',
  provider: { code: 'nova-poshta' },
  cost: uah(SHIPPING),
  paymentModel: 'MERCHANT_COLLECTED',
  carrierEstimatedCost: null,
  estimatedMinDeliveryAt: null,
  estimatedMaxDeliveryAt: null,
  phoneRequired: true,
  customerInputContract: null,
  publicData: null,
};

const CARD: Checkout.PaymentMethod = {
  handle: 'card',
  code: 'card',
  title: 'Card online',
  flow: 'ONLINE',
  provider: { code: 'liqpay' },
};

/**
 * The checkout of a signed-in buyer, ready to place: three lines, delivery to a Nova Poshta
 * branch and card payment, no promo codes and nothing chosen in the loyalty program. Stories
 * change only what their scenario is about.
 */
export const defaultCheckout: Checkout.Checkout = {
  id: 'checkout-1',
  channelCode: 'web',
  localeCode: 'en',
  currencyCode: 'UAH',
  resultRevision: '1',
  status: 'READY',
  guestCheckoutAllowed: true,
  expiresAt: null,
  valid: true,
  issues: [],
  createdAt: new Date('2026-10-21T10:00:00Z'),
  updatedAt: new Date('2026-10-21T10:05:00Z'),
  totalQuantity: LINES.reduce((sum, line) => sum + line.quantity, 0),
  cost: {
    subtotalAmount: uah(SUBTOTAL),
    totalAmount: uah(SUBTOTAL + SHIPPING),
    totalDiscountAmount: uah(0),
    merchandiseDiscountAmount: uah(0),
    totalShippingAmount: uah(SHIPPING),
    totalTaxAmount: uah(0),
    loyaltyAmount: uah(0),
  },
  lines: LINES,
  promoCodes: [],
  customerIdentity: {
    countryCode: 'UA',
    customer: {
      id: 'customer-1',
      displayName: 'Olena Kovalenko',
      firstName: 'Olena',
      lastName: 'Kovalenko',
      email: 'olena@example.com',
    },
    email: 'olena@example.com',
    firstName: 'Olena',
    lastName: 'Kovalenko',
    middleName: null,
    phone: '+380671234567',
  },
  customerNote: null,
  deliveryGroups: [
    {
      id: 'group-1',
      replacesGroupIds: [],
      checkoutLines: LINES,
      deliveryAddress: null,
      deliveryMethods: [NOVA_POSHTA],
      recipient: null,
      selection: {
        status: 'SELECTED',
        option: NOVA_POSHTA,
        previousOptionHandle: null,
        resetReason: null,
        customerInput: null,
      },
      shipping: {
        paymentModel: 'MERCHANT_COLLECTED',
        originalPrice: uah(SHIPPING),
        payer: 'MERCHANT',
        total: uah(SHIPPING),
        freeShipping: null,
      },
    },
  ],
  payment: {
    payableAmount: uah(SUBTOTAL + SHIPPING),
    paymentMethods: [CARD],
    selection: {
      status: 'SELECTED',
      method: CARD,
      previousMethodHandle: null,
      resetReason: null,
    },
  },
  loyaltyRedemption: null,
  loyaltyRewardId: null,
  loyaltySelection: null,
  loyaltyEarning: null,
  notifications: [],
};

/** The default checkout with the fields of a scenario. */
export function makeCheckout(
  overrides: Partial<Checkout.Checkout> = {}
): Checkout.Checkout {
  return { ...defaultCheckout, ...overrides };
}

/** The default checkout of a guest. */
export const guestCheckout = makeCheckout({
  customerIdentity: { ...defaultCheckout.customerIdentity, customer: null },
});
