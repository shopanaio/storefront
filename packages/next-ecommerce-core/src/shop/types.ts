/**
 * Shop configuration types for the e-commerce framework
 * These types define the global shop configuration, similar to Shopify's shop object
 * @module core/shop/types
 */

/**
 * Locale configuration for internationalization
 */
export interface Locale {
  /** ISO 639-1 language code (e.g., 'en', 'uk', 'ru') */
  code: string;
  /** Human-readable language name (e.g., 'English', 'Українська') */
  name: string;
  /** Text direction for the locale */
  direction: 'ltr' | 'rtl';
}

/**
 * Currency configuration for money formatting
 */
export interface Currency {
  /** ISO 4217 currency code (e.g., 'USD', 'UAH', 'EUR') */
  code: string;
  /** Currency symbol (e.g., '$', '₴', '€') */
  symbol: string;
  /** Position of the symbol relative to the amount */
  symbolPosition: 'before' | 'after';
  /** Decimal separator character */
  decimalSeparator: string;
  /** Thousands separator character */
  thousandsSeparator: string;
  /** Number of decimal places to display */
  decimals: number;
}

/**
 * Money formatting configuration combining currency and locale
 */
export interface MoneyFormat {
  currency: Currency;
  locale: Locale;
}

/**
 * Available features that can be enabled/disabled in the shop
 */
export interface ShopFeatures {
  /** Enable shopping cart functionality */
  cart: boolean;
  /** Enable wishlist/favorites functionality */
  wishlist: boolean;
  /** Enable product reviews and ratings */
  reviews: boolean;
  /** Enable product comparison functionality */
  compareProducts: boolean;
  /** Enable gift cards */
  giftCards: boolean;
  /** Enable subscription/recurring orders */
  subscriptions: boolean;
  /** Enable multi-currency support */
  multiCurrency: boolean;
  /** Enable inventory tracking */
  inventory: boolean;
}

/**
 * SEO metadata configuration
 */
export interface ShopSEO {
  /** Default page title */
  title: string;
  /** Default meta description */
  description: string;
  /** Default meta keywords */
  keywords?: string[];
  /** Default Open Graph image URL */
  ogImage?: string;
}

/**
 * Social media links configuration
 */
export interface ShopSocial {
  /** Facebook page URL */
  facebook?: string;
  /** Instagram profile URL */
  instagram?: string;
  /** Twitter/X profile URL */
  twitter?: string;
  /** YouTube channel URL */
  youtube?: string;
  /** TikTok profile URL */
  tiktok?: string;
  /** LinkedIn company URL */
  linkedin?: string;
}

/**
 * Physical address configuration
 */
export interface ShopAddress {
  /** Street address */
  street: string;
  /** City */
  city: string;
  /** State/province (optional) */
  state?: string;
  /** Country */
  country: string;
  /** Postal/ZIP code */
  zipCode: string;
}

/**
 * Main shop configuration object
 * This is the global configuration for the entire e-commerce application
 */
export interface ShopConfig {
  // Basic information
  /** Shop name */
  name: string;
  /** Shop domain (e.g., 'example.com') */
  domain: string;
  /** Contact email address */
  email: string;
  /** Contact phone number (optional) */
  phone?: string;

  // Localization
  /** Current active locale */
  locale: Locale;
  /** All available locales for the shop */
  availableLocales: Locale[];
  /** Current active currency */
  currency: Currency;
  /** All available currencies for the shop */
  availableCurrencies: Currency[];
  /** Timezone (IANA timezone identifier, e.g., 'Europe/Kyiv') */
  timezone: string;

  // Display settings
  /** Money formatting configuration */
  moneyFormat: MoneyFormat;
  /** Date format pattern (e.g., 'DD/MM/YYYY' or 'MM/DD/YYYY') */
  dateFormat: string;
  /** Default weight unit */
  weightUnit: 'kg' | 'lb' | 'g' | 'oz';
  /** Measurement system */
  measurementUnit: 'metric' | 'imperial';

  // Features
  /** Enabled/disabled features */
  features: ShopFeatures;

  // SEO and metadata
  /** SEO configuration (optional) */
  seo?: ShopSEO;

  // Social media
  /** Social media links (optional) */
  social?: ShopSocial;

  // Address
  /** Physical address (optional) */
  address?: ShopAddress;

  // Additional settings
  /** Custom metadata for extending configuration */
  metadata?: Record<string, any>;
}

/**
 * Helper type for weight units
 */
export type WeightUnit = ShopConfig['weightUnit'];

/**
 * Helper type for measurement units
 */
export type MeasurementUnit = ShopConfig['measurementUnit'];
