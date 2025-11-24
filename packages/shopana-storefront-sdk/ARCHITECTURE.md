# Page Builder Framework (RSC + Code-First Architecture)

## 1. Общая концепция

**Цель:** Создать максимально производительный и простой в поддержке фреймворк для Next.js, где страницы собираются разработчиками через TypeScript-конфигурации (Code-First).

Фреймворк не содержит никаких пользовательских компонентов или их примеров - только системные функции и компоненты необходимые для работы фреймворка.

**Ключевые принципы:**

1.  **RSC First (Server Components):** Страница-обвязка и `Builder` выполняются на сервере, HTML приходит в браузер готовым, а JS подключается только там, где он действительно нужен.
2.  **Code-First Templates:** Шаблоны страниц — это TypeScript файлы, которые напрямую импортируют компоненты секций. Template содержит конфигурацию страницы (похоже на как в shopify template liquid) только содержит импорты страниц, секций и блоков которые передаются в соответствующие поля template. Template это .ts объект экспортированный как export default.
3.  **Type Safety:** TypeScript автоматически проверяет соответствие настроек (`settings`) пропсам компонента прямо в шаблоне.
4.  **Islands Architecture:** Все остальное кроме страниц это клиентские компоненты с 'use client'
5.  **Dynamic Imports:** Внутренние RSC-страницы и пользовательские секции/блоки импортируются динамически (`next/dynamic`) для оптимизации размера бандла, а шаблоны подключаются синхронно через обычные импорты (`import productTemplate from '@/templates/product'`) для сохранения типизации.
6.  **Fault Tolerance:** Каждая страница, секция и блок оборачивается в Error Boundary, чтобы ошибка в одном блоке не ломала всю страницу.

---

## 2. Data Flow (Поток данных)

### 2.1. Шаблоны (Templates)

Шаблон — это объект, описывающий структуру страницы **как в Shopify Liquid**. Он импортирует все компоненты (Page, Sections, Blocks) и определяет их конфигурацию.

Во фреймворке зарезервированы названия шаблонов для всех основных страниц, home, product, collection, cart etc. Фреймворк импортирует их все через dynamic чтобы в bundle не попадали сразу все страницы а только та что рендерится по url. Пользователь обязан создать все зарезервированые файлы в `/templates/\*.ts`, даже если функциональность страницы пока не нужна (допустимы пустые плейсхолдеры, чтобы сборка не падала). Так реестр шаблонов всегда полный, а рантайм знает про все страницы.

Это просто пример шаблона главной страницы:

```typescript
// /templates/home.ts. - зарезервированное название ипортируется во фреймворке
import type { Template } from '@shopana/storefront-sdk/core';

// Импортируем компоненты (может быть dynamic)
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
    order: ['hero-main', 'features-1'], // порядок секций (как order в Shopify)
    'hero-main': {
      component: HeroSection,
      settings: {
        title: 'Welcome to NextBuilder',
        subtitle: 'RSC First Framework',
      },
      blocks: {
        order: ['hero-image', 'hero-button'], // порядок блоков (как block_order)
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

Layout внутри `template` — это просто React-компонент верхнего уровня. Builder передает в него массив секций (уже собранных из `template.sections`), но сам layout не описывает ни секции, ни блоки — он только решает, где и как отрендерить переданный список. Сами компоненты внутри шаблона разработчик может импортировать как напрямую, так и оборачивать в `next/dynamic`, а подключение готового шаблона к рантайму выполняется обычным `import`, чтобы Next.js сохранял прозрачную типизацию.

> **Важно (аналогия с Shopify Liquid):**
>
> - `type` → тип страницы (home, product, collection)
> - `layout` → компонент layout (обязательный; просто оборачивает переданные секции как `children` и сам не описывает их структуру)
> - `sections.order` → порядок секций (как order в Shopify)
> - `sections[id]` → объект секции с компонентом и настройками (аналог `sections[id]` в Shopify)
> - `sections[id].blocks.order` → порядок блоков внутри секции (как block_order)
> - `sections[id].blocks[blockId]` → конфиг блока (type + settings в Shopify)
> - Все компоненты импортируются в template и передаются в конфиг

### 2.2. Страница (Server Component) внутри пакета

Во фреймворке реализована собственная RSC-страница (обработчик `app/[[...slug]]/page.tsx`), которая отвечает за загрузку данных (через Relay/GraphQL), генерацию метаданных (SEO), выбор нужного шаблона и передачу **одного объекта данных** вниз в `Builder`. Фактически все запросы обслуживает Relay, но пользователи фреймворка об этом не знают: наружу торчит только типобезопасный интерфейс вида `fetchHomeData()` с уже собранным объектом. Пользователь пакета эту логику не пишет и не видит, максимум — реэкспортирует готовый компонент страницы.

`/templates/*.ts` это точки входа во фреймворк - остальное может быть импортировано из произвольных мест но мы рекомендуем иметь структуру папко как в shopify/liquid те. layouts, pages, sections, blocks.

Это пример страницы [...slug] которая парсит роут и рендерит правильную страницу и темплейт. Шаблоны импортируются динамически через компилируемый switch для оптимизации размера бандла, а оптимизацию дополнительно обеспечивают динамические секции/блоки. Это точка входа в рендеринг nextjs. Файл будет добавлен в пользовательский проект в app туда где пользователь желает монтировать зарезервированные пути. (Возможен сценарий с i18n /[locale]/[...slug]/page.tsx)

```tsx
// (внутри пакета)
import { Builder } from '@/core/Builder';
import type { Metadata } from 'next';

// 1. Генерация мета-тегов (Standard Next.js Mechanism)
// Фреймворк автоматически генерирует SEO-теги на основе данных страницы.
// Пользователю НЕ нужно вручную управлять <head> или писать generateMetadata.
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchSeoData(params);
  return {
    title: data.title,
    description: data.description,
  };
}

// 2. Основной рендер
export default async function Page({ params }: { params: { slug?: string[] } }) {
  const { pageType, params: routeParams } = parseRoute(params.slug || []);

  // Динамический импорт шаблона на основе pageType
  let template;
  if (pageType === 'home') {
    template = await import('@/templates/home').then(m => m.default);
  } else if (pageType === 'product') {
    template = await import('@/templates/product').then(m => m.default);
  } else if (pageType === 'collection') {
    template = await import('@/templates/collection').then(m => m.default);
  } else if (pageType === 'cart') {
    template = await import('@/templates/cart').then(m => m.default);
  } else if (pageType === 'page') {
    template = await import('@/templates/page').then(m => m.default);
  }

  // Загрузка данных на основе pageType и параметров
  const data = await loadPageData(pageType, routeParams);

  return (
    <Builder
      template={template}
      data={data}
      pageType={pageType}
    />
  );
}
```

Такой подход используется для всех зарезервированных страниц — шаблоны импортируются динамически через switch, что позволяет загружать только нужный шаблон для конкретного URL, сохраняя при этом полную типобезопасность на этапе компиляции.

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

Если используется i18n-структура вида `/[locale]/[[...slug]]`, Next.js middleware (например, `next-intl` или встроенный i18n) кладёт `locale` и связанные параметры в `params` до вызова нашей страницы. Фреймворк получает уже очищенный `slug` и locale в `params.locale`, поэтому `parseRoute` продолжает работать без изменений.

Пользователь пакета только определяет свои шаблоны (`home`, `product`, `collection` и т.д.) и регистрирует их в этом реестре; парсинг роута и выбор шаблона целиком инкапсулированы во фреймворке.

Для парсинга url используется библиотека path to regexp как в популярных фреймворках чтобы определить роут качественно.

### 2.4. Builder (Renderer)

Компонент, который выбирает layout из шаблона, рендерит секции и данные и оборачивает всё в `PageDataProvider`. Layout получает уже собранные секции как `children`, поэтому внутри него достаточно просто разместить `{children}` в нужном месте.

```tsx
// src/core/Builder.tsx
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

### 2.4.1. Компоненты Layout (Shopify liquid analogue)

Компоненты layouts получают уже отрендеренную страницу (все секции) через `children` и просто оборачивают её в собственную разметку. Пользователь может создать несколько layouts для разных страниц, например для страниц аутентификации можно использовать специальный layout. Вокруг `{children}` можно создать произвольную верстку как и в Shopify/Liquid. Эти компоненты создаются в проекте пользователем фреймворка.

```tsx
// /layout/Main/index.tsx
'use client';

import type { LayoutProps } from '@shopana/storefront-sdk/core';

export default function MainLayout({ children }: LayoutProps) {
  return (
    <main>
      {/* Custom JSX до контента */}
      {children}
      {/* Custom JSX после контента */}
    </main>
  );
}
```

### 2.4.2. Компоненты секций (Sections)

Это пример системного компонента Section предоставляемого через sdk. Этот компонент пользователь использует для отрисовки секций (инкапсуляция+логика спрятанная внутри фреймворка). Эти компоненты рендерятся внутри Layout (см. 2.4.1)

```tsx
export const Section = ({ component, ...config }: SectionConfig) => {
  const Component = component;
  return (
    <SectionErrorBoundary>
      {/* Передаем все кроме компонента */}
      <Component {...config} />
    </SectionErrorBoundary>
  );
};
```

`SectionErrorBoundary` работает исключительно как источник логов (например, для Sentry/Datadog). Пользователь не задаёт здесь UI-фолбек — если секция падает, на странице срабатывает общий fallback layout/page.

Это пример пользовательской секции. Секции получают блоки через props и рендерят их. Пользователь может рендерить их произвольно.

```tsx
// /sections/HeroSection/index.tsx
'use client';

import { Block } from '@shopana/storefront-sdk';
import type { SectionProps } from '@shopana/storefront-sdk/core';
import type { HomeTemplateData } from '@shopana/storefront-sdk/sdk';

export default function HeroSection({
  id,
  settings,
  blocks,
  data,
}: SectionProps<any, HomeTemplateData>) {
  return (
    <section id={id}>
      {/* Custom JSX */}
      {blocks?.map((block) => {
        return <Block key={block.id} {...block} />;
      })}
      {/* Custom JSX */}
    </section>
  );
}
```

### 2.4.3. Компоненты блоков (Blocks)

Это пример системного компонента Block предоставляемого через sdk. Этот компонент пользователь использует для отрисовки блока (инкапсуляция+логика спрятанная внутри фреймворка). Эти компоненты рендерятся внутри Section (см. 2.4.2)

```tsx
export const Block = ({ component, ...config }: BlockConfig) => {
  const Component = component;
  return (
    <BlockErrorBoundary>
      {/* Передаем все кроме компонента */}
      <Component {...config} />
    </BlockErrorBoundary>
  );
};
```

`BlockErrorBoundary` выполняет ту же задачу — логирование и сигнализация об ошибках. Отдельный визуальный fallback не рендерится; пользователь видит только page-level fallback.

Блоки — это переиспользуемые UI-компоненты.
Это пример блока Button в пользовательском проекте.

```tsx
// /blocks/Button/index.tsx
'use client';

export default function CTABlock({ id, settings }: BlockProps) {
  return (
    <div id={id}>
      <button onClick={onClick} className="btn">
        Pay now!
      </button>
      <button onClick={onClick} className="btn">
        Cancel
      </button>
    </div>
  );
}
```

### 2.5. Глобальный контекст магазина (`useShop`)

Помимо данных конкретной страницы, в приложении есть глобальный контекст магазина (название проекта, валюта, локаль, включенные фичи и т.д.), доступный через хук `useShop`.

`ShopProvider` — часть фреймворка: Builder оборачивает layout и все секции в провайдер автоматически, используя конфигурацию, определенную в пакете (например, на основе настроек магазина и локали). ShopConfig приезжает из бекенда (GraphQL/REST) вместе с данными страницы — server SDK получает его на сервере, и Builder передает готовый объект в `ShopProvider`. Пользовательский проект ничего не настраивает руками, а только читает данные или вызывает клиентские action-методы контекста.

- В любых секциях и блоках (и вообще в любом клиентском компоненте) можно вызвать `useShop()` и получить глобальную информацию:

```tsx
// src/sections/ProductHero/index.tsx
'use client';

import type { SectionProps } from '@/core/types';
import { useShop } from '@/core/shop';
import type { ProductTemplateData } from '@/types';

interface ProductHeroSettings {
  title: string;
}

export default function ProductHero({
  id,
  settings,
  data,
}: SectionProps<ProductHeroSettings, ProductTemplateData>) {
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

Важно: `useShop` — это отдельный слой поверх всего приложения и **не зависит от Builder**. Builder отвечает только за структуру и данные конкретной страницы, а глобальный контекст проекта живет в `ShopProvider` и доступен везде, где это нужно.

### 2.6. Entity-интерфейсы и Page Data

В проекте существуют зарезервированные entity-интерфейсы для доменных сущностей (продукт, категория, корзина и т.д.). Они используются как базовый слой данных, на котором строятся типы данных страниц. Этот слой вынесен в отдельный пакет `packages/entity`, и `@shopana/storefront-sdk` реэкспортирует нужные типы наружу, чтобы потребителю не приходилось подключать зависимость напрямую.

**Уточнение:** Entity-интерфейсы уже реализованы в отдельном пакете `packages/entity` и включают:
- `ProductEntity` - поля: id, title, handle, description, price, images, variants, options
- `CollectionEntity` - поля: id, title, handle, description, products
- `CartEntity` - поля: id, lines, totalPrice, checkoutUrl

- Для каждой зарезервированной страницы определяется свой Page Data-тип на основе этих сущностей:

```ts
// src/types.ts
export interface ProductTemplateData {
  product: ProductEntity;
  relatedProducts: ProductEntity[];
}

export interface CollectionTemplateData {
  collection: CollectionEntity;
  products: ProductEntity[];
}
```

- Внутренняя страница фреймворка загружает данные и типизирует их через Page Data (пользователь этого кода не пишет):

```tsx
// (внутри пакета, упрощённо)
import type { ProductTemplateData } from './types';
import { Builder } from './core/Builder';
import { productTemplate } from './templates/product';
import { sdk } from './sdk/server';

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const data: ProductTemplateData = await sdk.product.getTemplateData(params.handle);

  return (
    <Builder template={productTemplate} data={data} pageType="product" />
  );
}
```

- Секции на этих страницах получают строго типизированные данные через второй дженерик `SectionProps`:

```tsx
// src/sections/ProductHero/index.tsx
import type { SectionProps } from '@/core/types';
import type { ProductTemplateData } from '@/types';

interface ProductHeroSettings {
  title: string;
}

export default function ProductHero({
  id,
  settings,
  data,
}: SectionProps<ProductHeroSettings, ProductTemplateData>) {
  const { product } = data;

  return (
    <section id={id}>
      <h1>{settings.title ?? product.title}</h1>
    </section>
  );
}
```

Таким образом, entity-интерфейсы являются единым источником правды по структуре доменных объектов, Page Data-типы описывают данные конкретных страниц, а Builder просто прокидывает один объект `data` из страницы в секции/блоки без использования глобального стора.

### 2.7. Page Data Context и SDK-хуки (`useProduct`, `useCollection`, ...)

Чтобы в секциях использовать удобные SDK-хуки (как в Shopify Liquid есть `product`, `collection` и т.д.), но при этом **не фетчить данные на клиенте заново**, поверх Page Data вводится общий контекст страницы.

**Уточнение технической реализации:**
- **Data Loading:** Используется Relay для загрузки данных на сервере
- **Mutations:** GraphQL mutations через Relay как в текущем проекте
- **Error Handling:** Глобальный error boundary с кастомным UI и логированием в Sentry
- **Caching:** стандартный relay


Чтобы в секциях использовать удобные SDK-хуки (как в Shopify Liquid есть `product`, `collection` и т.д.), но при этом **не фетчить данные на клиенте заново**, поверх Page Data вводится общий контекст страницы.

- Вокруг `Builder` добавляется провайдер контекста с типом и данными страницы:

```tsx
// src/core/TemplateDataContext.tsx
'use client';

import { createContext, useContext } from 'react';

export interface TemplateDataContextValue<TData = any> {
  pageType: 'product' | 'collection' | 'cart' | 'page' | 'home';
  data: TData;
}

const TemplateDataContext = createContext<TemplateDataContextValue | null>(null);

export function TemplateDataProvider<TData>({
  value,
  children,
}: {
  value: TemplateDataContextValue<TData>;
  children: React.ReactNode;
}) {
  return (
    <TemplateDataContext.Provider value={value}>
      {children}
    </TemplateDataContext.Provider>
  );
}

export function useTemplateData<TData = any>() {
  const ctx = useContext(TemplateDataContext);
  if (!ctx) {
    throw new Error('useTemplateData must be used within TemplateDataProvider');
  }
  return ctx as TemplateDataContextValue<TData>;
}
```

- `Builder` оборачивает рендер секций в этот провайдер и прокидывает туда `pageType` и `data`:

```tsx
// src/core/Builder.tsx (концептуально)
export function Builder<TData>({
  template,
  data,
  pageType,
}: BuilderProps<TData>) {
  return (
    <TemplateDataProvider value={{ pageType, data }}>
      <main>
        {template.sections.order.map((sectionId) => {
          const section = template.sections[sectionId];
          if (!section || Array.isArray(section)) return null;

          const Component = section.component;
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
            <Component
              key={sectionId}
              id={sectionId}
              settings={section.settings}
              blocks={blocks}
              data={data}
            />
          );
        })}
      </main>
    </TemplateDataProvider>
  );
}
```

- SDK-хуки для секций/блоков просто читают уже существующие данные из этого контекста:

```ts
// src/sdk/hooks.ts
import { useTemplateData } from '@/core/TemplateDataContext';
import type { ProductTemplateData, CollectionTemplateData } from '@/types';

export function useProduct() {
  const { pageType, data } = useTemplateData<ProductTemplateData>();
  if (pageType !== 'product') {
    throw new Error('useProduct can only be used on product pages');
  }
  return data.product;
}

export function useCollection() {
  const { pageType, data } = useTemplateData<CollectionTemplateData>();
  if (pageType !== 'collection') {
    throw new Error('useCollection can only be used on collection pages');
  }
  return data.collection;
}
```

- При этом **Server SDK** (функции наподобие `sdk.product.getByHandle`) является внутренней частью пакета: он используется только во внутренних RSC-страницах фреймворка для сборки `ProductTemplateData` / `CollectionTemplateData` и других Page Data-типов. Пользователь пакета про него не знает: снаружи он работает только с:
  - пропсами `data` в секциях/блоках (`SectionProps<Settings, TemplateData>`),
  - и клиентскими SDK-хуками (`useProduct`, `useCollection`, `useCart` и т.д.), которые **только читают уже загруженные данные** без дополнительных запросов.

Это делает разработку секций максимально похожей на Shopify Liquid: в шаблонах ты просто вызываешь `useProduct()` или `useCollection()`, а данные уже гарантированно загружены и зафиксированы на уровне страницы.

---

## 3. Структура фреймворка (npm-пакет)

### 3.1. Организация как npm-пакет

**Важно:** Фреймворк должен быть реализован как npm-пакет в директории `packages/` с использованием monorepo-подхода.

**Зависимости пакета (package.json):**

```json
{
  "name": "@shopana/storefront-sdk",
  "version": "1.0.0",
  "peerDependencies": {
    "next": "^14.0.0 || ^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Почему Next.js в peerDependencies и devDependencies:**

- `peerDependencies`: Next.js должен быть установлен в проекте пользователя — фреймворк использует RSC, App Router и другие возможности Next.js, которые должны быть настроены на уровне проекта.
- `devDependencies`: Next.js нужен для разработки самого пакета — тестирования, сборки примеров, работы с TypeScript-типами из `next/dynamic`, `next/server` и т.д.

### 3.2. Структура исходного кода

```
src/
├── app/
│   └── [[...slug]]/
│       ├── page.tsx           # Внутренняя RSC-страница фреймворка (зарезервированные роуты)
│       ├── error.tsx          # Глобальный error boundary с Sentry логированием
│       └── not-found.tsx      # 404 страница для несуществующих роутов
│
├── core/
│   ├── Builder.tsx            # Основной рендерер
│   ├── TemplateDataContext.tsx    # Провайдер/хук useTemplateData
│   ├── Section.tsx            # Системный компонент секции
│   ├── Block.tsx              # Системный компонент блока
│   ├── ErrorBoundary.tsx      # Глобальный error boundary для секций и блоков
│   ├── types.ts               # TypeScript интерфейсы (SectionProps, PageTemplate, ...)
│   └── entities.ts            # Реэкспорт entity-интерфейсов из packages/entity
│
├── shop/                      # Глобальный контекст проекта/магазина
│   ├── types.ts               # ShopConfig и сопутствующие типы
│   ├── ShopContext.tsx        # Контекст + провайдер
│   ├── useShop.ts             # Хук useShop()
│   └── index.ts               # Публичные реэкспорты
│
├── sdk/
│   ├── server/                # Внутренний server SDK (только внутри пакета)
│   │   ├── product.ts         # Relay queries для product страниц
│   │   ├── collection.ts      # Relay queries для collection страниц
│   │   ├── cart.ts            # Relay queries для cart страниц
│   │   └── home.ts            # Relay queries для home страниц
│   └── client/                # Публичные client-хуки
│       ├── hooks.ts           # useProduct, useCollection, useCart, useTemplateData
│       ├── mutations.ts       # GraphQL mutations через Relay
│       └── index.ts           # Публичные реэкспорты
│
└── utils/
    ├── routeParser.ts         # Утилита parseRoute для парсинга URL
    └── logger.ts              # Sentry интеграция для логирования ошибок
```

Снаружи пакет экспортирует:

- ядро (`@shopana/storefront-sdk/core`): `Builder`, `TemplateDataContext`, типы для секций/шаблонов/страниц;
- SDK (`@shopana/storefront-sdk/sdk`): shop: `ShopProvider`, `useShop`, `ShopConfig`, ..., entity-типы, Page Data-типы и client-хуки (`useProduct`, `useCollection`, ...), причём server SDK остаётся внутренним.

---

## 4. Структура проекта, использующего фреймворк

Ниже пример типичной структуры Next.js-приложения, которое использует пакет `@shopana/storefront-sdk`:

```
my-shop/src.                      # src
├── app/[locale]/.                # Locale is optional.
│   ├── layout.tsx                # Оборачивает приложение в <ShopProvider> из пакета
│   ├── globals.css
│   └── [[...slug]]/
│       └── page.tsx              # Реэкспорт готовой страницы из пакета (router фреймворка)
│
├── blocks/                       # Компоненты блоков (мелкие переиспользуемые компоненты)
│   ├── CTA/
│   │   └── index.tsx
│   ├── Card/
│   │   └── index.tsx
│   └── Gallery/
│       └── index.tsx
│
├── sections/                     # Компоненты секций (используют блоки)
│   ├── HeroSection/
│   │   └── index.tsx
│   ├── ProductDetailsSection/
│   │   └── index.tsx
│   └── CollectionGridSection/
│       └── index.tsx
│
├── layout/                        # Компоненты layout (рендерят секции)
│   ├── Main/
│   │   └── index.tsx
│   └── Auth/
│       └── index.tsx
│
└── templates/                    # Конфигурация шаблонов (связывают компоненты страниц с типами)
    ├── home.ts                   # PageTemplate
    ├── product.ts                # PageTemplate
    └── collection.ts             # тут обязаны быть все зарезервированные файлы templates.
# Дальше пользовательский проект
```

### Иерархия компонентов:

1. **Blocks** → мелкие переиспользуемые компоненты (Button, Card, Image)
2. **Sections** → составные секции, используют блоки (HeroSection, ProductDetailsSection)
3. **Layout** → компоненты layout, рендерят секции (HomePage, ProductPage)
4. **Templates** → конфигурация, связывающая компоненты страниц с типами данных

Ключевые моменты:

- **Пользователь не пишет server SDK и router для `/[[...slug]]`** — они инкапсулированы во фреймворке.
- Всё, что делает пользователь:
  - создаёт блоки в `/blocks/**` (переиспользуемые UI-компоненты);
  - создаёт секции в `/sections/**` (композиции из блоков, используя типы и хуки из `@shopana/storefront-sdk`);
  - создаёт страницы в `/layout/**` (компоненты, которые рендерят секции);
  - создаёт шаблоны в `/templates/**` (конфигурация, связывающая компоненты страниц с типами данных из SDK);
  - при необходимости добавляет любые другие кастомные роуты в `app/**`, которые не пересекаются с зарезервированными путями фреймворка.

---

## 4. Технические уточнения и типизация

### 4.1. Техническая реализация

**Уточненные технические решения:**
- **Data Loading:** Relay для загрузки данных на сервере без кэширования
- **Mutations:** GraphQL mutations через Relay как в текущем проекте
- **Error Handling:** Глобальный error boundary с кастомным UI и логированием в Sentry
- **Entity Types:** Используются из готового пакета `packages/entity`

### 4.2. Зависимости пакета (обновленные)

```json
{
  "name": "@shopana/storefront-sdk",
  "version": "1.0.0",
  "peerDependencies": {
    "next": "^14.0.0 || ^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@shopana/entity": "^1.0.0",
    "relay-runtime": "^15.0.0"
  },
  "devDependencies": {
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@shopana/entity": "^1.0.0",
    "relay-runtime": "^15.0.0",
    "@sentry/nextjs": "^7.0.0"
  }
}
```

### 4.3. Core Types

Ключевой момент — правильная типизация на всех уровнях: blocks, sections, pages, templates (как в Shopify Liquid).

Публичные типы, доступные потребителю через `@shopana/storefront-sdk/core`:

- `PageType` — union типов страниц (`'home' | 'product' | ...`);
- `BlockProps` — пропсы блоков в пользовательском коде;
- `SectionProps` — пропсы секций в пользовательском коде;
- `LayoutProps` — пропсы layout-компонентов (только `children`);
- `Template` — тип шаблона страницы, используемый в `/templates/*.ts`.

Остальные типы из этого блока (`TemplateParams`, `BlockInstance`, `SectionCollection`, `PageBuilderProps`, `PageDataLoader`, `TemplateRegistration` и т.д.) являются **внутренними типами фреймворка** и используются только внутри пакета.

```typescript
// src/core/types.ts
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

export interface BlockConfig<TSettings = any> {
  component: BlockComponent<TSettings>;
  settings: TSettings;
}

export interface BlockCollection<TSettings = any> {
  order: string[];
  [blockId: string]: BlockConfig<TSettings> | string[];
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

export interface SectionInstance<TSettings = any, TData = any> {
  id: string;
  component: SectionComponent<TSettings, TData>;
  settings: TSettings;
  blocks?: BlockInstance[];
}

export interface SectionConfig<TSettings = any, TData = any> {
  component: SectionComponent<TSettings, TData>;
  settings: TSettings;
  blocks?: BlockCollection;
}

export interface SectionCollection<TData = any> {
  order: string[];
  [sectionId: string]: SectionConfig<any, TData> | string[];
}

export interface LayoutProps {
  children: ReactNode;
}

export type LayoutComponent =
  | ComponentType<LayoutProps>
  | LazyExoticComponent<ComponentType<LayoutProps>>;

export interface TemplateLayout<TSettings = any, TData = any> {
  component: LayoutComponent;
  settings?: TSettings;
}

export interface PageTemplate<TData = any, TLayoutSettings = any> {
  layout: TemplateLayout<TLayoutSettings, TData>;
  sections: SectionCollection<TData>;
}

export interface PageBuilderProps<TData = any> {
  template: PageTemplate<TData>;
  data: TData;
  pageType: PageType;
  fallback?: ReactNode;
}

export type PageDataLoader<TData = any> = (ctx: TemplateParams) => Promise<TData>;

export type MetadataBuilder<TData = any, TMetadata = Record<string, any>> = (
  ctx: TemplateParams & { resolved?: TData }
) => Promise<TMetadata> | TMetadata;

export interface TemplateRegistration<TData = any> {
  template: PageTemplate<TData>;
  loadData: PageDataLoader<TData>;
  buildMetadata?: MetadataBuilder<TData>;
}

Реестр `TemplateRegistration` полностью живёт внутри пакета: для каждой зарезервированной страницы мы предоставляем свой `template`, `loadData` и `buildMetadata`. Пользовательские шаблоны подключаются через TypeScript-файлы в `/templates`, а к данным они получают доступ только из секций/блоков (второй дженерик `SectionProps`) и через клиентские SDK-хуки. Пользователю не нужно (и не разрешается) регистрировать собственные лоадеры или метаданные — все запросы обслуживаются серверным SDK, инкапсулированным во фреймворке.
```

### Поток данных:

```
Template (импортирует все компоненты)
  ↓
Builder (получает template + data)
  ↓
Layout Component (получает sections + data)
  ↓ (map по sections)
Section Components (получают settings + blocks + data)
  ↓ (map по blocks)
Block Components (получают settings)
```

---

## 5. Технические решения и ограничения

### 5.1. Реализованные технические решения

| Компонент | Реализация | Комментарий |
|-----------|------------|-------------|
| **Data Loading** | Relay | Используется для загрузки данных на сервере |
| **Mutations** | GraphQL mutations через Relay | Как в текущем проекте |
| **Error Handling** | Global error boundary + Sentry | Кастомный UI и логирование |
загружаются при каждом запросе |
| **Entity Types** | packages/entity | Готовые типы ProductEntity, CollectionEntity, CartEntity |
| **Routing** | Next.js App Router | [[...slug]] для всех страниц |
| **State Management** | React Context + Relay | Без дополнительных state management библиотек |

### 5.2. Зарезервированные пути

Фреймворк использует следующие зарезервированные пути и соответствующие им шаблоны:
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

### 5.3. Обязательные файлы для пользователя

Пользователь обязан создать следующие файлы в `/templates/*.ts`:
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

Даже если функциональность не нужна, файлы должны существовать (можно пустые).

> **План внедрения и актуальный трекер задач** см. в `packages/next-ecommerce-core/IMPLEMENTATION_PLAN.md`.
