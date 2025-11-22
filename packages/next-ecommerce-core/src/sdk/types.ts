import type { Entity } from '@shopana/entity';

// Re-export entity types for backwards compatibility
export type ProductEntity = Entity.Product;
export type CollectionEntity = Entity.Category;
export type CartEntity = Entity.Cart;

// PageEntity doesn't have a direct equivalent in @shopana/entity
// Keep a simple version for now
export interface PageEntity {
  id: string;
  handle: string;
  title: string;
  body?: string;
}

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
