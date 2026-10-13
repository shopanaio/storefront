import type { model } from '../../../../model/namespace';
import type {
  SdkCartFragment_CartFragment,
  SdkCartLineFragment_LineFragment,
} from '../../../../graphql/apollo/generated/operations';
export type DenormalizedShopanaCart = Omit<SdkCartFragment_CartFragment, 'lines'> & {
  readonly lines: ReadonlyArray<SdkCartLineFragment_LineFragment>;
};
type ApiMoney = SdkCartLineFragment_LineFragment['cost']['unitPrice'];
const toAmount = (amount: unknown): number => {
  const value = Number(amount ?? 0);
  return Number.isFinite(value) ? value : 0;
};
const toMoney = (money: ApiMoney | null | undefined): model.Money => ({
  amount: toAmount(money?.amount),
  currencyCode: money?.currencyCode ?? 'USD',
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
  product: SdkCartLineFragment_LineFragment['purchasable']['product'],
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
const mapLine = (line: SdkCartLineFragment_LineFragment): model.CartLine => {
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
    title: apiPurchasable.title ?? '',
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
    sku: null,
    stockStatus: { isAvailable: apiPurchasable.isAvailable ?? true },
    createdAt: '',
    updatedAt: '',
    product: createProductReference(apiPurchasable.product, id),
  };
  return {
    id: line.id,
    quantity: line.quantity,
    purchasableId: line.purchasableId,
    purchasable,
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
/** Maps the current Checkout GraphQL fragment to the public cart entity. */
export function mapShopanaCheckoutToEntityCart(
  checkout: DenormalizedShopanaCart
): model.Cart {
  return {
    id: checkout.id,
    createdAt: toDate(checkout.createdAt),
    updatedAt: toDate(checkout.updatedAt),
    totalQuantity: checkout.totalQuantity,
    cost: {
      subtotalAmount: toMoney(checkout.cost.subtotalAmount),
      totalAmount: toMoney(checkout.cost.totalAmount),
      totalDiscountAmount: toMoney(checkout.cost.totalDiscountAmount),
      totalTaxAmount: toMoney(checkout.cost.totalTaxAmount),
      totalShippingAmount: toMoney(checkout.cost.totalShippingAmount),
    },
    lines: checkout.lines.map(mapLine),
  };
}
