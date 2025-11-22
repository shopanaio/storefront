# Page Builder Framework (RSC + Code-First Architecture)

## 1. Общая концепция

**Цель:** Создать максимально производительный и простой в поддержке фреймворк для Next.js, где страницы собираются разработчиками через TypeScript-конфигурации (Code-First).

**Ключевые принципы:**
1.  **RSC First (Server Components):** Все секции рендерятся на сервере. HTML приходит в браузер готовым. JS не нужен для отображения контента.
2.  **Code-First Templates:** Шаблоны страниц — это TypeScript файлы, которые напрямую импортируют компоненты секций. Никаких строковых ID ('hero') и глобальных реестров.
3.  **Type Safety:** TypeScript автоматически проверяет соответствие настроек (`settings`) пропсам компонента прямо в шаблоне.
4.  **Islands Architecture:** Интерактивность (слайдеры, меню) добавляется точечно через `'use client'` компоненты внутри серверных секций.
5.  **Dynamic Imports:** Секции импортируются динамически (`next/dynamic`) для оптимизации размера бандла.
6.  **Fault Tolerance:** Каждая секция оборачивается в Error Boundary, чтобы ошибка в одном блоке не ломала всю страницу.

---

## 2. Data Flow (Поток данных)

### 2.1. Шаблоны (Templates)
Шаблон — это объект, описывающий структуру страницы. Он содержит **ссылки на функции компонентов**, а не их строковые названия.

```typescript
// src/templates/home.ts
import dynamic from 'next/dynamic';
import type { PageTemplate } from '@/core/types';

// Динамические импорты для код-сплиттинга
const Hero = dynamic(() => import('@/sections/Hero'));
const Features = dynamic(() => import('@/sections/Features'));

export const homeTemplate: PageTemplate = {
  sections: [
    {
      id: 'hero-main',
      component: Hero, // Прямая ссылка на компонент
      settings: {
        title: "Welcome to NextBuilder",
        subtitle: "RSC First Framework"
      }
    },
    {
      id: 'features-1',
      component: Features,
      settings: {
        columns: 3 // TypeScript проверит, что Features принимает prop columns
      }
    }
  ]
};
```

### 2.2. Страница (Server Component) внутри пакета
Во фреймворке реализована собственная RSC-страница (обработчик `app/[[...slug]]/page.tsx`), которая отвечает за загрузку данных (через Apollo/Relay/GraphQL), генерацию метаданных (SEO), выбор нужного шаблона и передачу **одного объекта данных** вниз в `PageBuilder`. Фактически все запросы обслуживает Apollo (кеш, рефетч, пагинация), но пользователи фреймворка об этом не знают: наружу торчит только типобезопасный интерфейс вида `fetchHomeData()` с уже собранным объектом. Пользователь пакета эту логику не пишет и не видит, максимум — реэкспортирует готовый компонент страницы.

```tsx
// (внутри пакета)
import { PageBuilder } from '@/core/PageBuilder';
import { homeTemplate } from '@/templates/home';
import type { HomePageData } from '@/types';
import type { Metadata } from 'next';

// 1. Генерация мета-тегов (Standard Next.js Mechanism)
// Фреймворк автоматически генерирует SEO-теги на основе данных страницы.
// Пользователю НЕ нужно вручную управлять <head> или писать generateMetadata.
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchSeoData(params);
  return {
    title: data.title,
    description: data.description
  };
}

// 2. Основной рендер
export default async function Page() {
  const data: HomePageData = await fetchHomeData();

  return (
    <PageBuilder
      template={homeTemplate}
      data={data} // Все данные страницы в одном объекте
    />
  );
}
```

### 2.3. Структура роутов (Shopify-style) и выбор шаблонов

Роуты имеют строгую структуру, аналогичную Shopify-магазинам, поэтому `[[...slug]]` можно однозначно распарсить в `pageType` и `params`:

- `/` → `pageType = 'home'`
- `/products/[handle]` → `pageType = 'product'`, `params = { handle }`
- `/collections/[handle]` → `pageType = 'collection'`, `params = { handle }`
- `/pages/[handle]` → `pageType = 'page'`, `params = { handle }`
- `/cart` → `pageType = 'cart'`

Внутри `app/[[...slug]]/page.tsx` есть небольшая утилита `parseRoute(slug: string[]): { pageType; params }`, которая:

- по массиву сегментов (`['products', handle]`, `['collections', handle]`, `['cart']`, `[]` и т.д.) возвращает `pageType` и `params`;
- по `pageType` выбирает нужный `PageTemplate` из реестра шаблонов.

Пользователь пакета только определяет свои шаблоны (`homeTemplate`, `productTemplate`, `collectionTemplate` и т.д.) и регистрирует их в этом реестре; парсинг роута и выбор шаблона целиком инкапсулированы во фреймворке.

Также используются стандартные файлы Next.js для обработки состояний:
- `loading.tsx` — Скелетоны/Спиннеры
- `error.tsx` — Глобальная ошибка страницы
- `not-found.tsx` — Страница 404

### 2.4. PageBuilder (Renderer)
Компонент, который просто проходит циклом по массиву секций и рендерит их. Каждая секция оборачивается в **Error Boundary**, чтобы ошибка в одной секции не ломала всю страницу.

```tsx
// src/core/PageBuilder.tsx
import { SectionErrorBoundary } from '@/core/SectionErrorBoundary';

export function PageBuilder({ template, data }: PageBuilderProps) {
  return (
    <main>
      {template.sections.map((section) => {
        const Component = section.component;

        return (
          <SectionErrorBoundary key={section.id} fallback={<div>Section Error</div>}>
            <Component
              id={section.id}
              settings={section.settings}
              data={data} // Глобальные данные (если нужны)
            />
          </SectionErrorBoundary>
        );
      })}
    </main>
  );
}
```

### 2.5. Глобальный контекст магазина (`useShop`)
Помимо данных конкретной страницы, в приложении есть глобальный контекст магазина (название проекта, валюта, локаль, включенные фичи и т.д.), доступный через хук `useShop`.

- На уровне корневого лейаута приложение оборачивается в `ShopProvider`:

```tsx
// src/app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import { ShopProvider } from '@/core/shop';
import type { ShopConfig } from '@/core/shop';

const shopConfig: ShopConfig = {
  name: 'My Shop',
  currency: 'USD',
  // ...
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ShopProvider config={shopConfig}>
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
```

- В любых секциях и блоках (и вообще в любом клиентском компоненте) можно вызвать `useShop()` и получить глобальную информацию:

```tsx
// src/sections/ProductHero/index.tsx
'use client';

import type { SectionProps } from '@/core/types';
import { useShop } from '@/core/shop';
import type { ProductPageData } from '@/types';

interface ProductHeroSettings {
  title: string;
}

export default function ProductHero(
  { id, settings, data }: SectionProps<ProductHeroSettings, ProductPageData>
) {
  const shop = useShop(); // глобальная информация о магазине/проекте

  return (
    <section id={id}>
      <h1>{settings.title}</h1>
      <p>{shop.name}</p>
      {/* data.product и другие сущности приходят через проп data */}
    </section>
  );
}
```

Важно: `useShop` — это отдельный слой поверх всего приложения и **не зависит от PageBuilder**. PageBuilder отвечает только за структуру и данные конкретной страницы, а глобальный контекст проекта живет в `ShopProvider` и доступен везде, где это нужно.

### 2.6. Entity-интерфейсы и Page Data
В проекте существуют зарезервированные entity-интерфейсы для доменных сущностей (продукт, категория, корзина и т.д.). Они используются как базовый слой данных, на котором строятся типы данных страниц.

- Примеры сущностей:

```ts
// src/core/entities.ts
export interface ProductEntity {
  id: string;
  handle: string;
  title: string;
  price: number;
  // ...
}

export interface CollectionEntity {
  id: string;
  handle: string;
  title: string;
  // ...
}
```

- Для каждой зарезервированной страницы определяется свой Page Data-тип на основе этих сущностей:

```ts
// src/types.ts
export interface ProductPageData {
  product: ProductEntity;
  relatedProducts: ProductEntity[];
}

export interface CollectionPageData {
  collection: CollectionEntity;
  products: ProductEntity[];
}
```

- Внутренняя страница фреймворка загружает данные и типизирует их через Page Data (пользователь этого кода не пишет):

```tsx
// (внутри пакета, упрощённо)
import type { ProductPageData } from './types';
import { PageBuilder } from './core/PageBuilder';
import { productTemplate } from './templates/product';
import { sdk } from './sdk/server';

export default async function ProductPage({ params }: { params: { handle: string } }) {
  const data: ProductPageData = await sdk.product.getPageData(params.handle);

  return <PageBuilder template={productTemplate} data={data} pageType="product" />;
}
```

- Секции на этих страницах получают строго типизированные данные через второй дженерик `SectionProps`:

```tsx
// src/sections/ProductHero/index.tsx
import type { SectionProps } from '@/core/types';
import type { ProductPageData } from '@/types';

interface ProductHeroSettings {
  title: string;
}

export default function ProductHero(
  { id, settings, data }: SectionProps<ProductHeroSettings, ProductPageData>
) {
  const { product } = data;

  return (
    <section id={id}>
      <h1>{settings.title ?? product.title}</h1>
    </section>
  );
}
```

Таким образом, entity-интерфейсы являются единым источником правды по структуре доменных объектов, Page Data-типы описывают данные конкретных страниц, а PageBuilder просто прокидывает один объект `data` из страницы в секции/блоки без использования глобального стора.

### 2.7. Page Data Context и SDK-хуки (`useProduct`, `useCollection`, ...)
Чтобы в секциях использовать удобные SDK-хуки (как в Shopify Liquid есть `product`, `collection` и т.д.), но при этом **не фетчить данные на клиенте заново**, поверх Page Data вводится общий контекст страницы.

- Вокруг `PageBuilder` добавляется провайдер контекста с типом и данными страницы:

```tsx
// src/core/PageDataContext.tsx
'use client';

import { createContext, useContext } from 'react';

export interface PageDataContextValue<TData = any> {
  pageType: 'product' | 'collection' | 'cart' | 'page' | 'home';
  data: TData;
}

const PageDataContext = createContext<PageDataContextValue | null>(null);

export function PageDataProvider<TData>({
  value,
  children,
}: {
  value: PageDataContextValue<TData>;
  children: React.ReactNode;
}) {
  return (
    <PageDataContext.Provider value={value}>
      {children}
    </PageDataContext.Provider>
  );
}

export function usePageData<TData = any>() {
  const ctx = useContext(PageDataContext);
  if (!ctx) {
    throw new Error('usePageData must be used within PageDataProvider');
  }
  return ctx as PageDataContextValue<TData>;
}
```

- `PageBuilder` оборачивает рендер секций в этот провайдер и прокидывает туда `pageType` и `data`:

```tsx
// src/core/PageBuilder.tsx (концептуально)
export function PageBuilder<TData>({ template, data, pageType }: PageBuilderProps<TData>) {
  return (
    <PageDataProvider value={{ pageType, data }}>
      <main>
        {template.sections.map((section) => {
          const Component = section.component;
          return (
            <Component
              key={section.id}
              id={section.id}
              settings={section.settings}
              data={data}
            />
          );
        })}
      </main>
    </PageDataProvider>
  );
}
```

- SDK-хуки для секций/блоков просто читают уже существующие данные из этого контекста:

```ts
// src/sdk/hooks.ts
import { usePageData } from '@/core/PageDataContext';
import type { ProductPageData, CollectionPageData } from '@/types';

export function useProduct() {
  const { pageType, data } = usePageData<ProductPageData>();
  if (pageType !== 'product') {
    throw new Error('useProduct can only be used on product pages');
  }
  return data.product;
}

export function useCollection() {
  const { pageType, data } = usePageData<CollectionPageData>();
  if (pageType !== 'collection') {
    throw new Error('useCollection can only be used on collection pages');
  }
  return data.collection;
}
```

- При этом **Server SDK** (функции наподобие `sdk.product.getByHandle`) является внутренней частью пакета: он используется только во внутренних RSC-страницах фреймворка для сборки `ProductPageData` / `CollectionPageData` и других Page Data-типов. Пользователь пакета про него не знает: снаружи он работает только с:
  - пропсами `data` в секциях/блоках (`SectionProps<Settings, PageData>`),
  - и клиентскими SDK-хуками (`useProduct`, `useCollection`, `useCart` и т.д.), которые **только читают уже загруженные данные** без дополнительных запросов.

Это делает разработку секций максимально похожей на Shopify Liquid: в шаблонах ты просто вызываешь `useProduct()` или `useCollection()`, а данные уже гарантированно загружены и зафиксированы на уровне страницы.

---

## 3. Структура фреймворка (npm-пакет)

```
src/
├── app/
│   └── [[...slug]]/
│       └── page.tsx           # Внутренняя RSC-страница фреймворка (зарезервированные роуты)
│
├── core/
│   ├── PageBuilder.tsx        # Основной рендерер
│   ├── PageDataContext.tsx    # Провайдер/хук usePageData
│   ├── types.ts               # TypeScript интерфейсы (SectionProps, PageTemplate, ...)
│   └── entities.ts            # Базовые entity-интерфейсы (ProductEntity, CollectionEntity, ...)
│
├── shop/                      # Глобальный контекст проекта/магазина
│   ├── types.ts               # ShopConfig и сопутствующие типы
│   ├── ShopContext.tsx        # Контекст + провайдер
│   ├── useShop.ts             # Хук useShop()
│   └── index.ts               # Публичные реэкспорты
│
├── sdk/
│   ├── server/                # Внутренний server SDK (только внутри пакета)
│   │   ├── product.ts
│   │   ├── collection.ts
│   │   └── cart.ts
│   └── client/                # Публичные client-хуки
│       ├── hooks.ts           # useProduct, useCollection, useCart, usePageData, ...
│       └── index.ts
│
├── sections/                  # Базовые секции, идущие из коробки (опционально)
│   └── Hero/
│       ├── index.tsx
│       └── styles.module.css
│
└── templates/                 # Базовые примеры шаблонов (опционально)
    ├── home.ts
    ├── product.ts
    └── collection.ts
```

Снаружи пакет экспортирует:
- ядро (`nextbuilder/core`): `PageBuilder`, `PageDataContext`, типы для секций/шаблонов/страниц;
- контекст магазина (`nextbuilder/shop`): `ShopProvider`, `useShop`, `ShopConfig`, ...;
- SDK (`nextbuilder/sdk`): entity-типы, Page Data-типы и client-хуки (`useProduct`, `useCollection`, ...), причём server SDK остаётся внутренним.

---

## 4. Структура проекта, использующего фреймворк

Ниже пример типичной структуры Next.js-приложения, которое использует пакет `nextbuilder`:

```
my-shop/
├── app/
│   ├── layout.tsx                # Оборачивает приложение в <ShopProvider> из пакета
│   ├── globals.css
│   └── [[...slug]]/
│       └── page.tsx              # Реэкспорт готовой страницы из пакета (router фреймворка)
│
├── src/
│   ├── sections/                 # Пользовательские секции
│   │   ├── Hero/
│   │   │   └── index.tsx
│   │   ├── ProductHero/
│   │   │   └── index.tsx
│   │   └── CollectionHero/
│   │       └── index.tsx
│   │
│   └── templates/                # Пользовательские шаблоны страниц
│       ├── home.ts               # PageTemplate<HomePageData>
│       ├── product.ts            # PageTemplate<ProductPageData>
│       └── collection.ts         # PageTemplate<CollectionPageData>
│
├── package.json
└── tsconfig.json
```

Ключевые моменты:
- **Пользователь не пишет server SDK и router для `/[[...slug]]`** — они инкапсулированы во фреймворке.
- Всё, что делает пользователь:
  - создаёт свои секции/блоки в `src/sections/**` (используя типы и хуки из `nextbuilder`);
  - создаёт свои шаблоны страниц в `src/templates/**` (опираясь на зарезервированные типы страниц и Page Data-типы из SDK);
  - при необходимости добавляет любые другие кастомные роуты в `app/**`, которые не пересекаются с зарезервированными путями фреймворка.

---

## 4. Типизация (Core Types)

Ключевой момент — правильная типизация, чтобы `settings` в шаблоне соответствовали компоненту.

```typescript
// src/core/types.ts
import type { ComponentType, ReactNode } from 'react';

// Базовые пропсы любой секции
export interface SectionProps<T = any> {
  id: string;
  settings: T;
  data?: any; // Глобальные данные страницы
}

// Определение инстанса секции в шаблоне
export interface SectionInstance<T = any> {
  id: string;
  component: ComponentType<SectionProps<T>> | React.LazyExoticComponent<ComponentType<SectionProps<T>>>; // Ссылка на компонент (в т.ч. dynamic)
  settings: T;                               // Настройки должны соответствовать T
}

export interface PageTemplate {
  name: string;
  sections: SectionInstance[];
}
```

---

## 5. Интерактивность (Islands)

Когда нужен JS (например, для открытия мобильного меню или слайдера), мы создаем "остров".

1.  **Server Section (`src/sections/Header.tsx`):**
    Рендерит статический логотип и ссылки.
2.  **Client Component (`src/components/islands/MenuToggle.tsx`):**
    Имеет директиву `'use client'`, state `isOpen` и обработчики событий.

```tsx
// src/sections/Header.tsx (Server Component)
import { MenuToggle } from '@/components/islands/MenuToggle';

export default function Header({ settings }) {
  return (
    <header>
      <Logo />
      <nav className="desktop-only">...</nav>

      {/* Остров интерактивности */}
      <MenuToggle />
    </header>
  )
}
```

---

## 6. Этапы реализации

### Этап 1: Core (Ядро)
1.  Создать типы `SectionProps`, `SectionInstance`, `PageTemplate`.
2.  Реализовать `PageBuilder.tsx`.
3.  Настроить базовый Next.js лейаут.

### Этап 2: Первая Секция (Proof of Concept)
1.  Создать секцию `Hero` (принимает `title`, `image`).
2.  Создать шаблон `home.ts` с использованием `Hero`.
3.  Вывести это на главной странице.
4.  **Цель:** Убедиться, что HTML рендерится, типы проверяются, JS на клиенте минимален.

### Этап 3: Данные и Блоки
1.  Добавить поддержку вложенных блоков (например, `Features` секция с блоками `FeatureItem`).
2.  Реализовать передачу глобальных данных (например, заглушка данных магазина) через проп `data` **без глобального стора** — вся страница описывается шаблоном и одним объектом `data`, а локальный интерактивный стейт живет внутри отдельных `'use client'` компонентов.

### Этап 4: Интерактивность
1.  Добавить клиентский компонент (Counter или Toggle).
2.  Встроить его в серверную секцию.
3.  Проверить работу с отключенным JS (должен отображаться контент, но не работать кнопка).

### Этап 5: SDK и Page Data Context
1.  Реализовать Server SDK-функции для загрузки доменных сущностей (`sdk.product.getByHandle`, `sdk.collection.getByHandle` и т.д.) и сборки Page Data-типов (`ProductPageData`, `CollectionPageData`, ...).
2.  Добавить `PageDataContext` + `PageDataProvider` и интегрировать их в `PageBuilder`, чтобы `pageType` и `data` были доступны во всех секциях/блоках.
3.  Реализовать клиентские SDK-хуки (`useProduct`, `useCollection`, `useCart`, ...) поверх `usePageData`, которые читают уже загруженные данные страницы, не инициируя новых запросов.
4.  Обновить пример секций, чтобы они могли использовать и `SectionProps<..., PageData>`, и SDK-хуки одновременно (например, `useProduct()` + `useShop()`).
