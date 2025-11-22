import type { ShopConfig, Locale, Currency } from './types';

/**
 * Mock locale configurations
 */
export const MOCK_LOCALES: Record<string, Locale> = {
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
  },
  uk: {
    code: 'uk',
    name: 'Українська',
    direction: 'ltr',
  },
  ru: {
    code: 'ru',
    name: 'Русский',
    direction: 'ltr',
  },
};

/**
 * Mock currency configurations
 */
export const MOCK_CURRENCIES: Record<string, Currency> = {
  USD: {
    code: 'USD',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
  UAH: {
    code: 'UAH',
    symbol: '₴',
    symbolPosition: 'after',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    symbolPosition: 'after',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimals: 2,
  },
};

/**
 * Mock shop configuration for development and testing
 *
 * This is a temporary configuration with mock data.
 * In production, this should be replaced with actual shop configuration
 * loaded from a database, CMS, or configuration file.
 *
 * @example
 * ```tsx
 * import { ShopProvider } from '@/core/shop';
 * import { mockShopConfig } from '@/core/shop/mockShopConfig';
 *
 * function App() {
 *   return (
 *     <ShopProvider config={mockShopConfig}>
 *       <YourApp />
 *     </ShopProvider>
 *   );
 * }
 * ```
 */
export const mockShopConfig: ShopConfig = {
  // Basic information
  name: 'Shopana Demo Store',
  domain: 'demo.shopana.io',
  email: 'info@shopana.io',
  phone: '+380123456789',

  // Localization
  locale: MOCK_LOCALES.en,
  availableLocales: [MOCK_LOCALES.en, MOCK_LOCALES.uk, MOCK_LOCALES.ru],
  currency: MOCK_CURRENCIES.UAH,
  availableCurrencies: [MOCK_CURRENCIES.USD, MOCK_CURRENCIES.UAH, MOCK_CURRENCIES.EUR],
  timezone: 'Europe/Kyiv',

  // Display settings
  moneyFormat: {
    currency: MOCK_CURRENCIES.UAH,
    locale: MOCK_LOCALES.en,
  },
  dateFormat: 'DD/MM/YYYY',
  weightUnit: 'kg',
  measurementUnit: 'metric',

  // Features
  features: {
    cart: true,
    wishlist: true,
    reviews: true,
    compareProducts: false,
    giftCards: false,
    subscriptions: false,
    multiCurrency: true,
    inventory: true,
  },

  // SEO
  seo: {
    title: 'Shopana Demo Store - Your Shopping Destination',
    description: 'Shop the latest products at great prices. Free shipping on orders over $50.',
    keywords: ['e-commerce', 'online shopping', 'retail'],
    ogImage: '/images/og-image.jpg',
  },

  // Social media
  social: {
    facebook: 'https://facebook.com/shopana',
    instagram: 'https://instagram.com/shopana',
    twitter: 'https://twitter.com/shopana',
    youtube: 'https://youtube.com/@shopana',
  },

  // Address
  address: {
    street: '123 Main Street',
    city: 'Kyiv',
    state: 'Kyiv Oblast',
    country: 'Ukraine',
    zipCode: '01001',
  },

  // Custom metadata
  metadata: {
    version: '1.0.0',
    environment: 'development',
    customField: 'Custom value for extending shop config',
  },
};
