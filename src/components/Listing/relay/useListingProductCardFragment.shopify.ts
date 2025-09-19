import { ApiProduct } from "@codegen/schema-client";
import { useListingProductCardFragment_product$key } from "@src/components/Listing/relay/__generated__/useListingProductCardFragment_product.graphql";
import { graphql, useFragment } from "react-relay";

export const UseProductCardFragment = graphql`
  fragment useListingProductCardFragment_product on Product {
    id
    title
    handle
    description
    availableForSale

    images(first: 10) {
      edges {
        cursor
        node {
          id
          url
          src
          originalSrc
          transformedSrc
          altText
          width
          height
          thumbhash
        }
      }
    }

    featuredImage {
      id
      url
      altText
    }

    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }

    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }

    variants(first: 10) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

const useListingProductCardFragment = (
  ref: useListingProductCardFragment_product$key
) => {
  const productData = useFragment(UseProductCardFragment, ref);

  const transformedProduct: ApiProduct = {
    id: productData.id,
    title: productData.title,
    handle: productData.handle,
    description: productData.description || "",
    cover: productData.featuredImage
      ? {
        id: productData.featuredImage.id || "",
        iid: "", // Shopify doesn't provide iid, use empty string
        source: "URL" as const,
        url: productData.featuredImage.url,
      }
      : null,
    price: {
      amount: parseFloat(productData.priceRange.minVariantPrice.amount),
      currencyCode: productData.priceRange.minVariantPrice.currencyCode as "USD" | "EUR" | "GBP" | "UAH",
    },
    compareAtPrice: productData.compareAtPriceRange?.minVariantPrice
      ? {
        amount: parseFloat(
          productData.compareAtPriceRange.minVariantPrice.amount
        ),
        currencyCode: productData.compareAtPriceRange.minVariantPrice
          .currencyCode as "USD" | "EUR" | "GBP" | "UAH",
      }
      : null,
    stockStatus: {
      handle: "available",
      isAvailable: productData.availableForSale,
    },
    rating: {
      id: productData.id,
      iid: "", // Shopify doesn't provide iid
      rating: 0,
      count: 0,
      breakdown: [], // Empty array for breakdown
    },
    options: [],
    variants: productData.variants.edges.map((edge) => ({
      id: edge.node.id,
      iid: "", // Shopify doesn't provide iid
      title: edge.node.title,
      handle: edge.node.id, // Add required handle field
      price: {
        amount: parseFloat(edge.node.price.amount),
        currencyCode: edge.node.price.currencyCode as "USD" | "EUR" | "GBP" | "UAH",
      },
      compareAtPrice: edge.node.compareAtPrice
        ? {
          amount: parseFloat(edge.node.compareAtPrice.amount),
          currencyCode: edge.node.compareAtPrice.currencyCode as "USD" | "EUR" | "GBP" | "UAH",
        }
        : null,
      availableForSale: edge.node.availableForSale,
      selectedOptions: edge.node.selectedOptions.map((option) => ({
        name: option.name,
        value: option.value,
      })),
      // Add required fields for ApiProduct
      categories: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
      containerId: "",
      createdAt: new Date().toISOString(),
      description: "",
      excerpt: "",
      features: [],
      gallery: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
      groups: [],
      options: [],
      rating: { id: edge.node.id, iid: "", rating: 0, count: 0, breakdown: [] },
      reviews: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
      seoDescription: null,
      seoTitle: null,
      sku: null,
      stockStatus: {
        handle: "available",
        isAvailable: edge.node.availableForSale,
      },
      tags: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      },
      updatedAt: new Date().toISOString(),
      variants: [],
    })),
    // Add required fields for ApiProduct
    categories: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    },
    containerId: "",
    createdAt: new Date().toISOString(),
    excerpt: "",
    features: [],
    gallery: {
      edges: productData.images.edges.map((edge) => ({
        cursor: edge.cursor,
        node: {
          id: edge.node.id || "",
          iid: "", // Shopify doesn't provide iid
          source: "URL" as const, // Use MediaSource.URL
          url: edge.node.url || edge.node.originalSrc || edge.node.src || "",
        },
      })),
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: productData.images.edges.length,
    },
    groups: [],
    selectedOptions: [],
    seoDescription: null,
    seoTitle: null,
    sku: null,
    updatedAt: new Date().toISOString(),
  };

  return transformedProduct;
};

export default useListingProductCardFragment;
