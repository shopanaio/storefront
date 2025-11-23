# План миграции API слоя в @shopana/ecommerce-sdk

**Дата создания:** 2025-11-23
**Статус:** В работе
**Цель:** Вынести весь API слой из storefront в отдельный SDK пакет для переиспользования

---

## Обзор

Создание нового пакета `@shopana/ecommerce-sdk` в монорепозитории, который будет содержать:
- GraphQL hooks (Relay)
- Relay инфраструктуру (Environment, SSR helpers)
- Zustand stores (cart, session, app)
- React providers
- GraphQL queries
- Multi-provider поддержку (Shopana/Shopify)

---

## Структура проекта

### Текущая структура (что переносим)

```
storefront/src/
├── hooks/              # ~158 файлов хуков
│   ├── auth/          # useSignIn, useSignUp, useSignOut
│   ├── cart/          # useAddItemToCart, useCart, useUpdateCartLineQuantity
│   ├── category/      # useCategoryClientQuery
│   ├── product/       # useProduct, useProductBundlePricing
│   ├── search/        # usePredictiveSearch
│   ├── session/       # useGetSession, useGetSessionData
│   └── [utils]        # useBreakpoints, useCurrency, useIsMobile
├── relay/             # 4 файла Relay инфраструктуры
│   ├── Environment.ts
│   ├── loadSerializableQuery.ts
│   ├── useSerializablePreloadedQuery.ts
│   └── SessionPreloadProvider.tsx
├── store/             # 4 Zustand stores
│   ├── cartStore.ts   # Optimistic updates
│   ├── sessionStore.ts
│   ├── appStore.ts
│   └── cartMath.ts
├── queries/           # Shared GraphQL queries
│   ├── CategoryQuery/
│   ├── Listing/
│   └── Reviews/
├── providers/         # React contexts
│   ├── cart-context.tsx
│   └── session-context.tsx
└── cms/
    └── pick.ts        # Multi-provider picker
```

### Целевая структура SDK

```
packages/ecommerce-sdk/
├── src/
│   ├── hooks/         # Все хуки из storefront
│   ├── relay/         # Relay инфраструктура
│   ├── store/         # Zustand stores
│   ├── queries/       # GraphQL queries
│   ├── providers/     # React providers
│   ├── utils/         # cmsPick, accessToken
│   └── index.ts       # Главный экспорт
├── schema.shopana.graphql
├── schema.shopify.graphql
├── relay.shopana.json
├── relay.shopify.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Этап 1: Создание структуры пакета

### 1.1 Создать директорию и базовые файлы

```bash
mkdir -p packages/ecommerce-sdk/src/{hooks,relay,store,queries,providers,utils}
```

### 1.2 Создать package.json

```json
{
  "name": "@shopana/ecommerce-sdk",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./hooks": {
      "types": "./dist/hooks/index.d.ts",
      "default": "./dist/hooks/index.js"
    },
    "./hooks/auth": {
      "types": "./dist/hooks/auth/index.d.ts",
      "default": "./dist/hooks/auth/index.js"
    },
    "./hooks/cart": {
      "types": "./dist/hooks/cart/index.d.ts",
      "default": "./dist/hooks/cart/index.js"
    },
    "./hooks/product": {
      "types": "./dist/hooks/product/index.d.ts",
      "default": "./dist/hooks/product/index.js"
    },
    "./relay": {
      "types": "./dist/relay/index.d.ts",
      "default": "./dist/relay/index.js"
    },
    "./store": {
      "types": "./dist/store/index.d.ts",
      "default": "./dist/store/index.js"
    },
    "./providers": {
      "types": "./dist/providers/index.d.ts",
      "default": "./dist/providers/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "relay:shopana": "relay-compiler --config relay.shopana.json",
    "relay:shopify": "relay-compiler --config relay.shopify.json",
    "relay": "yarn relay:shopana && yarn relay:shopify"
  },
  "dependencies": {
    "@shopana/entity": "*",
    "zustand": "^5.0.6",
    "js-cookie": "^3.0.5",
    "lodash": "^4.17.21"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "react-relay": "^20.0.0",
    "relay-runtime": "^20.0.0",
    "next": "^14.0.0 || ^15.0.0 || ^16.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "relay-compiler": "^20.0.0",
    "typescript": "^5.7.2"
  }
}
```

### 1.3 Создать tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2021", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@shopana/entity": ["../entity/dist/index.d.ts"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/__generated__/**"]
}
```

---

## Этап 2: Перенос кода

### 2.1 Hooks (~158 файлов)

**Команда:**
```bash
cp -r storefront/src/hooks/* packages/ecommerce-sdk/src/hooks/
```

**Категории хуков:**
- ✅ `auth/` - useSignIn, useSignUp, useSignOut, useForgotPassword, useResetPassword
- ✅ `cart/` - useAddItemToCart, useCart, useUpdateCartLineQuantity, useRemoveItemFromCart
- ✅ `category/` - useCategoryClientQuery, loadCategoryServerQuery, useFilters
- ✅ `product/` - useProduct, usePreloadedProduct, useProductBundlePricing
- ✅ `search/` - usePredictiveSearch, useSearchRefetch
- ✅ `session/` - useGetSession, useGetSessionData, useInitialSessionState
- ✅ Utility hooks - useBreakpoints, useCurrency, useMoney, useIsClient

**Multi-provider pattern:**
Каждый хук имеет структуру:
```
hooks/cart/useAddItemToCart/
├── index.ts                    # CMS picker
├── useAddItemToCart.shopana.ts
├── useAddItemToCart.shopify.ts
└── interface.ts
```

### 2.2 Relay инфраструктура

**Файлы:**
- `relay/Environment.ts` - Relay Environment с Query Response Cache
- `relay/loadSerializableQuery.ts` - SSR загрузка
- `relay/useSerializablePreloadedQuery.ts` - клиентский preload
- `relay/SessionPreloadProvider.tsx` - preload provider

**Команда:**
```bash
cp storefront/src/relay/* packages/ecommerce-sdk/src/relay/
```

### 2.3 Zustand Stores

**Файлы:**
- `store/cartStore.ts` - Optimistic updates, versioning, операции с корзиной
- `store/sessionStore.ts` - Состояние сессии пользователя
- `store/appStore.ts` - Currency, locale (БЕЗ UI состояний!)
- `store/cartMath.ts` - Утилиты расчетов

**Команда:**
```bash
cp storefront/src/store/cartStore.ts packages/ecommerce-sdk/src/store/
cp storefront/src/store/sessionStore.ts packages/ecommerce-sdk/src/store/
cp storefront/src/store/appStore.ts packages/ecommerce-sdk/src/store/
cp storefront/src/store/cartMath.ts packages/ecommerce-sdk/src/store/
```

**⚠️ Важно:** Рефакторинг `appStore.ts`:
- Оставить: `currency`, `locale`
- Удалить: `isMobileMenuOpen`, `isSearchOpen`, `isSidebarOpen` и другие UI состояния

### 2.4 GraphQL Queries

**Команда:**
```bash
cp -r storefront/src/queries/* packages/ecommerce-sdk/src/queries/
```

### 2.5 Providers

**Файлы:**
- `providers/cart-context.tsx` (из `storefront/src/providers/cart-context.tsx`)
- `providers/session-context.tsx` (из `storefront/src/providers/session-context.tsx`)

**Команда:**
```bash
cp storefront/src/providers/cart-context.tsx packages/ecommerce-sdk/src/providers/CartProvider.tsx
cp storefront/src/providers/session-context.tsx packages/ecommerce-sdk/src/providers/SessionProvider.tsx
```

### 2.6 Utilities

**Файлы:**
- `utils/cmsPick.ts` - Multi-provider picker
- `utils/accessToken.ts` - Access token management

**Команда:**
```bash
cp storefront/src/cms/pick.ts packages/ecommerce-sdk/src/utils/cmsPick.ts
cp storefront/src/utils/accessToken.ts packages/ecommerce-sdk/src/utils/
```

---

## Этап 3: Исправление импортов

### 3.1 Замена алиасов путей

**Паттерны для поиска и замены:**

```typescript
// Было:
import { useCartStore } from '@src/store/cartStore';
import { cmsPick } from '@src/cms/pick';
import { getAccessToken } from '@src/utils/accessToken';

// Стало:
import { useCartStore } from '../store/cartStore';
import { cmsPick } from '../utils/cmsPick';
import { getAccessToken } from '../utils/accessToken';
```

**Замены:**
- `@src/store/*` → `../store/*` или `../../store/*`
- `@src/relay/*` → `../relay/*`
- `@src/providers/*` → `../providers/*`
- `@src/cms/pick` → `../utils/cmsPick`
- `@src/utils/accessToken` → `../utils/accessToken`
- `@codegen/*` → `../__generated__/*` (после настройки Relay)

### 3.2 Удаление зависимостей от next-intl

**Проблема:**
```typescript
import { useLocale } from 'next-intl';

const locale = useLocale();
```

**Решение 1:** Использовать appStore
```typescript
import { useAppStore } from '../store/appStore';

const locale = useAppStore((state) => state.locale);
```

**Решение 2:** Параметр функции
```typescript
// Было:
export const useProduct = () => {
  const locale = useLocale();
  // ...
}

// Стало:
export const useProduct = (locale?: string) => {
  const fallbackLocale = useAppStore((state) => state.locale);
  const actualLocale = locale || fallbackLocale;
  // ...
}
```

### 3.3 Environment Variables → Конфигурация

**Проблема:**
```typescript
const provider = process.env.NEXT_PUBLIC_CMS_PROVIDER;
```

**Решение:** Создать конфигурацию SDK

**Файл:** `src/config.ts`
```typescript
export interface SDKConfig {
  cmsProvider: 'shopana' | 'shopify';
  apiEndpoint: string;
  apiKey?: string;
  locale?: string;
  currency?: string;
}

let config: SDKConfig | null = null;

export const initSDK = (cfg: SDKConfig) => {
  config = cfg;
};

export const getSDKConfig = (): SDKConfig => {
  if (!config) {
    throw new Error('SDK not initialized. Call initSDK() first.');
  }
  return config;
};
```

**Обновить cmsPick:**
```typescript
import { getSDKConfig } from './config';

export const cmsPick = <T>(mapping: Record<string, T>): T => {
  const { cmsProvider } = getSDKConfig();
  return mapping[cmsProvider];
};
```

---

## Этап 4: GraphQL кодогенерация

### 4.1 Скопировать схемы

```bash
cp storefront/schema.shopana.graphql packages/ecommerce-sdk/
cp storefront/schema.shopify.graphql packages/ecommerce-sdk/
```

### 4.2 Настроить Relay Compiler

**Файл:** `relay.shopana.json`
```json
{
  "src": "./src",
  "schema": "./schema.shopana.graphql",
  "exclude": ["**/*.shopify.ts", "**/node_modules/**", "**/dist/**"],
  "language": "typescript",
  "artifactDirectory": "./src/__generated__"
}
```

**Файл:** `relay.shopify.json`
```json
{
  "src": "./src",
  "schema": "./schema.shopify.graphql",
  "exclude": ["**/*.shopana.ts", "**/node_modules/**", "**/dist/**"],
  "language": "typescript",
  "artifactDirectory": "./src/__generated__"
}
```

### 4.3 Запустить генерацию

```bash
cd packages/ecommerce-sdk
yarn relay
```

---

## Этап 5: Создание экспортов

### 5.1 Главный экспорт

**Файл:** `src/index.ts`
```typescript
// Hooks
export * from './hooks';

// Relay
export * from './relay';

// Stores
export * from './store';

// Providers
export * from './providers';

// Queries
export * from './queries';

// Utils
export * from './utils/cmsPick';
export * from './utils/accessToken';

// Config
export * from './config';
```

### 5.2 Экспорты хуков

**Файл:** `src/hooks/index.ts`
```typescript
// Auth
export * from './auth/useSignIn';
export * from './auth/useSignUp';
export * from './auth/useSignOut';
export * from './auth/useForgotPassword';
export * from './auth/useResetPassword';

// Cart
export * from './cart/useAddItemToCart';
export * from './cart/useCart';
export * from './cart/useUpdateCartLineQuantity';
export * from './cart/useRemoveItemFromCart';
export * from './cart/useClearCart';

// ... и так далее для всех категорий
```

**Создать отдельные индексы для категорий:**
- `src/hooks/auth/index.ts`
- `src/hooks/cart/index.ts`
- `src/hooks/product/index.ts`
- `src/hooks/category/index.ts`
- `src/hooks/search/index.ts`
- `src/hooks/session/index.ts`

### 5.3 Экспорты других модулей

**Файл:** `src/relay/index.ts`
```typescript
export { default as RelayEnvironment } from './Environment';
export * from './loadSerializableQuery';
export * from './useSerializablePreloadedQuery';
export * from './SessionPreloadProvider';
```

**Файл:** `src/store/index.ts`
```typescript
export * from './cartStore';
export * from './sessionStore';
export * from './appStore';
export * from './cartMath';
```

**Файл:** `src/providers/index.ts`
```typescript
export * from './CartProvider';
export * from './SessionProvider';
```

---

## Этап 6: Сборка и валидация

### 6.1 Запустить сборку

```bash
cd packages/ecommerce-sdk
yarn build
```

### 6.2 Проверить результаты

Проверить что создано:
- ✅ `dist/` директория
- ✅ `dist/index.js` и `dist/index.d.ts`
- ✅ `dist/hooks/`, `dist/relay/`, `dist/store/` и т.д.
- ✅ `.d.ts` файлы для TypeScript типов

### 6.3 Проверить на ошибки TypeScript

```bash
yarn build 2>&1 | grep "error TS"
```

---

## Этап 7: Интеграция с монорепой

### 7.1 Установить зависимости

```bash
cd /Users/phl/Projects/shopana-io/storefront
yarn install
```

Это создаст symlink для нового пакета.

### 7.2 Добавить в storefront (опционально)

**Файл:** `storefront/package.json`
```json
{
  "dependencies": {
    "@shopana/ecommerce-sdk": "*"
  }
}
```

---

## Этап 8: Документация

### 8.1 Создать README.md

**Файл:** `packages/ecommerce-sdk/README.md`

Должен содержать:
- Описание пакета
- Установка
- Инициализация SDK
- Примеры использования хуков
- API reference
- Конфигурация Relay

---

## Проблемные моменты и решения

### 1. Зависимость от next-intl
- **Проблема:** Hooks используют `useLocale()` из `next-intl`
- **Решение:** Использовать `appStore.locale` или передавать параметром

### 2. Environment variables
- **Проблема:** `process.env.NEXT_PUBLIC_*` используется в коде
- **Решение:** Конфигурация через `initSDK(config)`

### 3. Optimistic updates в cartStore
- **Проблема:** Тесная интеграция с Relay mutations
- **Решение:** Сохранить как есть, это часть API логики

### 4. __generated__ файлы Relay
- **Проблема:** Генерируются в storefront, нужны в SDK
- **Решение:** Настроить Relay Compiler для SDK отдельно

### 5. appStore UI состояния
- **Проблема:** `isMobileMenuOpen` и др. не относятся к API
- **Решение:** Удалить из SDK версии, оставить только `currency` и `locale`

---

## Чеклист выполнения

- [ ] Создана структура пакета
- [ ] Настроены package.json и tsconfig.json
- [ ] Перенесены hooks (~158 файлов)
- [ ] Перенесена Relay инфраструктура
- [ ] Перенесены Zustand stores
- [ ] Перенесены providers и queries
- [ ] Перенесены утилиты
- [ ] Исправлены все импорты
- [ ] Настроены GraphQL схемы и Relay Compiler
- [ ] Созданы индексные файлы для экспортов
- [ ] Запущена успешная сборка TypeScript
- [ ] Интегрирован с монорепой
- [ ] Создана документация

---

## Следующие шаги (НЕ в этом плане)

После создания SDK пакета:
1. Миграция storefront на использование `@shopana/ecommerce-sdk`
2. Обновление импортов в storefront
3. Удаление старого кода из storefront
4. Тестирование интеграции
5. Обновление других проектов для использования SDK

---

## Контакты и помощь

При возникновении проблем:
- Проверить TypeScript ошибки: `yarn build`
- Проверить Relay генерацию: `yarn relay`
- Проверить зависимости: `yarn install`

**Автор плана:** Claude Code
**Дата последнего обновления:** 2025-11-23
