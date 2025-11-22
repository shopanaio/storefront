# @shopana/next-ecommerce-core

RSC-first e-commerce framework for Next.js with type-safe templates and islands architecture.

## Features

✨ **RSC First** - Server Components by default, client components only where needed
🔒 **Type Safe** - Full TypeScript support with generics for settings and data
🏗️ **Code-First** - Templates are TypeScript files, not config JSONs
🏝️ **Islands Architecture** - Partial hydration for optimal performance
🎯 **Dynamic Imports** - Automatic code splitting per section
🛡️ **Error Boundaries** - Isolated errors per section
🔌 **Extensible** - Easy to add custom sections, templates, and data sources

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for local development setup.

## Installation

```bash
yarn add @shopana/next-ecommerce-core
# or
npm install @shopana/next-ecommerce-core
```

## Basic Usage

### 1. Setup Shop Provider

```tsx
// app/layout.tsx
import { ShopProvider } from '@shopana/next-ecommerce-core/shop';

const shopConfig = {
  name: 'My Shop',
  domain: 'myshop.com',
  email: 'info@myshop.com',
  locale: { code: 'en', name: 'English', direction: 'ltr' },
  currency: { code: 'USD', symbol: '$', symbolPosition: 'before', decimals: 2 },
  // ... see ShopConfig type for all options
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ShopProvider config={shopConfig}>
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
```

### 2. Create a Section

```tsx
// sections/Hero.tsx
'use client';

import type { SectionProps } from '@shopana/next-ecommerce-core/core';
import { useShop } from '@shopana/next-ecommerce-core/shop';

interface HeroSettings {
  title: string;
  subtitle?: string;
}

export default function Hero({ settings }: SectionProps<HeroSettings>) {
  const shop = useShop();

  return (
    <section>
      <h1>{settings.title}</h1>
      {settings.subtitle && <p>{settings.subtitle}</p>}
      <p>Welcome to {shop.name}</p>
    </section>
  );
}
```

### 3. Create a Template

```ts
// templates/home.ts
import dynamic from 'next/dynamic';
import type { PageTemplate } from '@shopana/next-ecommerce-core/core';
import type { HomePageData } from '@shopana/next-ecommerce-core/sdk';

const Hero = dynamic(() => import('../sections/Hero'));

export const homeTemplate: PageTemplate<HomePageData> = {
  name: 'home',
  sections: [
    {
      id: 'hero-main',
      component: Hero,
      settings: {
        title: 'Welcome to our store',
        subtitle: 'Best products at great prices'
      }
    }
  ]
};
```

### 4. Register Templates & Use Router

```tsx
// app/[[...slug]]/page.tsx
import { registerDefaultTemplates } from '@shopana/next-ecommerce-core';

// Register your templates (do this once, preferably in a setup file)
registerDefaultTemplates();

// Use the framework's router page
export { default, generateMetadata } from '@shopana/next-ecommerce-core/app/[[...slug]]/page';
```

## Architecture

### Data Flow

1. **Route Parsing** - URL → `pageType` + `params`
2. **Template Resolution** - `pageType` → `PageTemplate`
3. **Data Loading** - Server SDK loads data → `PageData`
4. **Page Rendering** - `PageBuilder` renders sections with data
5. **Context Provision** - `PageDataProvider` makes data available via hooks

### Component Hierarchy

```
Page (RSC)
└── PageBuilder (RSC)
    └── PageDataProvider (Client)
        └── Sections (Client, loaded via dynamic import)
            ├── Section 1 (wrapped in ErrorBoundary)
            ├── Section 2 (wrapped in ErrorBoundary)
            └── Section 3 (wrapped in ErrorBoundary)
```

## Core Concepts

### SectionProps

All sections receive these props:

```tsx
interface SectionProps<TSettings, TData> {
  id: string;              // Unique section ID
  settings: TSettings;     // Section-specific settings (type-safe!)
  blocks?: BlockInstance[]; // Optional nested blocks
  data: TData;             // Page data (e.g., ProductPageData)
}
```

### Page Data Types

The framework provides these page data types:

- `HomePageData` - Featured products and collections
- `ProductPageData` - Product + related products
- `CollectionPageData` - Collection + products
- `StaticPageData` - Static page content
- `CartPageData` - Cart items

### SDK Hooks

Access page data in any client component:

```tsx
import { useProduct, useCollection, useCart } from '@shopana/next-ecommerce-core/sdk';

// In a product page section
const product = useProduct();

// In a collection page section
const collection = useCollection();
```

### Shop Context

Access global shop config anywhere:

```tsx
import { useShop } from '@shopana/next-ecommerce-core/shop';

const shop = useShop();
shop.name;                      // 'My Shop'
shop.formatMoney(1234.56);     // '$1,234.56'
shop.formatDate(new Date());   // '22/11/2025'
shop.hasFeature('cart');       // true
```

## API Reference

### Core Exports

```tsx
import {
  PageBuilder,        // Main page renderer component
  PageDataProvider,   // Context provider for page data
  usePageData,        // Hook to access page data
  SectionErrorBoundary, // Error boundary for sections
  registerTemplate,   // Register a single template
  registerTemplates,  // Register multiple templates
} from '@shopana/next-ecommerce-core/core';
```

### Shop Exports

```tsx
import {
  ShopProvider,      // Global shop config provider
  useShop,          // Hook to access shop config
  type ShopConfig,  // Shop configuration type
} from '@shopana/next-ecommerce-core/shop';
```

### SDK Exports

```tsx
import {
  useProduct,        // Get current product (product pages only)
  useCollection,     // Get current collection (collection pages only)
  useCart,          // Get current cart (cart pages only)
  useStaticPage,    // Get current page (static pages only)
  type ProductEntity,
  type CollectionEntity,
  type CartEntity,
} from '@shopana/next-ecommerce-core/sdk';
```

## File Structure

```
@shopana/next-ecommerce-core/
├── core/              # Core framework utilities
│   ├── PageBuilder
│   ├── PageDataContext
│   ├── types
│   └── entities
├── shop/              # Shop context
│   ├── ShopProvider
│   ├── useShop
│   └── types
├── sdk/               # Data layer
│   ├── client/       # Client hooks
│   └── server/       # Server data fetching (internal)
├── sections/         # Built-in sections
├── templates/        # Default templates
└── app/              # Router implementation
```

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for local development setup.

**TL;DR:**

```bash
# Start dev with hot reload
yarn dev

# Build package
yarn build
```

All changes to `src/` are automatically hot-reloaded thanks to TypeScript paths mapping!

## License

MIT

## Related

- [Next.js](https://nextjs.org/)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Islands Architecture](https://jasonformat.com/islands-architecture/)
