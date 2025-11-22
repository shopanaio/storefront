export interface MoneyRange {
  min: number;
  max: number;
  currencyCode: string;
}

export interface MediaImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ProductEntity {
  id: string;
  handle: string;
  title: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currencyCode: string;
  availableForSale: boolean;
  images: MediaImage[];
  tags?: string[];
}

export interface CollectionEntity {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: MediaImage;
}

export interface PageEntity {
  id: string;
  handle: string;
  title: string;
  body?: string;
}

export interface CartLineItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  currencyCode: string;
  productId: string;
}

export interface CartEntity {
  id: string;
  lines: CartLineItem[];
  subtotal: number;
  total: number;
  currencyCode: string;
}
