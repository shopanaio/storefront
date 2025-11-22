# Page Builder Framework Architecture

## 1. Общая концепция

**Цель:** Построить фреймворк для Next.js приложений, где страницы собираются из переиспользуемых секций и блоков, настраиваемых через TypeScript конфигурации.

**Принципы:**
- **Section** (Секция) - крупный клиентский layout компонент страницы (`'use client'`)
- **Block** (Блок) - мелкий переиспользуемый клиентский компонент внутри секций (`'use client'`)
- **Schema** - JSON-описание настроек для секций/блоков
- **Template** - TypeScript конфигурация страницы (какие секции, в каком порядке, с какими настройками)
- **Page** (Страница) - серверный компонент который загружает данные и рендерит PageBuilder
- **Registry** - централизованная регистрация всех секций и блоков для динамической загрузки
- **Module Registry Pattern** - используется существующий паттерн из проекта для консистентности

**Архитектура рендеринга:**
```
Server Component (app/[locale]/products/[id]/page.tsx)
  ├─ Загрузка данных (async/await, fetch API, database)
  ├─ Создание template с данными
  └─ <PageBuilder template={template}> (Client Component)
      └─ Секции и блоки (все Client Components с 'use client')
```

---

## 2. Data Flow и Zustand State Management

### Управление состоянием через Zustand

Состояние page-builder управляется через Zustand store для максимальной производительности и гибкости:

```
PageBuilder
  └─ PageBuilderStoreProvider (Zustand store instance)
      └─ SectionRenderer (читает из store через селекторы)
          └─ BlockRenderer (читает из store через селекторы)
```

**Преимущества Zustand подхода:**
- ✅ **Селекторы** - точечные подписки на нужные части состояния
- ✅ **Оптимизация** - автоматическая оптимизация ре-рендеров через shallow equality
- ✅ **Производительность** - компоненты обновляются только когда изменяются выбранные данные
- ✅ **Гибкость** - вся мощь Zustand API доступна пользователям (middleware, devtools, persist)
- ✅ **Типобезопасность** - полная поддержка TypeScript с выводом типов
- ✅ **DevTools** - интеграция с Redux DevTools для отладки

### Доступные хуки для компонентов

#### Глобальная конфигурация магазина

**`useShop()`** - Глобальная конфигурация магазина (независимо от PageBuilder):
- `shop.name`, `shop.email`, `shop.domain` - информация о магазине
- `shop.locale`, `shop.currency` - текущая локаль и валюта
- `shop.features` - включенные фичи (cart, wishlist, reviews и т.д.)
- `shop.formatMoney(amount)` - форматирование денег с учетом валюты
- `shop.formatDate(date)` - форматирование дат
- `shop.formatWeight(weight)` - форматирование веса
- `shop.hasFeature(feature)` - проверка наличия фичи
- `shop.social`, `shop.address`, `shop.seo` - дополнительные данные

#### PageBuilder Zustand Hooks (с поддержкой селекторов)

**`usePage<TData>(selector?)`** - Доступ к глобальным данным страницы:
- Без селектора: `const page = usePage()` - возвращает весь state страницы
- С селектором: `const productName = usePage(state => state.data?.product.name)` - подписка только на конкретное поле
- `page.data` - данные загруженные на уровне страницы (например, из API)
- `page.metadata` - метаданные страницы
- `page.pageId`, `page.pageName` - информация о странице

**`useSection<TSettings>(sectionId, selector?)`** - Доступ к контексту секции:
- Обязательный параметр `sectionId` - ID секции для доступа к её данным
- Без селектора: `const section = useSection('section-1')` - возвращает всю секцию
- С селектором: `const title = useSection('section-1', s => s.settings.title)` - подписка только на title
- `section.settings` - настройки секции
- `section.schema` - schema секции
- `section.blocks` - дочерние блоки

**`useBlock<TSettings>(blockId, selector?)`** - Доступ к контексту блока:
- Обязательный параметр `blockId` - ID блока для доступа к его данным
- Без селектора: `const block = useBlock('block-1')` - возвращает весь блок
- С селектором: `const content = useBlock('block-1', b => b.settings.content)` - подписка только на content
- `block.settings` - настройки блока
- `block.schema` - schema блока
- `block.blockId`, `block.blockType` - информация о блоке

**`usePageBuilder()`** - Доступ к Page Builder registry (без изменений):
- `getSectionSchema(slug)` - получить schema секции
- `getBlockSchema(slug)` - получить schema блока
- `listSections()` - список всех зарегистрированных секций
- `listBlocks()` - список всех зарегистрированных блоков

**`usePageBuilderStore(selector?)`** - Прямой доступ к Zustand store:
- Для продвинутого использования и кастомных селекторов
- `const allSections = usePageBuilderStore(state => state.sections)` - все секции
- `const specificBlock = usePageBuilderStore(state => state.blocks['block-1'])` - конкретный блок

#### Комбинирование хуков

Все хуки можно использовать вместе в любом компоненте:

```typescript
function ProductSection({ id }: SectionProps) {
  const shop = useShop();              // Глобальная конфигурация
  const page = usePage<ProductData>(); // Данные страницы (вся структура)
  const section = useSection(id);      // Контекст секции

  return (
    <section>
      <h1>{shop.name}</h1>
      <p>{shop.formatMoney(page.data?.product.price)}</p>
    </section>
  );
}

// С использованием селекторов для оптимизации
function ProductSectionOptimized({ id }: SectionProps) {
  const shop = useShop();
  // Подписка ТОЛЬКО на product.price - компонент НЕ будет ре-рендериться при изменении других данных
  const productPrice = usePage(state => state.data?.product.price);
  // Подписка ТОЛЬКО на title секции
  const sectionTitle = useSection(id, s => s.settings.title);

  return (
    <section>
      <h1>{sectionTitle}</h1>
      <p>{shop.formatMoney(productPrice)}</p>
    </section>
  );
}
```

### Объявление интерфейсов

**Типизация настроек секции/блока:**
```typescript
// types.ts
export interface MySectionSettings {
  title: string;
  variant: 'default' | 'alternative';
}

// MySection.tsx
export default function MySection({ settings }: SectionProps) {
  const { title, variant } = settings as MySectionSettings;
  const section = useSection<MySectionSettings>();
  // section.settings теперь типизирован
}
```

**Типизация данных страницы:**
```typescript
// types.ts
export interface ProductPageData {
  product: { id: string; name: string; price: number };
  relatedProducts: Array<{ id: string; name: string }>;
}

// page.tsx
const template: PageTemplate<ProductPageData> = {
  id: 'product-page',
  name: 'Product Page',
  sections: [...],
  data: pageData, // ProductPageData
};

// ProductHeroSection.tsx
export default function ProductHeroSection() {
  const page = usePage<ProductPageData>();
  const product = page.data?.product; // типизировано
}
```

---

## 3. Структура проекта

```
src/
├── core/
│   ├── shop/                      # Глобальная конфигурация магазина
│   │   ├── types.ts               # Типы ShopConfig, Locale и т.д.
│   │   ├── ShopContext.tsx        # React Context для магазина
│   │   ├── useShop.ts             # Hook для доступа к конфигу
│   │   └── index.ts               # Экспорты
│   │
│   └── page-builder/              # Core система рендеринга
│       ├── types.ts               # TypeScript типы
│       ├── registry.ts            # PageBuilderRegistry класс (аналог ModuleRegistry)
│       ├── context.tsx            # Page/Section/Block Context
│       ├── hooks.ts               # usePage/useSection/useBlock
│       ├── PageBuilder.tsx        # Главный компонент
│       ├── SectionRenderer.tsx    # Рендер секций (с lazy loading)
│       ├── BlockRenderer.tsx      # Рендер блоков (с lazy loading)
│       └── index.ts               # Экспорты + auto-discovery
│
├── sections/                      # Секции (создаются пользователями фреймворка)
│   ├── index.ts                  # Auto-discovery через require.context
│   └── [SectionName]/
│       ├── [SectionName].tsx     # React компонент (default export)
│       ├── schema.ts             # Схема настроек
│       ├── types.ts              # Типы для props
│       └── register.ts           # Регистрация в registry
│
├── blocks/                        # Блоки (создаются пользователями фреймворка)
│   ├── index.ts                  # Auto-discovery через require.context
│   └── [BlockName]/
│       ├── [BlockName].tsx       # React компонент (default export)
│       ├── schema.ts
│       ├── types.ts
│       └── register.ts
│
├── templates/                     # TypeScript конфигурации страниц
│   ├── home.ts                   # Главная
│   ├── about.ts                  # О нас
│   └── ...
│
└── app/
    └── [locale]/
        └── [[...slug]]/          # Dynamic route для всех страниц
            └── page.tsx          # Загружает template и рендерит PageBuilder
```

---

## 4. Ключевые компоненты системы

### 4.0 Shop Context - Глобальная конфигурация магазина (`src/core/shop/`)

**Аналог Shopify shop object - глобальные настройки доступные везде в приложении**

**`types.ts` - Типы конфигурации магазина:**
```typescript
// Локализация
export interface Locale {
  code: string;              // 'en', 'uk', 'ru'
  name: string;              // 'English', 'Українська'
  direction: 'ltr' | 'rtl';  // Направление текста
}

export interface Currency {
  code: string;              // 'USD', 'UAH', 'EUR'
  symbol: string;            // '$', '₴', '€'
  symbolPosition: 'before' | 'after';  // '$100' или '100₴'
  decimalSeparator: string;  // '.' или ','
  thousandsSeparator: string; // ',' или ' '
  decimals: number;          // Количество знаков после запятой
}

export interface MoneyFormat {
  currency: Currency;
  locale: Locale;
}

// Настройки магазина
export interface ShopConfig {
  // Основная информация
  name: string;                    // Название магазина
  domain: string;                  // example.com
  email: string;                   // contact@example.com
  phone?: string;                  // +380XXXXXXXXX

  // Локализация
  locale: Locale;                  // Текущая локаль
  availableLocales: Locale[];      // Доступные языки
  currency: Currency;              // Текущая валюта
  availableCurrencies: Currency[]; // Доступные валюты
  timezone: string;                // 'Europe/Kyiv'

  // Настройки отображения
  moneyFormat: MoneyFormat;        // Формат денег
  dateFormat: string;              // 'DD/MM/YYYY' или 'MM/DD/YYYY'
  weightUnit: 'kg' | 'lb' | 'g' | 'oz';
  measurementUnit: 'metric' | 'imperial';

  // Фичи
  features: {
    cart: boolean;                 // Включена корзина
    wishlist: boolean;             // Wishlist функционал
    reviews: boolean;              // Отзывы на товары
    compareProducts: boolean;      // Сравнение товаров
    giftCards: boolean;            // Подарочные карты
    subscriptions: boolean;        // Подписки
    multiCurrency: boolean;        // Мультивалютность
    inventory: boolean;            // Управление инвентарем
  };

  // SEO и метаданные
  seo?: {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
  };

  // Социальные сети
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };

  // Адрес
  address?: {
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode: string;
  };

  // Дополнительные настройки
  metadata?: Record<string, any>;  // Кастомные поля
}

// Helper типы
export type WeightUnit = ShopConfig['weightUnit'];
export type MeasurementUnit = ShopConfig['measurementUnit'];
```

**`ShopContext.tsx` - React Context Provider:**
```typescript
'use client';

import { createContext, type ReactNode } from 'react';
import type { ShopConfig } from './types';

export const ShopContext = createContext<ShopConfig | null>(null);

export interface ShopProviderProps {
  config: ShopConfig;
  children: ReactNode;
}

/**
 * ShopProvider - Глобальный провайдер конфигурации магазина
 * Должен оборачивать всё приложение на верхнем уровне
 *
 * @example
 * <ShopProvider config={shopConfig}>
 *   <App />
 * </ShopProvider>
 */
export function ShopProvider({ config, children }: ShopProviderProps) {
  return <ShopContext.Provider value={config}>{children}</ShopContext.Provider>;
}
```

**`useShop.ts` - Hook для доступа к конфигурации:**
```typescript
'use client';

import { useContext, useMemo } from 'react';
import { ShopContext } from './ShopContext';
import type { ShopConfig, Currency, Locale } from './types';

/**
 * Hook для доступа к глобальной конфигурации магазина
 * Предоставляет информацию о локализации, валюте, настройках и утилиты
 *
 * @example
 * function MyComponent() {
 *   const shop = useShop();
 *   return <div>{shop.name}</div>;
 * }
 */
export function useShop(): ShopConfig & {
  // Утилиты для работы с деньгами
  formatMoney: (amount: number, currency?: Currency) => string;
  formatDate: (date: Date | string) => string;
  formatWeight: (weight: number) => string;

  // Проверки фич
  hasFeature: (feature: keyof ShopConfig['features']) => boolean;

  // Локализация
  t: (key: string, params?: Record<string, any>) => string;
  changeLocale: (locale: string) => void;
  changeCurrency: (currency: string) => void;
} {
  const config = useContext(ShopContext);

  if (!config) {
    throw new Error('useShop must be used within ShopProvider');
  }

  // Утилиты
  const utilities = useMemo(() => ({
    /**
     * Форматирование денег с учетом локали и валюты
     */
    formatMoney: (amount: number, currency?: Currency): string => {
      const curr = currency || config.currency;
      const formatted = amount.toFixed(curr.decimals)
        .replace('.', curr.decimalSeparator)
        .replace(/\B(?=(\d{3})+(?!\d))/g, curr.thousandsSeparator);

      return curr.symbolPosition === 'before'
        ? `${curr.symbol}${formatted}`
        : `${formatted}${curr.symbol}`;
    },

    /**
     * Форматирование даты с учетом формата магазина
     */
    formatDate: (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      // Простая реализация, можно использовать date-fns или day.js
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();

      return config.dateFormat
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', String(year));
    },

    /**
     * Форматирование веса с единицами
     */
    formatWeight: (weight: number): string => {
      return `${weight} ${config.weightUnit}`;
    },

    /**
     * Проверка наличия фичи
     */
    hasFeature: (feature: keyof ShopConfig['features']): boolean => {
      return config.features[feature] === true;
    },

    /**
     * Функция перевода (заглушка, можно интегрировать i18n)
     */
    t: (key: string, params?: Record<string, any>): string => {
      // TODO: Интеграция с i18n библиотекой (next-intl, react-i18next и т.д.)
      return key;
    },

    /**
     * Смена локали (заглушка)
     */
    changeLocale: (locale: string): void => {
      // TODO: Реализовать смену локали через router или i18n
      console.log('Changing locale to:', locale);
    },

    /**
     * Смена валюты (заглушка)
     */
    changeCurrency: (currency: string): void => {
      // TODO: Реализовать смену валюты
      console.log('Changing currency to:', currency);
    },
  }), [config]);

  return {
    ...config,
    ...utilities,
  };
}

/**
 * Optional hook - не выбрасывает ошибку если используется вне ShopProvider
 */
export function useShopOptional(): (ShopConfig & ReturnType<typeof useShop>) | null {
  const config = useContext(ShopContext);
  return config ? (useShop() as any) : null;
}
```

**`index.ts` - Экспорты:**
```typescript
export { ShopProvider, ShopContext } from './ShopContext';
export { useShop, useShopOptional } from './useShop';
export * from './types';
```

### 4.1 Core Types (`src/core/page-builder/types.ts`)

```typescript
import type { ComponentType } from 'react';

// Settings типы
export type SettingType = 'text' | 'textarea' | 'image' | 'select' | 'number' | 'checkbox' | 'color' | 'range';

export interface Setting {
  type: SettingType;
  id: string;
  label: string;
  default?: any;
  options?: Array<{ label: string; value: string | number }>;
  min?: number;
  max?: number;
  step?: number;
}

// Типы страниц (определяют контекст доступных данных)
export type PageTemplateType =
  | 'product'      // Страница товара
  | 'collection'   // Страница категории/коллекции
  | 'cart'         // Корзина
  | 'page'         // Обычная страница (контент)
  | 'home'         // Главная страница
  | 'blog'         // Список статей блога
  | 'article'      // Отдельная статья
  | 'search'       // Страница поиска
  | 'account';     // Личный кабинет

// Schema для секций и блоков
export interface SectionSchema {
  slug: string;
  name: string;
  description?: string;

  // Ограничение по типам страниц (аналог Shopify templates field)
  // undefined или [] = секция доступна на всех типах страниц
  // ['product', 'collection'] = только на страницах продуктов и категорий
  templates?: PageTemplateType[];

  settings: Setting[];
  blocks?: {
    types: string[];  // Разрешенные типы блоков
    max?: number;     // Максимальное количество
  };
}

export interface BlockSchema {
  slug: string;
  name: string;
  description?: string;
  settings: Setting[];
}

// Props для компонентов
export interface SectionProps<TSettings = Record<string, any>> {
  id: string;
  settings: TSettings;
  blocks?: BlockInstance[];
}

export interface BlockProps<TSettings = Record<string, any>> {
  id: string;
  settings: TSettings;
}

// Instances (из JSON template)
export interface SectionInstance {
  id: string;
  type: string;  // slug секции
  settings: Record<string, any>;
  blocks?: BlockInstance[];
}

export interface BlockInstance {
  id: string;
  type: string;  // slug блока
  settings: Record<string, any>;
}

// Template (может быть функцией для динамической генерации)
export interface PageTemplate<TData = any> {
  id: string;
  name: string;

  // Тип страницы - определяет какие секции могут использоваться
  // и какой контекст данных доступен (аналог Shopify template types)
  pageType: PageTemplateType;

  sections: SectionInstance[];
  data?: TData;  // Глобальные данные страницы (из API, props и т.д.)
  metadata?: Record<string, any>;  // Метаданные страницы
}

export type TemplateGenerator<TData = any> = (context?: any) => PageTemplate<TData>;

// Zustand Store типы
export interface PageBuilderState<TData = any> {
  // Page-level state
  pageId: string;
  pageName: string;
  data?: TData;  // Глобальные данные страницы
  metadata?: Record<string, any>;

  // Sections state (normalized по ID)
  sections: Record<string, SectionInstance & { schema?: SectionSchema }>;
  sectionOrder: string[];  // Порядок отображения секций

  // Blocks state (normalized по ID)
  blocks: Record<string, BlockInstance & { schema?: BlockSchema }>;

  // Actions для управления состоянием
  actions: {
    // Page actions
    setPageData: (data: TData) => void;
    updateMetadata: (metadata: Record<string, any>) => void;

    // Section actions
    addSection: (section: SectionInstance, schema?: SectionSchema) => void;
    updateSection: (sectionId: string, updates: Partial<SectionInstance>) => void;
    removeSection: (sectionId: string) => void;
    reorderSections: (newOrder: string[]) => void;

    // Block actions
    addBlock: (sectionId: string, block: BlockInstance, schema?: BlockSchema) => void;
    updateBlock: (blockId: string, updates: Partial<BlockInstance>) => void;
    removeBlock: (blockId: string, sectionId: string) => void;

    // Bulk actions
    reset: () => void;
    initializeFromTemplate: (template: PageTemplate<TData>) => void;
  };
}

// Селекторы для удобства использования
export type PageSelector<TData = any, R = any> = (state: PageBuilderState<TData>) => R;
export type SectionSelector<TSettings = Record<string, any>, R = any> = (
  section: SectionInstance & { schema?: SectionSchema }
) => R;
export type BlockSelector<TSettings = Record<string, any>, R = any> = (
  block: BlockInstance & { schema?: BlockSchema }
) => R;

// Типы для валидации
export interface ValidationError {
  sectionId: string;
  sectionType: string;
  message: string;
  severity: 'error' | 'warning';
}
```

### 3.2 Registry система (`src/core/page-builder/registry.ts`)

**Аналогично `ModuleRegistry`, используем Map-based подход с lazy loading:**

```typescript
import type { ComponentType } from 'react';
import type { SectionProps, BlockProps, SectionSchema, BlockSchema } from './types';

export type SectionSlug = string;
export type BlockSlug = string;

// Async loader для ленивой загрузки
export type AsyncLoader<T> = () => Promise<T> | T;

// Registry records
export interface SectionRegistryRecord {
  slug: SectionSlug;
  loader: AsyncLoader<{ default: ComponentType<SectionProps> }>;
  schema: SectionSchema;
}

export interface BlockRegistryRecord {
  slug: BlockSlug;
  loader: AsyncLoader<{ default: ComponentType<BlockProps> }>;
  schema: BlockSchema;
}

/**
 * PageBuilderRegistry - централизованный реестр секций и блоков
 * Использует тот же паттерн что и ModuleRegistry
 */
class PageBuilderRegistry {
  private sections: Map<SectionSlug, SectionRegistryRecord> = new Map();
  private blocks: Map<BlockSlug, BlockRegistryRecord> = new Map();

  // Регистрация
  registerSection(slug: SectionSlug, loader: SectionRegistryRecord['loader'], schema: SectionSchema): void {
    this.sections.set(slug, { slug, loader, schema });
  }

  registerBlock(slug: BlockSlug, loader: BlockRegistryRecord['loader'], schema: BlockSchema): void {
    this.blocks.set(slug, { slug, loader, schema });
  }

  // Получение записей
  getSection(slug: SectionSlug): SectionRegistryRecord | undefined {
    return this.sections.get(slug);
  }

  getBlock(slug: BlockSlug): BlockRegistryRecord | undefined {
    return this.blocks.get(slug);
  }

  // Загрузка компонентов (с кэшированием через dynamic import)
  async loadSection(slug: SectionSlug): Promise<ComponentType<SectionProps> | null> {
    const record = this.sections.get(slug);
    if (!record) return null;
    const result = await record.loader();
    return result.default;
  }

  async loadBlock(slug: BlockSlug): Promise<ComponentType<BlockProps> | null> {
    const record = this.blocks.get(slug);
    if (!record) return null;
    const result = await record.loader();
    return result.default;
  }

  // Получение schemas
  getSectionSchema(slug: SectionSlug): SectionSchema | undefined {
    return this.sections.get(slug)?.schema;
  }

  getBlockSchema(slug: BlockSlug): BlockSchema | undefined {
    return this.blocks.get(slug)?.schema;
  }

  // Списки
  listSections(): SectionSlug[] {
    return Array.from(this.sections.keys());
  }

  listBlocks(): BlockSlug[] {
    return Array.from(this.blocks.keys());
  }
}

// Singleton instance
export const pageBuilderRegistry = new PageBuilderRegistry();

// Helper функции
export function registerSection(
  slug: SectionSlug,
  loader: SectionRegistryRecord['loader'],
  schema: SectionSchema
): void {
  pageBuilderRegistry.registerSection(slug, loader, schema);
}

export function registerBlock(
  slug: BlockSlug,
  loader: BlockRegistryRecord['loader'],
  schema: BlockSchema
): void {
  pageBuilderRegistry.registerBlock(slug, loader, schema);
}
```

### 3.3 Zustand Store (`src/core/page-builder/store.ts` и `src/core/page-builder/hooks.ts`)

**Создание Zustand store для управления состоянием Page Builder:**

**`store.ts` - Zustand Store фабрика:**
```typescript
'use client';

import { createStore } from 'zustand/vanilla';
import type { PageTemplate, PageBuilderState, SectionInstance, BlockInstance, SectionSchema, BlockSchema } from './types';
import { pageBuilderRegistry } from './registry';

/**
 * Создает новый Zustand store для PageBuilder instance
 * Каждый PageBuilder имеет свой изолированный store
 */
export function createPageBuilderStore<TData = any>(initialTemplate?: PageTemplate<TData>) {
  return createStore<PageBuilderState<TData>>()((set, get) => ({
    // Initial state
    pageId: initialTemplate?.id || '',
    pageName: initialTemplate?.name || '',
    data: initialTemplate?.data,
    metadata: initialTemplate?.metadata || {},
    sections: {},
    sectionOrder: [],
    blocks: {},

    // Actions
    actions: {
      // Page actions
      setPageData: (data: TData) => {
        set({ data });
      },

      updateMetadata: (metadata: Record<string, any>) => {
        set((state) => ({
          metadata: { ...state.metadata, ...metadata },
        }));
      },

      // Section actions
      addSection: (section: SectionInstance, schema?: SectionSchema) => {
        set((state) => ({
          sections: {
            ...state.sections,
            [section.id]: { ...section, schema },
          },
          sectionOrder: [...state.sectionOrder, section.id],
        }));
      },

      updateSection: (sectionId: string, updates: Partial<SectionInstance>) => {
        set((state) => ({
          sections: {
            ...state.sections,
            [sectionId]: {
              ...state.sections[sectionId],
              ...updates,
            },
          },
        }));
      },

      removeSection: (sectionId: string) => {
        set((state) => {
          const { [sectionId]: removed, ...remainingSections } = state.sections;
          return {
            sections: remainingSections,
            sectionOrder: state.sectionOrder.filter((id) => id !== sectionId),
          };
        });
      },

      reorderSections: (newOrder: string[]) => {
        set({ sectionOrder: newOrder });
      },

      // Block actions
      addBlock: (sectionId: string, block: BlockInstance, schema?: BlockSchema) => {
        set((state) => {
          const section = state.sections[sectionId];
          if (!section) return state;

          return {
            blocks: {
              ...state.blocks,
              [block.id]: { ...block, schema },
            },
            sections: {
              ...state.sections,
              [sectionId]: {
                ...section,
                blocks: [...(section.blocks || []), block],
              },
            },
          };
        });
      },

      updateBlock: (blockId: string, updates: Partial<BlockInstance>) => {
        set((state) => ({
          blocks: {
            ...state.blocks,
            [blockId]: {
              ...state.blocks[blockId],
              ...updates,
            },
          },
        }));
      },

      removeBlock: (blockId: string, sectionId: string) => {
        set((state) => {
          const { [blockId]: removed, ...remainingBlocks } = state.blocks;
          const section = state.sections[sectionId];

          if (!section) return state;

          return {
            blocks: remainingBlocks,
            sections: {
              ...state.sections,
              [sectionId]: {
                ...section,
                blocks: section.blocks?.filter((b) => b.id !== blockId) || [],
              },
            },
          };
        });
      },

      // Bulk actions
      reset: () => {
        set({
          sections: {},
          sectionOrder: [],
          blocks: {},
          data: undefined,
          metadata: {},
        });
      },

      initializeFromTemplate: (template: PageTemplate<TData>) => {
        const sections: PageBuilderState<TData>['sections'] = {};
        const blocks: PageBuilderState<TData>['blocks'] = {};
        const sectionOrder: string[] = [];

        // Инициализация секций и блоков с их schemas
        template.sections.forEach((section) => {
          const schema = pageBuilderRegistry.getSectionSchema(section.type);
          sections[section.id] = { ...section, schema };
          sectionOrder.push(section.id);

          // Инициализация блоков секции
          section.blocks?.forEach((block) => {
            const blockSchema = pageBuilderRegistry.getBlockSchema(block.type);
            blocks[block.id] = { ...block, schema: blockSchema };
          });
        });

        set({
          pageId: template.id,
          pageName: template.name,
          data: template.data,
          metadata: template.metadata || {},
          sections,
          sectionOrder,
          blocks,
        });
      },
    },
  }));
}

export type PageBuilderStore<TData = any> = ReturnType<typeof createPageBuilderStore<TData>>;
```

**`store-provider.tsx` - React Provider для Store:**
```typescript
'use client';

import { createContext, useRef, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createPageBuilderStore, type PageBuilderStore } from './store';
import type { PageTemplate } from './types';

export const PageBuilderStoreContext = createContext<PageBuilderStore | null>(null);

export interface PageBuilderStoreProviderProps<TData = any> {
  template: PageTemplate<TData>;
  children: ReactNode;
}

/**
 * Provider для изоляции Zustand store на каждый PageBuilder instance
 * Каждый PageBuilder имеет свой независимый store
 */
export function PageBuilderStoreProvider<TData = any>({
  template,
  children,
}: PageBuilderStoreProviderProps<TData>) {
  const storeRef = useRef<PageBuilderStore<TData>>();

  if (!storeRef.current) {
    storeRef.current = createPageBuilderStore<TData>(template);
    // Инициализация store из template
    storeRef.current.getState().actions.initializeFromTemplate(template);
  }

  return (
    <PageBuilderStoreContext.Provider value={storeRef.current}>
      {children}
    </PageBuilderStoreContext.Provider>
  );
}
```

**`hooks.ts` - React Hooks с поддержкой Zustand селекторов:**
```typescript
'use client';

import { useContext } from 'react';
import { useStore } from 'zustand';
import { PageBuilderStoreContext } from './store-provider';
import { pageBuilderRegistry } from './registry';
import type { PageBuilderState, PageSelector } from './types';

/**
 * Базовый hook для доступа к Zustand store
 * @internal
 */
function usePageBuilderStore<TData = any>(): ReturnType<typeof createPageBuilderStore<TData>> {
  const store = useContext(PageBuilderStoreContext);
  if (!store) {
    throw new Error('usePageBuilderStore must be used within PageBuilderStoreProvider');
  }
  return store as any;
}

/**
 * Hook для доступа к Zustand store с селектором
 * Поддерживает всю мощь Zustand селекторов и оптимизации
 *
 * @example
 * // Без селектора - вернет весь state
 * const state = usePageBuilderState();
 *
 * // С селектором - подписка только на конкретное поле
 * const pageData = usePageBuilderState(state => state.data);
 * const sections = usePageBuilderState(state => state.sections);
 */
export function usePageBuilderState<TData = any>(): PageBuilderState<TData>;
export function usePageBuilderState<TData = any, R = any>(
  selector: PageSelector<TData, R>
): R;
export function usePageBuilderState<TData = any, R = any>(
  selector?: PageSelector<TData, R>
): PageBuilderState<TData> | R {
  const store = usePageBuilderStore<TData>();
  return useStore(store, selector || ((state) => state as any));
}

/**
 * Hook для доступа к данным страницы с поддержкой селекторов
 *
 * @example
 * // Весь page context
 * const page = usePage();
 *
 * // Только data через селектор (оптимизировано)
 * const pageData = usePage(state => state.data);
 * const productName = usePage(state => state.data?.product.name);
 */
export function usePage<TData = any>(): {
  pageId: string;
  pageName: string;
  data?: TData;
  metadata?: Record<string, any>;
};
export function usePage<TData = any, R = any>(selector: PageSelector<TData, R>): R;
export function usePage<TData = any, R = any>(selector?: PageSelector<TData, R>) {
  const store = usePageBuilderStore<TData>();

  if (selector) {
    return useStore(store, selector);
  }

  // Без селектора - возвращаем page-level данные
  return useStore(store, (state) => ({
    pageId: state.pageId,
    pageName: state.pageName,
    data: state.data,
    metadata: state.metadata,
  }));
}

/**
 * Hook для доступа к секции с поддержкой селекторов
 * Требует sectionId для получения конкретной секции
 *
 * @example
 * // Вся секция
 * const section = useSection('section-1');
 *
 * // Только settings секции (оптимизировано)
 * const settings = useSection('section-1', s => s.settings);
 * const title = useSection('section-1', s => s.settings.title);
 */
export function useSection<TSettings = Record<string, any>>(
  sectionId: string
): {
  id: string;
  type: string;
  settings: TSettings;
  schema?: any;
  blocks?: any[];
};
export function useSection<TSettings = Record<string, any>, R = any>(
  sectionId: string,
  selector: (section: any) => R
): R;
export function useSection<TSettings = Record<string, any>, R = any>(
  sectionId: string,
  selector?: (section: any) => R
) {
  const store = usePageBuilderStore();

  return useStore(store, (state) => {
    const section = state.sections[sectionId];
    if (!section) {
      console.warn(`Section with id "${sectionId}" not found`);
      return selector ? undefined : null;
    }
    return selector ? selector(section) : section;
  });
}

/**
 * Hook для доступа к блоку с поддержкой селекторов
 * Требует blockId для получения конкретного блока
 *
 * @example
 * // Весь блок
 * const block = useBlock('block-1');
 *
 * // Только settings блока (оптимизировано)
 * const settings = useBlock('block-1', b => b.settings);
 * const content = useBlock('block-1', b => b.settings.content);
 */
export function useBlock<TSettings = Record<string, any>>(
  blockId: string
): {
  id: string;
  type: string;
  settings: TSettings;
  schema?: any;
};
export function useBlock<TSettings = Record<string, any>, R = any>(
  blockId: string,
  selector: (block: any) => R
): R;
export function useBlock<TSettings = Record<string, any>, R = any>(
  blockId: string,
  selector?: (block: any) => R
) {
  const store = usePageBuilderStore();

  return useStore(store, (state) => {
    const block = state.blocks[blockId];
    if (!block) {
      console.warn(`Block with id "${blockId}" not found`);
      return selector ? undefined : null;
    }
    return selector ? selector(block) : block;
  });
}

/**
 * Hook для доступа к actions Zustand store
 * Используется для обновления состояния
 *
 * @example
 * const actions = usePageBuilderActions();
 * actions.updateSection('section-1', { settings: { title: 'New Title' } });
 * actions.addBlock('section-1', newBlock);
 */
export function usePageBuilderActions<TData = any>() {
  const store = usePageBuilderStore<TData>();
  return useStore(store, (state) => state.actions);
}

/**
 * Hook для доступа к Page Builder registry (без изменений)
 * Полезно для динамического получения schemas, списков секций/блоков
 *
 * @example
 * const { getSectionSchema, listSections } = usePageBuilder();
 * const schema = getSectionSchema('mySection');
 */
export function usePageBuilder() {
  return {
    getSectionSchema: (slug: string) => pageBuilderRegistry.getSectionSchema(slug),
    getBlockSchema: (slug: string) => pageBuilderRegistry.getBlockSchema(slug),
    listSections: () => pageBuilderRegistry.listSections(),
    listBlocks: () => pageBuilderRegistry.listBlocks(),
    getSection: (slug: string) => pageBuilderRegistry.getSection(slug),
    getBlock: (slug: string) => pageBuilderRegistry.getBlock(slug),
  };
}
```

### 3.4 Validation система (`src/core/page-builder/validation.ts`)

**Валидация совместимости секций с типами страниц (аналог Shopify):**

```typescript
import { pageBuilderRegistry } from './registry';
import type { PageTemplate, PageTemplateType, ValidationError } from './types';

/**
 * Проверяет, что все секции в template совместимы с типом страницы
 * Аналог Shopify проверки templates field
 *
 * @param template - Template для валидации
 * @returns Массив ошибок валидации (пустой если все ок)
 *
 * @example
 * const errors = validateTemplate(productPageTemplate);
 * if (errors.length > 0) {
 *   console.error('Template validation failed:', errors);
 * }
 */
export function validateTemplate(template: PageTemplate): ValidationError[] {
  const errors: ValidationError[] = [];

  template.sections.forEach((section) => {
    const schema = pageBuilderRegistry.getSectionSchema(section.type);

    // Секция не найдена в registry
    if (!schema) {
      errors.push({
        sectionId: section.id,
        sectionType: section.type,
        message: `Section type "${section.type}" not found in registry`,
        severity: 'error',
      });
      return;
    }

    // Проверяем templates constraint
    if (schema.templates && schema.templates.length > 0) {
      if (!schema.templates.includes(template.pageType)) {
        errors.push({
          sectionId: section.id,
          sectionType: section.type,
          message: `Section "${schema.name}" cannot be used on "${template.pageType}" pages. Allowed on: ${schema.templates.join(', ')}`,
          severity: 'error',
        });
      }
    }

    // Валидация блоков секции
    if (section.blocks) {
      section.blocks.forEach((block) => {
        const blockSchema = pageBuilderRegistry.getBlockSchema(block.type);

        if (!blockSchema) {
          errors.push({
            sectionId: section.id,
            sectionType: block.type,
            message: `Block type "${block.type}" not found in registry`,
            severity: 'error',
          });
          return;
        }

        // Проверка что блок разрешен в этой секции
        if (schema.blocks?.types && !schema.blocks.types.includes(block.type)) {
          errors.push({
            sectionId: section.id,
            sectionType: block.type,
            message: `Block "${blockSchema.name}" is not allowed in section "${schema.name}". Allowed blocks: ${schema.blocks.types.join(', ')}`,
            severity: 'error',
          });
        }
      });

      // Проверка максимального количества блоков
      if (schema.blocks?.max && section.blocks.length > schema.blocks.max) {
        errors.push({
          sectionId: section.id,
          sectionType: section.type,
          message: `Section "${schema.name}" has ${section.blocks.length} blocks, but max allowed is ${schema.blocks.max}`,
          severity: 'warning',
        });
      }
    }
  });

  return errors;
}

/**
 * Получить список секций доступных для конкретного типа страницы
 * Полезно для UI редактора - показывать только релевантные секции
 *
 * @param pageType - Тип страницы
 * @returns Массив slug секций доступных на этом типе страницы
 *
 * @example
 * const sections = getAvailableSectionsForPageType('product');
 * // ['productHero', 'productRecommendations', 'breadcrumbs', 'newsletter', ...]
 */
export function getAvailableSectionsForPageType(
  pageType: PageTemplateType
): string[] {
  const allSections = pageBuilderRegistry.listSections();

  return allSections.filter((slug) => {
    const schema = pageBuilderRegistry.getSectionSchema(slug);
    if (!schema) return false;

    // Если templates не указан - доступно везде
    if (!schema.templates || schema.templates.length === 0) return true;

    // Проверяем, что pageType в списке разрешенных
    return schema.templates.includes(pageType);
  });
}

/**
 * Получить список блоков разрешенных в конкретной секции
 *
 * @param sectionSlug - Slug секции
 * @returns Массив slug блоков разрешенных в этой секции
 */
export function getAvailableBlocksForSection(sectionSlug: string): string[] {
  const schema = pageBuilderRegistry.getSectionSchema(sectionSlug);
  if (!schema || !schema.blocks) return [];

  return schema.blocks.types;
}

/**
 * Проверяет, может ли секция использоваться на странице определенного типа
 */
export function canSectionBeUsedOnPage(
  sectionSlug: string,
  pageType: PageTemplateType
): boolean {
  const schema = pageBuilderRegistry.getSectionSchema(sectionSlug);
  if (!schema) return false;

  // Нет ограничений - доступно везде
  if (!schema.templates || schema.templates.length === 0) return true;

  return schema.templates.includes(pageType);
}
```

### 3.5 Auto-discovery системы

**`src/core/page-builder/index.ts`:**
```typescript
// Registry
export { pageBuilderRegistry, registerSection, registerBlock } from './registry';

// Types
export * from './types';

// Zustand Store
export { createPageBuilderStore, type PageBuilderStore } from './store';
export { PageBuilderStoreProvider, PageBuilderStoreContext } from './store-provider';

// Hooks
export {
  usePage,
  useSection,
  useBlock,
  usePageBuilder,
  usePageBuilderState,
  usePageBuilderActions,
} from './hooks';

// Validation
export {
  validateTemplate,
  getAvailableSectionsForPageType,
  getAvailableBlocksForSection,
  canSectionBeUsedOnPage,
} from './validation';

// Компоненты
export { PageBuilder } from './PageBuilder';
export { SectionRenderer } from './SectionRenderer';
export { BlockRenderer } from './BlockRenderer';

/**
 * Auto-discovery: импортирует все register.ts из sections/ и blocks/
 * Аналогично modules/index.ts
 */
const sectionsContext = require.context('@/sections', true, /register\.(t|j)sx?$/);
sectionsContext.keys().forEach((key) => sectionsContext(key));

const blocksContext = require.context('@/blocks', true, /register\.(t|j)sx?$/);
blocksContext.keys().forEach((key) => blocksContext(key));
```

### 3.5 Рендереры с Zustand Store (`src/core/page-builder/`)

**`SectionRenderer.tsx`** - рендерит секцию с lazy loading:
```typescript
'use client';

import { use } from 'react';
import { pageBuilderRegistry } from './registry';
import type { SectionInstance } from './types';

export interface SectionRendererProps {
  sectionId: string;
}

/**
 * Рендерит секцию по её ID из Zustand store
 * Компонент секции получает доступ к данным через useSection(id) hook
 */
export const SectionRenderer = ({ sectionId }: SectionRendererProps) => {
  const section = usePageBuilderState((state) => state.sections[sectionId]);

  if (!section) {
    console.error(`Section with id "${sectionId}" not found in store`);
    return null;
  }

  // Загружаем компонент из registry (с lazy loading)
  const Component = use(pageBuilderRegistry.loadSection(section.type));

  if (!Component) {
    console.error(`Section type "${section.type}" not found in registry`);
    return null;
  }

  // Передаем только ID - компонент сам получит данные через useSection(id)
  return (
    <Component
      id={section.id}
      settings={section.settings}
      blocks={section.blocks}
    />
  );
};
```

**`BlockRenderer.tsx`** - рендерит блок с lazy loading:
```typescript
'use client';

import { use } from 'react';
import { pageBuilderRegistry } from './registry';
import type { BlockInstance } from './types';

export interface BlockRendererProps {
  blockId: string;
}

/**
 * Рендерит блок по его ID из Zustand store
 * Компонент блока получает доступ к данным через useBlock(id) hook
 */
export const BlockRenderer = ({ blockId }: BlockRendererProps) => {
  const block = usePageBuilderState((state) => state.blocks[blockId]);

  if (!block) {
    console.error(`Block with id "${blockId}" not found in store`);
    return null;
  }

  // Загружаем компонент из registry (с lazy loading)
  const Component = use(pageBuilderRegistry.loadBlock(block.type));

  if (!Component) {
    console.error(`Block type "${block.type}" not found in registry`);
    return null;
  }

  // Передаем только ID - компонент сам получит данные через useBlock(id)
  return <Component id={block.id} settings={block.settings} />;
};
```

**`PageBuilder.tsx`** - главный компонент с Zustand Store Provider и валидацией:
```typescript
'use client';

import { useEffect } from 'react';
import { SectionRenderer } from './SectionRenderer';
import { PageBuilderStoreProvider } from './store-provider';
import { usePageBuilderState } from './hooks';
import { validateTemplate } from './validation';
import type { PageTemplate } from './types';

export interface PageBuilderProps<TData = any> {
  template: PageTemplate<TData>;
  strictMode?: boolean; // Если true - ошибки валидации выбрасывают exception
}

/**
 * Главный компонент Page Builder
 * Инициализирует Zustand store, валидирует template и рендерит секции
 */
export const PageBuilder = <TData = any,>({
  template,
  strictMode = false
}: PageBuilderProps<TData>) => {
  // Валидация template при монтировании (только в dev/strict mode)
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && !strictMode) return;

    const errors = validateTemplate(template);

    if (errors.length > 0) {
      const errorMessage = errors
        .map((e) => `[${e.severity.toUpperCase()}] Section "${e.sectionType}" (${e.sectionId}): ${e.message}`)
        .join('\n');

      if (strictMode) {
        throw new Error(`Template validation failed:\n${errorMessage}`);
      } else if (process.env.NODE_ENV === 'development') {
        console.error('❌ Template validation errors:', errors);
        console.error(errorMessage);
      }
    }
  }, [template, strictMode]);

  return (
    <PageBuilderStoreProvider template={template}>
      <PageBuilderContent />
    </PageBuilderStoreProvider>
  );
};

/**
 * Внутренний компонент который читает из store
 */
function PageBuilderContent() {
  // Получаем порядок секций из store с использованием селектора
  const sectionOrder = usePageBuilderState((state) => state.sectionOrder);

  return (
    <>
      {sectionOrder.map((sectionId) => (
        <SectionRenderer key={sectionId} sectionId={sectionId} />
      ))}
    </>
  );
}
```

---

## 4. Примеры использования фреймворка

### 4.1 Создание секции

**1. Schema** (`sections/MySection/schema.ts`):
```typescript
import type { SectionSchema } from '@/core/page-builder/types';

export const MySectionSchema: SectionSchema = {
  slug: 'mySection',
  name: 'My Section',
  description: 'Description of the section',

  // Ограничение по типам страниц (опционально)
  // undefined = доступно везде
  // ['product', 'collection'] = только на страницах продуктов и категорий
  templates: undefined, // Эта секция доступна на всех типах страниц

  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Default title',
    },
    {
      type: 'select',
      id: 'variant',
      label: 'Variant',
      default: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Alternative', value: 'alternative' },
      ],
    },
  ],
  blocks: {
    types: ['blockType1', 'blockType2'],  // Разрешенные блоки
    max: 5,
  },
};
```

**Пример секции только для страниц продуктов:**
```typescript
// sections/ProductRecommendations/schema.ts
import type { SectionSchema } from '@/core/page-builder/types';

export const ProductRecommendationsSchema: SectionSchema = {
  slug: 'productRecommendations',
  name: 'Product Recommendations',
  description: 'Shows recommended products based on current product',

  // Только на страницах продуктов!
  templates: ['product'],

  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Section Title',
      default: 'You may also like',
    },
    {
      type: 'number',
      id: 'limit',
      label: 'Number of products',
      default: 4,
      min: 1,
      max: 12,
    },
  ],
};
```

**Пример секции для нескольких типов страниц:**
```typescript
// sections/ProductGrid/schema.ts
import type { SectionSchema } from '@/core/page-builder/types';

export const ProductGridSchema: SectionSchema = {
  slug: 'productGrid',
  name: 'Product Grid',
  description: 'Grid layout for displaying products',

  // Доступно на главной и страницах категорий
  templates: ['home', 'collection'],

  settings: [
    {
      type: 'number',
      id: 'columns',
      label: 'Number of columns',
      default: 4,
      min: 2,
      max: 6,
    },
  ],
};
```

**2. Types** (`sections/MySection/types.ts`):
```typescript
export interface MySectionSettings {
  title: string;
  variant: 'default' | 'alternative';
}
```

**3. Component** (`sections/MySection/MySection.tsx`):
```typescript
'use client';

import type { SectionProps } from '@/core/page-builder/types';
import { BlockRenderer } from '@/core/page-builder';
import { usePage, useSection } from '@/core/page-builder/hooks';
import type { MySectionSettings } from './types';

// Базовый пример - без селекторов
export default function MySection({ id }: SectionProps) {
  // Получаем все данные секции из Zustand store
  const section = useSection<MySectionSettings>(id);
  const page = usePage();

  if (!section) return null;

  const { title, variant } = section.settings;

  return (
    <section id={id} className={`my-section my-section--${variant}`}>
      <h2>{title}</h2>

      {/* Рендер вложенных блоков */}
      <div className="my-section__blocks">
        {section.blocks?.map((block) => (
          <BlockRenderer key={block.id} blockId={block.id} />
        ))}
      </div>
    </section>
  );
}

// Оптимизированный пример - с селекторами
export function MySectionOptimized({ id }: SectionProps) {
  // Подписка ТОЛЬКО на нужные поля через селекторы
  // Компонент НЕ будет ре-рендериться при изменении других полей секции
  const title = useSection(id, (s) => s.settings.title);
  const variant = useSection(id, (s) => s.settings.variant);
  const blockIds = useSection(id, (s) => s.blocks?.map(b => b.id) || []);

  return (
    <section id={id} className={`my-section my-section--${variant}`}>
      <h2>{title}</h2>

      <div className="my-section__blocks">
        {blockIds.map((blockId) => (
          <BlockRenderer key={blockId} blockId={blockId} />
        ))}
      </div>
    </section>
  );
}

// Пример с использованием page data и селекторов
export function MySectionWithPageData({ id }: SectionProps) {
  const shop = useShop(); // Глобальная конфигурация

  // Селектор для page data - подписка только на product.name
  const productName = usePage((state) => state.data?.product.name);

  // Селектор для section title
  const sectionTitle = useSection(id, (s) => s.settings.title);

  return (
    <section id={id}>
      <h2>{sectionTitle}</h2>
      <p>Current product: {productName}</p>
      <p>Shop: {shop.name}</p>
    </section>
  );
}
```

**4. Register** (`sections/MySection/register.ts`):
```typescript
import { registerSection } from '@/core/page-builder';
import { MySectionSchema } from './schema';

// Регистрация с lazy loading
registerSection('mySection', async () => {
  return await import('./MySection');
}, MySectionSchema);
```

### 4.2 Создание блока

**1. Schema** (`blocks/MyBlock/schema.ts`):
```typescript
import type { BlockSchema } from '@/core/page-builder/types';

export const MyBlockSchema: BlockSchema = {
  slug: 'myBlock',
  name: 'My Block',
  description: 'Description of the block',
  settings: [
    {
      type: 'text',
      id: 'content',
      label: 'Content',
      default: 'Default content',
    },
  ],
};
```

**2. Component** (`blocks/MyBlock/MyBlock.tsx`):
```typescript
'use client';

import type { BlockProps } from '@/core/page-builder/types';
import { useBlock, usePage, usePageBuilderState } from '@/core/page-builder/hooks';

interface MyBlockSettings {
  content: string;
}

// Базовый пример - без селекторов
export default function MyBlock({ id }: BlockProps) {
  // Получаем все данные блока из Zustand store
  const block = useBlock<MyBlockSettings>(id);

  if (!block) return null;

  return (
    <div className="my-block">
      {block.settings.content}
    </div>
  );
}

// Оптимизированный пример - с селектором
export function MyBlockOptimized({ id }: BlockProps) {
  // Подписка ТОЛЬКО на content - компонент НЕ будет ре-рендериться при изменении других настроек
  const content = useBlock(id, (b) => b.settings.content);

  return (
    <div className="my-block">
      {content}
    </div>
  );
}

// Пример с доступом к данным страницы
export function MyBlockWithPageData({ id }: BlockProps) {
  const content = useBlock(id, (b) => b.settings.content);

  // Получаем данные страницы через селектор
  const pageData = usePage((state) => state.data);

  return (
    <div className="my-block">
      <p>{content}</p>
      {pageData && <pre>{JSON.stringify(pageData, null, 2)}</pre>}
    </div>
  );
}

// Пример с получением родительской секции
export function MyBlockWithSection({ id }: BlockProps) {
  const content = useBlock(id, (b) => b.settings.content);

  // Найдем родительскую секцию через store state
  const parentSection = usePageBuilderState((state) => {
    // Ищем секцию которая содержит этот блок
    return Object.values(state.sections).find((section) =>
      section.blocks?.some((b) => b.id === id)
    );
  });

  return (
    <div className="my-block">
      <p>{content}</p>
      {parentSection && (
        <small>Parent section: {parentSection.type}</small>
      )}
    </div>
  );
}
```

**3. Register** (`blocks/MyBlock/register.ts`):
```typescript
import { registerBlock } from '@/core/page-builder';
import { MyBlockSchema } from './schema';

registerBlock('myBlock', async () => {
  return await import('./MyBlock');
}, MyBlockSchema);
```

### 4.3 Template конфигурация

**Static template** (`templates/page.ts`):
```typescript
import type { PageTemplate } from '@/core/page-builder/types';

export const pageTemplate: PageTemplate = {
  id: 'page-id',
  name: 'Page Name',
  pageType: 'page', // Тип страницы - определяет доступные секции

  sections: [
    {
      id: 'section-1',
      type: 'sectionSlug',
      settings: {
        setting1: 'value1',
        setting2: 'value2',
      },
      blocks: [
        {
          id: 'block-1',
          type: 'blockSlug',
          settings: {
            setting1: 'value1',
          },
        },
      ],
    },
  ],
};
```

**Product page template:**
```typescript
import type { PageTemplate } from '@/core/page-builder/types';

interface ProductPageData {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
  relatedProducts: Array<{ id: string; name: string }>;
}

export const productPageTemplate: PageTemplate<ProductPageData> = {
  id: 'product-page',
  name: 'Product Page',
  pageType: 'product', // Тип определяет контекст данных

  sections: [
    {
      id: 'breadcrumbs-1',
      type: 'breadcrumbs', // Без ограничений - работает везде
      settings: {},
    },
    {
      id: 'product-hero-1',
      type: 'productHero', // templates: ['product']
      settings: {
        showGallery: true,
      },
    },
    {
      id: 'product-recommendations-1',
      type: 'productRecommendations', // templates: ['product']
      settings: {
        title: 'You may also like',
        limit: 4,
      },
    },
  ],
};
```

**Collection page template:**
```typescript
import type { PageTemplate } from '@/core/page-builder/types';

export const collectionPageTemplate: PageTemplate = {
  id: 'collection-page',
  name: 'Collection Page',
  pageType: 'collection',

  sections: [
    {
      id: 'collection-hero-1',
      type: 'collectionHero', // templates: ['collection']
      settings: {
        showDescription: true,
      },
    },
    {
      id: 'product-grid-1',
      type: 'productGrid', // templates: ['home', 'collection']
      settings: {
        columns: 4,
      },
    },
  ],
};
```

**Dynamic template with logic** (`templates/dynamic-page.ts`):
```typescript
import type { PageTemplate } from '@/core/page-builder/types';

const isDarkMode = process.env.THEME === 'dark';

export const dynamicPageTemplate: PageTemplate = {
  id: 'dynamic-page',
  name: 'Dynamic Page',
  pageType: 'page',

  sections: [
    {
      id: 'hero-1',
      type: 'mySection',
      settings: {
        title: 'Welcome',
        variant: isDarkMode ? 'dark' : 'light',
      },
    },
    // Условное включение секций
    ...(process.env.FEATURE_FLAG === 'true' ? [{
      id: 'feature-1',
      type: 'featureSection',
      settings: {},
    }] : []),
  ],
};
```

**Template generator function** (`templates/generated-page.ts`):
```typescript
import type { TemplateGenerator } from '@/core/page-builder/types';

export const generatePageTemplate: TemplateGenerator = (context) => {
  return {
    id: 'generated-page',
    name: 'Generated Page',
    pageType: context?.pageType || 'page',

    sections: [
      {
        id: 'section-1',
        type: 'mySection',
        settings: {
          title: context?.title || 'Default Title',
          variant: context?.theme || 'default',
        },
      },
    ],
  };
};
```

### 4.4 Использование в Next.js страницах

**Static template:**
```typescript
import { PageBuilder } from '@/core/page-builder';
import { myPageTemplate } from '@/templates/my-page';

export default function MyPage() {
  return (
    <main>
      <PageBuilder template={myPageTemplate} />
    </main>
  );
}
```

**Dynamic template with logic:**
```typescript
import { PageBuilder } from '@/core/page-builder';
import { generatePageTemplate } from '@/templates/generated-page';

export default function DynamicPage({ params }: { params: { theme: string } }) {
  const template = generatePageTemplate({ theme: params.theme });

  return (
    <main>
      <PageBuilder template={template} />
    </main>
  );
}
```

**Page with data fetching (Server Component):**
```typescript
import { PageBuilder } from '@/core/page-builder';
import type { PageTemplate } from '@/core/page-builder/types';

// Тип данных для страницы
interface ProductPageData {
  product: {
    id: string;
    name: string;
    price: number;
  };
  relatedProducts: Array<{ id: string; name: string }>;
}

async function fetchProductData(id: string): Promise<ProductPageData> {
  // Fetch data from API
  const product = await fetch(`/api/products/${id}`).then(res => res.json());
  const relatedProducts = await fetch(`/api/products/${id}/related`).then(res => res.json());

  return { product, relatedProducts };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  // Загружаем данные на сервере
  const pageData = await fetchProductData(params.id);

  // Создаем template с данными
  const template: PageTemplate<ProductPageData> = {
    id: `product-${params.id}`,
    name: 'Product Page',
    pageType: 'product', // Определяет контекст страницы

    sections: [
      {
        id: 'hero-1',
        type: 'productHero', // Эта секция должна иметь templates: ['product']
        settings: {
          showBreadcrumbs: true,
        },
      },
      {
        id: 'related-1',
        type: 'relatedProducts', // templates: ['product']
        settings: {
          title: 'You may also like',
          columns: 4,
        },
      },
    ],
    data: pageData, // Данные доступны через usePage()
    metadata: {
      productId: params.id,
    },
  };

  return (
    <main>
      {/* Валидация автоматически запустится в dev mode */}
      <PageBuilder template={template} />
    </main>
  );
}

// Теперь в секции ProductHero можно получить данные:
// const page = usePage<ProductPageData>();
// const product = page.data?.product;
```

**Dynamic page with template loading:**
```typescript
import { PageBuilder } from '@/core/page-builder';
import { notFound } from 'next/navigation';
import type { PageTemplate } from '@/core/page-builder/types';

async function getTemplate(slug: string[]): Promise<PageTemplate | null> {
  const path = slug.join('/');
  try {
    const module = await import(`@/templates/${path}`);
    // Поддержка как статических templates, так и generator функций
    return typeof module.default === 'function'
      ? module.default()
      : module.default;
  } catch {
    return null;
  }
}

export default async function DynamicPage({ params }: { params: { slug?: string[] } }) {
  const template = await getTemplate(params.slug || ['home']);

  if (!template) {
    notFound();
  }

  return (
    <main>
      <PageBuilder template={template} />
    </main>
  );
}
```

### 4.5 Использование валидации и контекстных ограничений

**1. Проверка совместимости секций с типом страницы:**
```typescript
import { validateTemplate } from '@/core/page-builder';
import type { PageTemplate } from '@/core/page-builder/types';

const template: PageTemplate = {
  id: 'my-page',
  name: 'My Page',
  pageType: 'page', // Обычная страница

  sections: [
    {
      id: 'product-hero-1',
      type: 'productHero', // templates: ['product'] - НЕ доступно на 'page'!
      settings: {},
    },
  ],
};

// Валидация покажет ошибку
const errors = validateTemplate(template);
if (errors.length > 0) {
  console.error('Validation failed:', errors);
  // Output: Section "productHero" cannot be used on "page" pages. Allowed on: product
}
```

**2. Получение доступных секций для UI редактора:**
```typescript
import { getAvailableSectionsForPageType } from '@/core/page-builder';

function SectionPicker({ pageType }: { pageType: PageTemplateType }) {
  const availableSections = getAvailableSectionsForPageType(pageType);

  return (
    <div>
      <h3>Available sections for {pageType}:</h3>
      <ul>
        {availableSections.map((slug) => (
          <li key={slug}>{slug}</li>
        ))}
      </ul>
    </div>
  );
}

// На странице продукта:
// ['productHero', 'productRecommendations', 'breadcrumbs', 'newsletter', ...]

// На обычной странице:
// ['breadcrumbs', 'newsletter', 'contentBlock', ...] (без product-specific секций)
```

**3. Проверка перед добавлением секции:**
```typescript
import { canSectionBeUsedOnPage } from '@/core/page-builder';

function addSectionToPage(sectionSlug: string, pageType: PageTemplateType) {
  if (!canSectionBeUsedOnPage(sectionSlug, pageType)) {
    console.error(`Section "${sectionSlug}" cannot be used on "${pageType}" pages`);
    return;
  }

  // Добавление секции безопасно
  // ...
}
```

**4. Валидация в strict mode (выбрасывает ошибку):**
```typescript
import { PageBuilder } from '@/core/page-builder';

export default function MyPage() {
  return (
    <PageBuilder
      template={template}
      strictMode={true} // Выбросит exception при ошибках валидации
    />
  );
}
```

**5. Получение разрешенных блоков для секции:**
```typescript
import { getAvailableBlocksForSection } from '@/core/page-builder';

function BlockPicker({ sectionSlug }: { sectionSlug: string }) {
  const allowedBlocks = getAvailableBlocksForSection(sectionSlug);

  return (
    <div>
      <h3>Allowed blocks in this section:</h3>
      <ul>
        {allowedBlocks.map((blockSlug) => (
          <li key={blockSlug}>{blockSlug}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.6 Продвинутое использование Zustand селекторов

**1. Композиция селекторов для сложной логики:**
```typescript
import { usePageBuilderState } from '@/core/page-builder';

function ProductListSection({ id }: SectionProps) {
  // Композиция нескольких значений в один селектор
  const sectionData = usePageBuilderState((state) => {
    const section = state.sections[id];
    const pageData = state.data;

    return {
      title: section?.settings.title,
      showPrices: section?.settings.showPrices,
      products: pageData?.products || [],
      currency: pageData?.currency,
    };
  });

  return (
    <section>
      <h2>{sectionData.title}</h2>
      {sectionData.products.map((product) => (
        <div key={product.id}>
          <p>{product.name}</p>
          {sectionData.showPrices && <p>{product.price} {sectionData.currency}</p>}
        </div>
      ))}
    </section>
  );
}
```

**2. Использование actions для обновления состояния:**
```typescript
import { usePageBuilderActions, useSection } from '@/core/page-builder';

function EditableTitleSection({ id }: SectionProps) {
  const title = useSection(id, (s) => s.settings.title);
  const actions = usePageBuilderActions();

  const handleTitleChange = (newTitle: string) => {
    // Обновление настроек секции через Zustand actions
    actions.updateSection(id, {
      settings: { ...section.settings, title: newTitle },
    });
  };

  return (
    <section>
      <input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
      />
    </section>
  );
}
```

**3. Мемоизация сложных вычислений с селекторами:**
```typescript
import { useMemo } from 'react';
import { usePageBuilderState } from '@/core/page-builder';

function AnalyticsSection({ id }: SectionProps) {
  // Селектор извлекает только нужные данные
  const blocks = usePageBuilderState((state) => state.sections[id]?.blocks || []);

  // Тяжелые вычисления мемоизируются
  const analytics = useMemo(() => {
    return {
      totalBlocks: blocks.length,
      blockTypes: blocks.reduce((acc, block) => {
        acc[block.type] = (acc[block.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [blocks]);

  return (
    <section>
      <p>Total blocks: {analytics.totalBlocks}</p>
      <pre>{JSON.stringify(analytics.blockTypes, null, 2)}</pre>
    </section>
  );
}
```

**4. Подписка на изменения с равенством (shallow/deep):**
```typescript
import { usePageBuilderState } from '@/core/page-builder';
import { shallow } from 'zustand/shallow';

function OptimizedSection({ id }: SectionProps) {
  // Используем shallow equality для объектов/массивов
  const { title, subtitle } = usePageBuilderState(
    (state) => ({
      title: state.sections[id]?.settings.title,
      subtitle: state.sections[id]?.settings.subtitle,
    }),
    shallow // Компонент ре-рендерится только если title ИЛИ subtitle изменились
  );

  return (
    <section>
      <h2>{title}</h2>
      <h3>{subtitle}</h3>
    </section>
  );
}
```

**5. Динамическое добавление и удаление секций/блоков:**
```typescript
import { usePageBuilderActions } from '@/core/page-builder';

function DynamicPageBuilder() {
  const actions = usePageBuilderActions();

  const addNewSection = () => {
    actions.addSection({
      id: `section-${Date.now()}`,
      type: 'mySection',
      settings: { title: 'New Section' },
      blocks: [],
    });
  };

  const removeSection = (sectionId: string) => {
    actions.removeSection(sectionId);
  };

  const reorderSections = (newOrder: string[]) => {
    actions.reorderSections(newOrder);
  };

  return (
    <div>
      <button onClick={addNewSection}>Add Section</button>
      {/* ... */}
    </div>
  );
}
```

### 4.6 Runtime API

```typescript
import { pageBuilderRegistry } from '@/core/page-builder';

// Получить список всех зарегистрированных секций
const sectionTypes = pageBuilderRegistry.listSections();
// ['sectionSlug1', 'sectionSlug2', ...]

// Получить schema конкретной секции
const sectionSchema = pageBuilderRegistry.getSectionSchema('sectionSlug');
// { slug: 'sectionSlug', name: 'Section Name', settings: [...], blocks: {...} }

// Получить список всех зарегистрированных блоков
const blockTypes = pageBuilderRegistry.listBlocks();
// ['blockSlug1', 'blockSlug2', ...]

// Получить schema блока
const blockSchema = pageBuilderRegistry.getBlockSchema('blockSlug');
// { slug: 'blockSlug', name: 'Block Name', settings: [...] }

// Проверить существование секции/блока
const hasSection = pageBuilderRegistry.getSection('sectionSlug') !== undefined;
const hasBlock = pageBuilderRegistry.getBlock('blockSlug') !== undefined;
```

---

## 5. Этапы реализации фреймворка

### Этап 0: Shop Context - Глобальная конфигурация (независимо от PageBuilder)

**Создать файлы:**
- ✅ `src/core/shop/types.ts` - типы ShopConfig, Locale, Currency, MoneyFormat
- ✅ `src/core/shop/ShopContext.tsx` - ShopProvider для глобальной конфигурации
- ✅ `src/core/shop/useShop.ts` - useShop() hook с утилитами (formatMoney, formatDate, hasFeature)
- ✅ `src/core/shop/index.ts` - публичные экспорты

**Результат:** Глобальная конфигурация магазина доступная везде через `useShop()`

**Настройка:**
1. Создать конфигурацию магазина (может загружаться из ENV, database, API)
2. Обернуть приложение в `<ShopProvider config={shopConfig}>` в root layout
3. Использовать `useShop()` в любых компонентах для доступа к конфигу

---

### Этап 1: Core система PageBuilder (types, registry, store, hooks, renderers)

**Создать файлы:**
- ✅ `src/core/page-builder/types.ts` - все TypeScript типы (включая PageTemplateType, ValidationError)
- ✅ `src/core/page-builder/registry.ts` - PageBuilderRegistry класс
- ✅ `src/core/page-builder/store.ts` - Zustand store фабрика
- ✅ `src/core/page-builder/store-provider.tsx` - PageBuilderStoreProvider
- ✅ `src/core/page-builder/hooks.ts` - React Hooks (usePage, useSection, useBlock, usePageBuilder)
- ✅ `src/core/page-builder/validation.ts` - Функции валидации (validateTemplate, getAvailableSectionsForPageType и т.д.)
- ✅ `src/core/page-builder/PageBuilder.tsx` - главный компонент с валидацией
- ✅ `src/core/page-builder/SectionRenderer.tsx` - компонент рендеринга секций
- ✅ `src/core/page-builder/BlockRenderer.tsx` - компонент рендеринга блоков
- ✅ `src/core/page-builder/index.ts` - публичные экспорты + auto-discovery

**Результат:** Готовая инфраструктура для регистрации, рендеринга, валидации и управления состоянием

---

### Этап 2: Инициализация директорий

**Создать структуру:**
- ✅ `src/sections/index.ts` - auto-discovery для секций
- ✅ `src/blocks/index.ts` - auto-discovery для блоков
- ✅ `src/templates/` - директория для TypeScript конфигураций

**Результат:** Готовая структура для добавления секций и блоков

---

### Этап 3: Proof of Concept

**Создать минимальный пример:**
1. Одну простую секцию с полной структурой (component, schema, types, register)
2. Один простой блок с полной структурой
3. Простой template (TypeScript)
4. Тестовую страницу использующую PageBuilder

**Результат:** Работающий end-to-end пример демонстрирующий все части фреймворка

---

### Этап 4: Template система и валидация

**Создать:**
1. ✅ TypeScript типы для templates (PageTemplate, TemplateGenerator, PageTemplateType)
2. ✅ Validation система:
   - ✅ `validateTemplate()` - проверка совместимости секций с типом страницы
   - ✅ `getAvailableSectionsForPageType()` - список доступных секций
   - ✅ `canSectionBeUsedOnPage()` - проверка конкретной секции
   - ✅ `getAvailableBlocksForSection()` - список разрешенных блоков
3. Утилиты для загрузки templates из файлов (поддержка статических и generator функций)
4. Опционально: Zod схема для runtime валидации template структуры
5. Error handling и fallback механизмы

**Результат:** Надёжная система загрузки и валидации TypeScript конфигураций с контекстными ограничениями (аналог Shopify)

---

### Этап 5: Расширенные возможности фреймворка

**1. Data integration pattern:**

Все данные загружаются на уровне страницы (Server Component) и передаются через `template.data`:

```typescript
// app/products/[id]/page.tsx (Server Component)
export default async function ProductPage({ params }: { params: { id: string } }) {
  // Загрузка данных на сервере
  const productData = await fetchProductData(params.id);

  const template: PageTemplate<ProductData> = {
    pageType: 'product',
    data: productData, // ✅ Данные передаются в template
    sections: [...],
  };

  return <PageBuilder template={template} />;
}

// sections/ProductHero/ProductHero.tsx (Client Component)
'use client';

export default function ProductHero({ id }: SectionProps) {
  const page = usePage<ProductData>();
  const product = page.data?.product; // ✅ Доступ к данным через hook

  return <div>{product.name}</div>;
}
```

**2. Conditional rendering:**
- Условная видимость секций на основе настроек
- Responsive behavior settings
- Feature flags в настройках секций

**3. Nested sections (опционально):**
- Секции внутри секций для сложных layouts
- Требует расширение SectionSchema и рендерера

**4. Settings validation:**
- Runtime проверка настроек на соответствие schema
- Type guards для settings
- Zod схемы для валидации

---

### Этап 6: Developer Experience

**1. TypeScript инструменты:**
- Строгая типизация всех API
- Type-safe template конфигурации
- Autocomplete для настроек секций/блоков

**2. DevTools:**
- Debug режим для PageBuilder
- Визуализация registry в dev mode
- Предупреждения о неиспользуемых секциях/блоках
- Zustand DevTools интеграция

**3. Documentation:**
- JSDoc комментарии для всех публичных API
- Примеры использования для каждого компонента фреймворка
- Inline комментарии в schema для подсказок в IDE

---

## 6. Примеры использования Hooks в компонентах

### 6.0 Использование `useShop()` для глобальной конфигурации магазина

**Setup в root layout (`app/layout.tsx`):**
```typescript
import { ShopProvider } from '@/core/shop';
import type { ShopConfig } from '@/core/shop/types';

// Конфигурация магазина (может загружаться из ENV, API, Database)
const shopConfig: ShopConfig = {
  name: 'My Shop',
  domain: 'myshop.com',
  email: 'contact@myshop.com',
  phone: '+380123456789',

  locale: {
    code: 'uk',
    name: 'Українська',
    direction: 'ltr',
  },
  availableLocales: [
    { code: 'uk', name: 'Українська', direction: 'ltr' },
    { code: 'en', name: 'English', direction: 'ltr' },
  ],

  currency: {
    code: 'UAH',
    symbol: '₴',
    symbolPosition: 'after',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    decimals: 2,
  },
  availableCurrencies: [
    { code: 'UAH', symbol: '₴', symbolPosition: 'after', decimalSeparator: ',', thousandsSeparator: ' ', decimals: 2 },
    { code: 'USD', symbol: '$', symbolPosition: 'before', decimalSeparator: '.', thousandsSeparator: ',', decimals: 2 },
  ],

  timezone: 'Europe/Kyiv',
  moneyFormat: { /* ... */ },
  dateFormat: 'DD.MM.YYYY',
  weightUnit: 'kg',
  measurementUnit: 'metric',

  features: {
    cart: true,
    wishlist: true,
    reviews: true,
    compareProducts: false,
    giftCards: false,
    subscriptions: false,
    multiCurrency: true,
    inventory: true,
  },

  seo: {
    title: 'My Shop - Best products online',
    description: 'Shop description',
  },

  social: {
    instagram: 'https://instagram.com/myshop',
    facebook: 'https://facebook.com/myshop',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

**Использование в компонентах:**
```typescript
'use client';

import { useShop } from '@/core/shop';

export default function ProductPrice({ price }: { price: number }) {
  const shop = useShop();

  return (
    <div className="product-price">
      <span className="price">
        {shop.formatMoney(price)}
      </span>
      <span className="currency">{shop.currency.code}</span>
    </div>
  );
}

// Вывод: "1 234,56₴ UAH" для украинской локали
```

**Использование в секциях PageBuilder:**
```typescript
'use client';

import { useShop } from '@/core/shop';
import { usePage } from '@/core/page-builder/hooks';
import type { SectionProps } from '@/core/page-builder/types';

interface ProductListSectionSettings {
  title: string;
  showPrices: boolean;
}

export default function ProductListSection({ settings }: SectionProps) {
  const { title, showPrices } = settings as ProductListSectionSettings;
  const shop = useShop();
  const page = usePage<{ products: Array<{ id: string; name: string; price: number }> }>();

  const products = page.data?.products || [];

  return (
    <section>
      <h2>{title}</h2>
      <div className="products">
        {products.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            {showPrices && shop.hasFeature('cart') && (
              <p>{shop.formatMoney(product.price)}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Проверка фич и локализация:**
```typescript
'use client';

import { useShop } from '@/core/shop';

export default function Header() {
  const shop = useShop();

  return (
    <header>
      <h1>{shop.name}</h1>

      {/* Условный рендеринг на основе фич */}
      {shop.hasFeature('wishlist') && (
        <button>Wishlist</button>
      )}

      {shop.hasFeature('multiCurrency') && (
        <select onChange={(e) => shop.changeCurrency(e.target.value)}>
          {shop.availableCurrencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code}
            </option>
          ))}
        </select>
      )}

      {/* Переключатель языков */}
      <select onChange={(e) => shop.changeLocale(e.target.value)}>
        {shop.availableLocales.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.name}
          </option>
        ))}
      </select>

      <p>Contact: {shop.email}</p>
    </header>
  );
}
```

**Форматирование дат и весов:**
```typescript
'use client';

import { useShop } from '@/core/shop';

export default function OrderInfo({
  orderDate,
  totalWeight
}: {
  orderDate: string;
  totalWeight: number;
}) {
  const shop = useShop();

  return (
    <div>
      <p>Order date: {shop.formatDate(orderDate)}</p>
      <p>Total weight: {shop.formatWeight(totalWeight)}</p>
    </div>
  );
}

// Вывод:
// Order date: 22.01.2025
// Total weight: 2.5 kg
```

**Адрес магазина и социальные сети:**
```typescript
'use client';

import { useShop } from '@/core/shop';

export default function Footer() {
  const shop = useShop();

  return (
    <footer>
      {shop.address && (
        <div className="address">
          <p>{shop.address.street}</p>
          <p>{shop.address.city}, {shop.address.country}</p>
          <p>{shop.address.zipCode}</p>
        </div>
      )}

      {shop.social && (
        <div className="social">
          {shop.social.instagram && (
            <a href={shop.social.instagram}>Instagram</a>
          )}
          {shop.social.facebook && (
            <a href={shop.social.facebook}>Facebook</a>
          )}
        </div>
      )}

      <p>© 2025 {shop.name}</p>
    </footer>
  );
}
```

### 6.1 Использование `usePage()` для доступа к глобальным данным

```typescript
'use client';

import { usePage } from '@/core/page-builder/hooks';
import type { ProductPageData } from '@/types';

export default function ProductHeroSection({ settings }: SectionProps) {
  // Получаем типизированные данные страницы
  const page = usePage<ProductPageData>();

  // Доступ к данным
  const product = page.data?.product;
  const metadata = page.metadata;

  if (!product) return null;

  return (
    <section>
      <h1>{product.name}</h1>
      <p>Price: ${product.price}</p>
      <p>Page ID: {metadata?.productId}</p>
    </section>
  );
}
```

### 6.2 Использование `useSection()` для доступа к контексту секции

```typescript
'use client';

import { useSection } from '@/core/page-builder/hooks';

export default function MyBlock({ settings }: BlockProps) {
  // Блок может получить информацию о родительской секции
  const section = useSection();

  console.log('Parent section type:', section.sectionType);
  console.log('Parent section settings:', section.settings);
  console.log('Section schema:', section.schema);

  // Можно адаптировать поведение блока в зависимости от родительской секции
  const isInHeroSection = section.sectionType === 'hero';

  return (
    <div className={isInHeroSection ? 'block-hero-style' : 'block-default-style'}>
      {/* ... */}
    </div>
  );
}
```

### 6.3 Использование `useBlock()` для доступа к метаданным блока

```typescript
'use client';

import { useBlock } from '@/core/page-builder/hooks';

export default function MyBlock({ settings }: BlockProps) {
  const block = useBlock();

  // Доступ к schema блока для динамических возможностей
  const schema = block.schema;
  const availableSettings = schema?.settings || [];

  // Можно использовать для debug mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Block ID:', block.blockId);
    console.log('Block type:', block.blockType);
    console.log('Available settings:', availableSettings);
  }

  return <div>{/* ... */}</div>;
}
```

### 6.4 Использование `usePageBuilder()` для доступа к registry

```typescript
'use client';

import { usePageBuilder } from '@/core/page-builder/hooks';
import { useState, useEffect } from 'react';

export default function SectionPicker() {
  const { listSections, getSectionSchema } = usePageBuilder();
  const [sections, setSections] = useState<string[]>([]);

  useEffect(() => {
    // Получить список всех доступных секций
    const availableSections = listSections();
    setSections(availableSections);
  }, []);

  return (
    <div>
      <h3>Available Sections:</h3>
      <ul>
        {sections.map((slug) => {
          const schema = getSectionSchema(slug);
          return (
            <li key={slug}>
              {schema?.name || slug}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

### 6.5 Комбинирование хуков для сложной логики

```typescript
'use client';

import { usePage, useSection, useBlock } from '@/core/page-builder/hooks';

interface MyBlockSettings {
  useGlobalData: boolean;
  useSectionData: boolean;
}

export default function SmartBlock({ settings }: BlockProps) {
  const { useGlobalData, useSectionData } = settings as MyBlockSettings;

  // Получаем все контексты
  const page = usePage();
  const section = useSection();
  const block = useBlock();

  // Условная логика на основе настроек
  let dataSource;
  if (useGlobalData) {
    dataSource = page.data;
  } else if (useSectionData) {
    dataSource = section.settings;
  } else {
    dataSource = block.settings;
  }

  return (
    <div>
      <p>Data from: {useGlobalData ? 'Page' : useSectionData ? 'Section' : 'Block'}</p>
      <pre>{JSON.stringify(dataSource, null, 2)}</pre>
    </div>
  );
}
```

### 6.6 Optional хуки для гибких компонентов

```typescript
'use client';

import { usePageOptional } from '@/core/page-builder/hooks';

// Компонент может работать как внутри так и вне PageBuilder
export default function FlexibleComponent() {
  const page = usePageOptional();

  if (page) {
    // Компонент внутри PageBuilder - используем данные страницы
    return (
      <div>
        <h2>Page: {page.pageName}</h2>
        <p>Data available: {page.data ? 'Yes' : 'No'}</p>
      </div>
    );
  }

  // Компонент вне PageBuilder - standalone режим
  return (
    <div>
      <h2>Standalone Mode</h2>
      <p>No page context available</p>
    </div>
  );
}
```

---

## 7. Интеграция useShop() с PageBuilder

### Архитектура Context системы

```
App Root
  └─ ShopProvider (глобальная конфигурация)
      └─ PageBuilder (PageContext)
          └─ SectionRenderer (SectionContext)
              └─ BlockRenderer (BlockContext)
```

**Доступность хуков:**
- `useShop()` - доступен везде (независимо от PageBuilder)
- `usePage()` - только внутри `<PageBuilder>`
- `useSection()` - только внутри секций
- `useBlock()` - только внутри блоков

### Типичные паттерны использования

**1. Секция с данными страницы и глобальной конфигурацией:**
```typescript
function ProductSection({ settings }: SectionProps) {
  const shop = useShop();  // Конфиг магазина (валюта, локаль и т.д.)
  const page = usePage<ProductPageData>();  // Данные страницы (продукт)

  return (
    <section>
      <h1>{page.data?.product.name}</h1>
      <p>{shop.formatMoney(page.data?.product.price)}</p>
      <p>Currency: {shop.currency.code}</p>
    </section>
  );
}
```

**2. Блок с доступом к родительской секции и конфигу:**
```typescript
function PriceBlock({ settings }: BlockProps) {
  const shop = useShop();              // Глобальный конфиг
  const section = useSection();        // Родительская секция
  const block = useBlock();            // Текущий блок

  // Адаптация на основе родительской секции
  const showCurrency = section.settings.showCurrency;

  return (
    <div>
      <span>{shop.formatMoney(block.settings.price)}</span>
      {showCurrency && <span>{shop.currency.code}</span>}
    </div>
  );
}
```

**3. Проверка фич перед рендерингом:**
```typescript
function CartButton() {
  const shop = useShop();

  if (!shop.hasFeature('cart')) {
    return null;  // Корзина отключена
  }

  return <button>Add to Cart</button>;
}
```

**4. Мультиязычность и мультивалютность:**
```typescript
function Header() {
  const shop = useShop();

  return (
    <header>
      {/* Переключатель языков */}
      {shop.availableLocales.length > 1 && (
        <LanguageSwitcher
          current={shop.locale}
          available={shop.availableLocales}
          onChange={shop.changeLocale}
        />
      )}

      {/* Переключатель валют */}
      {shop.hasFeature('multiCurrency') && (
        <CurrencySwitcher
          current={shop.currency}
          available={shop.availableCurrencies}
          onChange={shop.changeCurrency}
        />
      )}
    </header>
  );
}
```

### Преимущества подхода

✅ **Разделение ответственности:**
- `useShop()` - глобальная конфигурация (не зависит от PageBuilder)
- `usePage()` - данные конкретной страницы
- `useSection()` / `useBlock()` - локальный контекст компонентов

✅ **Повторное использование:**
- Компоненты могут использовать `useShop()` даже вне PageBuilder
- Секции и блоки можно переиспользовать на разных страницах

✅ **Типобезопасность:**
- Полная типизация через TypeScript generics
- Autocomplete для всех настроек и данных

✅ **Гибкость:**
- Конфигурация магазина может загружаться из любого источника (ENV, DB, API)
- Легко добавлять новые фичи и настройки

---

## 8. Преимущества архитектуры

### Module Registry подход

- ✅ **Консистентность с проектом**: Используется тот же паттерн что и `ModuleRegistry`
- ✅ **Lazy loading**: Секции и блоки загружаются по требованию (меньше bundle size)
- ✅ **Auto-discovery**: Автоматическая регистрация через `require.context`
- ✅ **Масштабируемость**: Легко добавлять секции как git submodules/плагины
- ✅ **Type-safe**: Полная типизация TypeScript с дженериками
- ✅ **Декларативность**: Регистрация в отдельных `register.ts` файлах

### Page Builder в целом

- ✅ **Переиспользование**: Секции и блоки можно использовать на разных страницах
- ✅ **Гибкость**: Легко создавать новые страницы через TypeScript конфигурации
- ✅ **Композиция**: Секции состоят из блоков
- ✅ **Schema-driven**: Декларативное описание настроек компонентов
- ✅ **SSR-friendly**: Данные загружаются на сервере (Server Component) и передаются в client components
- ✅ **State Management**: Zustand для эффективного управления состоянием на клиенте
- ✅ **Extensible**: Schema позволяет расширять функциональность

---

## 7. Сравнение паттернов регистрации

| Аспект | Static Registry (enum + object) | Module Registry (Map + class) |
|--------|--------------------------------|-------------------------------|
| **Регистрация** | Enum + Object | Registry class + register.ts |
| **Загрузка** | Статические импорты | Lazy loading (async) |
| **Масштабирование** | Ручное добавление | Auto-discovery |
| **Типизация** | Union types | Generics + Map |
| **Композиция** | Плоская структура | Иерархическая (sections + blocks) |
| **Конфигурация** | Hardcoded в коде | TypeScript/external config |
| **Метаданные** | Отсутствуют | Schema для каждого компонента |
| **Расширяемость** | Требует изменения кода | Plugin-like architecture |

**Сравнение кода:**

```typescript
// Static Registry Pattern
enum ComponentType {
  MyComponent = "myComponent",
}

const Components = {
  [ComponentType.MyComponent]: MyComponent,
};

// Module Registry Pattern (используется в фреймворке)
registerSection('mySection', async () => {
  return await import('./MySection');
}, MySectionSchema);
```

---

## 8. Контекстные ограничения секций (Page Template Types)

### Концепция

**Аналог Shopify:** В Shopify каждая секция может иметь поле `templates` в schema, которое ограничивает использование секции на определенных типах страниц:

```liquid
{% schema %}
{
  "name": "Product Recommendations",
  "templates": ["product"],  // Только на страницах продуктов
  "settings": [...]
}
{% endschema %}
```

### Зачем это нужно?

1. **Типобезопасность данных:**
   - Секция `productHero` ожидает данные `product` в `usePage().data`
   - Если использовать её на странице корзины - получим runtime ошибку
   - Валидация предотвращает такие ошибки на этапе разработки

2. **Улучшенный DX в редакторе:**
   - UI редактор показывает только релевантные секции для конкретного типа страницы
   - Нельзя случайно добавить "Product Gallery" на страницу "About Us"

3. **Семантическая правильность:**
   - Секции имеют четкий контекст использования
   - Код более читаемый и предсказуемый

### Как это работает

**1. Определение типов страниц:**
```typescript
export type PageTemplateType =
  | 'product'      // Страница товара - доступны данные product
  | 'collection'   // Категория - доступны данные collection + products
  | 'cart'         // Корзина - доступны данные cart
  | 'page'         // Обычная страница - минимальный контекст
  | 'home'         // Главная - может иметь featured products и т.д.
  | 'blog'
  | 'article'
  | 'search'
  | 'account';
```

**2. Ограничение секций в schema:**
```typescript
// Секция только для продуктов
export const ProductHeroSchema: SectionSchema = {
  slug: 'productHero',
  name: 'Product Hero',
  templates: ['product'], // ⚠️ Только на страницах продуктов!
  settings: [...],
};

// Секция для нескольких типов
export const ProductGridSchema: SectionSchema = {
  slug: 'productGrid',
  name: 'Product Grid',
  templates: ['home', 'collection'], // На главной и категориях
  settings: [...],
};

// Универсальная секция
export const NewsletterSchema: SectionSchema = {
  slug: 'newsletter',
  name: 'Newsletter',
  templates: undefined, // Нет ограничений - доступно везде
  settings: [...],
};
```

**3. Указание типа в template:**
```typescript
const template: PageTemplate<ProductData> = {
  id: 'product-page',
  name: 'Product Page',
  pageType: 'product', // ⚠️ Определяет контекст

  sections: [
    {
      id: 'hero-1',
      type: 'productHero', // ✅ OK - templates: ['product']
      settings: {},
    },
    {
      id: 'grid-1',
      type: 'productGrid', // ❌ ОШИБКА - templates: ['home', 'collection']
      settings: {},
    },
  ],
};
```

**4. Автоматическая валидация:**
```typescript
// В dev mode PageBuilder автоматически проверяет совместимость
<PageBuilder template={template} />

// Console output:
// ❌ Template validation errors:
// [ERROR] Section "productGrid" (grid-1): Section "Product Grid" cannot be used on "product" pages. Allowed on: home, collection
```

### Паттерны использования

**Секции специфичные для контекста:**
```typescript
// Только для продуктов
templates: ['product']
// Примеры: productHero, productGallery, productRecommendations, addToCart

// Только для категорий
templates: ['collection']
// Примеры: collectionHero, productFilters, sortOptions

// Только для корзины
templates: ['cart']
// Примеры: cartItems, cartSummary, checkoutButton
```

**Секции для нескольких типов:**
```typescript
// Для страниц с продуктами
templates: ['home', 'collection', 'search']
// Примеры: productGrid, productCard

// Для контентных страниц
templates: ['page', 'article', 'blog']
// Примеры: richTextContent, contentBlock
```

**Универсальные секции:**
```typescript
// Без ограничений
templates: undefined // или []
// Примеры: header, footer, breadcrumbs, newsletter, socialShare
```

### Связь с типизацией данных

```typescript
// Тип страницы определяет структуру данных
interface ProductPageData {
  product: Product;
  relatedProducts: Product[];
}

interface CollectionPageData {
  collection: Collection;
  products: Product[];
  filters: Filter[];
}

// Template связывает pageType с данными
const productTemplate: PageTemplate<ProductPageData> = {
  pageType: 'product',
  data: productData,
  sections: [
    // Секции могут безопасно использовать usePage<ProductPageData>()
  ],
};
```

### Валидация и утилиты

```typescript
// Проверка template
const errors = validateTemplate(template);

// Получение доступных секций для типа страницы
const sections = getAvailableSectionsForPageType('product');
// ['productHero', 'productRecommendations', 'breadcrumbs', 'newsletter', ...]

// Проверка конкретной секции
const canUse = canSectionBeUsedOnPage('productHero', 'product'); // true
const cannotUse = canSectionBeUsedOnPage('productHero', 'cart'); // false
```

### Миграция с универсальных секций

Если у вас уже есть секции без ограничений:

1. **Оставьте универсальные секции без изменений:**
   ```typescript
   templates: undefined // Работает везде
   ```

2. **Добавьте ограничения для специфичных секций:**
   ```typescript
   templates: ['product'] // Только там где нужны данные product
   ```

3. **Используйте условную логику внутри универсальных секций:**
   ```typescript
   function SmartSection() {
     const page = usePage();

     // Адаптация под разные контексты
     if (page.data?.product) {
       return <ProductView product={page.data.product} />;
     }
     if (page.data?.collection) {
       return <CollectionView collection={page.data.collection} />;
     }
     return <DefaultView />;
   }
   ```

---

## 9. FAQ

**Q: Почему Module Registry вместо простого объекта?**
A: Module Registry обеспечивает lazy loading, auto-discovery, plugin architecture и лучше масштабируется. Консистентен с существующей архитектурой проекта.

**Q: Как работает auto-discovery?**
A: Webpack `require.context` находит все `register.ts` файлы при сборке и автоматически выполняет регистрацию. Добавление нового компонента не требует изменения core кода.

**Q: Зачем нужны контекстные ограничения секций (templates field)?**
A: Три основные причины:
  1. **Типобезопасность** - секция `productHero` не будет работать на странице корзины (нет данных `product`)
  2. **Улучшенный DX** - редактор показывает только релевантные секции для типа страницы
  3. **Валидация** - ошибки обнаруживаются на этапе разработки, а не в production

**Q: Обязательно ли указывать templates в schema секции?**
A: Нет. Если `templates: undefined` или не указано - секция доступна на всех типах страниц. Используйте ограничения только для секций специфичных для контекста (product, collection, cart и т.д.).

**Q: Где хранить templates?**
A: В TypeScript файлах в директории `src/templates/`. Templates могут быть как статическими объектами, так и функциями-генераторами для динамической генерации на основе данных страницы.

**Q: Как тестировать компоненты?**
A: Секции и блоки - изолированные React компоненты с чёткими props интерфейсами:
```typescript
render(<MySection id="test" settings={{ title: 'Test' }} />);
```

**Q: Могут ли секции и блоки быть Server Components?**
A: Нет. Все секции и блоки должны быть Client Components (`'use client'`), так как используют React hooks (Zustand). Загрузка данных происходит на уровне страницы (Server Component), которая передает данные в PageBuilder через template.data.

**Q: Как добавить новый компонент?**
A:
1. Создать директорию `sections/MySection/` или `blocks/MyBlock/`
2. Создать файлы: `Component.tsx`, `schema.ts` (с `templates` если нужно), `types.ts`, `register.ts`
3. Auto-discovery автоматически подхватит при следующей сборке

**Q: Версионирование schemas?**
A: Рекомендуется добавить поле `version` в schema для миграций при breaking changes.

**Q: Почему TypeScript templates вместо JSON/CMS?**
A: TypeScript templates дают:
  - Условную логику и вычисляемые значения
  - Type safety (включая pageType и данные)
  - Переиспользование констант и импорты
  - Возможность создавать generator функции
  - Version control через Git
  - Code review процесс для изменений в templates
  - Нет необходимости в дополнительной инфраструктуре (CMS, database для templates)

---

## 10. Roadmap

**Фаза 1: Core Framework**
1. ✅ Архитектура спроектирована
2. Создать core систему (types, registry, renderers)
3. Настроить auto-discovery
4. Создать базовую структуру директорий

**Фаза 2: Proof of Concept**
5. Создать минимальный рабочий пример (1 секция + 1 блок + template)
6. Протестировать полный цикл: register → render
7. Проверить lazy loading и auto-discovery

**Фаза 3: Template система**
8. Template validation и error handling
9. Утилиты для загрузки templates
10. TypeScript типы для валидации

**Фаза 4: Production Ready**
11. Unit тесты для core функциональности
12. Performance оптимизация (memoization, lazy loading)
13. Error boundaries и fallback компоненты
14. JSDoc документация для публичных API
