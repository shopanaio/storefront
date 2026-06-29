# Home Page Data Loading Migration Plan for the SDK

## Overview

Move the GraphQL loader and provider for the home page from the application into the SDK. The scope is Shopana backend only, without CMS abstractions.

## Current State

### Files in the Application (`src/`)

```text
src/hooks/home/
├── HomePageQuery/
│   ├── HomePageQuery.shopana.ts              # GraphQL query -> move to SDK
│   └── __generated__/                        # Relay generated files
├── loadHomeServerQuery/
│   └── loadHomeServerQuery.shopana.ts        # Server loader -> move to SDK
├── useHomeClientQuery/
│   └── useHomeClientQuery.shopana.ts         # Client hook -> move to SDK
└── interface.ts                              # Types -> move to SDK

src/app/[locale]/(default)/
├── page.tsx                                  # Will use the SDK
└── client.tsx                                # Will use the SDK

src/components/Home/
├── Home.tsx                                  # Remains in the application
├── sections.ts                               # Remains in the application
└── ProductSlideshow/relay/
    └── useProductSlideshowFragment.shopana.tsx  # Fragment -> move to SDK
```

## Architecture Decision

**Approach: full migration into the SDK.**

The SDK owns:
- GraphQL query (`HomePageQuery`)
- Fragments (`CategoryFragment`, `ProductFragment`)
- Server loader (`loadHomeServerQuery`)
- Provider and hooks (`HomeDataProvider`, `useHomeData`)
- Types (`HomeTemplateData`)

The application only:
- Uses ready-made SDK components and data primitives
- Renders UI sections with data from hooks

## New SDK Module Structure

**No `index.ts` files.**

```text
packages/shopana-storefront-sdk/src/modules/home/
├── core/
│   ├── types.ts                              # HomeTemplateData, CategoryData
│   └── graphql/
│       ├── queries/
│       │   ├── HomePageQuery.ts              # Main query
│       │   └── __generated__/                # Relay generated files
│       └── fragments/
│           ├── CategoryFragment.ts           # Category with products
│           └── __generated__/
├── react/
│   ├── context/
│   │   └── HomeDataContext.tsx
│   ├── hooks/
│   │   ├── useHomeData.ts
│   │   ├── useHomeCategories.ts
│   │   └── useCategoryProducts.ts
│   └── providers/
│       └── HomeDataProvider.tsx
└── next/
    └── loaders/
        └── loadHomeServerQuery.ts
```

## Detailed Implementation Plan

### Stage 1: GraphQL Query and Fragments in the SDK

**File: `modules/home/core/graphql/fragments/CategoryFragment.ts`**

```typescript
import { graphql } from 'relay-runtime';

export const CategoryFragment = graphql`
  fragment CategoryFragment_category on Category {
    id
    title
    handle
    listing(first: 12) {
      edges {
        node {
          ... on ProductVariant {
            id
            title
            handle
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
              altText
              width
              height
            }
            product {
              id
              title
              handle
            }
          }
        }
      }
    }
  }
`;
```

**File: `modules/home/core/graphql/queries/HomePageQuery.ts`**

```typescript
import { graphql } from 'relay-runtime';

export const HomePageQuery = graphql`
  query HomePageQuery {
    electronics: category(handle: "electronics") {
      title
      ...CategoryFragment_category
    }
    toys: category(handle: "toys-kids") {
      title
      ...CategoryFragment_category
    }
    sport: category(handle: "sport-i-otdyh") {
      title
      ...CategoryFragment_category
    }
    homeAndGarden: category(handle: "home-garden") {
      id
      title
      handle
      children(first: 10) {
        edges {
          node {
            ...CategoryFragment_category
          }
        }
      }
    }
  }
`;

export { default as HomePageQueryNode } from './__generated__/HomePageQuery.graphql';
export type { HomePageQuery as HomePageQueryType } from './__generated__/HomePageQuery.graphql';
```

### Stage 2: Core Types

**File: `modules/home/core/types.ts`**

```typescript
import type { CategoryFragment_category$data } from './graphql/fragments/__generated__/CategoryFragment_category.graphql';
import type { HomePageQuery$data } from './graphql/queries/__generated__/HomePageQuery.graphql';

export type CategoryData = CategoryFragment_category$data;
export type HomeQueryResponse = HomePageQuery$data;

export interface HomeProduct {
  id: string;
  title: string;
  handle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  } | null;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  product: {
    id: string;
    title: string;
    handle: string;
  };
}

export interface HomeCategory {
  id: string;
  title: string;
  handle: string;
  products: HomeProduct[];
}

export interface HomeTemplateData {
  pageType: 'home';
  raw: HomeQueryResponse;
  categories: {
    electronics: HomeCategory | null;
    toys: HomeCategory | null;
    sport: HomeCategory | null;
    homeAndGarden: {
      id: string;
      title: string;
      handle: string;
      children: HomeCategory[];
    } | null;
  };
}

export type { CategoryFragment_category$key } from './graphql/fragments/__generated__/CategoryFragment_category.graphql';
```

### Stage 3: Server Loader

**File: `modules/home/next/loaders/loadHomeServerQuery.ts`**

```typescript
import { loadSerializableQuery } from '../../../../graphql/relay/loadSerializableQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { createFetchGraphQL } from '../../../../graphql/relay/Environment';
import type { RelayEnvironmentConfig } from '../../../../graphql/relay/types';
import HomePageQueryNode, {
  HomePageQuery,
} from '../../core/graphql/queries/__generated__/HomePageQuery.graphql';

export interface LoadHomeServerQueryOptions {
  environmentConfig: RelayEnvironmentConfig;
}

export async function loadHomeServerQuery(
  options: LoadHomeServerQueryOptions
): Promise<SerializablePreloadedQuery<typeof HomePageQueryNode, HomePageQuery>> {
  const { environmentConfig } = options;

  const { headers } = await import('next/headers');
  const cookie = (await headers()).get('cookie') ?? undefined;

  const networkFetch = createFetchGraphQL({
    graphqlUrl: environmentConfig.graphqlUrl,
    apiKeyHeader: environmentConfig.apiKeyHeader,
    apiKey: environmentConfig.apiKey,
    accessTokenCookieName: environmentConfig.accessTokenCookieName,
    serverCookies: cookie,
  });

  return loadSerializableQuery<typeof HomePageQueryNode, HomePageQuery>(
    networkFetch,
    HomePageQueryNode.params,
    {},
    cookie
  );
}

export type { HomePageQuery };
```

### Stage 4: React Context and Provider

**File: `modules/home/react/context/HomeDataContext.tsx`**

```typescript
'use client';

import { createContext, useContext } from 'react';
import type { HomeTemplateData } from '../../core/types';

interface HomeDataContextValue {
  data: HomeTemplateData;
}

const HomeDataContext = createContext<HomeDataContextValue | null>(null);

export function useHomeDataContext(): HomeDataContextValue {
  const context = useContext(HomeDataContext);
  if (!context) {
    throw new Error('useHomeDataContext must be used within HomeDataProvider');
  }
  return context;
}

export { HomeDataContext };
```

**File: `modules/home/react/providers/HomeDataProvider.tsx`**

The provider:
- Converts a serializable preloaded query into a Relay query reference
- Reads the query with `usePreloadedQuery`
- Transforms raw query data into `HomeTemplateData`
- Provides it through `HomeDataContext`

### Stage 5: Client Hooks

**File: `modules/home/react/hooks/useHomeData.ts`**

```typescript
'use client';

import { useHomeDataContext } from '../context/HomeDataContext';
import type { HomeTemplateData } from '../../core/types';

export function useHomeData(): HomeTemplateData {
  const { data } = useHomeDataContext();
  return data;
}
```

**File: `modules/home/react/hooks/useHomeCategories.ts`**

```typescript
'use client';

import { useHomeData } from './useHomeData';
import type { HomeCategory } from '../../core/types';

export function useHomeCategories() {
  const { categories } = useHomeData();
  return categories;
}

export function useHomeCategory(
  key: 'electronics' | 'toys' | 'sport'
): HomeCategory | null {
  const categories = useHomeCategories();
  return categories[key];
}

export function useHomeAndGarden() {
  const categories = useHomeCategories();
  return categories.homeAndGarden;
}
```

**File: `modules/home/react/hooks/useCategoryProducts.ts`**

```typescript
'use client';

import { useHomeCategory } from './useHomeCategories';
import type { HomeProduct } from '../../core/types';

export function useCategoryProducts(
  categoryKey: 'electronics' | 'toys' | 'sport'
): HomeProduct[] {
  const category = useHomeCategory(categoryKey);
  return category?.products ?? [];
}
```

### Stage 6: Integration in SDK `page.tsx`

This is the critical integration point. The SDK `[[...slug]]/page.tsx` must load the correct data based on the parsed route and wrap rendering in the matching provider.

For the home page:
- Import `loadHomeServerQuery`
- Import `HomeDataProvider`
- Load the home preloaded query when `pageType === 'home'`
- Wrap the builder output in `HomeDataProvider`

### Stage 7: Application Integration

The application home route should use the SDK page factory instead of its own query and client wrapper.

Expected application responsibilities:
- Keep UI sections in the application
- Use SDK types and hooks where appropriate
- Remove the old home query/loaders once the SDK version is active

### Stage 8: Relay Generation

Run Relay generation for the SDK after adding the query and fragments.

```bash
yarn relay
```

Generated files must be committed because SDK source imports them.

### Stage 9: Validation

Check that:
- `HomePageQuery` is generated
- `CategoryFragment` is generated
- `loadHomeServerQuery` returns a serializable preloaded query
- `HomeDataProvider` hydrates from the preloaded query
- Home sections render from SDK-provided data
- The application no longer imports home page data loaders from `src/hooks/home`

## Notes

- Keep this module Shopana-only for now.
- Do not introduce CMS provider selection here.
- Avoid barrel `index.ts` files in this module.
- Preserve Relay as the source of truth for server and client data.
