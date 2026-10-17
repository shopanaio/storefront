import type { Checkout } from '#checkout/types/entity';
import type { model } from '@shopana/storefront-sdk';
import type {
  StorefrontCheckoutDeliveryOptionFragment,
  StorefrontCheckoutLineFieldsFragment,
  StorefrontCheckoutMoneyFragment,
  StorefrontCheckoutPaymentMethodFragment,
  StorefrontCheckoutSelectionResetReasonFragment,
  StorefrontUseCheckoutFragment,
} from '#checkout/graphql/operations';
type ApiCheckout = StorefrontUseCheckoutFragment;
type ApiLine = StorefrontCheckoutLineFieldsFragment & {
  readonly children?: readonly ApiLine[];
};
type ApiDeliveryGroup = ApiCheckout['deliveryGroups'][number];
type ApiDeliveryAddress = NonNullable<ApiDeliveryGroup['deliveryAddress']>;
const GENERIC_DELIVERY_PROVIDER = 'generic';
const toAmount = (amount: unknown): number => {
  const value = Number(amount ?? 0);
  return Number.isFinite(value) ? value : 0;
};
const toDate = (value: unknown): Date => {
  const date = new Date(String(value ?? ''));
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
};
const toOptionalDate = (value: string | null | undefined): Date | null =>
  value ? toDate(value) : null;
const toRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const mapMoney = (money: StorefrontCheckoutMoneyFragment): model.Money => ({
  amount: toAmount(money.amount),
  currencyCode: money.currencyCode,
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
    description: null,
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
const mapLine = (line: ApiLine): Checkout.Line => {
  const image = line.image?.image?.url
    ? {
        id: line.image.id,
        url: String(line.image.image.url),
      }
    : null;
  return {
    id: line.id,
    quantity: line.quantity,
    title: line.title,
    sku: line.sku ?? null,
    cost: mapLineCost(line.cost),
    originalPrice: mapMoney(line.originalPrice),
    priceConfig: line.priceConfig
      ? {
          type: line.priceConfig.type,
          amount: line.priceConfig.amount ?? null,
          percent: line.priceConfig.percent ?? null,
        }
      : null,
    imageSrc: image?.url ?? null,
    purchasable: mapLinePurchasable(line, image),
    purchasableId: line.purchasableId,
    purchase: { type: line.purchase.type },
    attributes: toRecord(line.attributes),
    tag: line.tag
      ? { id: line.tag.id, slug: line.tag.slug, unique: line.tag.unique }
      : null,
    componentItemId: line.componentItemId ?? null,
    children: (line.children ?? []).map(mapLine),
  };
};
const mapResetReason = (
  reason: StorefrontCheckoutSelectionResetReasonFragment | null | undefined
): Checkout.SelectionResetReason | null =>
  reason ? { code: reason.code, message: reason.message } : null;
const mapDeliveryMethod = (
  method: StorefrontCheckoutDeliveryOptionFragment
): Checkout.DeliveryMethod => ({
  handle: method.handle,
  code: method.code,
  title: method.title,
  description: method.description ?? null,
  deliveryMethodType: method.deliveryMethodType,
  carrierCode: method.carrierCode ?? null,
  provider: {
    code: method.carrierCode?.trim() || GENERIC_DELIVERY_PROVIDER,
  },
  cost: mapMoney(method.cost),
  estimatedMinDeliveryAt: toOptionalDate(method.estimatedMinDeliveryAt),
  estimatedMaxDeliveryAt: toOptionalDate(method.estimatedMaxDeliveryAt),
  phoneRequired: method.phoneRequired,
  customerInputContract: method.customerInputContract ?? null,
  publicData: method.publicData,
});
const mapDeliveryAddress = (
  address: ApiDeliveryAddress
): Checkout.DeliveryAddress => ({
  id: address.id ?? null,
  address1: address.address1 ?? null,
  address2: address.address2 ?? null,
  city: address.city ?? null,
  countryCode: address.countryCode ?? null,
  data: address.data ?? null,
  postalCode: address.postalCode ?? null,
  provinceCode: address.provinceCode ?? null,
  name: address.name,
  phone: address.phone ?? null,
  country: address.country ?? null,
  province: address.province ?? null,
  formatted: [...address.formatted],
  formattedArea: address.formattedArea ?? null,
});
const mapDeliveryGroup = (
  group: ApiDeliveryGroup,
  linesById: ReadonlyMap<string, Checkout.Line>
): Checkout.DeliveryGroup => ({
  id: group.id,
  checkoutLines: group.checkoutLines
    .map((line) => linesById.get(line.id) ?? null)
    .filter((line): line is Checkout.Line => line !== null),
  deliveryAddress: group.deliveryAddress
    ? mapDeliveryAddress(group.deliveryAddress)
    : null,
  deliveryMethods: group.options.map(mapDeliveryMethod),
  recipient: group.recipient
    ? {
        email: group.recipient.email ?? null,
        firstName: group.recipient.firstName ?? null,
        lastName: group.recipient.lastName ?? null,
        middleName: group.recipient.middleName ?? null,
        phone: group.recipient.phone ?? null,
      }
    : null,
  selection: {
    status: group.selection.status,
    option: group.selection.option
      ? mapDeliveryMethod(group.selection.option)
      : null,
    previousOptionHandle: group.selection.previousOptionHandle ?? null,
    resetReason: mapResetReason(group.selection.resetReason),
  },
});
const mapPaymentMethod = (
  method: StorefrontCheckoutPaymentMethodFragment
): Checkout.PaymentMethod => ({
  handle: method.handle,
  code: method.code,
  title: method.title,
  provider: { code: method.providerCode },
  flow: method.flow,
});
/**
 * Collects lines and bundle components by id, because delivery groups may
 * reference either.
 */
const indexLines = (
  lines: readonly Checkout.Line[],
  index = new Map<string, Checkout.Line>()
): Map<string, Checkout.Line> => {
  for (const line of lines) {
    index.set(line.id, line);
    indexLines(line.children, index);
  }
  return index;
};
/** Maps the checkout fragment from the current schema to the UI entity. */
export function mapApiCheckoutToCheckout(
  apiCheckout: Readonly<ApiCheckout>
): Checkout.Checkout {
  const lines = apiCheckout.lines.map(mapLine);
  const linesById = indexLines(lines);
  const { customer } = apiCheckout.customerIdentity;
  const customerEmail = customer?.emailAddress?.emailAddress ?? null;
  return {
    id: apiCheckout.id,
    channelCode: apiCheckout.channelCode,
    localeCode: apiCheckout.localeCode,
    currencyCode: apiCheckout.currencyCode,
    resultRevision: apiCheckout.resultRevision,
    status: apiCheckout.status,
    expiresAt: toDate(apiCheckout.expiresAt),
    valid: apiCheckout.valid,
    issues: apiCheckout.issues.map((issue) => ({
      code: issue.code,
      message: issue.message,
      severity: issue.severity,
      effect: issue.effect,
      field: [...issue.field],
      lineId: issue.lineId ?? null,
      retryable: issue.retryable,
    })),
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
      countryCode: apiCheckout.customerIdentity.countryCode ?? null,
      customer: customer
        ? {
            id: customer.id,
            displayName: customer.displayName,
            firstName: customer.firstName ?? null,
            lastName: customer.lastName ?? null,
            email: customerEmail,
          }
        : null,
      email: apiCheckout.customerIdentity.email ?? customerEmail,
      firstName:
        apiCheckout.customerIdentity.firstName ?? customer?.firstName ?? null,
      lastName:
        apiCheckout.customerIdentity.lastName ?? customer?.lastName ?? null,
      middleName: apiCheckout.customerIdentity.middleName ?? null,
      phone: apiCheckout.customerIdentity.phone ?? null,
    },
    customerNote: apiCheckout.customerNote ?? null,
    deliveryGroups: apiCheckout.deliveryGroups.map((group) =>
      mapDeliveryGroup(group, linesById)
    ),
    payment: {
      payableAmount: mapMoney(apiCheckout.payment.payableAmount),
      paymentMethods: apiCheckout.payment.methods.map(mapPaymentMethod),
      selection: {
        status: apiCheckout.payment.selection.status,
        method: apiCheckout.payment.selection.method
          ? mapPaymentMethod(apiCheckout.payment.selection.method)
          : null,
        previousMethodHandle:
          apiCheckout.payment.selection.previousMethodHandle ?? null,
        resetReason: mapResetReason(apiCheckout.payment.selection.resetReason),
      },
    },
    notifications: apiCheckout.notifications.map((notification) => ({
      id: notification.id,
      code: notification.code,
      severity: notification.severity,
      isDismissed: notification.isDismissed,
    })),
  };
}
