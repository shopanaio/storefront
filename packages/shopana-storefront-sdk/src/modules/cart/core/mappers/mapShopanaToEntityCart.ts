import type { model } from '../../../../model/namespace';
import type {
  SdkCartFragment_CartFragment,
  SdkCartLineFragment_FieldsFragment,
  SdkCartLineFragment_LineFragment,
} from '../../../../graphql/apollo/generated/operations';
import { mapStorefrontPromotion } from '../../../promotions/core/mapStorefrontPromotion';
export type DenormalizedShopanaCart = Omit<
  SdkCartFragment_CartFragment,
  'lines'
> & {
  readonly lines: ReadonlyArray<SdkCartLineFragment_LineFragment>;
};
type ApiMoney = SdkCartLineFragment_FieldsFragment['cost']['unitPrice'];
/** A child line carries the same fields as a root line; its own children are not read. */
type ApiLine = SdkCartLineFragment_FieldsFragment &
  Partial<Pick<SdkCartLineFragment_LineFragment, 'children'>>;
const toAmount = (amount: unknown): number => {
  const value = Number(amount);
  return Number.isFinite(value) ? value : 0;
};
const toMoney = (money: ApiMoney): model.Money => ({
  amount: toAmount(money.amount),
  currencyCode: money.currencyCode,
});
const toDate = (value: unknown): Date => {
  const date = new Date(String(value ?? ''));
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
};
const emptyTags = (): model.TagConnection => ({
  edges: [],
  pageInfo: { hasNextPage: false, hasPreviousPage: false },
  totalCount: 0,
});
const createProductReference = (
  product: ApiLine['purchasable']['product'],
  fallbackId: string
): model.Product | null => {
  if (!product) {
    return null;
  }
  return {
    __typename: 'Product',
    id: product.id ?? fallbackId,
    handle: product.handle,
    title: product.title,
    description: null,
    excerpt: '',
    category: null,
    options: [],
    groups: [],
    features: [],
    rating: {
      id: product.id ?? fallbackId,
      rating: 0,
      count: 0,
      breakdown: [],
    },
    tags: emptyTags(),
    createdAt: '',
    updatedAt: '',
    variants: [],
  };
};
const mapLine = (line: ApiLine): model.ConfirmedCartLine => {
  const apiPurchasable = line.purchasable;
  const id = apiPurchasable.id ?? line.purchasableId;
  const cover =
    apiPurchasable.cover?.__typename === 'MediaImage'
      ? apiPurchasable.cover
      : null;
  const media = cover?.image?.url
    ? {
        id: cover.id,
        url: String(cover.image.url),
      }
    : line.image?.image?.url
      ? {
          id: line.image.id,
          url: String(line.image.image.url),
        }
      : null;
  const purchasable: model.ProductVariant = {
    __typename: 'ProductVariant',
    id,
    iid: id,
    handle: apiPurchasable.handle ?? '',
    title:
      apiPurchasable.title &&
      apiPurchasable.title !== apiPurchasable.product?.title
        ? apiPurchasable.title
        : (apiPurchasable.selectedOptions
            ?.map((selection) => selection.value)
            .join(' / ') ?? ''),
    description: '',
    excerpt: '',
    selectedOptions:
      apiPurchasable.selectedOptions?.map(
        (selection) => selection.optionValue.handle
      ) ?? [],
    price: toMoney(apiPurchasable.price ?? line.cost.unitPrice),
    compareAtPrice: apiPurchasable.compareAtPrice
      ? toMoney(apiPurchasable.compareAtPrice)
      : line.cost.compareAtUnitPrice
        ? toMoney(line.cost.compareAtUnitPrice)
        : null,
    cover: media,
    gallery: {
      edges: media ? [{ node: media, cursor: '' }] : [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      totalCount: media ? 1 : 0,
    },
    sku: line.sku ?? null,
    stockStatus: {
      isAvailable: apiPurchasable.isAvailable ?? true,
      maxQuantity:
        apiPurchasable.inventoryItem?.inventoryPolicy === 'DENY'
          ? apiPurchasable.quantityAvailable
          : null,
    },
    createdAt: '',
    updatedAt: '',
    product: createProductReference(apiPurchasable.product, id),
  };
  const image = line.image?.image;
  return {
    isOptimistic: false,
    id: line.id,
    quantity: line.quantity,
    purchasableId: line.purchasableId,
    purchasable,
    title: line.title,
    image: image?.url
      ? {
          url: String(image.url),
          width: image.width ?? null,
          height: image.height ?? null,
          alt: image.altText ?? null,
        }
      : null,
    tag: line.tag
      ? { id: line.tag.id, slug: line.tag.slug, unique: line.tag.unique }
      : null,
    attributes: line.attributes,
    purchaseType: line.purchase.type,
    parentId: line.parent?.id ?? null,
    componentItemId: line.componentItemId ?? null,
    options:
      apiPurchasable.selectedOptions?.map((selection) => ({
        name: selection.option.name,
        value: selection.optionValue.name,
      })) ?? [],
    children: line.children?.map(mapLine) ?? [],
    currentlyNotInStock: apiPurchasable.currentlyNotInStock ?? false,
    cost: {
      unitPrice: toMoney(line.cost.unitPrice),
      compareAtUnitPrice: line.cost.compareAtUnitPrice
        ? toMoney(line.cost.compareAtUnitPrice)
        : null,
      subtotalAmount: toMoney(line.cost.subtotalAmount),
      totalAmount: toMoney(line.cost.totalAmount),
    },
  };
};
type ApiRequirement = NonNullable<
  SdkCartFragment_CartFragment['promotionProgress'][number]['requirement']
>;
const toOptionalMoney = (
  money: ApiMoney | null | undefined
): model.Money | null => (money ? toMoney(money) : null);
const mapRequirement = (
  requirement: ApiRequirement
): model.CartPromotionRequirement => ({
  type: requirement.type,
  required: toOptionalMoney(requirement.required),
  current: toOptionalMoney(requirement.current),
  remaining: toOptionalMoney(requirement.remaining),
  requiredQuantity: requirement.requiredQuantity ?? null,
  currentQuantity: requirement.currentQuantity ?? null,
  remainingQuantity: requirement.remainingQuantity ?? null,
  ratio: Math.min(1, Math.max(0, toAmount(requirement.ratio))),
});
const mapFreeShippingProgress = (
  progress: NonNullable<SdkCartFragment_CartFragment['freeShippingProgress']>
): model.CartFreeShippingProgress => ({
  status: progress.status,
  source: progress.source ?? null,
  title: progress.title,
  promotion: progress.promotion
    ? mapStorefrontPromotion(progress.promotion)
    : null,
  requirement: progress.requirement
    ? mapRequirement(progress.requirement)
    : null,
  nextRequirement: progress.nextRequirement
    ? mapRequirement(progress.nextRequirement)
    : null,
  maximumShippingPrice: toOptionalMoney(progress.maximumShippingPrice),
  appliesToSelectedDelivery: progress.appliesToSelectedDelivery ?? null,
});
/** Maps the current Checkout GraphQL fragment to the public cart entity. */
export function mapShopanaCheckoutToEntityCart(
  checkout: DenormalizedShopanaCart
): model.Cart {
  return {
    id: checkout.id,
    status: checkout.status,
    expiresAt: toDate(checkout.expiresAt),
    resultRevision: checkout.resultRevision,
    valid: checkout.valid,
    loyaltyRewardId: checkout.loyaltyRewardId ?? null,
    loyaltyRedemption: checkout.loyaltyRedemption
      ? {
          ...checkout.loyaltyRedemption,
          requestedPoints: checkout.loyaltyRedemption.requestedPoints ?? null,
          requestedAmount: checkout.loyaltyRedemption.requestedAmount
            ? toMoney(checkout.loyaltyRedemption.requestedAmount)
            : null,
          points: checkout.loyaltyRedemption.points ?? null,
          availablePoints: checkout.loyaltyRedemption.availablePoints ?? null,
          availableAmount: toMoney(checkout.loyaltyRedemption.availableAmount),
          discount: toMoney(checkout.loyaltyRedemption.discount),
          payableAfterLoyalty: toMoney(
            checkout.loyaltyRedemption.payableAfterLoyalty
          ),
          expiresAt: toDate(checkout.loyaltyRedemption.expiresAt),
        }
      : null,
    createdAt: toDate(checkout.createdAt),
    updatedAt: toDate(checkout.updatedAt),
    totalQuantity: checkout.totalQuantity,
    guestCheckoutAllowed: checkout.guestCheckoutAllowed,
    issues: checkout.issues.map((issue) => ({
      ...issue,
      lineId: issue.lineId ?? null,
    })),
    notifications: checkout.notifications.map((notification) => ({
      ...notification,
    })),
    promoCodes: checkout.promoCodes.map((promoCode) => ({
      code: promoCode.code,
      status: promoCode.status,
      reason: promoCode.reason ?? null,
      message: promoCode.message ?? null,
    })),
    loyaltyEarning: checkout.loyaltyEarning
      ? {
          state: checkout.loyaltyEarning.state,
          points: checkout.loyaltyEarning.points,
          amount: checkout.loyaltyEarning.amount
            ? toMoney(checkout.loyaltyEarning.amount)
            : null,
          headline: checkout.loyaltyEarning.presentation.headline,
          description: checkout.loyaltyEarning.presentation.description ?? null,
        }
      : null,
    promotionProgress: checkout.promotionProgress.map((progress) => ({
      promotion: progress.promotion
        ? mapStorefrontPromotion(progress.promotion)
        : null,
      status: progress.status,
      requirement: mapRequirement(progress.requirement),
    })),
    freeShippingProgress: checkout.freeShippingProgress
      ? mapFreeShippingProgress(checkout.freeShippingProgress)
      : null,
    appliedPromotions: checkout.appliedPromotions.map((applied) => ({
      title: applied.title,
      discountClass: applied.discountClass,
      amount: toMoney(applied.amount),
      promotion: applied.promotion
        ? mapStorefrontPromotion(applied.promotion)
        : null,
    })),
    cost: {
      subtotalAmount: toMoney(checkout.cost.subtotalAmount),
      totalAmount: toMoney(checkout.cost.totalAmount),
      totalDiscountAmount: toMoney(checkout.cost.totalDiscountAmount),
      totalTaxAmount: toMoney(checkout.cost.totalTaxAmount),
      totalShippingAmount: toMoney(checkout.cost.totalShippingAmount),
      merchandiseDiscountAmount: toMoney(
        checkout.cost.merchandiseDiscountAmount
      ),
      loyaltyAmount: toMoney(checkout.cost.loyaltyAmount),
    },
    lines: checkout.lines.map(mapLine),
  };
}
