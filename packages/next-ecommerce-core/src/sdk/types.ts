import type {
  CartEntity,
  CollectionEntity,
  PageEntity,
  ProductEntity,
} from '../core/entities';

export interface HomePageData {
  featuredProducts: ProductEntity[];
  featuredCollections: CollectionEntity[];
}

export interface ProductPageData {
  product: ProductEntity;
  relatedProducts: ProductEntity[];
}

export interface CollectionPageData {
  collection: CollectionEntity;
  products: ProductEntity[];
}

export interface StaticPageData {
  page: PageEntity;
}

export interface CartPageData {
  cart: CartEntity;
}

export interface PageDataMap {
  home: HomePageData;
  product: ProductPageData;
  collection: CollectionPageData;
  page: StaticPageData;
  cart: CartPageData;
}
