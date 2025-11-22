# Shop Configuration Module

Global shop configuration system for the e-commerce framework, similar to Shopify's `shop` object.

## Overview

This module provides:
- Global shop configuration (name, domain, contact info)
- Localization settings (locale, currency, timezone)
- Feature flags (cart, wishlist, reviews, etc.)
- Utility functions (money formatting, date formatting, etc.)

## Quick Start

### 1. Setup in Root Layout

```tsx
import { ShopProvider, mockShopConfig } from '@/core/shop';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ShopProvider config={mockShopConfig}>
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
```

### 2. Use in Components

```tsx
import { useShop } from '@/core/shop';

function ProductCard({ product }) {
  const shop = useShop();

  return (
    <div>
      <h2>{product.name}</h2>
      <p>{shop.formatMoney(product.price)}</p>
      <p>Shop: {shop.name}</p>

      {shop.hasFeature('cart') && (
        <button>Add to Cart</button>
      )}
    </div>
  );
}
```

## API Reference

### `useShop()`

Main hook for accessing shop configuration and utilities.

**Returns:**
- All shop configuration fields
- Utility methods (see below)

**Example:**
```tsx
const shop = useShop();

// Configuration
console.log(shop.name);           // "Shopana Demo Store"
console.log(shop.locale.code);    // "en"
console.log(shop.currency.code);  // "UAH"

// Utilities
const price = shop.formatMoney(1234.56);  // "1234,56₴"
const date = shop.formatDate(new Date()); // "22/11/2025"
const weight = shop.formatWeight(5.5);    // "5.5 kg"
```

### Utility Methods

#### `formatMoney(amount, currency?)`
Formats monetary amounts according to shop currency settings.

```tsx
const shop = useShop();

shop.formatMoney(1234.56);              // "1234,56₴" (default UAH)
shop.formatMoney(1234.56, USD_CURRENCY); // "$1,234.56"
```

#### `formatDate(date)`
Formats dates according to shop date format.

```tsx
const shop = useShop();

shop.formatDate(new Date());         // "22/11/2025"
shop.formatDate("2025-11-22");       // "22/11/2025"
```

#### `formatWeight(weight)`
Formats weight with appropriate unit.

```tsx
const shop = useShop();

shop.formatWeight(5.5); // "5.5 kg"
```

#### `hasFeature(feature)`
Checks if a feature is enabled.

```tsx
const shop = useShop();

if (shop.hasFeature('cart')) {
  // Show cart UI
}

if (shop.hasFeature('wishlist')) {
  // Show wishlist button
}
```

### Available Features

- `cart` - Shopping cart functionality
- `wishlist` - Wishlist/favorites
- `reviews` - Product reviews and ratings
- `compareProducts` - Product comparison
- `giftCards` - Gift card functionality
- `subscriptions` - Recurring orders
- `multiCurrency` - Multi-currency support
- `inventory` - Inventory tracking

## Configuration

### Using Mock Configuration (Development)

```tsx
import { mockShopConfig } from '@/core/shop';

// Use in ShopProvider
<ShopProvider config={mockShopConfig}>
  {children}
</ShopProvider>
```

### Creating Custom Configuration

```tsx
import type { ShopConfig } from '@/core/shop';
import { MOCK_LOCALES, MOCK_CURRENCIES } from '@/core/shop';

const myShopConfig: ShopConfig = {
  name: 'My Store',
  domain: 'mystore.com',
  email: 'info@mystore.com',

  locale: MOCK_LOCALES.en,
  availableLocales: [MOCK_LOCALES.en, MOCK_LOCALES.uk],

  currency: MOCK_CURRENCIES.USD,
  availableCurrencies: [MOCK_CURRENCIES.USD, MOCK_CURRENCIES.EUR],

  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  weightUnit: 'lb',
  measurementUnit: 'imperial',

  features: {
    cart: true,
    wishlist: true,
    reviews: false,
    compareProducts: false,
    giftCards: false,
    subscriptions: false,
    multiCurrency: true,
    inventory: true,
  },

  moneyFormat: {
    currency: MOCK_CURRENCIES.USD,
    locale: MOCK_LOCALES.en,
  },
};
```

## TypeScript Support

All types are fully typed with TypeScript:

```tsx
import type {
  ShopConfig,
  Locale,
  Currency,
  ShopFeatures
} from '@/core/shop';

// Typed shop config
const config: ShopConfig = { /* ... */ };

// Typed features
const features: ShopFeatures = {
  cart: true,
  wishlist: true,
  // ... etc
};
```

## Integration with PageBuilder

Shop context can be used alongside PageBuilder:

```tsx
import { useShop } from '@/core/shop';
import { usePage } from '@/core/page-builder';

function ProductSection() {
  const shop = useShop();
  const page = usePage<ProductPageData>();

  return (
    <div>
      <h1>{shop.name}</h1>
      <p>{shop.formatMoney(page.data?.product.price)}</p>
    </div>
  );
}
```

## Future Enhancements

The following utilities are placeholders and will be implemented:

- `t(key, params)` - Translation function (TODO: integrate i18n library)
- `changeLocale(locale)` - Locale switching (TODO: integrate with router)
- `changeCurrency(currency)` - Currency switching (TODO: implement state management)

## Files

- `types.ts` - TypeScript type definitions
- `ShopContext.tsx` - React Context and Provider
- `useShop.ts` - Main hook and utilities
- `mockShopConfig.ts` - Mock configuration for development
- `index.ts` - Public API exports
