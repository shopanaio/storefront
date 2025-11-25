# План миграции Home Page Data Loading в SDK

## Обзор

Перенос GraphQL загрузчика и провайдера для главной страницы из приложения в SDK. Только Shopana backend, без CMS-абстракций.

## Текущее состояние

### Файлы в приложении (src/)
```
src/hooks/home/
├── HomePageQuery/
│   ├── HomePageQuery.shopana.ts              # GraphQL query → переносим в SDK
│   └── __generated__/                        # Relay generated
├── loadHomeServerQuery/
│   └── loadHomeServerQuery.shopana.ts        # Server loader → переносим в SDK
├── useHomeClientQuery/
│   └── useHomeClientQuery.shopana.ts         # Client hook → переносим в SDK
└── interface.ts                              # Types → переносим в SDK

src/app/[locale]/(default)/
├── page.tsx                                  # Будет использовать SDK
└── client.tsx                                # Будет использовать SDK

src/components/Home/
├── Home.tsx                                  # Останется в приложении
├── sections.ts                               # Останется в приложении
└── ProductSlideshow/relay/
    └── useProductSlideshowFragment.shopana.tsx  # Fragment → переносим в SDK
```

---

## Архитектурное решение

**Подход: Полный перенос в SDK**

SDK полностью владеет:
- GraphQL query (HomePageQuery)
- Fragments (CategoryFragment, ProductFragment)
- Server loader (loadHomeServerQuery)
- Provider и hooks (HomeDataProvider, useHomeData)
- Типы (HomeTemplateData)

Приложение только:
- Использует готовые компоненты из SDK
- Рендерит UI-секции с данными из хуков

---

## Структура нового модуля в SDK

**Без index.ts файлов**

```
packages/shopana-storefront-sdk/src/modules/home/
├── core/
│   ├── types.ts                              # HomeTemplateData, CategoryData
│   └── graphql/
│       ├── queries/
│       │   ├── HomePageQuery.ts              # Main query
│       │   └── __generated__/                # Relay generated
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

---

## Детальный план реализации

### Этап 1: GraphQL Query & Fragments в SDK

**Файл: `modules/home/core/graphql/fragments/CategoryFragment.ts`**
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

**Файл: `modules/home/core/graphql/queries/HomePageQuery.ts`**
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

---

### Этап 2: Core Types

**Файл: `modules/home/core/types.ts`**
```typescript
import type { CategoryFragment_category$data } from './graphql/fragments/__generated__/CategoryFragment_category.graphql';
import type { HomePageQuery$data } from './graphql/queries/__generated__/HomePageQuery.graphql';

// Re-export generated types
export type CategoryData = CategoryFragment_category$data;
export type HomeQueryResponse = HomePageQuery$data;

// Product from listing
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

// Category with products
export interface HomeCategory {
  id: string;
  title: string;
  handle: string;
  products: HomeProduct[];
}

// Template data для секций
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

// Fragment key types for Relay
export type { CategoryFragment_category$key } from './graphql/fragments/__generated__/CategoryFragment_category.graphql';
```

---

### Этап 3: Server Loader

**Файл: `modules/home/next/loaders/loadHomeServerQuery.ts`**
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

/**
 * Load home page data on server (Next.js RSC)
 *
 * @example
 * ```tsx
 * // app/page.tsx
 * import { loadHomeServerQuery } from '@shopana/storefront-sdk/modules/home/next';
 *
 * export default async function HomePage() {
 *   const preloadedQuery = await loadHomeServerQuery({ environmentConfig });
 *   return <HomeClient preloadedQuery={preloadedQuery} />;
 * }
 * ```
 */
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

  const preloadedQuery = await loadSerializableQuery<
    typeof HomePageQueryNode,
    HomePageQuery
  >(
    networkFetch,
    HomePageQueryNode.params,
    {},
    cookie
  );

  return preloadedQuery;
}

export type { HomePageQuery };
```

---

### Этап 4: React Context & Provider

**Файл: `modules/home/react/context/HomeDataContext.tsx`**
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

**Файл: `modules/home/react/providers/HomeDataProvider.tsx`**
```typescript
'use client';

import { type ReactNode, useMemo } from 'react';
import { usePreloadedQuery, useRelayEnvironment } from 'react-relay';
import { useSerializablePreloadedQuery } from '../../../../graphql/relay/useSerializablePreloadedQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { HomeDataContext } from '../context/HomeDataContext';
import type { HomeTemplateData, HomeCategory, HomeProduct } from '../../core/types';
import HomePageQueryNode, {
  HomePageQuery,
} from '../../core/graphql/queries/__generated__/HomePageQuery.graphql';

interface HomeDataProviderProps {
  children: ReactNode;
  preloadedQuery: SerializablePreloadedQuery<typeof HomePageQueryNode, HomePageQuery>;
}

// Transform raw query data to HomeTemplateData
function transformQueryData(data: HomePageQuery['response']): HomeTemplateData {
  const transformCategory = (category: any): HomeCategory | null => {
    if (!category) return null;

    const products: HomeProduct[] = category.listing?.edges?.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      price: edge.node.price,
      compareAtPrice: edge.node.compareAtPrice,
      image: edge.node.image,
      product: edge.node.product,
    })) ?? [];

    return {
      id: category.id,
      title: category.title,
      handle: category.handle,
      products,
    };
  };

  return {
    pageType: 'home',
    raw: data,
    categories: {
      electronics: transformCategory(data.electronics),
      toys: transformCategory(data.toys),
      sport: transformCategory(data.sport),
      homeAndGarden: data.homeAndGarden ? {
        id: data.homeAndGarden.id,
        title: data.homeAndGarden.title,
        handle: data.homeAndGarden.handle,
        children: data.homeAndGarden.children?.edges?.map((edge: any) =>
          transformCategory(edge.node)
        ).filter(Boolean) as HomeCategory[] ?? [],
      } : null,
    },
  };
}

export function HomeDataProvider({
  children,
  preloadedQuery,
}: HomeDataProviderProps) {
  const environment = useRelayEnvironment();

  const queryReference = useSerializablePreloadedQuery(
    environment,
    preloadedQuery
  );

  const rawData = usePreloadedQuery<HomePageQuery>(
    HomePageQueryNode,
    queryReference
  );

  const data = useMemo(() => transformQueryData(rawData), [rawData]);

  return (
    <HomeDataContext.Provider value={{ data }}>
      {children}
    </HomeDataContext.Provider>
  );
}
```

---

### Этап 5: Client Hooks

**Файл: `modules/home/react/hooks/useHomeData.ts`**
```typescript
'use client';

import { useHomeDataContext } from '../context/HomeDataContext';
import type { HomeTemplateData } from '../../core/types';

/**
 * Hook для доступа к полным данным главной страницы
 *
 * @example
 * ```tsx
 * const { categories, raw } = useHomeData();
 * ```
 */
export function useHomeData(): HomeTemplateData {
  const { data } = useHomeDataContext();
  return data;
}
```

**Файл: `modules/home/react/hooks/useHomeCategories.ts`**
```typescript
'use client';

import { useHomeData } from './useHomeData';
import type { HomeCategory } from '../../core/types';

/**
 * Hook для доступа к категориям главной страницы
 */
export function useHomeCategories() {
  const { categories } = useHomeData();
  return categories;
}

/**
 * Hook для конкретной категории по ключу
 */
export function useHomeCategory(
  key: 'electronics' | 'toys' | 'sport'
): HomeCategory | null {
  const categories = useHomeCategories();
  return categories[key];
}

/**
 * Hook для категории homeAndGarden с дочерними категориями
 */
export function useHomeAndGarden() {
  const categories = useHomeCategories();
  return categories.homeAndGarden;
}
```

**Файл: `modules/home/react/hooks/useCategoryProducts.ts`**
```typescript
'use client';

import { useHomeCategory } from './useHomeCategories';
import type { HomeProduct } from '../../core/types';

/**
 * Hook для получения продуктов конкретной категории
 *
 * @example
 * ```tsx
 * const products = useCategoryProducts('electronics');
 * ```
 */
export function useCategoryProducts(
  categoryKey: 'electronics' | 'toys' | 'sport'
): HomeProduct[] {
  const category = useHomeCategory(categoryKey);
  return category?.products ?? [];
}
```

---

### Этап 6: Интеграция в SDK page.tsx (КРИТИЧНО)

Это ключевой этап — SDK's `[[...slug]]/page.tsx` должен по распарсенному роуту загружать данные и оборачивать в провайдер.

**Обновить: `packages/shopana-storefront-sdk/src/next/page.tsx`**
```typescript
import type { Metadata } from 'next';
import type { PageTemplate, TemplateParams } from '../core/types';
import { Builder } from '../core/Builder';
import { parseRoute } from '../utils/routeParser';
import { notFound } from 'next/navigation';

// Home module imports (direct imports, no index.ts)
import { loadHomeServerQuery } from '../modules/home/next/loaders/loadHomeServerQuery';
import { HomeDataProvider } from '../modules/home/react/providers/HomeDataProvider';

// Config will be passed from user's app
import { getEnvironmentConfig } from '../config';

type SlugParam = string[] | undefined;

interface PageProps {
  params: Promise<{ slug?: SlugParam }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// ... loadTemplate remains the same ...

// Page data structure per page type
interface PageData {
  home: {
    preloadedQuery: SerializablePreloadedQuery<any, any>;
  };
  product: {
    // TODO: product data
  };
  collection: {
    // TODO: collection data
  };
  // ... other page types
}

// Load data based on page type
async function loadPageData(ctx: TemplateParams): Promise<PageData[keyof PageData] | null> {
  const { pageType, params } = ctx;
  const environmentConfig = getEnvironmentConfig();

  switch (pageType) {
    case 'home': {
      const preloadedQuery = await loadHomeServerQuery({ environmentConfig });
      return { preloadedQuery };
    }
    case 'product': {
      // TODO: loadProductServerQuery({ environmentConfig, handle: params.handle })
      return null;
    }
    case 'collection': {
      // TODO: loadCollectionServerQuery({ environmentConfig, handle: params.handle })
      return null;
    }
    // ... other cases
    default:
      return null;
  }
}

// Wrap content with appropriate provider based on page type
function PageWrapper({
  pageType,
  data,
  children,
}: {
  pageType: string;
  data: any;
  children: React.ReactNode;
}) {
  switch (pageType) {
    case 'home':
      return (
        <HomeDataProvider preloadedQuery={data.preloadedQuery}>
          {children}
        </HomeDataProvider>
      );
    case 'product':
      // TODO: ProductDataProvider
      return <>{children}</>;
    case 'collection':
      // TODO: CollectionDataProvider
      return <>{children}</>;
    default:
      return <>{children}</>;
  }
}

// Main page component
export default async function Page({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { pageType, params: routeParams } = parseRoute(resolvedParams.slug ?? []);

  if (pageType === '404') {
    notFound();
  }

  const template = await loadTemplate(pageType);

  if (!template) {
    console.error(`No template found for pageType: ${pageType}`);
    notFound();
  }

  // Load data using appropriate loader for page type
  const data = await loadPageData({
    pageType,
    params: routeParams,
    searchParams: resolvedSearchParams,
  });

  // Render with page-specific provider
  return (
    <PageWrapper pageType={pageType} data={data}>
      <Builder
        template={template}
        data={data}
        pageType={pageType}
        fallback={<div>Loading...</div>}
      />
    </PageWrapper>
  );
}
```

**Ключевые изменения:**
1. `loadPageData()` вызывает `loadHomeServerQuery()` когда `pageType === 'home'`
2. `PageWrapper` оборачивает Builder в `HomeDataProvider` для home страницы
3. Данные загружаются на сервере (RSC), провайдер гидрирует их на клиенте

---

### Этап 7: Интеграция в приложение

`src/app/[locale]/(default)/[[...slug]]/page.tsx` уже интегрирован, без изменений.

**Удалить старые файлы:**
- `src/app/[locale]/(default)/page.tsx` - больше не нужен
- `src/app/[locale]/(default)/client.tsx` - больше не нужен

**Обновить: `src/templates/index.ts` (home template)**

Секции в шаблоне теперь получают данные через хуки SDK:

```typescript
// src/templates/index.ts
import type { Template } from '@shopana/storefront-sdk/core';
import MainLayout from '@/layout/Main';
import HeroSection from '@/sections/HeroSection';
import CategoryProductsSection from '@/sections/CategoryProductsSection';

const homeTemplate: Template = {
  layout: {
    component: MainLayout,
  },
  sections: {
    order: ['hero', 'electronics', 'sport', 'toys'],
    'hero': {
      component: HeroSection,
      settings: {},
    },
    'electronics': {
      component: CategoryProductsSection,
      settings: { categoryKey: 'electronics' },
    },
    'sport': {
      component: CategoryProductsSection,
      settings: { categoryKey: 'sport' },
    },
    'toys': {
      component: CategoryProductsSection,
      settings: { categoryKey: 'toys' },
    },
  },
};

export default homeTemplate;
```

**Пример секции использующей SDK хуки:**
```typescript
// src/sections/CategoryProductsSection/index.tsx
'use client';

import { useHomeCategory } from '@shopana/storefront-sdk/modules/home/hooks/useHomeCategories';
import { useCategoryProducts } from '@shopana/storefront-sdk/modules/home/hooks/useCategoryProducts';
import { ProductSlideShow } from '@/components/ProductSlideshow';

interface CategoryProductsSectionProps {
  id: string;
  settings: {
    categoryKey: 'electronics' | 'sport' | 'toys';
  };
}

export default function CategoryProductsSection({ settings }: CategoryProductsSectionProps) {
  const category = useHomeCategory(settings.categoryKey);
  const products = useCategoryProducts(settings.categoryKey);

  if (!category) return null;

  return (
    <ProductSlideShow
      title={category.title}
      products={products}
    />
  );
}
```

---

## Файлы для удаления из приложения

После миграции удалить:
```
src/hooks/home/
├── HomePageQuery/           # Перенесено в SDK
├── loadHomeServerQuery/     # Перенесено в SDK
├── useHomeClientQuery/      # Заменено на SDK hooks
└── interface.ts             # Перенесено в SDK

src/components/Home/ProductSlideshow/relay/
└── useProductSlideshowFragment.shopana.tsx  # Fragment теперь в SDK
```

---

## Checklist

### SDK — Home Module (без index.ts)
- [ ] `modules/home/core/types.ts`
- [ ] `modules/home/core/graphql/fragments/CategoryFragment.ts`
- [ ] `modules/home/core/graphql/queries/HomePageQuery.ts`
- [ ] `modules/home/react/context/HomeDataContext.tsx`
- [ ] `modules/home/react/providers/HomeDataProvider.tsx`
- [ ] `modules/home/react/hooks/useHomeData.ts`
- [ ] `modules/home/react/hooks/useHomeCategories.ts`
- [ ] `modules/home/react/hooks/useCategoryProducts.ts`
- [ ] `modules/home/next/loaders/loadHomeServerQuery.ts`

### SDK — Core Integration
- [ ] Обновить `src/next/page.tsx` — добавить loadPageData для home
- [ ] Обновить `src/next/page.tsx` — добавить PageWrapper с HomeDataProvider

### SDK — Relay
- [ ] Проверить `relay.shopana.json` — modules/home должен быть включен
- [ ] Запустить `yarn relay` для генерации типов

### Приложение
- [ ] Создать `src/templates/index.ts` — home template с секциями
- [ ] Создать `src/sections/CategoryProductsSection/index.tsx`
- [ ] Удалить `src/app/[locale]/(default)/page.tsx`
- [ ] Удалить `src/app/[locale]/(default)/client.tsx`
- [ ] Удалить `src/hooks/home/`
- [ ] Удалить `src/components/Home/ProductSlideshow/relay/useProductSlideshowFragment.shopana.tsx`

### Тестирование
- [ ] `yarn build` в SDK
- [ ] `yarn relay` в SDK
- [ ] `yarn dev` в приложении
- [ ] Проверить что `/` рендерит home page
- [ ] Проверить SSR (view source)
- [ ] Проверить hydration (console errors)
- [ ] Проверить что хуки возвращают данные в секциях

