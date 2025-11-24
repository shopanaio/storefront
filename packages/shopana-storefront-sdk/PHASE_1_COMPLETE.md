# Фаза 1 завершена: Автономная инфраструктура

## ✅ Выполненные задачи

### 1. Создан `core/config.ts`
- `CartConfig` interface для конфигурации модуля
- `createCartConfig()` функция для слияния с дефолтными значениями
- Поддержка настройки валюты, локали, cookies

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
```

### 2. Обновлен `core/utils/cartId.ts`
- Добавлена функция `createCartIdUtils(config)` для создания утилит с кастомной конфигурацией
- Поддержка динамического имени cookie
- Обратная совместимость через дефолтный экспорт `cartIdUtils`

### 3. Создан новый `react/context/CartContext.tsx`
- **Полностью автономный** - без зависимостей от `@src/*`
- `CartContextProvider` - внутренний провайдер
- Экспортирует 4 специализированных хука:
  - `useCartContext()` - полный контекст
  - `useCartStore()` - доступ к store
  - `useCartConfig()` - доступ к конфигу
  - `useCartIdUtils()` - доступ к утилитам cookies

### 4. Переписан `react/providers/CartProvider.tsx`
- **Полностью автономный** - без зависимостей от `@src/*`
- Использует `CartContextProvider` из SDK
- Автоматическая загрузка корзины из cookies
- Поддержка SSR через `initialCartData` prop
- Использует `createCartIdUtils` с конфигурацией

### 5. Исправлен `react/hooks/useCart.ts`
- Убрана зависимость от `@src/store/cartStore`
- Использует `useCartStore()` из context
- Убран циклический импорт `@shopana/storefront-sdk`

### 6. Исправлен `react/store/CartStoreZustand.ts`
- Обновлены имена методов с `optimistic*` на `checkoutLines*`
- Соответствует интерфейсу `CartStore`

## 📦 Новая архитектура

```
modules/cart/
├── core/
│   ├── config.ts           ✅ NEW - Configuration interface
│   ├── utils/
│   │   └── cartId.ts       ✅ UPDATED - Config support
│   └── index.ts            ✅ UPDATED - Exports config
│
├── react/
│   ├── context/
│   │   ├── CartContext.tsx ✅ UPDATED - Autonomous context
│   │   └── index.ts        ✅ UPDATED - New exports
│   │
│   ├── providers/
│   │   ├── CartProvider.tsx     ✅ REWRITTEN - Autonomous
│   │   ├── CartProvider.old.tsx  (backup)
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   └── useCart.ts      ✅ UPDATED - Uses context
│   │
│   ├── store/
│   │   └── CartStoreZustand.ts ✅ FIXED - Correct method names
│   │
│   └── index.ts            ✅ UPDATED - New exports
```

## 🎯 Достигнутые цели

1. ✅ **Конфигурируемость** - валюта, локаль, cookies настраиваются через props
2. ✅ **Автономность Context** - CartContext не зависит от внешних провайдеров
3. ✅ **Автономность Provider** - CartProvider работает независимо
4. ✅ **Обратная совместимость** - старые утилиты продолжают работать
5. ✅ **Type Safety** - все типы экспортируются

## 📝 API использования

### Базовое использование

```typescript
import {
  CartProvider,
  createCartStoreZustand
} from '@shopana/storefront-sdk/modules/cart/react';

const cartStore = createCartStoreZustand();

function App() {
  return (
    <CartProvider
      store={cartStore}
      config={{
        defaultCurrency: 'USD',
        defaultLocale: 'en',
      }}
    >
      {children}
    </CartProvider>
  );
}
```

### Использование хуков

```typescript
import {
  useCart,
  useCartConfig,
  useCartIdUtils
} from '@shopana/storefront-sdk/modules/cart/react';

function MyComponent() {
  const { cart, loading } = useCart();
  const config = useCartConfig();
  const cartIdUtils = useCartIdUtils();

  // config.defaultCurrency === 'USD'
  // config.defaultLocale === 'en'
  // cartIdUtils.getCartIdFromCookie()
}
```

### Кастомная конфигурация cookies

```typescript
<CartProvider
  store={cartStore}
  config={{
    defaultCurrency: 'EUR',
    defaultLocale: 'ru-RU',
    cookieName: 'myCart',
    cookieOptions: {
      secure: true,
      sameSite: 'lax',
      maxAge: 3600 * 24 * 60, // 60 days
    },
  }}
>
  {children}
</CartProvider>
```

## 🔄 Оставшиеся зависимости от @src/*

Следующие файлы **все еще** зависят от `@src/*` (Фаза 2):

1. `useAddItemToCart.ts` - `@src/store/cartStore`, `@src/store/appStore`, `next-intl`
2. `useRemoveItemFromCart.ts` - `@src/store/cartStore`
3. `useClearCart.ts` - `@src/providers/cart-context`, `@src/store/cartStore`
4. `useCreateCart.ts` - `@src/providers/cart-context`
5. `useUpdateCartLineQuantity.ts` - `@src/store/cartStore`
6. `useReplaceCartItem.ts` - `@src/store/cartStore`, `@src/store/appStore`
7. `useCartId.ts` - `@src/providers/cart-context`
8. `useCartFragment.ts` - `@src/providers/cart-context`
9. `CartProvider.old.tsx` - старая версия (можно удалить)
10. `next/loaders/loadCartServerQuery.ts` - `@src/relay/Environment`

## 🚀 Следующие шаги (Фаза 2)

1. Обновить все hooks для использования `useCartContext()` вместо `@src/*`
2. Заменить `useCurrencyStore` → `useCartConfig().defaultCurrency`
3. Заменить `useLocale` → `useCartConfig().defaultLocale`
4. Заменить прямой доступ к `useCartStore.getState()` → использовать context
5. Обновить GraphQL fragment imports
6. Обновить `next/loaders` для использования SDK relay utilities

## 📊 Метрики

- **Создано новых файлов:** 1 (config.ts)
- **Обновлено файлов:** 7
- **Удалено зависимостей @src/*:** 3 файла стали автономными
- **Оставшихся зависимостей:** ~10 файлов

---

**Дата:** 2025-11-24
**Статус:** ✅ Фаза 1 завершена
**Следующая фаза:** Рефакторинг Hooks (Phase 2)
