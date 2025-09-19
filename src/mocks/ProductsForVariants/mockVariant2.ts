import { ApiProduct, CurrencyCode, LocaleCode, MediaSource, ProductGroupPriceType, ProductOptionDisplayType } from "@codegen/schema-client";
import { mockOrder } from "../order";
import { mockCategory } from "../category";
import { mockProductCup1 } from "../ProductsForGroups/ProductCup1";
import { mockProductCup2 } from "../ProductsForGroups/ProductCup2";
import { mockProductBox1 } from "../ProductsForGroups/ProductBox1";
import { mockProductBox2 } from "../ProductsForGroups/ProductBox2";
import { mockProductBox3 } from "../ProductsForGroups/ProductBox3";
import { mockAdditional1 } from "../ProductsForGroups/Additional1";
import { mockAdditional2 } from "../ProductsForGroups/Additional2";
import { mockAdditional3 } from "../ProductsForGroups/Additional3";
import { mockAdditional5 } from "../ProductsForGroups/Additional5";
import { mockAdditional4 } from "../ProductsForGroups/Additional4";
import { mockSet1 } from "../ProductsForGroups/ProductSet1";
import { mockSet2 } from "../ProductsForGroups/ProductSet2";
import { mockSet3 } from "../ProductsForGroups/ProductSet3";
import { mockSet4 } from "../ProductsForGroups/ProductSet4";
import { mockSet5 } from "../ProductsForGroups/ProductSet5";

export const mockVariant2: ApiProduct = {
  __typename: 'Product',
  handle: 'variant-2',
  title: 'Бокс Ведьмак 2.0 | Witcher |║ Подарочный набор в стиле Ведьмака',
  id: "variant-id-2",
  iid: 'variant-uuid-2',
  options: [{
    __typename: 'ProductOption',
    handle: 't-short',
    id: 'witcher-box-t-short',
    iid: 'witcher-box-t-short',
    title: 'T-short',
    value: {
      __typename: 'ProductOptionValue',
      title: "T-Short 1",
      handle: 't-shirt-1',
      id: 'witcher-box-t-short-1',
      iid: 'witcher-box-t-short-1',
      style: {
        __typename: 'ProductOptionImage',
        type: ProductOptionDisplayType.Image,
        image: {
          __typename: 'File',
          id: 't-short-uuid-1',
          iid: 't-short-uuid-1',
          source: MediaSource.Url,
          url: "https://kashalot.gift/image/cachewebp/catalog/Witcher/Futbolki_Witcher/2-600x600.webp",
        },
      },
    },
  }, {
    __typename: 'ProductOption',
    handle: 'size',
    id: 'witcher-box-size',
    iid: 'witcher-box-size',
    title: 'Size',
    value: {
      __typename: 'ProductOptionValue',
      title: "L",
      handle: 'l',
      id: 'witcher-box-size-3',
      iid: 'witcher-box-size-3',
      style: {
        __typename: 'ProductOptionSize',
        type: ProductOptionDisplayType.SizeControl,
      },
    },
  }],
  averageRating: 5,
  breadcrumbs: [mockCategory],
  categories: [mockCategory],
  compareAtPrice: {
    amount: 150,
    currencyCode: CurrencyCode.Usd,
  },
  cover: {
    __typename: "File",
    id: "file-1",
    iid: "uuid-file-1",
    source: MediaSource.Url,
    url: "https://kashalot.gift/image/cachewebp/catalog/Witcher-2022/witcher-premium-2022-600x600.webp",
  },
  description: 'Подарок фанату «Ведьмака», который переносит в любимый фэнтезийный мир.Подарок The Witcher, который дарит ощущение, что вы прикоснулись к вещам прямиком из этой вселенной.Подарок геймеру, с которым любой, даже самый сложный квест, будет пройдет быстрее и проще.И всё это про наш подарочный набор по «Ведьмаку» 2.0 – это золотая середина между доступностью, практичностью и универсальностью.Он подойдёт любому человеку, будь это ваша вторая половинка, друзья или коллеги.',
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
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-2',
        iid: 'gallery-uuid-2',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher-2022/bloknot-witcher-2022-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-3',
        iid: 'gallery-uuid-3',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher/witcher-new-cup-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-4',
        iid: 'gallery-uuid-4',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher-2022/witcher-map-2022-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-5',
        iid: 'gallery-uuid-5',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher-2022/checanaya-moneta-witcher-2022-1-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-6',
        iid: 'gallery-uuid-6',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher-2022/lastochka-2022-1-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-7',
        iid: 'gallery-uuid-7',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher/Tri_siropa_eliksira_Witcher/syrop-chorna-krov-2025-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-8',
        iid: 'gallery-uuid-8',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher/Tri_siropa_eliksira_Witcher/syrop-bila-chajka-2025-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-9',
        iid: 'gallery-uuid-9',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher/Tri_siropa_eliksira_Witcher/syrop-raffara-2025-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-10',
        iid: 'gallery-uuid-10',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher-2022/witcher-premium-2022-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-11',
        iid: 'gallery-uuid-11',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher-2022/bloknot-witcher-2022-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-12',
        iid: 'gallery-uuid-12',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher/witcher-new-cup-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-13',
        iid: 'gallery-uuid-13',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher-2022/witcher-map-2022-600x600.webp",
      },
    }, {
      __typename: 'GalleryEdge',
      cursor: '',
      node: {
        __typename: 'File',
        id: 'gallery-id-14',
        iid: 'gallery-uuid-14',
        source: MediaSource.Url,
        url: "https://kashalot.gift/image/cachewebp/catalog/Witcher-2022/checanaya-moneta-witcher-2022-1-600x600.webp",
      },
    },],
    pageInfo: {
      __typename: 'PageInfo',
      endCursor: '',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '',
    },
    totalCount: 14,
  },
  groups: [{
    __typename: 'ProductGroup',
    title: "Чашка в стиле ведьмака",
    id: 'group-id-1',
    iid: 'group-uuid-1',
    isMultiple: false,
    isRequired: true,
    items: [{
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockProductCup1,
    }, {
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockProductCup2,
    },],
  }, {
    __typename: 'ProductGroup',
    title: "Коробка",
    id: 'group-id-2',
    iid: 'group-uuid-2',
    isMultiple: false,
    isRequired: true,
    items: [{
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockProductBox1,
    }, {
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockProductBox2,
    }, {
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockProductBox3,
    }],
  }, {
    __typename: 'ProductGroup',
    title: "Желаете расширить набор?",
    id: 'group-id-3',
    iid: 'group-uuid-3',
    isMultiple: true,
    isRequired: false,
    items: [{
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockAdditional1,
    }, {
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockAdditional2,
    }, {
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockAdditional3,
    }, {
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockAdditional4,
    }, {
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockAdditional5,
    }],
  }, {
    __typename: 'ProductGroup',
    title: "Set",
    id: 'group-id-4',
    iid: 'group-uuid-4',
    isMultiple: false,
    isRequired: true,
    items: [{
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockSet1,
    }],
  }, {
    __typename: 'ProductGroup',
    title: "Set",
    id: 'group-id-5',
    iid: 'group-uuid-5',
    isMultiple: false,
    isRequired: true,
    items: [{
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockSet2,
    }],
  }, {
    __typename: 'ProductGroup',
    title: "Set",
    id: 'group-id-6',
    iid: 'group-uuid-6',
    isMultiple: false,
    isRequired: true,
    items: [{
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockSet3,
    }],
  }, {
    __typename: 'ProductGroup',
    title: "Set",
    id: 'group-id-7',
    iid: 'group-uuid-7',
    isMultiple: false,
    isRequired: true,
    items: [{
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockSet4,
    }],
  }, {
    __typename: 'ProductGroup',
    title: "Set",
    id: 'group-id-8',
    iid: 'group-uuid-8',
    isMultiple: false,
    isRequired: true,
    items: [{
      __typename: 'ProductGroupItem',
      maxQuantity: 999,
      price: {
        __typename: 'ProductGroupPrice',
        amount: {
          __typename: 'Money',
          amount: 10,
          currencyCode: CurrencyCode.Usd,
        },
        type: ProductGroupPriceType.Base,
      },
      product: mockSet5,
    }],
  }],


  price: {
    amount: 100,
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
    }, {
      __typename: 'ProductRatingEdge',
      cursor: 'rating-cursor-2',
      node: {
        __typename: 'ProductRating',
        comment: "I’ve been using this product for about two weeks now, and overall, I’m impressed. The build quality feels premium, and the performance is snappy. I deducted one star because the instructions were a bit unclear, but once I figured it out, it worked like a charm.",
        createdAt: new Date().toISOString(),
        id: "globally-rating-id-1",
        rating: 5,
        user: {
          __typename: 'User',
          email: 'example@io.com',
          id: 'user-id-2',
          iid: 'user-uuid-2',
          isVerified: true,
          language: LocaleCode.En,
          name: {
            __typename: 'UserName',
            first: "John",
            last: "Doe",
          },
          orders: {
            __typename: 'OrderConnection',
            edges: [{
              __typename: 'OrderEdge',
              cursor: 'johns-order-1',
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
          phone: '+19993333333'
        },
      },
    }, {
      __typename: 'ProductRatingEdge',
      cursor: 'rating-cursor-3',
      node: {
        __typename: 'ProductRating',
        comment: "I’ve been using this product for about two weeks now, and overall, I’m impressed. The build quality feels premium, and the performance is snappy. I deducted one star because the instructions were a bit unclear, but once I figured it out, it worked like a charm.",
        createdAt: new Date().toISOString(),
        id: "globally-rating-id-3",
        rating: 5,
        user: {
          __typename: 'User',
          email: 'example@io.com',
          id: 'user-id-3',
          iid: 'user-uuid-3',
          isVerified: true,
          language: LocaleCode.En,
          name: {
            __typename: 'UserName',
            first: "Jose",
            last: "Leos",
          },
          orders: {
            __typename: 'OrderConnection',
            edges: [{
              __typename: 'OrderEdge',
              cursor: 'joses-order-1',
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
          phone: '+19992222222'
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
    totalCount: 3,
  },
  seoDescription: '',
  seoTitle: '',

  sku: '2761140',
  stockStatus: {
    __typename: 'StockStatus',
    handle: "OUT_OF_STOCK",
    isAvailable: false,
  },
  tags: [{
    __typename: 'Tag',
    handle: 'witcher',
    id: 'id-tag-1',
    iid: 'uuid-tag-1',
    title: "Witcher",
  }, {
    __typename: 'Tag',
    handle: 'gerald',
    id: 'id-tag-2',
    iid: 'uuid-tag-2',
    title: "Gerald",
  }],
  variants: [],
}
