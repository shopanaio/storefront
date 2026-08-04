'use client';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { SerializableApolloQuery } from '../../../../graphql/apollo/loadSerializableQuery';
import { ProductDataContext } from '../context/ProductDataContext';
import type {
  Product,
  ProductTemplateData,
  ProductVariant,
  ProductOption,
  ProductTag,
  ProductGroup,
  ProductImage,
} from '../../core/types';
import type {
  SdkProductQuery,
  SdkProductQueryVariables,
} from '../../../../graphql/apollo/generated/operations';
interface ProductDataProviderProps {
  children: ReactNode;
  preloadedQuery: SerializableApolloQuery<
    SdkProductQuery,
    SdkProductQueryVariables
  >;
}
type RawProduct = NonNullable<SdkProductQuery['product']>;
type RawVariant = RawProduct['variants']['edges'][number]['node'];
const toAmount = (amount: unknown): number => {
  const value = Number(amount ?? 0);
  return Number.isFinite(value) ? value : 0;
};
const toImage = (
  media:
    | {
        readonly id?: string;
        readonly image?: {
          readonly url: unknown;
        } | null;
      }
    | null
    | undefined
): ProductImage | null => {
  if (!media?.id || !media.image?.url) {
    return null;
  }
  return { id: media.id, url: String(media.image.url) };
};
const transformGroups = (variant: RawVariant | undefined): ProductGroup[] => {
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
        const unitPrice = {
          amount: toAmount(item.unitPrice.amount),
          currencyCode: item.unitPrice.currencyCode,
        };
        return {
          id: item.id,
          node: node
            ? {
                id: node.id,
                title: node.title,
                handle: node.handle,
                product: {
                  title: node.product.title,
                  handle: node.product.handle,
                },
                price: unitPrice,
                cover: toImage(node.cover),
              }
            : null,
          selected: item.selected,
          required: item.required,
          availableForSale: item.availableForSale,
          quantity: item.quantity,
          minQuantity: item.minQuantity,
          maxQuantity: item.maxQuantity,
          price: {
            amount: unitPrice,
            percentage: null,
          },
        };
      }),
    };
  });
};
function transformProduct(
  rawProduct: SdkProductQuery['product']
): Product | null {
  if (!rawProduct) {
    return null;
  }
  const productMedia = [
    toImage(rawProduct.featuredMedia),
    ...rawProduct.media.edges.map((edge) => toImage(edge.node)),
  ].filter((image): image is ProductImage => image !== null);
  const variants: ProductVariant[] = rawProduct.variants.edges.map(
    ({ node }) => {
      const seen = new Set<string>();
      const images = [
        toImage(node.featuredMedia),
        ...node.media.edges.map((edge) => toImage(edge.node)),
        ...productMedia,
      ].filter((image): image is ProductImage => {
        if (!image || seen.has(image.id)) {
          return false;
        }
        seen.add(image.id);
        return true;
      });
      return {
        id: node.id,
        handle: node.handle,
        title: node.title,
        selectedOptions: node.selectedOptions.map(
          (selection) => selection.optionValue.handle
        ),
        cover: images[0] ?? null,
        gallery: {
          edges: images.map((image) => ({ node: image })),
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
          totalCount: images.length,
        },
        price: {
          amount: toAmount(node.price?.amount),
          currencyCode: node.price?.currencyCode ?? 'USD',
        },
        compareAtPrice: node.compareAtPrice
          ? {
              amount: toAmount(node.compareAtPrice.amount),
              currencyCode: node.compareAtPrice.currencyCode,
            }
          : null,
        sku: node.sku,
        stockStatus: { isAvailable: node.isAvailable },
        isDefault: node.isDefault,
        groups: transformGroups(node),
      };
    }
  );
  const options: ProductOption[] = (rawProduct.options ?? []).map((o) => ({
    id: o.id,
    handle: o.handle,
    title: o.title,
    displayType: o.displayType === 'BUTTONS' ? 'RADIO' : o.displayType,
    values: (o.values ?? []).map((v) => ({
      id: v.id,
      title: v.title,
      handle: v.handle,
      swatch: v.swatch
        ? {
            id: `${v.id}:swatch`,
            color: v.swatch.color ? String(v.swatch.color) : null,
            displayType:
              v.swatch.displayType === 'GRADIENT'
                ? 'COLOR_DUO'
                : v.swatch.displayType,
            image: toImage(v.swatch.image),
          }
        : null,
    })),
  }));
  const tags: ProductTag[] = rawProduct.tags.map((tag) => ({
    id: tag.id,
    handle: tag.handle,
    title: tag.title,
  }));
  const defaultVariant =
    rawProduct.variants.edges.find(({ node }) => node.isDefault)?.node ??
    rawProduct.variants.edges[0]?.node;
  const groups = transformGroups(defaultVariant);
  return {
    id: rawProduct.id,
    title: rawProduct.title,
    handle: rawProduct.handle,
    description: rawProduct.description?.text ?? null,
    excerpt: rawProduct.excerpt?.text ?? null,
    options,
    category: rawProduct.category
      ? {
          id: rawProduct.category.id,
          title: rawProduct.category.title,
          handle: rawProduct.category.handle,
          breadcrumbs: (rawProduct.category.breadcrumbs ?? []).map((b) => ({
            id: b.id,
            title: b.title,
            handle: b.handle,
          })),
        }
      : null,
    variants,
    tags,
    features: rawProduct.features.map((feature) => ({
      id: feature.id,
      handle: feature.handle,
      title: feature.title,
      values: feature.values.map((value) => ({
        id: value.id,
        handle: value.handle,
        title: value.title,
      })),
    })),
    groups,
    seoTitle: rawProduct.seo.title,
    seoDescription: rawProduct.seo.description,
    createdAt: rawProduct.createdAt,
    updatedAt: rawProduct.updatedAt,
    rating: rawProduct.rating
      ? {
          id: rawProduct.id,
          count: rawProduct.rating.count,
          rating: rawProduct.rating.rating,
          breakdown: [
            rawProduct.rating.breakdown.rating1Count,
            rawProduct.rating.breakdown.rating2Count,
            rawProduct.rating.breakdown.rating3Count,
            rawProduct.rating.breakdown.rating4Count,
            rawProduct.rating.breakdown.rating5Count,
          ].map((count, index) => ({
            star: index + 1,
            count,
            percentage:
              rawProduct.rating.count > 0
                ? (count / rawProduct.rating.count) * 100
                : 0,
          })),
        }
      : null,
  };
}
function transformQueryData(data: SdkProductQuery): ProductTemplateData {
  return {
    pageType: 'product',
    raw: data,
    product: transformProduct(data.product),
  };
}
export function ProductDataProvider({
  children,
  preloadedQuery,
}: ProductDataProviderProps) {
  const rawData = preloadedQuery.data;
  const data = useMemo(() => transformQueryData(rawData), [rawData]);
  return (
    <ProductDataContext.Provider value={{ data }}>
      {children}
    </ProductDataContext.Provider>
  );
}
