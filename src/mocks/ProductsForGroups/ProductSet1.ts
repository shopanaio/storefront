import { ApiProduct, CurrencyCode, LocaleCode, MediaSource } from "@codegen/schema-client";
import { mockOrder } from "../order";
import { mockCategory } from "../category";

export const mockSet1: ApiProduct = {
  __typename: 'Product',
  title: 'Карта по вселенной Ведьмака',
  handle: 'witcher-map-1',
  id: "product-id-set-1",
  iid: 'product-uuid-set-1',
  cover: {
    __typename: "File",
    id: "file-1",
    iid: "uuid-file-1",
    source: MediaSource.Url,
    url: "https://kashalot.gift/image/cachewebp/catalog/Witcher-2022/witcher-map-2022-1500x1500.webp",
  },
  averageRating: 5,
  breadcrumbs: [mockCategory],
  categories: [mockCategory],
  compareAtPrice: {
    amount: 15,
    currencyCode: CurrencyCode.Usd,
  },

  description: 'Карта по вселенной Ведьмака, на стилизованной крафтовой бумаге, формата А3.',
  excerpt: 'Capture professional-grade photos with its advanced camera system, and enjoy the latest features with Samsung’s intuitive One UI. Ideal for work',
  features: [{
    __typename: 'ProductFeatureSection',
    features: [{
      __typename: 'ProductFeature',
      handle: 'model',
      id: 'specification-id-1',
      iid: 'specification-uuid-1',
      title: "Model",
      values: [{
        __typename: 'ProductFeatureValue',
        handle: 'WRF345C',
        id: 'id-1',
        iid: 'uuid-1',
        title: "WRF345C",
      }],
    }, {
      __typename: 'ProductFeature',
      handle: 'dimensials',
      id: 'specification-id-2',
      iid: 'specification-uuid-2',
      title: "Dimensials",
      values: [{
        __typename: 'ProductFeatureValue',
        handle: '21mm*13mm*55mm',
        id: 'id-2',
        iid: 'uuid-2',
        title: "21mm*13mm*55mm",
      }],
    }, {
      __typename: 'ProductFeature',
      handle: 'driver',
      id: 'specification-id-3',
      iid: 'specification-uuid-3',
      title: "Driver",
      values: [{
        __typename: 'ProductFeatureValue',
        handle: 'DriverDriver Driver',
        id: 'id-3',
        iid: 'uuid-3',
        title: "DriverDriver Driver",
      }],
    }, {
      __typename: 'ProductFeature',
      handle: 'weight',
      id: 'specification-id-4',
      iid: 'specification-uuid-4',
      title: "Weight",
      values: [{
        __typename: 'ProductFeatureValue',
        handle: '200g',
        id: 'id-4',
        iid: 'uuid-4',
        title: "200g",
      }],
    }, {
      __typename: 'ProductFeature',
      handle: 'material',
      id: 'specification-id-5',
      iid: 'specification-uuid-5',
      title: "Material",
      values: [{
        __typename: 'ProductFeatureValue',
        handle: 'alluminium',
        id: 'id-5',
        iid: 'uuid-5',
        title: "Alluminium",
      }],
    }],
    id: 'witcher-box-feature-id-1',
    iid: 'witcher-box-feature-uuid-1',
    title: 'Specification',
  }],

  gallery: {
    __typename: 'GalleryConnection',
    edges: [{
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-1',
        iid: 'gallery-uuid-1',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher-2022/witcher-premium-2022-600x600.webp",
      },
    }],
    pageInfo: {
      __typename: 'PageInfo',
      endCursor: '',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '',
    },
    totalCount: 1,
  },
  /** Groups of related products (e.g., bundles). */
  groups: [],
  options: [],

  price: {
    amount: 10,
    currencyCode: CurrencyCode.Usd,
  },
  productType: 'gift',
  rating: 5.0,
  ratingCount: 645,
  ratings: {
    __typename: 'ProductRatingConnection',
    edges: [{
      __typename: 'ProductRatingEdge',
      cursor: 'rating-cursor-1',
      node: {
        __typename: 'ProductRating',
        comment: "I’ve been using this product for about two weeks now, and overall, I’m impressed. The build quality feels premium, and the performance is snappy. I deducted one star because the instructions were a bit unclear, but once I figured it out, it worked like a charm.",
        createdAt: new Date().toISOString(),
        id: "globally-rating-id-1",
        rating: 5,
        user: {
          __typename: 'User',
          email: 'example@io.com',
          id: 'user-id-1',
          iid: 'user-uuid-1',
          isVerified: true,
          language: LocaleCode.En,
          name: {
            __typename: 'UserName',
            first: "Gomer",
            last: "Simpson",
            middle: "J.",
          },
          orders: {
            __typename: 'OrderConnection',
            edges: [{
              __typename: 'OrderEdge',
              cursor: 'gomers-order-1',
              node: mockOrder,
            }],
            pageInfo: {
              __typename: 'PageInfo',
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
            totalCount: 1,
          },
          phone: '+19991111111'
        },
      },
    }],
    pageInfo: {
      __typename: 'PageInfo',
      endCursor: '',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '',
    },
    totalCount: 1,
  },
  seoDescription: '',
  seoTitle: '',

  sku: '2761140',
  stockStatus: {
    __typename: 'StockStatus',
    handle: "IN_STOCK",
    isAvailable: true,
  },
  tags: [{
    __typename: 'Tag',
    handle: 'witcher',
    id: 'id-tag-1',
    iid: 'uuid-tag-1',
    title: "Witcher",
  }],
  variants: [],

}
