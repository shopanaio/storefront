import type { Checkout } from '@src/modules/checkout/types/entity';
import type { model } from '@shopana/storefront-sdk';
import type { useCheckoutFragment$data } from './__generated__/useCheckoutFragment.graphql';

type ApiCheckout = useCheckoutFragment$data;
type ApiMoney = ApiCheckout['cost']['totalAmount'];
type ApiLine = ApiCheckout['lines'][number];
type ApiDeliveryGroup = ApiCheckout['deliveryGroups'][number];
type ApiDeliveryMethod = ApiDeliveryGroup['deliveryMethods'][number];
type ApiPaymentMethod = ApiCheckout['payment']['paymentMethods'][number];

const GENERIC_DELIVERY_PROVIDER = 'generic';

const toAmount = (amount: unknown): number => {
  const value = Number(amount ?? 0);
  return Number.isFinite(value) ? value : 0;
};

const toDate = (value: unknown): Date => {
  const date = new Date(String(value ?? ''));
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
};

const mapMoney = (money: ApiMoney | null | undefined): model.Money => ({
  amount: toAmount(money?.amount),
  currencyCode: money?.currencyCode ?? 'UAH',
});

const emptyRating = (id: string): model.ProductRating => ({
  id,
  rating: 0,
  count: 0,
  breakdown: [],
});

const emptyTags = (): model.TagConnection => ({
  edges: [],
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
  },
  totalCount: 0,
});

const createProductReference = (
  product: NonNullable<ApiLine['purchasable']['product']> | undefined,
  fallbackId: string
): model.Product | null => {
  if (!product) {
    return null;
  }

  const id = product.id ?? fallbackId;
  return {
    __typename: 'Product',
    id,
    handle: product.handle,
    title: product.title,
    description: '',
    excerpt: '',
    category: null,
    options: [],
    groups: [],
    features: [],
    rating: emptyRating(id),
    tags: emptyTags(),
    createdAt: '',
    updatedAt: '',
    variants: [],
  };
};

const mapLinePurchasable = (
  line: ApiLine,
  cover: model.Media | null
): Checkout.Purchasable => {
  const apiPurchasable = line.purchasable;
  const id = apiPurchasable.id ?? line.purchasableId;
  const gallery: model.GalleryConnection = {
    edges: cover ? [{ node: cover, cursor: '' }] : [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
    totalCount: cover ? 1 : 0,
  };

  return {
    __typename: 'ProductVariant',
    id,
    iid: id,
    handle: apiPurchasable.handle ?? '',
    title: apiPurchasable.title ?? line.title,
    description: '',
    excerpt: '',
    selectedOptions: [],
    price: mapMoney(line.cost.unitPrice),
    compareAtPrice: mapMoney(line.cost.compareAtUnitPrice),
    cover,
    gallery,
    sku: apiPurchasable.sku ?? line.sku,
    stockStatus: { isAvailable: true },
    createdAt: '',
    updatedAt: '',
    product: createProductReference(apiPurchasable.product, id),
  };
};

const mapLineCost = (cost: ApiLine['cost']): Checkout.LineCost => ({
  unitPrice: mapMoney(cost.unitPrice),
  compareAtUnitPrice: mapMoney(cost.compareAtUnitPrice),
  subtotalAmount: mapMoney(cost.subtotalAmount),
  totalAmount: mapMoney(cost.totalAmount),
  discountAmount: mapMoney(cost.discountAmount),
  taxAmount: mapMoney(cost.taxAmount),
});

const mapChildLine = (
  child: ApiLine['children'][number],
  currencyCode: string
): Checkout.Line => {
  const zero = { amount: 0, currencyCode };
  const purchasableId = child.id;

  return {
    id: child.id,
    quantity: child.quantity,
    cost: {
      compareAtUnitPrice: zero,
      subtotalAmount: zero,
      totalAmount: zero,
      unitPrice: zero,
    },
    purchasableId,
    title: '',
    purchasable: {
      __typename: 'ProductVariant',
      id: purchasableId,
      iid: purchasableId,
      handle: '',
      title: '',
      description: '',
      excerpt: '',
      selectedOptions: [],
      price: zero,
      compareAtPrice: null,
      cover: null,
      gallery: {
        edges: [],
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
        totalCount: 0,
      },
      sku: null,
      stockStatus: { isAvailable: true },
      createdAt: '',
      updatedAt: '',
      product: null,
    },
  };
};

const mapLine = (line: ApiLine): Checkout.Line => {
  const image = line.image?.image?.url
    ? {
        id: line.image.id,
        url: String(line.image.image.url),
      }
    : null;
  const currencyCode = line.cost.totalAmount.currencyCode;

  return {
    id: line.id,
    quantity: line.quantity,
    cost: mapLineCost(line.cost),
    imageSrc: image?.url ?? null,
    purchasable: mapLinePurchasable(line, image),
    purchasableId: line.purchasableId,
    purchasableSnapshot: line.attributes,
    sku: line.sku,
    title: line.title,
    children: line.children.map((child) => mapChildLine(child, currencyCode)),
  };
};

const mapDeliveryMethod = (
  method: ApiDeliveryMethod
): Checkout.DeliveryMethod => ({
  handle: method.handle,
  code: method.code,
  title: method.title,
  description: method.description,
  deliveryMethodType:
    method.deliveryMethodType === 'SHIPPING' ? 'SHIPPING' : 'PICKUP',
  provider: {
    code: method.providerCode?.trim() || GENERIC_DELIVERY_PROVIDER,
  },
  publicData: method.data,
});

const mapSelectedDeliveryMethod = (
  selection: ApiDeliveryGroup['selectedDeliveryMethod']
): Checkout.DeliveryMethod | null =>
  selection.option ? mapDeliveryMethod(selection.option) : null;

const mapDeliveryGroup = (
  group: ApiDeliveryGroup,
  linesById: ReadonlyMap<string, Checkout.Line>
): Checkout.DeliveryGroup => {
  const selectedDeliveryMethod = mapSelectedDeliveryMethod(
    group.selectedDeliveryMethod
  );

  return {
    id: group.id,
    checkoutLines: group.checkoutLines
      .map((line) => linesById.get(line.id) ?? null)
      .filter((line): line is Checkout.Line => line !== null),
    deliveryAddress: group.deliveryAddress
      ? {
          id: group.deliveryAddress.id,
          address1: group.deliveryAddress.address1,
          address2: group.deliveryAddress.address2,
          city: group.deliveryAddress.city,
          countryCode: group.deliveryAddress.countryCode,
          data: group.deliveryAddress.data,
          postalCode: group.deliveryAddress.postalCode,
          provinceCode: group.deliveryAddress.provinceCode,
        }
      : null,
    deliveryMethods: group.deliveryMethods.map(mapDeliveryMethod),
    estimatedCost: group.selectedDeliveryMethod.option
      ? {
          amount: mapMoney(group.selectedDeliveryMethod.option.cost),
          paymentModel: 'MERCHANT_COLLECTED',
        }
      : null,
    recipient: group.recipient
      ? {
          email: group.recipient.email,
          firstName: group.recipient.firstName,
          lastName: group.recipient.lastName,
          middleName: group.recipient.middleName,
          phone: group.recipient.phone,
        }
      : null,
    selectedDeliveryMethod,
  };
};

const mapPaymentMethod = (
  method: ApiPaymentMethod
): Checkout.PaymentMethod => ({
  handle: method.handle,
  code: method.code,
  provider: { code: method.providerCode },
  flow: method.flow,
  data: undefined,
});

/** Maps the Relay checkout fragment from the current schema to the UI entity. */
export function mapApiCheckoutToCheckout(
  apiCheckout: Readonly<ApiCheckout>
): Checkout.Checkout {
  const lines = apiCheckout.lines.map(mapLine);
  const linesById = new Map(lines.map((line) => [line.id, line]));
  const selectedPaymentMethod =
    apiCheckout.payment.selectedPaymentMethod.method;

  return {
    id: apiCheckout.id,
    version: apiCheckout.version,
    resultRevision: apiCheckout.resultRevision,
    createdAt: toDate(apiCheckout.createdAt),
    updatedAt: toDate(apiCheckout.updatedAt),
    totalQuantity: apiCheckout.totalQuantity,
    cost: {
      subtotalAmount: mapMoney(apiCheckout.cost.subtotalAmount),
      totalAmount: mapMoney(apiCheckout.cost.totalAmount),
      totalDiscountAmount: mapMoney(apiCheckout.cost.totalDiscountAmount),
      totalShippingAmount: mapMoney(apiCheckout.cost.totalShippingAmount),
      totalTaxAmount: mapMoney(apiCheckout.cost.totalTaxAmount),
    },
    lines,
    appliedPromoCodes: apiCheckout.appliedPromoCodes.map((promoCode) => ({
      code: promoCode.code,
      appliedAt: toDate(promoCode.appliedAt),
      discountType: promoCode.discountType,
      value: promoCode.value,
      provider: promoCode.provider,
    })),
    customerIdentity: {
      countryCode: apiCheckout.customerIdentity.countryCode,
      email:
        apiCheckout.customerIdentity.email ??
        apiCheckout.customerIdentity.customer?.emailAddress?.emailAddress ??
        null,
      firstName:
        apiCheckout.customerIdentity.firstName ??
        apiCheckout.customerIdentity.customer?.firstName ??
        null,
      lastName:
        apiCheckout.customerIdentity.lastName ??
        apiCheckout.customerIdentity.customer?.lastName ??
        null,
      middleName: apiCheckout.customerIdentity.middleName,
      phone: apiCheckout.customerIdentity.phone,
    },
    customerNote: apiCheckout.customerNote,
    deliveryGroups: apiCheckout.deliveryGroups.map((group) =>
      mapDeliveryGroup(group, linesById)
    ),
    payment: {
      payableAmount: mapMoney(apiCheckout.payment.payableAmount),
      paymentMethods: apiCheckout.payment.paymentMethods.map(mapPaymentMethod),
      selectedPaymentMethod: selectedPaymentMethod
        ? mapPaymentMethod(selectedPaymentMethod)
        : null,
    },
    notifications: apiCheckout.notifications.map((notification) => ({
      id: notification.id,
      code: notification.code,
      severity: notification.severity,
      isDismissed: notification.isDismissed,
    })),
  };
}
