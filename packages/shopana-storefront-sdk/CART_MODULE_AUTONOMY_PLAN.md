# План автономизации модуля Cart в SDK

## 📋 Обзор

Этот документ описывает полный план превращения модуля `cart` в полностью автономный модуль SDK без зависимостей от корневого проекта (`@src/*`).

**Дата создания:** 2025-11-24
**Статус:** В процессе (Фаза 1 ✅ завершена)

---

## 🎯 Цели

1. **Полная автономность** - модуль не зависит от корневого проекта
2. **Переиспользуемость** - можно использовать в любом Next.js/React проекте
3. **Конфигурируемость** - валюта, локаль, cookies настраиваются через props
4. **Type Safety** - полная типизация на всех уровнях
5. **Testability** - можно тестировать изолированно
6. **Framework-agnostic core** - core слой работает без React
7. **SSR Support** - Next.js adapter для server-side загрузки

---

## 🔴 Выявленные проблемы

### Критические зависимости от корневого проекта

Модуль cart имеет **11 файлов** с зависимостями от `@src/*`:

#### 1. Store зависимости
- `@src/store/cartStore` - используется в 8 файлах
- `@src/store/appStore` (useCurrencyStore) - используется в 3 файлах

#### 2. Context/Provider зависимости
- `@src/providers/cart-context` - используется в 5 файлах
- Включает CartContextProvider и useCartContext

#### 3. Utilities зависимости
- `@src/utils/cartId` - утилиты для cookies (уже есть дубликат в SDK!)

#### 4. GraphQL зависимости
- `@src/hooks/cart/*` - старые query и fragment импорты
- `@src/relay/Environment` - network fetch

#### 5. i18n зависимости
- `next-intl` (useLocale) - внешняя зависимость для локали

### Архитектурные проблемы

1. **Dual Context Pattern** - hooks используют и Context и прямой доступ к Zustand store
2. **Missing Configuration** - нет единой точки для валюты, локали, relay environment
3. **Incomplete Migration** - `cartId` utils уже в SDK но не используются
4. **Fragment Fragmentation** - GraphQL fragments используют старые пути
5. **Provider Dependency Hell** - CartProvider зависит от внешнего CartContextProvider

---

## 📦 Текущая структура

```
modules/cart/
├── core/                           # Framework-agnostic
│   ├── types.ts                    # ✅ TypeScript interfaces
│   ├── config.ts                   # ✅ NEW - Configuration
│   ├── graphql/
│   │   ├── queries/
│   │   │   ├── loadCartQuery.ts    # ✅ Query for loading cart
│   │   │   └── index.ts
│   │   ├── mutations/
│   │   │   ├── addToCartMutation.ts         # ✅
│   │   │   ├── removeFromCartMutation.ts    # ✅
│   │   │   ├── clearCartMutation.ts         # ✅
│   │   │   ├── createCartMutation.ts        # ✅
│   │   │   ├── updateCartLineQuantityMutation.ts  # ✅
│   │   │   ├── replaceCartItemMutation.ts   # ✅
│   │   │   └── index.ts
│   │   └── fragments/
│   │       ├── CartFragment.ts     # ✅
│   │       ├── CartLineFragment.ts # ✅
│   │       └── index.ts
│   ├── mappers/
│   │   ├── mapShopanaToEntityCart.ts # ✅
│   │   └── index.ts
│   ├── utils/
│   │   ├── cartId.ts               # ✅ UPDATED - Config support
│   │   ├── cartMath.ts             # ✅
│   │   └── index.ts
│   └── index.ts
│
├── store/                          # Framework-agnostic state abstraction
│   ├── CartStore.ts                # ✅ Interface definition
│   ├── createCartStore.ts          # ✅ Factory function
│   └── index.ts
│
├── react/                          # React adapter
│   ├── context/
│   │   ├── CartContext.tsx         # ✅ UPDATED - Autonomous
│   │   └── index.ts
│   ├── providers/
│   │   ├── CartProvider.tsx        # ✅ REWRITTEN - Autonomous
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useCart.ts              # ✅ UPDATED - Uses context
│   │   ├── useAddItemToCart.ts     # ❌ Has @src/* deps
│   │   ├── useRemoveItemFromCart.ts # ❌ Has @src/* deps
│   │   ├── useClearCart.ts         # ❌ Has @src/* deps
│   │   ├── useCreateCart.ts        # ❌ Has @src/* deps
│   │   ├── useUpdateCartLineQuantity.ts # ❌ Has @src/* deps
│   │   ├── useReplaceCartItem.ts   # ❌ Has @src/* deps
│   │   ├── useIsInTheCart.ts       # ❌ Has @src/* deps
│   │   ├── useCartId.ts            # ❌ Has @src/* deps
│   │   ├── useCartFragment.ts      # ❌ Has @src/* deps
│   │   └── index.ts
│   ├── store/
│   │   └── CartStoreZustand.ts     # ✅ FIXED - Zustand implementation
│   └── index.ts
│
├── next/                           # Next.js adapter
│   ├── loaders/
│   │   ├── loadCartServerQuery.ts  # ❌ Has @src/* deps
│   │   └── index.ts
│   └── index.ts
│
└── index.ts                        # Main module export
```

---

## 🚀 План реализации

### ✅ Фаза 1: Создание автономного Context и Configuration (ЗАВЕРШЕНА)

#### 1.1 Создать CartConfiguration interface ✅
**Файл:** `core/config.ts`

```typescript
export interface CartConfig {
  defaultCurrency: string;
  defaultLocale: string;
  cookieName?: string;
  cookieOptions?: {
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
  };
}

export const DEFAULT_CART_CONFIG: Partial<CartConfig> = {
  cookieName: 'cartId',
  cookieOptions: {
    secure: true,
    sameSite: 'strict',
    maxAge: 3600 * 24 * 30, // 30 days
  },
};

export function createCartConfig(userConfig: CartConfig): Required<CartConfig>;
```

#### 1.2 Обновить cartId utils ✅
**Файл:** `core/utils/cartId.ts`

```typescript
export function createCartIdUtils(config?: CartIdUtilsConfig) {
  const cookieName = config?.cookieName ?? 'cartId';
  const cookieOptions = config?.cookieOptions ?? { ... };

  return {
    getCartIdFromCookie(serverCookies?: string): string | null,
    setCartIdCookie(cartId: string, options?): void,
    removeCartIdCookie(): void,
    hasCart(serverCookies?: string): boolean,
  };
}

// Backward compatibility
export const cartIdUtils = createCartIdUtils();
```

#### 1.3 Переписать CartContext ✅
**Файл:** `react/context/CartContext.tsx`

```typescript
export interface CartContextValue {
  store: CartStore;
  config: Required<CartConfig>;
  cartIdUtils: ReturnType<typeof createCartIdUtils>;
}

export function CartContextProvider({ children, store, config }: Props);
export function useCartContext(): CartContextValue;
export function useCartStore(): CartStore;
export function useCartConfig(): Required<CartConfig>;
export function useCartIdUtils(): ReturnType<typeof createCartIdUtils>;
```

#### 1.4 Создать новый CartProvider ✅
**Файл:** `react/providers/CartProvider.tsx`

```typescript
export interface CartProviderProps {
  children: React.ReactNode;
  store: CartStore;
  config: CartConfig;
  initialCartData?: PreloadedQuery<LoadCartQueryType> | null;
}

export const CartProvider: React.FC<CartProviderProps>;
```

**Убраны зависимости:**
- ❌ `@src/providers/cart-context` → ✅ Internal CartContextProvider
- ❌ `@src/utils/cartId` → ✅ SDK cartIdUtils
- ❌ `@src/hooks/cart/loadCartQuery` → ✅ SDK loadCartQuery

---

### 🔄 Фаза 2: Рефакторинг Hooks

#### 2.1 Обновить все hooks для использования Context

**Изменения для всех hooks:**

```typescript
// Было:
import { useCartStore } from '@src/store/cartStore';
import { useCurrencyStore } from '@src/store/appStore';
import { useLocale } from 'next-intl';
import { useCartContext } from '@src/providers/cart-context';

const currencyCode = useCurrencyStore((state) => state.currencyCode);
const [localeCode] = useLocale();
const { cart, checkoutLinesAdd } = useCartStore.getState();

// Стало:
import { useCartStore, useCartConfig } from '../context';

const store = useCartStore();
const { defaultCurrency, defaultLocale } = useCartConfig();
const { cart } = store;
const { revert } = store.checkoutLinesAdd({ ... });
```

#### 2.2 Список hooks для рефакторинга

**Высокий приоритет (блокируют автономность):**

1. **useAddItemToCart.ts**
   - Убрать: `@src/store/cartStore`, `@src/store/appStore`, `next-intl`
   - Использовать: `useCartStore()`, `useCartConfig()`

2. **useRemoveItemFromCart.ts**
   - Убрать: `@src/store/cartStore`
   - Использовать: `useCartStore()`

3. **useClearCart.ts**
   - Убрать: `@src/providers/cart-context`, `@src/store/cartStore`
   - Использовать: `useCartStore()`

4. **useCreateCart.ts**
   - Убрать: `@src/providers/cart-context`
   - Использовать: `useCartContext()` для доступа к cartIdUtils

5. **useUpdateCartLineQuantity.ts**
   - Убрать: `@src/store/cartStore`
   - Использовать: `useCartStore()`

6. **useReplaceCartItem.ts**
   - Убрать: `@src/store/cartStore`, `@src/store/appStore`
   - Использовать: `useCartStore()`, `useCartConfig()`

7. **useIsInTheCart.ts**
   - Проверить и убрать зависимости

8. **useCartId.ts**
   - Убрать: `@src/providers/cart-context`
   - Использовать: `useCartIdUtils()`

9. **useCartFragment.ts**
   - Убрать: `@src/providers/cart-context`
   - Использовать: `useCartContext()`

10. **useCartLineFragment.ts**
    - Проверить и убрать зависимости

#### 2.3 Удалить @ts-ignore комментарии

После рефакторинга удалить все комментарии:
```typescript
// @ts-ignore - TODO: Phase 2 - Move useCartStore to SDK
// @ts-ignore - TODO: Phase 2 - Move useCurrencyStore to SDK
// @ts-ignore - TODO: Phase 2 - Move useLocale to SDK
```

---

### 🔧 Фаза 3: Миграция GraphQL

#### 3.1 Обновить fragment imports

**Во всех hooks заменить:**

```typescript
// Было:
import { useCart_CartFragment$key } from '@src/hooks/cart/useCartFragment/__generated__/useCart_CartFragment.graphql';

// Стало:
import { useCart_CartFragment$key } from '../../core/graphql/fragments/__generated__/useCart_CartFragment.graphql';
```

#### 3.2 Проверить все query/mutation imports

Убедиться что все используют SDK версии:
- `loadCartQuery` из `../../core/graphql/queries`
- Все mutations из `../../core/graphql/mutations`
- Все fragments из `../../core/graphql/fragments`

#### 3.3 Удалить зависимости от @src/hooks/cart/*

Полностью убрать импорты из старых файлов корзины.

---

### 🔌 Фаза 4: Relay Environment Integration

#### 4.1 Добавить relay environment в Context (опционально)

```typescript
export interface CartContextValue {
  store: CartStore;
  config: Required<CartConfig>;
  cartIdUtils: ReturnType<typeof createCartIdUtils>;
  // Optional: allow custom relay environment
  relayEnvironment?: Environment;
}
```

#### 4.2 Обновить Next.js loaders

**Файл:** `next/loaders/loadCartServerQuery.ts`

```typescript
// Убрать:
import { networkFetch } from '@src/relay/Environment';

// Использовать:
import { loadSerializableQuery } from '../../../graphql/relay';
import { cartIdUtils } from '../../core/utils/cartId';
```

---

### 📖 Фаза 5: Документация и Migration Guide

#### 5.1 Создать MIGRATION_GUIDE.md

Документация по переходу с `@src/*` на SDK:
- Как обновить CartProvider
- Как обновить использование hooks
- Breaking changes (если есть)
- Примеры до/после

#### 5.2 Обновить примеры в CART_MODULE_MIGRATION_PLAN.md

Добавить актуальные примеры использования:
- Базовая настройка
- Кастомная конфигурация
- SSR интеграция
- Примеры hooks

#### 5.3 Добавить TypeScript примеры конфигурации

```typescript
// Basic usage
<CartProvider
  store={cartStore}
  config={{
    defaultCurrency: 'USD',
    defaultLocale: 'en',
  }}
>
  {children}
</CartProvider>

// Advanced configuration
<CartProvider
  store={cartStore}
  config={{
    defaultCurrency: 'EUR',
    defaultLocale: 'ru-RU',
    cookieName: 'myCartId',
    cookieOptions: {
      secure: true,
      sameSite: 'lax',
      maxAge: 3600 * 24 * 60, // 60 days
    },
  }}
  initialCartData={serverCartData}
>
  {children}
</CartProvider>
```

---

### 🧹 Фаза 6: Root Project Migration

#### 6.1 Обновить app/layout.tsx

**Корневой проект:** `src/app/layout.tsx`

```typescript
// Было:
import { useCartStore } from '@src/store/cartStore';

// Стало:
import {
  CartProvider,
  createCartStoreZustand
} from '@shopana/storefront-sdk/modules/cart/react';

const cartStore = createCartStoreZustand();

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartProvider
          store={cartStore}
          config={{
            defaultCurrency: 'USD',
            defaultLocale: 'en',
          }}
        >
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
```

#### 6.2 Заменить все импорты hooks

**Во всех компонентах:**

```typescript
// Было:
import { useAddItemToCart } from '@src/hooks/cart/useAddItemToCart';
import { useCart } from '@src/hooks/cart/useCart';

// Стало:
import {
  useAddItemToCart,
  useCart
} from '@shopana/storefront-sdk/modules/cart/react';
```

#### 6.3 Удалить старые файлы

После миграции и тестирования удалить:
- `src/hooks/cart/*` - все старые cart hooks
- `src/utils/cartId/*` - старая версия cartId utils
- Cart-related код из `src/store/cartStore` (если возможно)
- `src/providers/cart-context` - старый context

#### 6.4 Тестировать все cart операции

Проверить:
- ✅ Добавление товара в корзину
- ✅ Удаление товара из корзины
- ✅ Обновление количества
- ✅ Замена товара (replace variant)
- ✅ Очистка корзины
- ✅ Создание новой корзины
- ✅ Загрузка корзины при SSR
- ✅ Сохранение cartId в cookies
- ✅ Восстановление корзины после перезагрузки

---

## 📋 Детальный чеклист

### ✅ Phase 1: Core Infrastructure (ЗАВЕРШЕНА)
- [x] Создать `core/config.ts` - CartConfig interface
- [x] Обновить `core/utils/cartId.ts` - использовать config
- [x] Создать `react/context/CartContext.tsx` - новый Context без зависимостей
- [x] Переписать `react/providers/CartProvider.tsx` - автономная реализация
- [x] Исправить `react/hooks/useCart.ts` - убрать @src/store/cartStore
- [x] Исправить `react/store/CartStoreZustand.ts` - правильные имена методов
- [x] Обновить `core/index.ts` - экспортировать config
- [x] Обновить `react/context/index.ts` - новые exports
- [x] Обновить `react/index.ts` - новые exports

### 🔄 Phase 2: Hooks Migration (В процессе)
- [ ] `useAddItemToCart.ts` - убрать `@src/store/cartStore`, `@src/store/appStore`, `next-intl`
- [ ] `useRemoveItemFromCart.ts` - убрать `@src/store/cartStore`
- [ ] `useClearCart.ts` - убрать `@src/providers/cart-context`, `@src/store/cartStore`
- [ ] `useCreateCart.ts` - убрать `@src/providers/cart-context`
- [ ] `useUpdateCartLineQuantity.ts` - убрать `@src/store/cartStore`
- [ ] `useReplaceCartItem.ts` - убрать `@src/store/cartStore`, `@src/store/appStore`
- [ ] `useIsInTheCart.ts` - проверить зависимости
- [ ] `useCartId.ts` - убрать `@src/providers/cart-context`
- [ ] `useCartFragment.ts` - убрать `@src/providers/cart-context`
- [ ] `useCartLineFragment.ts` - проверить зависимости

### 🔧 Phase 3: GraphQL Migration
- [ ] Обновить fragment imports во всех hooks
- [ ] Проверить все query/mutation imports
- [ ] Удалить зависимости от `@src/hooks/cart/*`

### 🔌 Phase 4: Next.js Adapter
- [ ] Обновить `next/loaders/loadCartServerQuery.ts`
- [ ] Использовать SDK relay utilities
- [ ] Тестировать SSR загрузку корзины

### 📖 Phase 5: Documentation & Migration
- [ ] Создать MIGRATION_GUIDE.md
- [ ] Обновить примеры в CART_MODULE_MIGRATION_PLAN.md
- [ ] Добавить TypeScript примеры конфигурации
- [ ] Документировать все публичные API
- [ ] Создать примеры использования для разных фреймворков

### 🧹 Phase 6: Root Project Migration
- [ ] Обновить app/layout.tsx использовать новый CartProvider
- [ ] Заменить все импорты с `@src/hooks/cart/*` на SDK
- [ ] Обновить все компоненты использующие cart hooks
- [ ] Удалить старые файлы из src/hooks/cart/
- [ ] Удалить src/utils/cartId
- [ ] Тестировать все cart операции
- [ ] Проверить SSR работу
- [ ] Проверить cookies сохранение/восстановление
- [ ] Performance testing

---

## 🎯 Приоритеты выполнения

### Критичные (блокируют автономность)
1. ✅ **Phase 1** - Core Infrastructure
2. 🔄 **Phase 2** - Hooks Migration
3. 🔄 **Phase 3** - GraphQL Migration

### Важные (улучшают интеграцию)
4. **Phase 4** - Next.js Adapter
5. **Phase 5** - Documentation

### Опциональные (cleanup)
6. **Phase 6** - Root Project Migration

---

## 📦 Итоговые exports в package.json

```json
{
  "name": "@shopana/storefront-sdk",
  "exports": {
    "./modules/cart": {
      "types": "./dist/modules/cart/index.d.ts",
      "default": "./dist/modules/cart/index.js"
    },
    "./modules/cart/core": {
      "types": "./dist/modules/cart/core/index.d.ts",
      "default": "./dist/modules/cart/core/index.js"
    },
    "./modules/cart/store": {
      "types": "./dist/modules/cart/store/index.d.ts",
      "default": "./dist/modules/cart/store/index.js"
    },
    "./modules/cart/react": {
      "types": "./dist/modules/cart/react/index.d.ts",
      "default": "./dist/modules/cart/react/index.js"
    },
    "./modules/cart/next": {
      "types": "./dist/modules/cart/next/index.d.ts",
      "default": "./dist/modules/cart/next/index.js"
    }
  },
  "peerDependencies": {
    "zustand": "^4.0.0 || ^5.0.0",
    "js-cookie": "^3.0.0",
    "react": "^18.0.0 || ^19.0.0",
    "react-relay": "^18.0.0 || ^19.0.0 || ^20.0.0",
    "next": "^14.0.0 || ^15.0.0 || ^16.0.0"
  }
}
```

---

## ⚡ Преимущества после завершения

1. **Полная автономность** - модуль не зависит от корневого проекта
2. **Переиспользуемость** - можно использовать в любом Next.js/React проекте
3. **Конфигурируемость** - валюта, локаль, cookies настраиваются через props
4. **Type Safety** - полная типизация на всех уровнях
5. **Testability** - можно тестировать изолированно от root project
6. **Framework-agnostic core** - core слой работает без React
7. **SSR Support** - Next.js adapter для server-side загрузки
8. **Modular imports** - импортируй только то что нужно
9. **Smaller bundle** - tree-shaking работает корректно
10. **Better DX** - понятная структура и документация

---

## 📊 Метрики прогресса

### Текущее состояние
- **Фаз завершено:** 1 из 6 (17%)
- **Файлов стало автономными:** 3
- **Файлов осталось с зависимостями:** ~10
- **Удалено зависимостей @src/*:** ~5 импортов
- **Создано новых файлов:** 2
- **Обновлено файлов:** 7

### Целевое состояние
- **Фаз завершено:** 6 из 6 (100%)
- **Файлов автономных:** ~25 (все)
- **Файлов с зависимостями:** 0
- **Удалено зависимостей @src/*:** все

---

## 🔗 Связанные документы

- `CART_MODULE_MIGRATION_PLAN.md` - Оригинальный план миграции
- `PHASE_1_COMPLETE.md` - Отчет о завершении Фазы 1
- `MIGRATION_GUIDE.md` - Руководство по миграции (будет создано)

---

## 📝 Заметки

### Backward Compatibility
- Старые утилиты `cartIdUtils` продолжают работать через дефолтный export
- Можно постепенно мигрировать без breaking changes

### Breaking Changes (будущие)
- В Phase 6 будет удален весь старый код из `@src/*`
- Необходимо обновить все импорты в root project

### Performance Considerations
- Новый Context использует `useMemo` для оптимизации
- CartProvider загружает корзину асинхронно
- Optimistic updates работают через Zustand store

---

**Последнее обновление:** 2025-11-24
**Автор:** Claude Code
**Статус:** 🔄 В процессе (Phase 1 ✅ завершена)
