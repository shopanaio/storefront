# Page Builder Framework (RSC + Code-First Architecture)

## 1. General Concept

**Goal:** create a highly performant and maintainable Next.js framework where pages are assembled by developers through TypeScript configuration files.

The framework does not include user components or example user components. It only provides the system functions and components required for the framework to work.

**Key principles:**

1. **RSC First (Server Components):** the page wrapper and `Builder` run on the server. The browser receives ready HTML, and JavaScript is loaded only where it is actually needed.
2. **Code-First Templates:** page templates are TypeScript files that directly import section components. A template contains page configuration, similar to a Shopify Liquid template, but implemented as a `.ts` object exported as `default`.
3. **Type Safety:** TypeScript validates that `settings` match component props directly in the template.
4. **Islands Architecture:** everything except pages is implemented as client components with `'use client'`.
5. **Dynamic Imports:** internal RSC pages and user sections/blocks can be imported dynamically to optimize bundle size. Templates are connected through normal imports to preserve type checking.
6. **Fault Tolerance:** every page, section, and block is wrapped in an error boundary so an error in one block does not break the entire page.

## 2. Data Flow

### 2.1 Templates

A template is an object that describes page structure in a Shopify Liquid-like style. It imports all page, section, and block components and defines their configuration.

The framework reserves template names for the main pages: home, product, collection, cart, search, blog, article, page, list-collections, and 404. The user must create all reserved files in `/templates/*.ts`, even when a page is not needed yet. Empty placeholders are allowed so the build does not fail and the runtime always has a complete template registry.

Example home template:

```typescript
// /templates/home.ts
import type { Template } from '@shopana/storefront-sdk/core';

import Layout from '@/layout/Main';
import HeroSection from '@/sections/HeroSection';
import FeaturesSection from '@/sections/FeaturesSection';
import Button from '@/blocks/Button';
import Image from '@/blocks/Image';

const template: Template = {
  layout: {
    component: Layout,
  },
  sections: {
    order: ['hero-main', 'features-1'],
    'hero-main': {
      component: HeroSection,
      settings: {
        title: 'Welcome to NextBuilder',
        subtitle: 'RSC First Framework',
      },
      blocks: {
        order: ['hero-image', 'hero-button'],
        'hero-image': {
          component: Image,
          settings: { src: '/hero.jpg', alt: 'Hero' },
        },
        'hero-button': {
          component: Button,
          settings: { text: 'Shop Now' },
        },
      },
    },
    'features-1': {
      component: FeaturesSection,
      settings: {
        columns: 3,
      },
    },
  },
};

export default template;
```

`layout` is a top-level React component. The builder passes assembled sections to it as `children`; the layout only decides where and how to render that content. Components inside templates may be imported directly or wrapped with `next/dynamic`.

Important Shopify Liquid analogy:

- `type` -> page type: home, product, collection
- `layout` -> layout component
- `sections.order` -> section order
- `sections[id]` -> section config with component and settings
- `sections[id].blocks.order` -> block order inside a section
- `sections[id].blocks[blockId]` -> block config
- all components are imported into the template and passed through the config

### 2.2 Package-Owned Page (Server Component)

The framework implements its own RSC page handler, `app/[[...slug]]/page.tsx`. It is responsible for:

- Loading data through Apollo Client/GraphQL
- Generating metadata for SEO
- Selecting the correct template
- Passing a single data object into `Builder`

Users of the framework do not write this logic. In the application they only re-export the ready-made page component.

```tsx
import { Builder } from '@/core/Builder';
import type { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchSeoData(params);
  return {
    title: data.title,
    description: data.description,
  };
}

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const { pageType, params: routeParams } = parseRoute(params.slug || []);

  let template;
  if (pageType === 'home') {
    template = await import('@/templates/home').then((m) => m.default);
  } else if (pageType === 'product') {
    template = await import('@/templates/product').then((m) => m.default);
  } else if (pageType === 'collection') {
    template = await import('@/templates/collection').then((m) => m.default);
  }

  const data = await loadPageData(pageType, routeParams);

  return <Builder template={template} data={data} pageType={pageType} />;
}
```

This approach is used for all reserved pages. Templates are imported dynamically through a switch so only the template needed for the current URL is loaded.

### 2.3 Route Structure and Template Selection

Routes follow a Shopify-style structure, so `[[...slug]]` can be parsed into `pageType` and `params`:

- `/` -> `pageType = 'home'`
- `/products/[handle]` -> `pageType = 'product'`, `params = { handle }`
- `/collections/[handle]` -> `pageType = 'collection'`, `params = { handle }`
- `/pages/[handle]` -> `pageType = 'page'`, `params = { handle }`
- `/cart` -> `pageType = 'cart'`

The framework uses a route parser based on `path-to-regexp` so route matching is explicit and reliable. If an i18n structure such as `/[locale]/[[...slug]]` is used, middleware provides locale values before the framework page runs.

### 2.4 Builder

`Builder` selects the layout from the template, renders sections and blocks, and wraps everything in `TemplateDataProvider`.

```tsx
import { TemplateDataProvider } from '@/core/TemplateDataContext';
import { Section } from '@/core/Section';

export function Builder({ template, data, pageType }: BuilderProps) {
  const LayoutComponent = template.layout.component;

  return (
    <TemplateDataProvider value={{ pageType, data }}>
      <LayoutComponent>
        {template.sections.order.map((sectionId) => {
          const section = template.sections[sectionId];
          if (!section || Array.isArray(section)) return null;

          const blocks = section.blocks
            ? section.blocks.order
                .map((blockId) => {
                  const block = section.blocks?.[blockId];
                  if (!block || Array.isArray(block)) return null;
                  return {
                    id: blockId,
                    component: block.component,
                    settings: block.settings,
                  };
                })
                .filter(Boolean)
            : undefined;

          return (
            <Section
              key={sectionId}
              id={sectionId}
              settings={section.settings}
              blocks={blocks}
              data={data}
            />
          );
        })}
      </LayoutComponent>
    </TemplateDataProvider>
  );
}
```

### 2.4.1 Layout Components

Layout components receive rendered page sections through `children` and wrap them in custom markup. Users can define multiple layouts for different page classes, for example a special layout for authentication pages.

```tsx
'use client';

import type { LayoutProps } from '@shopana/storefront-sdk/core';

export default function MainLayout({ children }: LayoutProps) {
  return <main>{children}</main>;
}
```

### 2.4.2 Section Components

`Section` is a system component provided by the SDK. It receives a component, settings, blocks, and page data, then renders the user's section component. It is rendered inside the layout.

### 2.4.3 Block Components

Blocks are smaller reusable components rendered inside sections. Blocks receive their own `settings` and `id`; sections decide how to display them.

## 2.5 Page Data Context and SDK Hooks

To make sections feel close to Shopify Liquid, page data is loaded once at the page level and made available through a shared context.

The goal is to let a section call hooks such as `useProduct()` or `useCollection()` without refetching client data. These hooks read already loaded page data from context.

Technical details:

- **Data Loading:** request-scoped Apollo Client loads data on the server.
- **Mutations:** generated GraphQL mutations are executed through Apollo Client.
- **Error Handling:** global error boundary with custom UI and Sentry logging.
- **Caching:** normalized Apollo cache with shared server/browser type policies.

The builder wraps section rendering in a provider with page type and data:

```tsx
<TemplateDataProvider value={{ pageType, data }}>
  {sections}
</TemplateDataProvider>
```

SDK hooks read from this context:

```typescript
export function useProduct() {
  const { pageType, data } = useTemplateData();
  if (pageType !== 'product') {
    throw new Error('useProduct can only be used on product pages');
  }
  return data.product;
}
```

The internal Server SDK is used only inside package-owned RSC pages to build `ProductTemplateData`, `CollectionTemplateData`, and other page data types. Package consumers only work with:

- `data` props in sections and blocks
- Client SDK hooks such as `useProduct`, `useCollection`, and `useCart`

This makes section development similar to Shopify Liquid: data is already guaranteed to be loaded at page level.

## 3. Framework Structure as an NPM Package

The framework should be implemented as an npm package inside `packages/` and use the monorepo approach.

Expected structure:

```text
src/
├── app/
│   └── [[...slug]]/
│       ├── page.tsx
│       ├── error.tsx
│       └── not-found.tsx
├── core/
│   ├── Builder.tsx
│   ├── TemplateDataContext.tsx
│   ├── Section.tsx
│   ├── Block.tsx
│   ├── ErrorBoundary.tsx
│   ├── types.ts
│   └── entities.ts
├── shop/
│   ├── types.ts
│   ├── ShopContext.tsx
│   ├── useShop.ts
│   └── index.ts
├── sdk/
│   ├── server/
│   │   ├── product.ts
│   │   ├── collection.ts
│   │   ├── cart.ts
│   │   └── home.ts
│   └── client/
│       ├── hooks.ts
│       ├── mutations.ts
│       └── index.ts
└── utils/
    ├── routeParser.ts
    └── logger.ts
```

External exports:

- Core exports from `@shopana/storefront-sdk/core`: `Builder`, `TemplateDataContext`, section/template/page types
- SDK exports from `@shopana/storefront-sdk/sdk`: `ShopProvider`, `useShop`, `ShopConfig`, entity types, page data types, and client hooks

The Server SDK remains internal.

## 4. Project Structure for Applications Using the Framework

Example Next.js application:

```text
my-shop/src
├── app/[locale]/
│   ├── layout.tsx
│   ├── globals.css
│   └── [[...slug]]/
│       └── page.tsx
├── blocks/
│   ├── CTA/
│   ├── Card/
│   └── Gallery/
├── sections/
│   ├── HeroSection/
│   ├── ProductDetailsSection/
│   └── CollectionGridSection/
├── layout/
│   ├── Main/
│   └── Auth/
└── templates/
    ├── home.ts
    ├── product.ts
    └── collection.ts
```

Component hierarchy:

1. **Blocks** - small reusable UI components
2. **Sections** - composed sections that use blocks
3. **Layout** - page wrappers that render sections
4. **Templates** - configuration that maps page types to components and data

Key points:

- Users do not write the Server SDK or the router for `/[[...slug]]`; they are encapsulated in the framework.
- Users create blocks, sections, layouts, and templates.
- Users may add custom routes in `app/**` as long as they do not collide with reserved framework routes.

## 5. Technical Details and Typing

### 5.1 Technical Implementation

Selected decisions:

- **Data Loading:** Apollo Client loads data on the server with request-scoped caching.
- **Mutations:** generated GraphQL mutations are executed through Apollo Client.
- **Error Handling:** global error boundary with custom UI and Sentry logging.
- **Entity Types:** use types from the existing `packages/entity` package.

### 5.2 Package Dependencies

```json
{
  "name": "@shopana/storefront-sdk",
  "version": "1.0.0",
  "peerDependencies": {
    "next": "^14.0.0 || ^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@apollo/client": "^4.0.0",
    "@apollo/client-integration-nextjs": "^0.14.0",
    "graphql": "^16.0.0"
  },
  "devDependencies": {
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@shopana/entity": "^1.0.0",
    "@sentry/nextjs": "^7.0.0"
  }
}
```

### 5.3 Core Types

Public types available through `@shopana/storefront-sdk/core`:

- `PageType`
- `BlockProps`
- `SectionProps`
- `LayoutProps`
- `Template`

Internal types include `TemplateParams`, `BlockInstance`, `SectionCollection`, `PageBuilderProps`, `PageDataLoader`, and `TemplateRegistration`.

```typescript
import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';

export type PageType =
  | 'home'
  | 'product'
  | 'collection'
  | 'search'
  | 'blog'
  | 'article'
  | 'page'
  | 'cart'
  | 'list-collections'
  | '404';

export interface TemplateParams {
  pageType: PageType;
  params: Record<string, string | undefined>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface BlockProps<TSettings = any> {
  id: string;
  settings: TSettings;
}

export type BlockComponent<TSettings = any> =
  | ComponentType<BlockProps<TSettings>>
  | LazyExoticComponent<ComponentType<BlockProps<TSettings>>>;

export interface BlockInstance<TSettings = any> extends BlockProps<TSettings> {
  component: BlockComponent<TSettings>;
}

export interface SectionProps<TSettings = any, TData = any> {
  id: string;
  settings: TSettings;
  blocks?: BlockInstance[];
  data: TData;
}

export type SectionComponent<TSettings = any, TData = any> =
  | ComponentType<SectionProps<TSettings, TData>>
  | LazyExoticComponent<ComponentType<SectionProps<TSettings, TData>>>;

export interface SectionCollection<TData = any> {
  order: string[];
  [sectionId: string]: SectionConfig<any, TData> | string[];
}

export interface LayoutProps {
  children: ReactNode;
}

export interface PageTemplate<TData = any, TLayoutSettings = any> {
  layout: TemplateLayout<TLayoutSettings, TData>;
  sections: SectionCollection<TData>;
}
```

The `TemplateRegistration` registry lives entirely inside the package. For every reserved page the package provides its own template, data loader, and metadata builder. User templates are connected through TypeScript files in `/templates`, and user code receives data only through section/block props and client SDK hooks.

### Data Flow

```text
Template imports all components
  -> Builder receives template and data
  -> Layout receives sections and data
  -> Sections receive settings, blocks, and data
  -> Blocks receive settings
```

## 6. Technical Decisions and Constraints

### 6.1 Implemented Technical Decisions

| Component        | Implementation                             | Notes                                                 |
| ---------------- | ------------------------------------------ | ----------------------------------------------------- |
| Data Loading     | Apollo Client                              | Request-scoped server loading and browser hydration   |
| Mutations        | Generated GraphQL mutations through Apollo | Normalized cache updates with domain strategies       |
| Error Handling   | Global error boundary + Sentry             | Custom UI and logging                                 |
| Entity Types     | `packages/entity`                          | Ready-made Product, Collection, and Cart types        |
| Routing          | Next.js App Router                         | `[[...slug]]` for reserved pages                      |
| State Management | React Context + Apollo Client              | Zustand remains responsible for cart/session UI state |

### 6.2 Reserved Routes

Reserved framework routes:

- `/` -> `index` (home)
- `/products/[handle]` -> `product`
- `/collections/[handle]` -> `collection`
- `/search` -> `search`
- `/blogs` -> `blog`
- `/blogs/[handle]` -> `article`
- `/pages/[handle]` -> `page`
- `/cart` -> `cart`
- `/collections` -> `list-collections`
- `*` -> `404`

### 6.3 Required User Files

The user must create these files in `/templates/*.ts`:

- `index.ts` (home)
- `product.ts`
- `collection.ts`
- `search.ts`
- `blog.ts`
- `article.ts`
- `page.ts`
- `cart.ts`
- `list-collections.ts`
- `404.ts`

Even if a feature is not needed, the file must exist and may contain a placeholder.

> See `packages/next-ecommerce-core/IMPLEMENTATION_PLAN.md` for the implementation plan and task tracker.
