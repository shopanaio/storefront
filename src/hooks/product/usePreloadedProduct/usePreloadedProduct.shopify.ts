import ProductQuery from "@src/hooks/product/ProductQuery";
import { ProductQuery as ProductQueryType } from "@src/hooks/product/ProductQuery/__generated__/ProductQuery.graphql";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import type { Entity } from "@shopana/entity";

// Function for converting Shopify product to Shopana format
const transformShopifyToShopana = (shopifyProduct: ProductQueryType['product']): Entity.Product | null => {
  if (!shopifyProduct) return null;

  // Convert category
  const category: Entity.Category | null = shopifyProduct.category ? {
    id: shopifyProduct.category.id,
    iid: shopifyProduct.category.id as any, // Shopify doesn't have iid, use id
    title: shopifyProduct.category.name,
    handle: shopifyProduct.category.name.toLowerCase().replace(/\s+/g, '-'),
    description: '',
    excerpt: '',
    breadcrumbs: [], // Shopify doesn't provide breadcrumbs
    cover: null,
    gallery: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
        totalCount: 0
      },
      totalCount: 0
    },
    children: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
        totalCount: 0
      },
      totalCount: 0
    },
    listing: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
        totalCount: 0
      },
      totalCount: 0,
      filters: [],
      availabilitySortApplied: false,
      nestedCategoriesIncluded: false,
      sort: 'MOST_RELEVANT' as any
    },
    listingType: 'STANDARD' as any,
    seoDescription: null,
    seoTitle: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } : null;

  // Convert price
  const price: ApiMoney = {
    amount: shopifyProduct.priceRange.minVariantPrice.amount,
    currencyCode: shopifyProduct.priceRange.minVariantPrice.currencyCode as any
  };

  // Convert compareAtPrice
  const compareAtPrice: ApiMoney | null = shopifyProduct.compareAtPriceRange ? {
    amount: shopifyProduct.compareAtPriceRange.minVariantPrice.amount,
    currencyCode: shopifyProduct.compareAtPriceRange.minVariantPrice.currencyCode as any
  } : null;

  // Convert cover image
  const cover: ApiFile | null = shopifyProduct.featuredImage ? {
    id: shopifyProduct.featuredImage.id || '',
    iid: shopifyProduct.featuredImage.id || '' as any,
    url: shopifyProduct.featuredImage.url,
    source: 'URL' as any
  } : null;

  // Convert gallery
  const gallery: ApiGalleryConnection = {
    edges: shopifyProduct.images.edges.map(edge => ({
      cursor: edge.node.id || '',
      node: {
        id: edge.node.id || '',
        iid: edge.node.id || '' as any,
        url: edge.node.url,
        source: 'URL' as any
      }
    })),
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
      totalCount: shopifyProduct.images.edges.length
    },
    totalCount: shopifyProduct.images.edges.length
  };

  // Convert stock status
  const stockStatus: ApiStockStatus = {
    handle: shopifyProduct.availableForSale ? 'IN_STOCK' : 'OUT_OF_STOCK',
    isAvailable: shopifyProduct.availableForSale
  };

  // Convert tags
  const tags: ApiTagConnection = {
    edges: shopifyProduct.tags.map(tag => ({
      cursor: tag,
      node: {
        id: tag,
        iid: tag as any,
        handle: tag.toLowerCase().replace(/\s+/g, '-'),
        title: tag
      }
    })),
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
      totalCount: shopifyProduct.tags.length
    },
    totalCount: shopifyProduct.tags.length
  };

  // Convert options
  const options = shopifyProduct.options.map(option => ({
    id: option.id,
    iid: option.id as any,
    handle: option.name.toLowerCase().replace(/\s+/g, '-'),
    title: option.name,
    displayType: 'DROPDOWN' as any,
    values: option.values.map(value => ({
      id: value,
      iid: value as any,
      handle: value.toLowerCase().replace(/\s+/g, '-'),
      title: value,
      swatch: null
    }))
  }));

  // Convert variants
  const variants: ApiProduct[] = shopifyProduct.variants.edges.map(edge => ({
    id: edge.node.id,
    iid: edge.node.id as any,
    title: edge.node.title,
    handle: edge.node.title.toLowerCase().replace(/\s+/g, '-'),
    description: '',
    excerpt: '',
    cover: edge.node.image ? {
      id: edge.node.image.id || '',
      iid: edge.node.image.id || '' as any,
      url: edge.node.image.url,
      source: 'URL' as any
    } : null,
    price: {
      amount: edge.node.price.amount,
      currencyCode: edge.node.price.currencyCode as any
    },
    compareAtPrice: edge.node.compareAtPrice ? {
      amount: edge.node.compareAtPrice.amount,
      currencyCode: edge.node.compareAtPrice.currencyCode as any
    } : null,
    selectedOptions: edge.node.selectedOptions.map(opt => opt.value),
    categories: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
        totalCount: 0
      },
      totalCount: 0
    },
    category: null,
    containerId: '' as any,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    options: [],
    features: [],
    gallery: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
        totalCount: 0
      },
      totalCount: 0
    },
    groups: [],
    seoTitle: null,
    seoDescription: null,
    productType: null,
    rating: {
      id: '',
      iid: '' as any,
      count: 0,
      rating: 0,
      breakdown: []
    },
    reviews: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
        totalCount: 0
      },
      totalCount: 0
    },
    sku: null,
    stockStatus: {
      handle: 'IN_STOCK',
      isAvailable: true
    },
    variants: []
  }));

  // Create transformed product
  const transformedProduct: ApiProduct = {
    id: shopifyProduct.id,
    iid: shopifyProduct.id as any,
    title: shopifyProduct.title,
    handle: shopifyProduct.handle,
    description: shopifyProduct.description,
    excerpt: shopifyProduct.description.substring(0, 100) + '...',
    cover,
    gallery,
    price,
    compareAtPrice,
    category,
    categories: {
      edges: category ? [{
        cursor: category.id,
        node: category
      }] : [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
        totalCount: category ? 1 : 0
      },
      totalCount: category ? 1 : 0
    },
    containerId: '' as any,
    createdAt: shopifyProduct.createdAt,
    updatedAt: shopifyProduct.updatedAt,
    options,
    selectedOptions: [],
    features: [],
    groups: [],
    seoTitle: null,
    seoDescription: null,
    productType: shopifyProduct.productType || null,
    rating: {
      id: '',
      iid: '' as any,
      count: 0,
      rating: 0,
      breakdown: []
    },
    sku: null,
    stockStatus,
    tags,
    variants
  };

  return transformedProduct;
};

const usePreloadedProduct = (queryReference: PreloadedQuery<ProductQueryType>) => {
  const data = usePreloadedQuery<ProductQueryType>(
    ProductQuery,
    queryReference
  );

  const shopifyProduct = data?.product ?? null;

  // Convert Shopify product to Shopana format
  const transformedProduct = transformShopifyToShopana(shopifyProduct);

  return transformedProduct;
};

export default usePreloadedProduct;
