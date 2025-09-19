import { ApiProduct, CurrencyCode, LocaleCode, MediaSource, ProductGroupPriceType, ProductOptionDisplayType, ReviewStatus } from "@codegen/schema-client";
import { mockOrder } from "./order";
import { mockCategory } from "./category";
import { mockProductCup1 } from "./ProductsForGroups/ProductCup1";
import { mockProductCup2 } from "./ProductsForGroups/ProductCup2";
import { mockProductBox1 } from "./ProductsForGroups/ProductBox1";
import { mockProductBox2 } from "./ProductsForGroups/ProductBox2";
import { mockProductBox3 } from "./ProductsForGroups/ProductBox3";
import { mockAdditional1 } from "./ProductsForGroups/Additional1";
import { mockAdditional2 } from "./ProductsForGroups/Additional2";
import { mockAdditional3 } from "./ProductsForGroups/Additional3";
import { mockAdditional5 } from "./ProductsForGroups/Additional5";
import { mockAdditional4 } from "./ProductsForGroups/Additional4";
import { mockSet1 } from "./ProductsForGroups/ProductSet1";
import { mockSet5 } from "./ProductsForGroups/ProductSet5";
import { mockSet3 } from "./ProductsForGroups/ProductSet3";
import { mockSet4 } from "./ProductsForGroups/ProductSet4";
import { mockSet2 } from "./ProductsForGroups/ProductSet2";
import { mockVariant1 } from "./ProductsForVariants/mockVariant1";
import { mockVariant2 } from "./ProductsForVariants/mockVariant2";
import { mockVariant3 } from "./ProductsForVariants/mockVariant3";
import { mockVariant4 } from "./ProductsForVariants/mockVariant4";
import { mockVariant5 } from "./ProductsForVariants/mockVariant5";
import { mockVariant6 } from "./ProductsForVariants/mockVariant6";
import { mockVariant7 } from "./ProductsForVariants/mockVariant7";
import { mockVariant8 } from "./ProductsForVariants/mockVariant8";
import { ProductPotion1 } from "./ProductsForGroups/ProductPotion1";
import { ProductPotion3 } from "./ProductsForGroups/ProductPotion3";
import { ProductPotion2 } from "./ProductsForGroups/ProductPotion2";
//import { mockColorVariant1 } from "./ProductsForVariants/mockColorVariant1";

export const mockProduct: ApiProduct = {
  __typename: 'Product',
  averageRating: 5,
  breadcrumbs: [mockCategory],
  /* categories: [mockCategory], */
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
    title: "Ведьмачье зелье",
    id: 'group-id-3',
    iid: 'group-uuid-3',
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
      product: ProductPotion1,
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
      product: ProductPotion2,
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
      product: ProductPotion3,
    },],
  }, {
    __typename: 'ProductGroup',
    title: "Желаете расширить набор?",
    id: 'group-id-4',
    iid: 'group-uuid-4',
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
      product: mockSet1,
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
      product: mockSet2,
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
      product: mockSet3,
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
      product: mockSet4,
    }],
  }, {
    __typename: 'ProductGroup',
    title: "Set",
    id: 'group-id-9',
    iid: 'group-uuid-9',
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
  handle: 'main-product',
  id: "product-id-1",
  iid: 'product-uuid-1',
  options: [/* {
    __typename: 'ProductOption',
    handle: 'color',
    id: 'witcher-box-color',
    iid: 'witcher-box-color',
    title: 'Color',
    value: {
      __typename: 'ProductOptionValue',
      title: "Чорна кров",
      handle: 'black-blood',
      id: 'witcher-box-color-1',
      iid: 'witcher-box-color-1',
      style: {
        __typename: 'ProductOptionColor',
        type: ProductOptionDisplayType.ColorSwatch,
        color: "black"
      },
    },
  }, */ {
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
        title: "S",
        handle: 's',
        id: 'witcher-box-size-1',
        iid: 'witcher-box-size-1',
        style: {
          __typename: 'ProductOptionSize',
          type: ProductOptionDisplayType.SizeControl,
        },
      },
    }],

  price: {
    amount: 100,
    currencyCode: CurrencyCode.Usd,
  },
  productType: 'gift',
  rating: {
    __typename: 'ProductRating',
    /** Rating breakdown details. */
    breakdown: [{
      __typename: 'RatingBreakdown',
      count: 0,
      percentage: 0,
      star: 1,
    }, {
      __typename: 'RatingBreakdown',
      count: 0,
      percentage: 0,
      star: 2,
    }, {
      __typename: 'RatingBreakdown',
      count: 0,
      percentage: 0,
      star: 3,
    }, {
      __typename: 'RatingBreakdown',
      count: 3,
      percentage: 50,
      star: 4,
    }, {
      __typename: 'RatingBreakdown',
      count: 3,
      percentage: 50,
      star: 5,
    }],
    count: 6,
    id: "rating-id-1",
    iid: "rating-iid-1",
    rating: 4.5
  },
  reviews: {
    __typename: 'ProductReviewConnection',
    edges: [{
      __typename: 'ProductReviewEdge',
      cursor: 'rating-cursor-1',
      node: {
        __typename: 'ProductReview',
        id: 'globally-rating-id-1',
        iid: 'uuid-review-1',
        status: ReviewStatus.Approved,
        rating: 5,
        title: 'Great device but needs better instructions',
        message: 'The product works well, but it came with a slight cosmetic defect. The product works well, but it came with a slight cosmetic defect. The product works well, but it came with a slight cosmetic defect. The product works well, but it came with a slight cosmetic defect. The product works well, but it came with a slight cosmetic defect. The product works well, but it came with a slight cosmetic defect.',
        pros: 'Premium build, snappy performance',
        cons: 'Unclear instructions',
        createdAt: new Date('2025-07-01T10:00:00Z').toISOString(),
        editedAt: null,
        helpfulYes: 12,
        helpfulNo: 2,
        meHelpful: false,
        verifiedPurchase: true,
        media: [],
        sellerReply: {
          __typename: 'ReviewComment',
          id: 'reply-id-1',
          createdAt: new Date('2025-07-02T12:00:00Z').toISOString(),
          editedAt: null,
          message: 'Thank you for your feedback! We’ll work on improving the instructions.',
          author: {
            __typename: 'User',
            email: 'support@shop.com',
            id: 'admin-user-id-1',
            iid: 'admin-user-uuid-1',
            isVerified: true,
            language: LocaleCode.En,
            name: {
              __typename: 'UserName',
              first: 'Support',
              last: 'Team'
            },
            phone: null,
            orders: {
              __typename: 'OrderConnection',
              edges: [],
              pageInfo: {
                __typename: 'PageInfo',
                endCursor: null,
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: null,
              },
              totalCount: 0,
            },
          },
        },
        user: {
          __typename: 'User',
          email: 'gomer.simpson@example.com',
          id: 'user-id-1',
          iid: 'user-uuid-1',
          isVerified: true,
          language: LocaleCode.En,
          name: {
            __typename: 'UserName',
            first: 'Gomer',
            middle: 'J.',
            last: 'Simpson',
          },
          phone: '+19991111111',
          orders: {
            __typename: 'OrderConnection',
            edges: [
              {
                __typename: 'OrderEdge',
                cursor: 'gomers-order-1',
                node: mockOrder,
              },
            ],
            pageInfo: {
              __typename: 'PageInfo',
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
            totalCount: 1,
          },
        },
      },
    }, {
      __typename: 'ProductReviewEdge',
      cursor: 'rating-cursor-2',
      node: {
        __typename: 'ProductReview',
        id: 'globally-rating-id-2',
        iid: 'uuid-review-2',
        status: ReviewStatus.Approved,
        rating: 5,
        title: 'Absolutely worth it!',
        message: 'This is by far the best product I’ve bought this year. Solid build, easy to use.',
        pros: 'Excellent quality, fast delivery',
        cons: 'Packaging could be better',
        createdAt: new Date('2025-07-02T15:20:00Z').toISOString(),
        editedAt: null,
        locale: 'en',
        helpfulYes: 8,
        helpfulNo: 0,
        meHelpful: true,
        verifiedPurchase: true,
        media: [],
        sellerReply: null,
        user: {
          __typename: 'User',
          email: 'maria.ivanova@example.com',
          id: 'user-id-2',
          iid: 'user-uuid-2',
          isVerified: true,
          language: LocaleCode.En,
          name: {
            __typename: 'UserName',
            first: 'Maria',
            last: 'Ivanova',
          },
          phone: '+380501112233',
          orders: {
            __typename: 'OrderConnection',
            edges: [
              {
                __typename: 'OrderEdge',
                cursor: 'marias-order-1',
                node: mockOrder,
              },
            ],
            pageInfo: {
              __typename: 'PageInfo',
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
            totalCount: 1,
          },
        },
      },
    },
    {
      __typename: 'ProductReviewEdge',
      cursor: 'rating-cursor-3',
      node: {
        __typename: 'ProductReview',
        id: 'globally-rating-id-3',
        iid: 'uuid-review-3',
        status: ReviewStatus.Approved,
        rating: 5,
        title: 'Top-notch performance',
        message: 'Works perfectly and exceeded my expectations. Highly recommended!',
        pros: 'Fast, reliable, stylish design',
        cons: null,
        createdAt: new Date('2025-07-03T08:10:00Z').toISOString(),
        editedAt: null,
        locale: 'en',
        helpfulYes: 20,
        helpfulNo: 1,
        meHelpful: false,
        verifiedPurchase: false,
        media: [],
        sellerReply: null,
        user: {
          __typename: 'User',
          email: 'hiro.t@example.com',
          id: 'user-id-3',
          iid: 'user-uuid-3',
          isVerified: true,
          language: LocaleCode.En,
          name: {
            __typename: 'UserName',
            first: 'Hiro',
            last: 'Tanaka',
          },
          phone: '+81312345678',
          orders: {
            __typename: 'OrderConnection',
            edges: [
              {
                __typename: 'OrderEdge',
                cursor: 'hiro-order-1',
                node: mockOrder,
              },
            ],
            pageInfo: {
              __typename: 'PageInfo',
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
            totalCount: 1,
          },
        },
      },
    },
    {
      __typename: 'ProductReviewEdge',
      cursor: 'rating-cursor-4',
      node: {
        __typename: 'ProductReview',
        id: 'globally-rating-id-4',
        iid: 'uuid-review-4',
        status: ReviewStatus.Approved,
        rating: 4,
        title: 'Good value for money',
        message: 'Solid product overall, just missing some features I expected.',
        pros: 'Affordable, works as described',
        cons: 'No manual included',
        createdAt: new Date('2025-07-04T12:45:00Z').toISOString(),
        editedAt: null,
        locale: 'en',
        helpfulYes: 5,
        helpfulNo: 2,
        meHelpful: false,
        verifiedPurchase: true,
        media: [],
        sellerReply: null,
        user: {
          __typename: 'User',
          email: 'jean.dupont@example.com',
          id: 'user-id-4',
          iid: 'user-uuid-4',
          isVerified: true,
          language: LocaleCode.En,
          name: {
            __typename: 'UserName',
            first: 'Jean',
            last: 'Dupont',
          },
          phone: '+33123456789',
          orders: {
            __typename: 'OrderConnection',
            edges: [
              {
                __typename: 'OrderEdge',
                cursor: 'jeans-order-1',
                node: mockOrder,
              },
            ],
            pageInfo: {
              __typename: 'PageInfo',
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
            totalCount: 1,
          },
        },
      },
    },
    {
      __typename: 'ProductReviewEdge',
      cursor: 'rating-cursor-5',
      node: {
        __typename: 'ProductReview',
        id: 'globally-rating-id-5',
        iid: 'uuid-review-5',
        status: ReviewStatus.Approved,
        rating: 4,
        title: 'Almost perfect',
        message: 'The product works well, but it came with a slight cosmetic defect.',
        pros: 'Fast shipping, does the job',
        cons: 'Scratch on the surface',
        createdAt: new Date('2025-07-05T09:30:00Z').toISOString(),
        editedAt: null,
        locale: 'en',
        helpfulYes: 3,
        helpfulNo: 0,
        meHelpful: true,
        verifiedPurchase: false,
        media: [],
        sellerReply: null,
        user: {
          __typename: 'User',
          email: 'amina.yusuf@example.com',
          id: 'user-id-5',
          iid: 'user-uuid-5',
          isVerified: true,
          language: LocaleCode.En,
          name: {
            __typename: 'UserName',
            first: 'Amina',
            last: 'Yusuf',
          },
          phone: '+2347012345678',
          orders: {
            __typename: 'OrderConnection',
            edges: [
              {
                __typename: 'OrderEdge',
                cursor: 'amina-order-1',
                node: mockOrder,
              },
            ],
            pageInfo: {
              __typename: 'PageInfo',
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
            totalCount: 1,
          },
        },
      },
    }, {
      __typename: 'ProductReviewEdge',
      cursor: 'rating-cursor-6',
      node: {
        __typename: 'ProductReview',
        id: 'globally-rating-id-6',
        iid: 'uuid-review-6',
        status: ReviewStatus.Approved,
        rating: 4,
        title: 'Decent product, minor flaws',
        message: 'It performs as expected, but the initial setup took more time than it should.',
        pros: 'Durable, does what it promises',
        cons: 'Complicated setup process',
        createdAt: new Date('2025-07-06T14:05:00Z').toISOString(),
        editedAt: null,
        locale: 'en',
        helpfulYes: 6,
        helpfulNo: 1,
        meHelpful: false,
        verifiedPurchase: true,
        media: [],
        sellerReply: null,
        user: {
          __typename: 'User',
          email: 'liam.oconnor@example.com',
          id: 'user-id-6',
          iid: 'user-uuid-6',
          isVerified: true,
          language: LocaleCode.En,
          name: {
            __typename: 'UserName',
            first: 'Liam',
            last: "O'Connor",
          },
          phone: '+353851234567',
          orders: {
            __typename: 'OrderConnection',
            edges: [
              {
                __typename: 'OrderEdge',
                cursor: 'liam-order-1',
                node: mockOrder,
              },
            ],
            pageInfo: {
              __typename: 'PageInfo',
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
            totalCount: 1,
          },
        },
      },
    }
    ],
    pageInfo: {
      __typename: 'PageInfo',
      endCursor: '',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '',
    },
    totalCount: 6,
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
  }, {
    __typename: 'Tag',
    handle: 'gerald',
    id: 'id-tag-2',
    iid: 'uuid-tag-2',
    title: "Gerald",
  }],
  title: 'Бокс Ведьмак 2.0 | Witcher |║ Подарочный набор в стиле Ведьмака',
  variants: [],
}

const allVariants = [
  //mockColorVariant1,
  mockProduct,
  mockVariant1,
  mockVariant2,
  mockVariant3,
  mockVariant4,
  mockVariant5,
  mockVariant6,
  mockVariant7,
  mockVariant8,
];

mockProduct.variants = allVariants;
mockVariant1.variants = allVariants;
mockVariant2.variants = allVariants;
mockVariant3.variants = allVariants;
mockVariant4.variants = allVariants;
mockVariant5.variants = allVariants;
mockVariant6.variants = allVariants;
mockVariant7.variants = allVariants;
mockVariant8.variants = allVariants;
