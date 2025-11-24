export interface Locale {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
}

export interface Currency {
  code: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalSeparator: string;
  thousandsSeparator: string;
  decimals: number;
}

export interface MoneyFormat {
  currency: Currency;
  locale: Locale;
}

export interface ShopFeatures {
  cart: boolean;
  wishlist: boolean;
  reviews: boolean;
  compareProducts: boolean;
  giftCards: boolean;
  subscriptions: boolean;
  multiCurrency: boolean;
  inventory: boolean;
}

export interface ShopSEO {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

export interface ShopSocial {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
}

export interface ShopAddress {
  street: string;
  city: string;
  state?: string;
  country: string;
  zipCode: string;
}

export interface ShopConfig {
  name: string;
  domain: string;
  email: string;
  phone?: string;
  locale: Locale;
  availableLocales: Locale[];
  currency: Currency;
  availableCurrencies: Currency[];
  timezone: string;
  moneyFormat: MoneyFormat;
  dateFormat: string;
  weightUnit: 'kg' | 'lb' | 'g' | 'oz';
  measurementUnit: 'metric' | 'imperial';
  features: ShopFeatures;
  seo?: ShopSEO;
  social?: ShopSocial;
  address?: ShopAddress;
  metadata?: Record<string, unknown>;
}

export type WeightUnit = ShopConfig['weightUnit'];

export type MeasurementUnit = ShopConfig['measurementUnit'];

