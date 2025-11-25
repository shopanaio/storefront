import type { model } from "@shopana/storefront-sdk";
import { CurrencyCode } from '@codegen/schema-client';
import type { ProductQuery$data } from '@src/hooks/product/ProductQuery/__generated__/ProductQuery.graphql';

type ApiProduct = NonNullable<ProductQuery$data['product']>;
type ApiVariant = NonNullable<ApiProduct['variants']>[number];

/**
 * Maps API product variant to domain ProductVariant
 */
function mapApiVariantToVariant(apiVariant: ApiVariant): model.ProductVariant {
  return {
    __typename: 'ProductVariant',
    id: apiVariant.id,
    iid: apiVariant.id, // API doesn't have iid, using id
    handle: apiVariant.handle,
    title: apiVariant.title,
    description: '', // Variants don't have description in current schema
    excerpt: '', // Variants don't have excerpt in current schema
    selectedOptions: [...(apiVariant.selectedOptions || [])],
    price: {
      amount: apiVariant.price?.amount || 0,
      currencyCode: (apiVariant.price?.currencyCode || 'USD') as CurrencyCode,
    },
    compareAtPrice: apiVariant.compareAtPrice
      ? {
          amount: apiVariant.compareAtPrice.amount,
          currencyCode: apiVariant.compareAtPrice.currencyCode as CurrencyCode,
        }
      : null,
    cover: apiVariant.cover
      ? {
          id: apiVariant.cover.id,
          url: apiVariant.cover.url,
        }
      : null,
    gallery: apiVariant.gallery
      ? {
          edges: (apiVariant.gallery.edges || []).map((edge) => ({
            node: {
              id: edge.node.id,
              url: edge.node.url,
            },
            cursor: '', // Not provided in current schema
          })),
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
          totalCount: (apiVariant.gallery.edges || []).length,
        }
      : undefined,
    sku: apiVariant.sku || null,
    stockStatus: {
      isAvailable: apiVariant.stockStatus?.isAvailable || false,
    },
    createdAt: '', // Not provided in current schema
    updatedAt: '', // Not provided in current schema
  };
}

/**
 * Maps API product to domain Product
 *
 * @param apiProduct - Product data from GraphQL API
 * @returns Domain Product model
 */
export function mapApiProductToProduct(apiProduct: ApiProduct | null): model.Product | null {
  if (!apiProduct) {
    return null;
  }

  return {
    __typename: 'Product',
    id: apiProduct.id,
    iid: apiProduct.id, // API doesn't have iid, using id
    handle: apiProduct.handle,
    title: apiProduct.title,
    description: apiProduct.description || '',
    excerpt: apiProduct.excerpt || '',
    category: apiProduct.category
      ? {
          id: apiProduct.category.id,
          title: apiProduct.category.title,
          handle: apiProduct.category.handle,
          breadcrumbs: (apiProduct.category.breadcrumbs || []).map((bc) => ({
            id: bc.id,
            title: bc.title,
            handle: bc.handle,
          })),
        }
      : null,
    options: (apiProduct.options || []).map((option) => ({
      id: option.id,
      handle: option.handle,
      title: option.title,
      displayType: option.displayType,
      values: option.values.map((value) => ({
        id: value.id,
        title: value.title,
        handle: value.handle,
        swatch: value.swatch
          ? {
              id: value.swatch.id,
              color: value.swatch.color,
              displayType: value.swatch.displayType,
              image: value.swatch.image
                ? {
                    id: value.swatch.image.id,
                    url: value.swatch.image.url,
                  }
                : null,
            }
          : null,
      })),
    })),
    groups: (apiProduct.groups || []).map((group) => ({
      id: group.id,
      title: group.title,
      isRequired: group.isRequired,
      isMultiple: group.isMultiple,
        items: group.items.map((item) => ({
        node: {
          id: item.node.id || '',
          title: item.node.title || '',
          handle: item.node.handle || '',
          price: {
            amount: item.node.price?.amount || 0,
            currencyCode: (item.node.price?.currencyCode || 'USD') as CurrencyCode,
          },
          cover: item.node.cover
            ? {
                id: item.node.cover.id,
                url: item.node.cover.url,
              }
            : null,
        },
        maxQuantity: item.maxQuantity || undefined,
        price: {
          amount: item.price?.amount
            ? {
                amount: item.price.amount.amount,
                currencyCode: item.price.amount.currencyCode as CurrencyCode,
              }
            : null,
          percentage: item.price?.percentage || null,
        },
      })),
    })),
    features: [], // Not loaded in current query, can be added later
    rating: {
      id: apiProduct.rating?.id || '',
      rating: apiProduct.rating?.rating || 0,
      count: apiProduct.rating?.count || 0,
      breakdown: (apiProduct.rating?.breakdown || []).map((b) => ({
        star: b.star,
        count: b.count,
        percentage: b.percentage,
      })),
    },
    tags: {
      edges: (apiProduct.tags?.edges || []).map((edge) => ({
        node: {
          id: edge.node.id,
          handle: edge.node.handle,
          title: edge.node.title,
        },
        cursor: '', // Not provided in current schema
      })),
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: (apiProduct.tags?.edges || []).length,
    },
    seoDescription: apiProduct.seoDescription || null,
    seoTitle: apiProduct.seoTitle || null,
    createdAt: apiProduct.createdAt || '',
    updatedAt: apiProduct.updatedAt || '',
    variants: (apiProduct.variants || []).map(mapApiVariantToVariant),
  };
}
