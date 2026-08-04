import type { SdkProductQuery } from '@shopana/storefront-sdk/graphql/apollo/generated/operations';
import type { model } from '@shopana/storefront-sdk';
type ApiProduct = NonNullable<SdkProductQuery['product']>;
type ApiVariant = ApiProduct['variants']['edges'][number]['node'];
const toAmount = (amount: unknown): number => {
  const value = Number(amount ?? 0);
  return Number.isFinite(value) ? value : 0;
};
const toDateTime = (value: unknown): string =>
  value == null ? '' : String(value);
const toMedia = (
  media:
    | {
        readonly id?: string;
        readonly image?: {
          readonly url: unknown;
        } | null;
      }
    | null
    | undefined
): model.Media | null => {
  if (!media?.id || !media.image?.url) {
    return null;
  }
  return { id: media.id, url: String(media.image.url) };
};
const mapOptionDisplayType = (
  displayType: ApiProduct['options'][number]['displayType']
): model.ProductOptionDisplayType => {
  switch (displayType) {
    case 'SWATCH':
      return 'SWATCH';
    case 'DROPDOWN':
      return 'DROPDOWN';
    case 'BUTTONS':
    default:
      return 'RADIO';
  }
};
const mapSwatchDisplayType = (
  displayType: NonNullable<
    ApiProduct['options'][number]['values'][number]['swatch']
  >['displayType']
): model.SwatchDisplayType => {
  switch (displayType) {
    case 'IMAGE':
      return 'IMAGE';
    case 'GRADIENT':
      return 'COLOR_DUO';
    case 'COLOR':
    default:
      return 'COLOR';
  }
};
const createGallery = (
  media: Array<model.Media | null>
): model.GalleryConnection => {
  const seen = new Set<string>();
  const images = media.filter((item): item is model.Media => {
    if (!item || seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
  return {
    edges: images.map((node) => ({ node, cursor: '' })),
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
    totalCount: images.length,
  };
};
const mapApiVariantToVariant = (
  apiVariant: ApiVariant,
  productMedia: model.Media[]
): model.ProductVariant => {
  const gallery = createGallery([
    toMedia(apiVariant.featuredMedia),
    ...apiVariant.media.edges.map((edge) => toMedia(edge.node)),
    ...productMedia,
  ]);
  return {
    __typename: 'ProductVariant',
    id: apiVariant.id,
    iid: apiVariant.id,
    handle: apiVariant.handle,
    title: apiVariant.title,
    description: '',
    excerpt: '',
    selectedOptions: apiVariant.selectedOptions.map(
      (selection) => selection.optionValue.handle
    ),
    price: {
      amount: toAmount(apiVariant.price?.amount),
      currencyCode: apiVariant.price?.currencyCode ?? 'USD',
    },
    compareAtPrice: apiVariant.compareAtPrice
      ? {
          amount: toAmount(apiVariant.compareAtPrice.amount),
          currencyCode: apiVariant.compareAtPrice.currencyCode,
        }
      : null,
    cover: gallery.edges[0]?.node ?? null,
    gallery,
    sku: apiVariant.sku ?? null,
    stockStatus: {
      isAvailable: apiVariant.isAvailable,
    },
    isDefault: apiVariant.isDefault,
    groups: mapComponentGroups(apiVariant),
    createdAt: '',
    updatedAt: '',
  };
};
function mapComponentGroups(
  variant: ApiVariant | undefined
): model.ProductGroup[] {
  if (!variant) {
    return [];
  }
  const configuration = variant.componentConfiguration;
  if (!configuration) {
    return [];
  }
  return configuration.groups.map((group) => {
    return {
      id: group.id,
      title: group.title,
      isRequired: group.isRequired,
      isMultiple: group.maxSelection == null || group.maxSelection > 1,
      minSelection: group.minSelection,
      maxSelection: group.maxSelection,
      items: group.items.map((item) => {
        const node = item.node;
        const price = {
          amount: toAmount(item.unitPrice.amount),
          currencyCode: item.unitPrice.currencyCode,
        };
        return {
          id: item.id,
          node: {
            id: node.id,
            title: node.title,
            handle: node.handle,
            price,
            cover: toMedia(node.cover),
          },
          selected: item.selected,
          required: item.required,
          availableForSale: item.availableForSale,
          quantity: item.quantity,
          minQuantity: item.minQuantity,
          maxQuantity: item.maxQuantity,
          price: {
            amount: price,
            percentage: null,
          },
        };
      }),
    };
  });
}
/** Maps the current GraphQL product response to the storefront domain model. */
export function mapApiProductToProduct(
  apiProduct: ApiProduct | null
): model.Product | null {
  if (!apiProduct) {
    return null;
  }
  const productMedia = createGallery([
    toMedia(apiProduct.featuredMedia),
    ...apiProduct.media.edges.map((edge) => toMedia(edge.node)),
  ]).edges.map((edge) => edge.node);
  const variants = apiProduct.variants.edges.map(({ node }) =>
    mapApiVariantToVariant(node, productMedia)
  );
  const ratingCounts = [
    apiProduct.rating.breakdown.rating1Count,
    apiProduct.rating.breakdown.rating2Count,
    apiProduct.rating.breakdown.rating3Count,
    apiProduct.rating.breakdown.rating4Count,
    apiProduct.rating.breakdown.rating5Count,
  ];
  const defaultVariant =
    apiProduct.variants.edges.find(({ node }) => node.isDefault)?.node ??
    apiProduct.variants.edges[0]?.node;
  return {
    __typename: 'Product',
    id: apiProduct.id,
    handle: apiProduct.handle,
    title: apiProduct.title,
    description: apiProduct.description?.text ?? '',
    excerpt: apiProduct.excerpt?.text ?? '',
    category: apiProduct.category
      ? {
          id: apiProduct.category.id,
          title: apiProduct.category.title,
          handle: apiProduct.category.handle,
          description: '',
          excerpt: '',
          breadcrumbs: apiProduct.category.breadcrumbs.map((breadcrumb) => ({
            id: breadcrumb.id,
            title: breadcrumb.title,
            handle: breadcrumb.handle,
          })),
          createdAt: '',
          updatedAt: '',
        }
      : null,
    options: apiProduct.options.map((option) => ({
      id: option.id,
      handle: option.handle,
      title: option.title,
      displayType: mapOptionDisplayType(option.displayType),
      values: option.values.map((value) => ({
        id: value.id,
        title: value.title,
        handle: value.handle,
        swatch: value.swatch
          ? {
              id: `${value.id}:swatch`,
              color: value.swatch.color ? String(value.swatch.color) : '',
              color2: value.swatch.color2 ? String(value.swatch.color2) : null,
              displayType: mapSwatchDisplayType(value.swatch.displayType),
              image: toMedia(value.swatch.image),
            }
          : null,
      })),
    })),
    groups: mapComponentGroups(defaultVariant),
    features: apiProduct.features.map((feature) => ({
      id: feature.id,
      handle: feature.handle,
      title: feature.title,
      values: feature.values.map((value) => ({
        id: value.id,
        handle: value.handle,
        title: value.title,
      })),
    })),
    rating: {
      id: apiProduct.id,
      rating: apiProduct.rating.rating,
      count: apiProduct.rating.count,
      breakdown: ratingCounts.map((count, index) => ({
        star: index + 1,
        count,
        percentage:
          apiProduct.rating.count > 0
            ? (count / apiProduct.rating.count) * 100
            : 0,
      })),
    },
    tags: {
      edges: apiProduct.tags.map((tag) => ({
        node: {
          id: tag.id,
          handle: tag.handle,
          title: tag.title,
        },
        cursor: '',
      })),
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: apiProduct.tags.length,
    },
    seoDescription: apiProduct.seo.description ?? null,
    seoTitle: apiProduct.seo.title ?? null,
    createdAt: toDateTime(apiProduct.createdAt),
    updatedAt: toDateTime(apiProduct.updatedAt),
    variants,
  };
}
