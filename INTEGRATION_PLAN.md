# План интеграции @shopana/next-ecommerce-core

## Архитектура (как в Shopify Liquid)

### Иерархия компонентов:
1. **Blocks** (`/blocks`) - мелкие переиспользуемые UI-компоненты (Button, Image, Card)
2. **Sections** (`/sections`) - композитные секции, рендерят блоки (HeroSection, ProductDetailsSection)
3. **Pages** (`/pages`) - компоненты страниц, рендерят секции (HomePage, ProductPage)
4. **Templates** (`/templates`) - конфигурация, импортирует все компоненты и определяет структуру

### Поток данных:
```
Template (импортирует Page, Sections, Blocks)
  ↓
PageBuilder (получает template + data)
  ↓
Page Component (получает sections + data, рендерит секции)
  ↓ (map sections)
Section Components (получают settings + blocks + data, рендерят блоки)
  ↓ (map blocks)
Block Components (получают settings)
```

## Текущее состояние

### ✅ Готово
- Зависимость `@shopana/next-ecommerce-core` установлена
- TypeScript и Next.js настроены
- `ShopProvider` интегрирован в root layout
- Документация обновлена с правильной архитектурой

### ❌ Нужно сделать
- Создать папки `/blocks`, `/sections`, `/pages`, `/templates` в корне
- Создать простые Hello World компоненты
- Настроить path mappings в tsconfig
- Создать динамический роут
- Протестировать

## Структура после интеграции

```
/storefront (root)
├── blocks/                # Компоненты блоков
│   ├── Button/
│   │   └── index.tsx
│   └── Image/
│       └── index.tsx
│
├── sections/              # Компоненты секций
│   ├── HeroSection/
│   │   └── index.tsx
│   ├── ProductDetailsSection/
│   │   └── index.tsx
│   └── CollectionGridSection/
│       └── index.tsx
│
├── pages/                 # Компоненты страниц
│   ├── HomePage/
│   │   └── index.tsx
│   ├── ProductPage/
│   │   └── index.tsx
│   └── CollectionPage/
│       └── index.tsx
│
├── templates/             # Конфигурация шаблонов
│   ├── home.ts
│   ├── product.ts
│   ├── collection.ts
│   └── index.ts
│
├── packages/              # Monorepo packages
├── src/                   # Next.js приложение
│   └── app/
│       └── [locale]/
│           └── (shop)/
│               └── [[...slug]]/
│                   └── page.tsx
└── tsconfig.json
```

## Этапы интеграции

### Этап 1: Создать простые блоки (Hello World)

**1.1. Button Block** - `/blocks/Button/index.tsx`
```tsx
'use client';

interface ButtonProps {
  text: string;
  onClick?: () => void;
}

export default function Button({ text, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
      {text}
    </button>
  );
}
```

**1.2. Image Block** - `/blocks/Image/index.tsx`
```tsx
'use client';

interface ImageProps {
  src: string;
  alt: string;
}

export default function Image({ src, alt }: ImageProps) {
  return (
    <div style={{ padding: '1rem' }}>
      <img src={src} alt={alt} style={{ maxWidth: '100%' }} />
    </div>
  );
}
```

### Этап 2: Создать простые секции (Hello World)

**2.1. HeroSection** - `/sections/HeroSection/index.tsx`
```tsx
'use client';

import type { SectionProps } from '@shopana/next-ecommerce-core/core';

interface HeroSectionSettings {
  title?: string;
  subtitle?: string;
}

export default function HeroSection({ id, settings, blocks, data }: SectionProps<HeroSectionSettings, any>) {
  return (
    <section id={id} style={{ padding: '3rem', background: '#f0f0f0', textAlign: 'center' }}>
      <h1>{settings.title || 'Hero Section'}</h1>
      <p>{settings.subtitle || 'This is a hero section'}</p>

      {/* Рендерим блоки из template */}
      <div style={{ marginTop: '2rem' }}>
        {blocks?.map((block) => {
          const BlockComponent = block.component;
          return <BlockComponent key={block.id} {...block.settings} />;
        })}
      </div>

      <pre style={{ textAlign: 'left', fontSize: '12px' }}>{JSON.stringify({ settings, data }, null, 2)}</pre>
    </section>
  );
}
```

**2.2. ProductDetailsSection** - `/sections/ProductDetailsSection/index.tsx`
```tsx
'use client';

import type { SectionProps } from '@shopana/next-ecommerce-core/core';

export default function ProductDetailsSection({ id, settings, blocks, data }: SectionProps<any, any>) {
  return (
    <section id={id} style={{ padding: '2rem', background: '#e0f0ff' }}>
      <h2>Product Details Section</h2>

      {blocks?.map((block) => {
        const BlockComponent = block.component;
        return <BlockComponent key={block.id} {...block.settings} />;
      })}

      <pre style={{ fontSize: '12px' }}>{JSON.stringify({ settings, data }, null, 2)}</pre>
    </section>
  );
}
```

**2.3. CollectionGridSection** - `/sections/CollectionGridSection/index.tsx`
```tsx
'use client';

import type { SectionProps } from '@shopana/next-ecommerce-core/core';

export default function CollectionGridSection({ id, settings, blocks, data }: SectionProps<any, any>) {
  return (
    <section id={id} style={{ padding: '2rem', background: '#fff0e0' }}>
      <h2>Collection Grid Section</h2>

      {blocks?.map((block) => {
        const BlockComponent = block.component;
        return <BlockComponent key={block.id} {...block.settings} />;
      })}

      <pre style={{ fontSize: '12px' }}>{JSON.stringify({ settings, data }, null, 2)}</pre>
    </section>
  );
}
```

### Этап 3: Создать компоненты страниц

**3.1. HomePage** - `/pages/HomePage/index.tsx`
```tsx
'use client';

import type { LayoutProps } from '@shopana/next-ecommerce-core/core';
import type { HomePageData } from '@shopana/next-ecommerce-core/sdk';
import { SectionErrorBoundary } from '@shopana/next-ecommerce-core/core';

export default function HomePage({ sections, data }: LayoutProps<any, HomePageData>) {
  return (
    <main style={{ minHeight: '100vh' }}>
      <h1 style={{ padding: '2rem', textAlign: 'center', background: '#333', color: 'white', margin: 0 }}>
        Home Page
      </h1>

      {sections.map((section) => {
        const SectionComponent = section.component;
        return (
          <SectionErrorBoundary key={section.id} fallback={<div style={{ padding: '2rem', color: 'red' }}>Section Error</div>}>
            <SectionComponent
              id={section.id}
              settings={section.settings}
              blocks={section.blocks}
              data={data}
            />
          </SectionErrorBoundary>
        );
      })}
    </main>
  );
}
```

**3.2. ProductPage** - `/pages/ProductPage/index.tsx`
```tsx
'use client';

import type { LayoutProps } from '@shopana/next-ecommerce-core/core';
import type { ProductPageData } from '@shopana/next-ecommerce-core/sdk';
import { SectionErrorBoundary } from '@shopana/next-ecommerce-core/core';

export default function ProductPage({ sections, data }: LayoutProps<any, ProductPageData>) {
  return (
    <main style={{ minHeight: '100vh' }}>
      <h1 style={{ padding: '2rem', textAlign: 'center', background: '#1a5490', color: 'white', margin: 0 }}>
        Product Page
      </h1>

      {sections.map((section) => {
        const SectionComponent = section.component;
        return (
          <SectionErrorBoundary key={section.id} fallback={<div style={{ padding: '2rem', color: 'red' }}>Section Error</div>}>
            <SectionComponent
              id={section.id}
              settings={section.settings}
              blocks={section.blocks}
              data={data}
            />
          </SectionErrorBoundary>
        );
      })}
    </main>
  );
}
```

**3.3. CollectionPage** - `/pages/CollectionPage/index.tsx`
```tsx
'use client';

import type { LayoutProps } from '@shopana/next-ecommerce-core/core';
import type { CollectionPageData } from '@shopana/next-ecommerce-core/sdk';
import { SectionErrorBoundary } from '@shopana/next-ecommerce-core/core';

export default function CollectionPage({ sections, data }: LayoutProps<any, CollectionPageData>) {
  return (
    <main style={{ minHeight: '100vh' }}>
      <h1 style={{ padding: '2rem', textAlign: 'center', background: '#c75b12', color: 'white', margin: 0 }}>
        Collection Page
      </h1>

      {sections.map((section) => {
        const SectionComponent = section.component;
        return (
          <SectionErrorBoundary key={section.id} fallback={<div style={{ padding: '2rem', color: 'red' }}>Section Error</div>}>
            <SectionComponent
              id={section.id}
              settings={section.settings}
              blocks={section.blocks}
              data={data}
            />
          </SectionErrorBoundary>
        );
      })}
    </main>
  );
}
```

### Этап 4: Создать шаблоны (импортируют все компоненты)

**4.1. Home Template** - `/templates/home.ts`
```typescript
import type { PageTemplate } from '@shopana/next-ecommerce-core/core';
import type { HomePageData } from '@shopana/next-ecommerce-core/sdk';

// Импортируем компоненты
import HomePage from '@/pages/HomePage';
import HeroSection from '@/sections/HeroSection';
import Button from '@/blocks/Button';
import Image from '@/blocks/Image';

export const homeTemplate: PageTemplate<HomePageData> = {
  name: 'home',
  layout: {
    component: HomePage,
  },
  sections: {
    order: ['hero'],
    hero: {
      component: HeroSection,
      settings: {
        title: 'Welcome to Our Store',
        subtitle: 'Built with @shopana/next-ecommerce-core',
      },
      blocks: {
        order: ['hero-image', 'hero-button'],
        'hero-image': {
          component: Image,
          settings: {
            src: '/placeholder-hero.jpg',
            alt: 'Hero Image',
          },
        },
        'hero-button': {
          component: Button,
          settings: {
            text: 'Shop Now',
          },
        },
      },
    },
  },
};
```

**4.2. Product Template** - `/templates/product.ts`
```typescript
import type { PageTemplate } from '@shopana/next-ecommerce-core/core';
import type { ProductPageData } from '@shopana/next-ecommerce-core/sdk';

import ProductPage from '@/pages/ProductPage';
import ProductDetailsSection from '@/sections/ProductDetailsSection';
import Button from '@/blocks/Button';

export const productTemplate: PageTemplate<ProductPageData> = {
  name: 'product',
  layout: {
    component: ProductPage,
  },
  sections: {
    order: ['product-details'],
    'product-details': {
      component: ProductDetailsSection,
      settings: {},
      blocks: {
        order: ['add-to-cart-button'],
        'add-to-cart-button': {
          component: Button,
          settings: {
            text: 'Add to Cart',
          },
        },
      },
    },
  },
};
```

**4.3. Collection Template** - `/templates/collection.ts`
```typescript
import type { PageTemplate } from '@shopana/next-ecommerce-core/core';
import type { CollectionPageData } from '@shopana/next-ecommerce-core/sdk';

import CollectionPage from '@/pages/CollectionPage';
import CollectionGridSection from '@/sections/CollectionGridSection';

export const collectionTemplate: PageTemplate<CollectionPageData> = {
  name: 'collection',
  layout: {
    component: CollectionPage,
  },
  sections: {
    order: ['collection-grid'],
    'collection-grid': {
      component: CollectionGridSection,
      settings: {
        columns: 3,
      },
    },
  },
};
```

**4.4. Templates Registry** - `/templates/index.ts`
```typescript
import { registerTemplates } from '@shopana/next-ecommerce-core/core';
import { homeTemplate } from './home';
import { productTemplate } from './product';
import { collectionTemplate } from './collection';

// Регистрируем все шаблоны
registerTemplates([
  homeTemplate,
  productTemplate,
  collectionTemplate
]);
```

### Этап 5: Создать динамический роут

**5.1. Dynamic Route** - `/src/app/[locale]/(shop)/[[...slug]]/page.tsx`

```typescript
import { PageBuilder, resolvePageRequest } from '@shopana/next-ecommerce-core/core';
import { PageDataProvider } from '@shopana/next-ecommerce-core/core';
import type { Metadata } from 'next';

// ВАЖНО: Импортируем регистрацию шаблонов
import '@/templates';

interface PageProps {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = slug ? `/${slug.join('/')}` : '/';

  return {
    title: `Shop - ${path}`,
    description: `E-commerce page for ${path}`,
  };
}

export default async function ShopPage({ params }: PageProps) {
  const { slug } = await params;
  const path = slug ? `/${slug.join('/')}` : '/';

  // Резолвим тип страницы на основе URL
  const pageRequest = resolvePageRequest(path);

  // TODO: Загружать реальные данные из SDK
  // Пока используем mock данные
  const pageData = {
    type: pageRequest.type,
    // Здесь будут реальные данные
  };

  return (
    <PageDataProvider data={pageData}>
      <PageBuilder type={pageRequest.type} />
    </PageDataProvider>
  );
}
```

### Этап 6: Обновить tsconfig.json

Добавить path mappings для всех папок:

```json
{
  "compilerOptions": {
    "paths": {
      "@/blocks/*": ["../blocks/*"],
      "@/sections/*": ["../sections/*"],
      "@/pages/*": ["../pages/*"],
      "@/templates": ["../templates"],
      "@/templates/*": ["../templates/*"],
      // ... остальные paths
    }
  }
}
```

### Этап 7: Тестирование

**Проверить роуты:**
- `http://localhost:3000/` → HomePage с HeroSection
- `http://localhost:3000/products/test` → ProductPage с ProductDetailsSection
- `http://localhost:3000/collections/test` → CollectionPage с CollectionGridSection

**Проверить:**
- Секции рендерятся правильно
- Блоки отображаются внутри секций
- Props передаются корректно
- Нет ошибок в консоли

## Следующие шаги (после базовой интеграции)

1. Заменить Hello World компоненты на реальные UI
2. Добавить стили (CSS Modules или Tailwind)
3. Интегрировать реальный SDK для загрузки данных
4. Добавить больше секций и блоков
5. Настроить SEO metadata
6. Добавить обработку ошибок и loading states
