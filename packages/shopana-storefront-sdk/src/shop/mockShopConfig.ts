import type { Currency, Locale, ShopConfig } from './types';

export const MOCK_LOCALES: Record<string, Locale> = {
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
  },
};

export const MOCK_CURRENCIES: Record<string, Currency> = {
  USD: {
    code: 'USD',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimals: 2,
  },
};

export const mockShopConfig: ShopConfig = {
  name: 'Shopana Demo Store',
  domain: 'demo.shopana.io',
  email: 'info@shopana.io',
  locale: MOCK_LOCALES.en,
  availableLocales: [MOCK_LOCALES.en],
  currency: MOCK_CURRENCIES.USD,
  availableCurrencies: [MOCK_CURRENCIES.USD],
  timezone: 'UTC',
  moneyFormat: {
    currency: MOCK_CURRENCIES.USD,
    locale: MOCK_LOCALES.en,
  },
  dateFormat: 'YYYY-MM-DD',
  weightUnit: 'kg',
  measurementUnit: 'metric',
  features: {
    cart: true,
    wishlist: false,
    reviews: false,
    compareProducts: false,
    giftCards: false,
    subscriptions: false,
    multiCurrency: false,
    inventory: true,
  },
};

