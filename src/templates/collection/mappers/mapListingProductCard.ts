import type { model } from '@shopana/storefront-sdk';

interface RawMedia {
  readonly id?: string;
  readonly image?: { readonly url: unknown } | null;
}

interface RawSelectedOption {
  readonly optionValue: { readonly handle: string };
}

interface RawListingProduct {
  readonly id: string;
  readonly title: string;
  readonly handle: string;
  readonly description?: { readonly text: string } | null;
  readonly rating: { readonly rating: number; readonly count: number };
  readonly cover?: RawMedia | null;
  readonly gallery: {
    readonly edges: ReadonlyArray<{ readonly node: RawMedia }>;
  };
  readonly options?: ReadonlyArray<{
    readonly id: string;
    readonly handle: string;
    readonly title: string;
    readonly displayType: 'BUTTONS' | 'DROPDOWN' | 'SWATCH';
    readonly values: ReadonlyArray<{
      readonly id: string;
      readonly handle: string;
      readonly title: string;
      readonly swatch?: {
        readonly color?: unknown | null;
        readonly color2?: unknown | null;
        readonly displayType: 'COLOR' | 'GRADIENT' | 'IMAGE';
        readonly image?: RawMedia | null;
      } | null;
    }>;
  }>;
  readonly selectedVariant?: {
    readonly id: string;
    readonly title: string;
    readonly handle: string;
    readonly price?: {
      readonly amount: unknown;
      readonly currencyCode: string;
    } | null;
    readonly compareAtPrice?: {
      readonly amount: unknown;
      readonly currencyCode: string;
    } | null;
    readonly isAvailable: boolean;
    readonly selectedOptions?: ReadonlyArray<RawSelectedOption>;
    readonly sku?: string | null;
  } | null;
}

const toAmount = (amount: unknown): number => {
  const value = Number(amount ?? 0);
  return Number.isFinite(value) ? value : 0;
};

const toMedia = (media: RawMedia | null | undefined): model.Media | null =>
  media?.id && media.image?.url
    ? { id: media.id, url: String(media.image.url) }
    : null;

const mapDisplayType = (
  displayType: 'BUTTONS' | 'DROPDOWN' | 'SWATCH'
): model.ProductOptionDisplayType =>
  displayType === 'BUTTONS' ? 'RADIO' : displayType;

const mapSwatchDisplayType = (
  displayType: 'COLOR' | 'GRADIENT' | 'IMAGE'
): model.SwatchDisplayType =>
  displayType === 'GRADIENT' ? 'COLOR_DUO' : displayType;

export interface MappedListingProductCard {
  product: model.Product;
  variant: model.ProductVariant;
  gallery: string[];
}

export function mapListingProductCard(
  rawProduct: RawListingProduct
): MappedListingProductCard {
  const selectedVariant = rawProduct.selectedVariant;
  const seen = new Set<string>();
  const images = [
    toMedia(rawProduct.cover),
    ...rawProduct.gallery.edges.map((edge) => toMedia(edge.node)),
  ].filter((image): image is model.Media => {
    if (!image || seen.has(image.id)) {
      return false;
    }
    seen.add(image.id);
    return true;
  });
  const options: model.ProductOption[] = (rawProduct.options ?? []).map(
    (option) => ({
      id: option.id,
      handle: option.handle,
      title: option.title,
      displayType: mapDisplayType(option.displayType),
      values: option.values.map((value) => ({
        id: value.id,
        handle: value.handle,
        title: value.title,
        swatch: value.swatch
          ? {
              id: `${value.id}:swatch`,
              color: value.swatch.color ? String(value.swatch.color) : '',
              color2: value.swatch.color2
                ? String(value.swatch.color2)
                : null,
              displayType: mapSwatchDisplayType(
                value.swatch.displayType
              ),
              image: toMedia(value.swatch.image),
            }
          : null,
      })),
    })
  );
  const productReference: model.Product = {
    __typename: 'Product',
    id: rawProduct.id,
    title: rawProduct.title,
    handle: rawProduct.handle,
    description: rawProduct.description?.text ?? '',
    excerpt: '',
    category: null,
    options,
    groups: [],
    features: [],
    rating: {
      id: rawProduct.id,
      rating: rawProduct.rating.rating,
      count: rawProduct.rating.count,
      breakdown: [],
    },
    tags: {
      edges: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      totalCount: 0,
    },
    createdAt: '',
    updatedAt: '',
    variants: [],
  };
  const variantId = selectedVariant?.id ?? rawProduct.id;
  const variant: model.ProductVariant = {
    __typename: 'ProductVariant',
    id: variantId,
    iid: variantId,
    title: selectedVariant?.title ?? rawProduct.title,
    handle: selectedVariant?.handle ?? rawProduct.handle,
    description: '',
    excerpt: '',
    selectedOptions:
      selectedVariant?.selectedOptions?.map(
        (selection) => selection.optionValue.handle
      ) ?? [],
    price: {
      amount: toAmount(selectedVariant?.price?.amount),
      currencyCode: selectedVariant?.price?.currencyCode ?? 'USD',
    },
    compareAtPrice: selectedVariant?.compareAtPrice
      ? {
          amount: toAmount(selectedVariant.compareAtPrice.amount),
          currencyCode: selectedVariant.compareAtPrice.currencyCode,
        }
      : null,
    cover: images[0] ?? null,
    gallery: {
      edges: images.map((node) => ({ node, cursor: '' })),
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      totalCount: images.length,
    },
    sku: selectedVariant?.sku ?? null,
    stockStatus: { isAvailable: selectedVariant?.isAvailable ?? false },
    createdAt: '',
    updatedAt: '',
    product: productReference,
  };

  return {
    product: { ...productReference, variants: [variant] },
    variant,
    gallery: images.map((image) => image.url),
  };
}
