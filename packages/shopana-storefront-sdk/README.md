# @shopana/storefront-sdk

Type-safe, code-first page builder framework for Next.js (App Router, RSC‑first) inspired by Shopify Liquid templates, but implemented entirely in TypeScript and React.

`@shopana/storefront-sdk` lets you build e‑commerce pages by composing templates (TypeScript objects) with your own layouts, sections, and blocks, while keeping all data strictly typed end‑to‑end.

---

## Features

- **RSC‑first rendering** – builder and pages run on the server, sending fully rendered HTML; client JS is loaded only where it is really needed.
- **Code‑first templates** – pages are defined as TypeScript files that import layouts, sections, and blocks directly.
- **Islands architecture** – everything except the page shell is built as client components (`'use client'`).
- **Dynamic imports** – internal templates and user sections/blocks are loaded on demand so the bundle stays small.
- **Strong typing** – template configuration, component props, and page data are validated by TypeScript at build time.
- **Error boundaries** – layouts, sections and blocks are wrapped in error boundaries so one broken block does not break the whole page.
- **E‑commerce‑ready** – reserved entities (Product, Collection, Cart), standard page types, and SDK hooks for accessing data.

---

## When to use this package

Use `@shopana/storefront-sdk` when you need:

- a highly performant, maintainable e‑commerce frontend on Next.js App Router;
- a **code‑first** alternative to visual/JSON page builders;
- strong typing and clear contracts between data, templates, and components.

You **do not**:

- write your own router for `/[[...slug]]`;
- implement server data loading from scratch;
- roll your own page builder infrastructure.

You **do**:

- define templates in `/templates/*.ts`;
- implement layouts, sections, and blocks in your app;
- use the provided types and SDK hooks from `@shopana/storefront-sdk`.

For a deep dive into the architecture, see `ARCHITECTURE.md`. For the current implementation roadmap, see `IMPLEMENTATION_PLAN.md`.

---

## Installation

Designed for Next.js 14/15/16 (App Router) and React 18/19.

```bash
npm install @shopana/storefront-sdk
# or
yarn add @shopana/storefront-sdk
```

Key peer dependencies (see `package.json` for exact versions):

- `next` `^14.0.0 || ^15.0.0 || ^16.0.0`
- `react` `^18.0.0 || ^19.0.0`
- `react-dom` `^18.0.0 || ^19.0.0`

Runtime dependencies:

- `@shopana/entity` – shared e‑commerce entity types (Product, Collection, Cart, …)
- `path-to-regexp` – routing helpers for URL pattern matching

In the full project setup, Relay (`relay-runtime`) is used in the server SDK to fetch data, but it is not a direct peer of this package.

---

## Core concepts

The framework follows a familiar e‑commerce hierarchy:

1. **Blocks** – small reusable UI components (button, price, image).
2. **Sections** – compositions of blocks (Hero, ProductDetails, RelatedProducts).
3. **Layouts** – page wrappers that render sections via `children`.
4. **Templates** – TypeScript objects that wire layouts, sections, blocks, and data types.

Data flow:

```text
Template (imports layout, sections, blocks)
  ↓
Builder (receives template + data + pageType)
  ↓
Layout component (receives children)
  ↓
Section components (receive settings + blocks + data)
  ↓
Block components (receive settings)
```

---

## Recommended project structure

In your Next.js app, a typical structure might look like this:

```text
app/
  [[...slug]]/
    page.tsx              # RSC page that uses the Builder

layout/
  MainLayout.tsx          # main site layout
  AuthLayout.tsx          # example of a dedicated layout

sections/
  HeroSection.tsx
  ProductHero.tsx
  ProductDetails.tsx

blocks/
  Button.tsx
  Image.tsx
  Price.tsx

templates/
  index.ts                # home
  product.ts
  collection.ts
  search.ts
  blog.ts
  article.ts
  page.ts
  cart.ts
  list-collections.ts
  404.ts
```

The framework expects all reserved template files to exist in `templates/`, even if they are minimal placeholders at first.

---

## Routing and reserved pages

The framework is designed around a single catch‑all route `app/[[...slug]]/page.tsx` which:

- parses the URL (Shopify‑style) into `pageType` and `params`;
- picks the appropriate template based on `pageType`;
- loads page data on the server and passes it to the `Builder`.

Default reserved paths:

- `/` → `index` (home)
- `/products/[handle]` → `product`
- `/collections/[handle]` → `collection`
- `/search` → `search`
- `/blogs` → `blog`
- `/blogs/[handle]` → `article`
- `/pages/[handle]` → `page`
- `/cart` → `cart`
- `/collections` → `list-collections`
- `*` (fallback 404) → `404`

Each reserved route should have a corresponding template in `templates/*.ts`.

---

## Templates: defining pages

A template is a plain TypeScript file which:

- imports your layout, sections, and blocks;
- defines the order of sections and blocks;
- provides `settings` for each component;
- is typed using `PageTemplate` from the core.

Example of a minimal home page template:

```ts
// templates/index.ts
import type { PageTemplate } from '@shopana/storefront-sdk/core';

import MainLayout from '@/layout/MainLayout';
import HeroSection from '@/sections/HeroSection';
import FeaturesSection from '@/sections/FeaturesSection';
import Button from '@/blocks/Button';
import Image from '@/blocks/Image';

const template: PageTemplate = {
  layout: {
    component: MainLayout,
  },
  sections: {
    order: ['hero-main', 'features'],
    'hero-main': {
      component: HeroSection,
      settings: {
        title: 'Welcome to Shopana',
      },
      blocks: {
        order: ['hero-image', 'hero-cta'],
        'hero-image': {
          component: Image,
          settings: { src: '/hero.jpg', alt: 'Hero' },
        },
        'hero-cta': {
          component: Button,
          settings: { label: 'Shop now' },
        },
      },
    },
    features: {
      component: FeaturesSection,
      settings: {},
    },
  },
};

export default template;
```

If the settings or data types do not match the component props, TypeScript will fail compilation.

---

## Layout components

Layouts receive fully rendered sections via `children` and wrap them in the page chrome.

```tsx
// layout/MainLayout.tsx
'use client';

import type { LayoutProps } from '@shopana/storefront-sdk/core';

export default function MainLayout({ children }: LayoutProps) {
  return (
    <main>
      {/* Header / Navigation */}
      {children}
      {/* Footer */}
    </main>
  );
}
```

You can define multiple layouts (e.g. an auth layout) and reference them from different templates.

---

## Sections and blocks

Sections and blocks are your client components that receive configuration and page data.

### Section example

```tsx
// sections/HeroSection.tsx
'use client';

import type { SectionProps } from '@shopana/storefront-sdk/core';
import { Block } from '@shopana/storefront-sdk';
import type { HomeTemplateData } from '@shopana/storefront-sdk/sdk';

interface HeroSettings {
  title: string;
}

export default function HeroSection({
  id,
  settings,
  blocks,
  data,
}: SectionProps<HeroSettings, HomeTemplateData>) {
  return (
    <section id={id}>
      <h1>{settings.title}</h1>
      {blocks?.map((block) => (
        <Block key={block.id} {...block} />
      ))}
    </section>
  );
}
```

### Block example

```tsx
// blocks/Button.tsx
'use client';

import type { BlockProps } from '@shopana/storefront-sdk/core';

interface ButtonSettings {
  label: string;
}

export default function Button({ id, settings }: BlockProps<ButtonSettings>) {
  return (
    <button id={id} className="btn">
      {settings.label}
    </button>
  );
}
```

The internal `Section` and `Block` components provided by this package wrap your components in error boundaries and handle framework‑level concerns.

---

## Page data and entity types

Core domain entities live in `@shopana/entity` and are used as the single source of truth for e‑commerce data:

- `ProductEntity`
- `CollectionEntity`
- `CartEntity`

Example page data types built on top of those entities:

```ts
// src/types.ts (inside this package)
export interface ProductTemplateData {
  product: ProductEntity;
  relatedProducts: ProductEntity[];
}

export interface CollectionTemplateData {
  collection: CollectionEntity;
  products: ProductEntity[];
}
``>

The server SDK (using Relay) loads data and types it with these interfaces. Sections receive strongly typed data through `SectionProps<Settings, PageData>`.

---

## Contexts and SDK hooks

On top of page data and global shop configuration, the framework provides React contexts and hooks:

- `TemplateDataProvider` / `useTemplateData` – current page type and data (`pageType`, `data`);
- `ShopProvider` / `useShop` – global shop configuration (name, locale, currency, feature flags, etc.);
- convenience hooks (e.g. `useProduct`, `useCollection`, …) – shortcuts for accessing current page entities without refetching.

Example usage:

```tsx
// sections/ProductHero.tsx
'use client';

import type { SectionProps } from '@shopana/storefront-sdk/core';
import { useShop } from '@shopana/storefront-sdk/sdk';
import type { ProductTemplateData } from '@shopana/storefront-sdk/sdk';

interface ProductHeroSettings {
  title?: string;
}

export default function ProductHero({
  id,
  settings,
  data,
}: SectionProps<ProductHeroSettings, ProductTemplateData>) {
  const shop = useShop();

  return (
    <section id={id}>
      <h1>{settings.title ?? data.product.title}</h1>
      <p>{shop.name}</p>
    </section>
  );
}
```

The data is loaded once on the server and passed to client components via context, so no extra client‑side fetching is required.

---

## Public core types

From `@shopana/storefront-sdk/core` you get the main building‑block types:

- `PageType` – union of reserved page types:
  `'home' | 'product' | 'collection' | 'search' | 'blog' | 'article' | 'page' | 'cart' | 'list-collections' | '404'`
- `BlockProps<TSettings>`
- `SectionProps<TSettings, TData>`
- `LayoutProps`
- `PageTemplate<TData, TLayoutSettings>`

Internal types such as `TemplateParams`, `BlockInstance`, `SectionCollection`, `PageBuilderProps`, `PageDataLoader`, `TemplateRegistration`, etc. are used inside the package and are not meant to be part of the public API surface.

---

## Getting started (checklist)

1. **Install dependencies**
   Add `@shopana/storefront-sdk` to your Next.js App Router project and ensure peer dependencies are satisfied.

2. **Create layout components**
   Implement at least one main layout (e.g. `layout/MainLayout.tsx`) and export it as default.

3. **Create basic blocks and sections**
   Build reusable blocks (Button, Image, Price, …) and sections (HeroSection, ProductHero, ProductDetails, …) using `BlockProps` and `SectionProps`.

4. **Define templates in `templates/*.ts`**
   Create TypeScript files for all reserved page types (home, product, collection, cart, etc.) and describe their structure via `PageTemplate`.

5. **Wire the Builder into `app/[[...slug]]/page.tsx`**
   Use the framework’s routing and Builder helpers (see source and tests) or mirror the patterns described in `ARCHITECTURE.md`.

6. **Hook up the server SDK and Relay**
   Configure your data layer using Relay and your back‑end, and return page data in the shape expected by the template types.

---

## Documentation and status

- **Architecture** – see `ARCHITECTURE.md` for a full technical description of the data flow and internal components.
- **Implementation plan** – see `IMPLEMENTATION_PLAN.md` for the current task tracker and feature status.
- **Tests** – refer to tests in `src/**` (for example `src/core/Builder.test.tsx`) for usage patterns and contracts.

---

## License

MIT, as specified in the package `license` field and repository root.
