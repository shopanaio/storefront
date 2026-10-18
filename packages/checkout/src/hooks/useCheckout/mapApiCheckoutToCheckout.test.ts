import type { StorefrontUseCheckoutFragment } from '#checkout/graphql/operations';
import { mapApiCheckoutToCheckout } from './mapApiCheckoutToCheckout';

type ApiCheckout = StorefrontUseCheckoutFragment;
type ApiLine = ApiCheckout['lines'][number];
type ApiChildLine = ApiLine['children'][number];
type ApiGrandchildLine = ApiChildLine['children'][number];
type ApiDeliveryGroup = ApiCheckout['deliveryGroups'][number];
type ApiDeliveryOption = ApiDeliveryGroup['options'][number];
type ApiPaymentMethod = ApiCheckout['payment']['methods'][number];

const money = (amount: string) => ({
  __typename: 'Money' as const,
  amount,
  currencyCode: 'UAH' as const,
});

const lineCost = (amount: string) => ({
  __typename: 'CheckoutLineCost' as const,
  unitPrice: money(amount),
  compareAtUnitPrice: money('0'),
  subtotalAmount: money(amount),
  totalAmount: money(amount),
  discountAmount: money('0'),
  taxAmount: money('0'),
});

const lineFields = (id: string, amount: string): ApiGrandchildLine => ({
  __typename: 'CheckoutLine',
  id,
  title: `Line ${id}`,
  sku: `SKU-${id}`,
  quantity: 1,
  cost: lineCost(amount),
  originalPrice: money(amount),
  priceConfig: null,
  image: null,
  purchasable: {
    __typename: 'ProductVariant',
    id: `variant-${id}`,
    handle: `variant-${id}`,
    sku: `SKU-${id}`,
    title: `Variant ${id}`,
    product: {
      __typename: 'Product',
      id: `product-${id}`,
      title: `Product ${id}`,
      handle: `product-${id}`,
    },
  },
  purchasableId: `variant-${id}`,
  purchase: { __typename: 'CheckoutLinePurchase', type: 'ONE_TIME' },
  attributes: {},
  tag: null,
  componentItemId: null,
});

const deliveryOption = (
  overrides: Partial<ApiDeliveryOption> = {}
): ApiDeliveryOption => ({
  __typename: 'CheckoutDeliveryOption',
  handle: 'np-warehouse',
  code: 'warehouse-warehouse',
  title: 'Nova Poshta warehouse',
  description: null,
  deliveryMethodType: 'PICKUP_POINT',
  carrierCode: 'nova-poshta',
  publicData: { payer: 'Recipient' },
  cost: money('0'),
  paymentModel: 'CARRIER_DIRECT',
  estimatedMinDeliveryAt: '2026-10-19T00:00:00.000Z',
  estimatedMaxDeliveryAt: null,
  phoneRequired: true,
  customerInputContract: {
    oneOf: [{ properties: { type: { const: 'WAREHOUSE' } } }],
  },
  ...overrides,
});

const deliveryGroup = (
  overrides: Partial<ApiDeliveryGroup> = {}
): ApiDeliveryGroup => ({
  __typename: 'CheckoutDeliveryGroup',
  id: 'group-1',
  checkoutLines: [{ __typename: 'CheckoutLine', id: 'line-1' }],
  deliveryAddress: null,
  options: [deliveryOption()],
  recipient: null,
  selection: {
    __typename: 'CheckoutDeliveryOptionSelection',
    status: 'NONE',
    previousOptionHandle: null,
    resetReason: null,
    option: null,
  },
  ...overrides,
});

const liqpay: ApiPaymentMethod = {
  __typename: 'CheckoutPaymentMethod',
  handle: 'liqpay',
  code: 'liqpay',
  title: 'LiqPay',
  providerCode: 'liqpay',
  flow: 'ONLINE',
};

const createApiCheckout = (
  overrides: Partial<ApiCheckout> = {}
): ApiCheckout => ({
  __typename: 'Checkout',
  id: 'checkout-1',
  channelCode: 'web',
  localeCode: 'uk',
  currencyCode: 'UAH',
  resultRevision: 'rev-1',
  status: 'OPEN',
  expiresAt: '2026-10-18T12:00:00.000Z',
  valid: true,
  issues: [],
  createdAt: '2026-10-17T10:00:00.000Z',
  updatedAt: '2026-10-17T11:00:00.000Z',
  totalQuantity: 1,
  cost: {
    __typename: 'CheckoutCost',
    subtotalAmount: money('500'),
    totalAmount: money('580'),
    totalDiscountAmount: money('0'),
    totalShippingAmount: money('80'),
    totalTaxAmount: money('0'),
  },
  lines: [{ ...lineFields('line-1', '500'), children: [] }],
  appliedPromoCodes: [],
  customerIdentity: {
    __typename: 'CheckoutCustomerIdentity',
    countryCode: null,
    customer: null,
    email: null,
    firstName: null,
    lastName: null,
    middleName: null,
    phone: null,
  },
  customerNote: null,
  deliveryGroups: [deliveryGroup()],
  payment: {
    __typename: 'CheckoutPayment',
    payableAmount: money('580'),
    methods: [liqpay],
    selection: {
      __typename: 'CheckoutPaymentMethodSelection',
      status: 'NONE',
      previousMethodHandle: null,
      resetReason: null,
      method: null,
    },
  },
  notifications: [],
  ...overrides,
});

describe('mapApiCheckoutToCheckout', () => {
  it('maps lifecycle, validity and issues', () => {
    const checkout = mapApiCheckoutToCheckout(
      createApiCheckout({
        status: 'READY',
        valid: false,
        issues: [
          {
            __typename: 'CheckoutIssue',
            code: 'DELIVERY_CUSTOMER_INPUT_INVALID',
            message: 'Select a warehouse',
            severity: 'ERROR',
            effect: 'STOP',
            field: ['deliveryGroups', 'group-1', 'customerInput'],
            lineId: null,
            retryable: false,
          },
          {
            __typename: 'CheckoutIssue',
            code: 'PRICE_CHANGED',
            message: 'Price changed',
            severity: 'WARNING',
            effect: 'CONTINUE',
            field: [],
            lineId: 'line-1',
            retryable: true,
          },
        ],
      })
    );

    expect(checkout.status).toBe('READY');
    expect(checkout.expiresAt).toEqual(new Date('2026-10-18T12:00:00.000Z'));
    expect(
      mapApiCheckoutToCheckout(createApiCheckout({ expiresAt: 'not a date' })).expiresAt
    ).toBeNull();
    expect(checkout.valid).toBe(false);
    expect(checkout.channelCode).toBe('web');
    expect(checkout.localeCode).toBe('uk');
    expect(checkout.currencyCode).toBe('UAH');
    expect(checkout.issues).toEqual([
      {
        code: 'DELIVERY_CUSTOMER_INPUT_INVALID',
        message: 'Select a warehouse',
        severity: 'ERROR',
        effect: 'STOP',
        field: ['deliveryGroups', 'group-1', 'customerInput'],
        lineId: null,
        retryable: false,
      },
      {
        code: 'PRICE_CHANGED',
        message: 'Price changed',
        severity: 'WARNING',
        effect: 'CONTINUE',
        field: [],
        lineId: 'line-1',
        retryable: true,
      },
    ]);
  });

  it('maps every field of a delivery option', () => {
    const [group] =
      mapApiCheckoutToCheckout(createApiCheckout()).deliveryGroups;

    expect(group.deliveryMethods).toEqual([
      {
        handle: 'np-warehouse',
        code: 'warehouse-warehouse',
        title: 'Nova Poshta warehouse',
        description: null,
        deliveryMethodType: 'PICKUP_POINT',
        carrierCode: 'nova-poshta',
        provider: { code: 'nova-poshta' },
        cost: { amount: 0, currencyCode: 'UAH' },
        paymentModel: 'CARRIER_DIRECT',
        estimatedMinDeliveryAt: new Date('2026-10-19T00:00:00.000Z'),
        estimatedMaxDeliveryAt: null,
        phoneRequired: true,
        customerInputContract: {
          oneOf: [{ properties: { type: { const: 'WAREHOUSE' } } }],
        },
        publicData: { payer: 'Recipient' },
      },
    ]);
  });

  it('keeps the carrier code empty and renders such options generically', () => {
    const [group] = mapApiCheckoutToCheckout(
      createApiCheckout({
        deliveryGroups: [
          deliveryGroup({
            options: [
              deliveryOption({
                carrierCode: null,
                deliveryMethodType: 'LOCAL',
              }),
            ],
          }),
        ],
      })
    ).deliveryGroups;

    expect(group.deliveryMethods[0]).toMatchObject({
      carrierCode: null,
      provider: { code: 'generic' },
      deliveryMethodType: 'LOCAL',
    });
  });

  it('maps several delivery groups with their own lines and selections', () => {
    const fedex = deliveryOption({
      handle: 'fedex-ground',
      code: 'ground',
      title: 'FedEx Ground',
      deliveryMethodType: 'SHIPPING',
      carrierCode: 'test-fedex',
      phoneRequired: false,
      customerInputContract: null,
    });
    const checkout = mapApiCheckoutToCheckout(
      createApiCheckout({
        totalQuantity: 2,
        lines: [
          { ...lineFields('line-1', '500'), children: [] },
          { ...lineFields('line-2', '300'), children: [] },
        ],
        deliveryGroups: [
          deliveryGroup({
            id: 'group-1',
            checkoutLines: [{ __typename: 'CheckoutLine', id: 'line-1' }],
            selection: {
              __typename: 'CheckoutDeliveryOptionSelection',
              status: 'SELECTED',
              previousOptionHandle: null,
              resetReason: null,
              option: deliveryOption(),
            },
          }),
          deliveryGroup({
            id: 'group-2',
            checkoutLines: [{ __typename: 'CheckoutLine', id: 'line-2' }],
            options: [deliveryOption(), fedex],
          }),
        ],
      })
    );

    expect(checkout.deliveryGroups).toHaveLength(2);
    const [first, second] = checkout.deliveryGroups;
    expect(first.checkoutLines.map((line) => line.id)).toEqual(['line-1']);
    expect(first.selection.status).toBe('SELECTED');
    expect(first.selection.option?.handle).toBe('np-warehouse');
    expect(second.checkoutLines.map((line) => line.id)).toEqual(['line-2']);
    expect(second.deliveryMethods.map((method) => method.handle)).toEqual([
      'np-warehouse',
      'fedex-ground',
    ]);
    expect(second.selection).toEqual({
      status: 'NONE',
      option: null,
      previousOptionHandle: null,
      resetReason: null,
    });
  });

  it('maps delivery and payment selection resets', () => {
    const checkout = mapApiCheckoutToCheckout(
      createApiCheckout({
        deliveryGroups: [
          deliveryGroup({
            selection: {
              __typename: 'CheckoutDeliveryOptionSelection',
              status: 'RESET',
              previousOptionHandle: 'np-courier',
              resetReason: {
                __typename: 'CheckoutSelectionResetReason',
                code: 'OPTION_UNAVAILABLE',
                message: 'Courier delivery is no longer available',
              },
              option: null,
            },
          }),
        ],
        payment: {
          __typename: 'CheckoutPayment',
          payableAmount: money('580'),
          methods: [liqpay],
          selection: {
            __typename: 'CheckoutPaymentMethodSelection',
            status: 'RESET',
            previousMethodHandle: 'nova-poshta-cod',
            resetReason: {
              __typename: 'CheckoutSelectionResetReason',
              code: 'METHOD_UNAVAILABLE',
              message: 'Cash on delivery is unavailable',
            },
            method: null,
          },
        },
      })
    );

    expect(checkout.deliveryGroups[0].selection).toEqual({
      status: 'RESET',
      option: null,
      previousOptionHandle: 'np-courier',
      resetReason: {
        code: 'OPTION_UNAVAILABLE',
        message: 'Courier delivery is no longer available',
      },
    });
    expect(checkout.payment.selection).toEqual({
      status: 'RESET',
      method: null,
      previousMethodHandle: 'nova-poshta-cod',
      resetReason: {
        code: 'METHOD_UNAVAILABLE',
        message: 'Cash on delivery is unavailable',
      },
    });
  });

  it('maps payment methods with title and flow in API order', () => {
    const cod: ApiPaymentMethod = {
      __typename: 'CheckoutPaymentMethod',
      handle: 'nova-poshta-cod',
      code: 'nova-poshta-cod',
      title: 'Cash on delivery',
      providerCode: 'nova-poshta',
      flow: 'ON_DELIVERY',
    };
    const checkout = mapApiCheckoutToCheckout(
      createApiCheckout({
        payment: {
          __typename: 'CheckoutPayment',
          payableAmount: money('580'),
          methods: [cod, liqpay],
          selection: {
            __typename: 'CheckoutPaymentMethodSelection',
            status: 'SELECTED',
            previousMethodHandle: null,
            resetReason: null,
            method: liqpay,
          },
        },
      })
    );

    expect(checkout.payment.paymentMethods).toEqual([
      {
        handle: 'nova-poshta-cod',
        code: 'nova-poshta-cod',
        title: 'Cash on delivery',
        provider: { code: 'nova-poshta' },
        flow: 'ON_DELIVERY',
      },
      {
        handle: 'liqpay',
        code: 'liqpay',
        title: 'LiqPay',
        provider: { code: 'liqpay' },
        flow: 'ONLINE',
      },
    ]);
    expect(checkout.payment.selection.status).toBe('SELECTED');
    expect(checkout.payment.selection.method?.handle).toBe('liqpay');
  });

  it('maps bundle children from API data', () => {
    const grandchild: ApiGrandchildLine = {
      ...lineFields('grandchild-1', '0'),
      componentItemId: 'component-2',
      priceConfig: {
        __typename: 'CheckoutLinePriceConfig',
        type: 'FREE',
        amount: null,
        percent: null,
      },
    };
    const child: ApiChildLine = {
      ...lineFields('child-1', '180'),
      quantity: 2,
      originalPrice: money('200'),
      componentItemId: 'component-1',
      priceConfig: {
        __typename: 'CheckoutLinePriceConfig',
        type: 'DISCOUNT_PERCENT',
        amount: null,
        percent: 10,
      },
      image: {
        __typename: 'MediaImage',
        id: 'media-1',
        image: { __typename: 'Image', url: 'https://cdn.test/child.jpg' },
      },
      children: [grandchild],
    };
    const bundle: ApiLine = {
      ...lineFields('bundle-1', '360'),
      attributes: { giftNote: 'Happy birthday' },
      tag: {
        __typename: 'CheckoutTag',
        id: 'tag-1',
        slug: 'box',
        unique: true,
      },
      children: [child],
    };
    const checkout = mapApiCheckoutToCheckout(
      createApiCheckout({
        lines: [bundle],
        deliveryGroups: [
          deliveryGroup({
            checkoutLines: [{ __typename: 'CheckoutLine', id: 'bundle-1' }],
          }),
        ],
      })
    );

    const [line] = checkout.lines;
    expect(line.attributes).toEqual({ giftNote: 'Happy birthday' });
    expect(line.tag).toEqual({ id: 'tag-1', slug: 'box', unique: true });
    expect(line.purchase).toEqual({ type: 'ONE_TIME' });
    expect(line.children).toHaveLength(1);

    const [mappedChild] = line.children;
    expect(mappedChild).toMatchObject({
      id: 'child-1',
      title: 'Line child-1',
      sku: 'SKU-child-1',
      quantity: 2,
      componentItemId: 'component-1',
      originalPrice: { amount: 200, currencyCode: 'UAH' },
      priceConfig: { type: 'DISCOUNT_PERCENT', amount: null, percent: 10 },
      imageSrc: 'https://cdn.test/child.jpg',
      cost: { totalAmount: { amount: 180, currencyCode: 'UAH' } },
    });
    expect(mappedChild.purchasable.product?.title).toBe('Product child-1');
    expect(mappedChild.children).toEqual([
      expect.objectContaining({
        id: 'grandchild-1',
        componentItemId: 'component-2',
        priceConfig: { type: 'FREE', amount: null, percent: null },
        children: [],
      }),
    ]);
    expect(checkout.deliveryGroups[0].checkoutLines).toEqual([line]);
  });

  it('maps the delivery address without carrier-specific fields', () => {
    const [group] = mapApiCheckoutToCheckout(
      createApiCheckout({
        deliveryGroups: [
          deliveryGroup({
            deliveryAddress: {
              __typename: 'CheckoutDeliveryAddress',
              id: 'address-1',
              address1: null,
              address2: null,
              city: 'Kyiv',
              countryCode: 'UA',
              data: { carriers: { 'nova-poshta': { settlementRef: 'ref' } } },
              postalCode: '01001',
              provinceCode: 'UA-30',
              name: 'Kyiv',
              phone: null,
              country: 'Ukraine',
              province: 'Kyiv',
              formatted: ['Kyiv', 'Ukraine'],
              formattedArea: 'Kyiv, Ukraine',
            },
          }),
        ],
      })
    ).deliveryGroups;

    expect(group.deliveryAddress).toEqual({
      id: 'address-1',
      address1: null,
      address2: null,
      city: 'Kyiv',
      countryCode: 'UA',
      data: { carriers: { 'nova-poshta': { settlementRef: 'ref' } } },
      postalCode: '01001',
      provinceCode: 'UA-30',
      name: 'Kyiv',
      phone: null,
      country: 'Ukraine',
      province: 'Kyiv',
      formatted: ['Kyiv', 'Ukraine'],
      formattedArea: 'Kyiv, Ukraine',
    });
  });

  it('falls back to the signed-in customer for identity fields', () => {
    const checkout = mapApiCheckoutToCheckout(
      createApiCheckout({
        customerIdentity: {
          __typename: 'CheckoutCustomerIdentity',
          countryCode: 'UA',
          customer: {
            __typename: 'Customer',
            id: 'customer-1',
            displayName: 'Olena K.',
            firstName: 'Olena',
            lastName: 'Kovalenko',
            emailAddress: {
              __typename: 'CustomerEmailAddress',
              emailAddress: 'olena@example.test',
            },
          },
          email: null,
          firstName: null,
          lastName: null,
          middleName: null,
          phone: '+380000000000',
        },
      })
    );

    expect(checkout.customerIdentity).toEqual({
      countryCode: 'UA',
      customer: {
        id: 'customer-1',
        displayName: 'Olena K.',
        firstName: 'Olena',
        lastName: 'Kovalenko',
        email: 'olena@example.test',
      },
      email: 'olena@example.test',
      firstName: 'Olena',
      lastName: 'Kovalenko',
      middleName: null,
      phone: '+380000000000',
    });
  });
});
