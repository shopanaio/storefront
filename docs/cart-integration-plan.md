# План интеграции модуля Cart с корневым приложением

## Оглавление
1. [Обзор](#обзор)
2. [Текущее состояние](#текущее-состояние)
3. [Архитектура модуля Cart](#архитектура-модуля-cart)
4. [Этапы интеграции](#этапы-интеграции)
5. [Миграция существующего кода](#миграция-существующего-кода)
6. [Тестирование](#тестирование)
7. [Потенциальные проблемы](#потенциальные-проблемы)

---

## Обзор

Модуль Cart находится в `packages/shopana-storefront-sdk/src/modules/cart` и представляет собой полнофункциональное решение для управления корзиной покупок с поддержкой:
- Framework-agnostic core логики
- React адаптеров (хуки, контекст, провайдеры)
- Next.js специфичных решений (SSR loaders)
- Интеграции с Relay GraphQL
- State management через Zustand

**Цель**: Полностью интегрировать модуль Cart SDK в корневое приложение, заменив существующую реализацию корзины.

---

## Текущее состояние

### Существующая реализация корзины

**Расположение**: `/src/providers/cart/`

**Файлы**:
- `cart-context.tsx` - старый контекст корзины
- `cart-provider.shopana.tsx` - провайдер для Shopana
- `cart-provider.shopify.tsx` - провайдер для Shopify
- `index.ts` - выбор провайдера через `cmsPick`

**Используемые хуки**:
- `/src/hooks/cart/` - существующие хуки для работы с корзиной

**Проблемы текущей реализации**:
- Дублирование логики между провайдерами
- Тесная связь с Relay фрагментами приложения
- Отсутствие единого источника правды (single source of truth)
- Сложность тестирования

---

## Архитектура модуля Cart

### Структура модуля

```
packages/shopana-storefront-sdk/src/modules/cart/
├── core/                           # Framework-agnostic ядро
│   ├── config.ts                   # Конфигурация модуля
│   ├── types.ts                    # TypeScript типы
│   ├── graphql/
│   │   ├── fragments/              # GraphQL фрагменты
│   │   │   ├── CartFragment.ts
│   │   │   └── CartLineFragment.ts
│   │   ├── queries/                # GraphQL запросы
│   │   │   └── loadCartQuery.ts
│   │   └── mutations/              # GraphQL мутации
│   │       ├── addToCartMutation.ts
│   │       ├── removeFromCartMutation.ts
│   │       ├── updateCartLineQuantityMutation.ts
│   │       ├── replaceCartItemMutation.ts
│   │       ├── clearCartMutation.ts
│   │       └── createCartMutation.ts
│   ├── mappers/                    # Преобразование данных
│   │   └── mapShopanaToEntityCart.ts
│   └── utils/
│       ├── cartId.ts               # Работа с ID корзины (cookies)
│       └── cartMath.ts             # Математические операции
│
├── store/                          # Абстракция хранилища
│   ├── CartStore.ts                # Интерфейс хранилища
│   └── createCartStore.ts          # Фабрика хранилища
│
├── react/                          # React адаптер
│   ├── context/                    # React контекст
│   │   └── CartContext.tsx
│   ├── providers/                  # Провайдеры
│   │   └── CartProvider.tsx
│   ├── store/                      # Zustand реализация
│   │   └── CartStoreZustand.ts
│   └── hooks/                      # React хуки
│       ├── useCart.ts              # Основной хук корзины
│       ├── useCartId.ts
│       ├── useAddItemToCart.ts
│       ├── useRemoveItemFromCart.ts
│       ├── useUpdateCartLineQuantity.ts
│       ├── useReplaceCartItem.ts
│       ├── useClearCart.ts
│       ├── useCreateCart.ts
│       ├── useIsInTheCart.ts
│       ├── useCartFragment.ts
│       └── useCartLineFragment.ts
│
├── next/                           # Next.js адаптер
│   └── loaders/
│       └── loadCartServerQuery.ts  # SSR загрузка корзины
│
└── index.ts                        # Главный экспорт
```

### Ключевые компоненты

#### 1. **CartStore** (Zustand)
Централизованное хранилище состояния корзины:
```typescript
interface CartStore {
  cart: model.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  setCart: (cart: model.Cart | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}
```

#### 2. **CartProvider**
React провайдер, который:
- Инициализирует store
- Загружает корзину из cookies при монтировании
- Управляет жизненным циклом корзины
- Предоставляет контекст для дочерних компонентов
- Поддерживает SSR через `initialCartData`

#### 3. **Хуки**
Набор хуков для работы с корзиной:
- `useCart()` - получение текущего состояния корзины
- `useAddItemToCart()` - добавление товаров
- `useRemoveItemFromCart()` - удаление товаров
- `useUpdateCartLineQuantity()` - обновление количества
- `useReplaceCartItem()` - замена варианта товара
- `useClearCart()` - очистка корзины
- `useCreateCart()` - создание новой корзины

#### 4. **GraphQL интеграция**
- Все операции работают через Relay
- Автоматическая генерация типов через `__generated__`
- Фрагменты для повторного использования данных

---

## Этапы интеграции

### Этап 1: Подготовка (Preparation)

**Цель**: Подготовить инфраструктуру для интеграции

**Задачи**:

1. **Анализ зависимостей**
   - Составить список всех компонентов, использующих старую корзину
   - Проверить совместимость версий зависимостей (React, Relay, Zustand)
   - Документировать API старой реализации

2. **Создание резервной копии**
   - Создать feature branch: `feat/cart-sdk-integration`
   - Сохранить старую реализацию с суффиксом `.old.tsx`

3. **Настройка конфигурации**
   ```typescript
   // src/config/cart.config.ts
   import { createCartConfig } from '@shopana/storefront-sdk/cart';

   export const cartConfig = createCartConfig({
     defaultCurrency: 'UAH',
     defaultLocale: 'uk',
     cookieName: 'shopana_cart_id',
     cookieOptions: {
       maxAge: 60 * 60 * 24 * 30, // 30 days
       path: '/',
       sameSite: 'lax',
     },
   });
   ```

**Результат**: Готовая инфраструктура для начала интеграции

---

### Этап 2: Интеграция CartProvider в Root Layout

**Цель**: Заменить старый провайдер на новый из SDK

**Задачи**:

1. **Создание экземпляра store**
   ```typescript
   // src/store/cart.store.ts
   import { createCartStoreZustand } from '@shopana/storefront-sdk/cart';

   export const cartStore = createCartStoreZustand();
   ```

2. **Обновление Root Layout**
   ```typescript
   // src/app/layout.tsx
   'use client';

   import { getCurrentEnvironment } from '@src/relay/Environment';
   import { RelayEnvironmentProvider } from 'react-relay';
   import { ShopProvider } from '@shopana/storefront-sdk/shop';
   import { CartProvider } from '@shopana/storefront-sdk/cart';
   import { mockShopConfig } from '@shopana/storefront-sdk/shop/mockShopConfig';
   import { cartStore } from '@src/store/cart.store';
   import { cartConfig } from '@src/config/cart.config';

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en" suppressHydrationWarning>
         <head>
           <title>Shopana</title>
           {/* meta tags */}
         </head>
         <RelayEnvironmentProvider environment={getCurrentEnvironment()}>
           <ShopProvider config={mockShopConfig}>
             <CartProvider store={cartStore} config={cartConfig}>
               <body>
                 <div id="app">{children}</div>
                 <div id="sheet-wrapper"></div>
               </body>
             </CartProvider>
           </ShopProvider>
         </RelayEnvironmentProvider>
       </html>
     );
   }
   ```

3. **Удаление старого провайдера**
   - Убрать импорты из `src/providers/cart/`
   - Переименовать старые файлы: `*.old.tsx`
   - Обновить `src/providers/cart/index.ts`:
   ```typescript
   // src/providers/cart/index.ts
   export { CartProvider } from '@shopana/storefront-sdk/cart';
   ```

**Результат**: CartProvider из SDK активен во всем приложении

---

### Этап 3: Миграция хуков

**Цель**: Заменить все использования старых хуков корзины на новые из SDK

**Задачи**:

1. **Создание barrel-файла для хуков**
   ```typescript
   // src/hooks/cart/index.ts
   export {
     useCart,
     useCartId,
     useAddItemToCart,
     useRemoveItemFromCart,
     useUpdateCartLineQuantity,
     useReplaceCartItem,
     useClearCart,
     useCreateCart,
     useIsInTheCart,
     useCartContext,
     useCartStore,
   } from '@shopana/storefront-sdk/cart';
   ```

2. **Обновление импортов в компонентах**

   **До**:
   ```typescript
   import { useCart } from '@src/hooks/cart/useCart';
   ```

   **После**:
   ```typescript
   import { useCart } from '@shopana/storefront-sdk/cart';
   // или
   import { useCart } from '@src/hooks/cart';
   ```

3. **Адаптация типов**
   - Обновить типы компонентов под новые типы из SDK
   - Заменить `model.Cart` на типы из SDK, если требуется

4. **Массовая замена**
   ```bash
   # Найти все файлы, использующие старые хуки
   grep -r "from '@src/hooks/cart/" src/

   # Заменить импорты (используя IDE или скрипт)
   ```

**Результат**: Все компоненты используют хуки из SDK

---

### Этап 4: Интеграция с Next.js SSR

**Цель**: Добавить поддержку Server-Side Rendering для корзины

**Задачи**:

1. **Создание SSR loader утилиты**
   ```typescript
   // src/utils/cart/loadCartSSR.ts
   import { loadCartServerQuery } from '@shopana/storefront-sdk/cart/next';
   import { getCurrentEnvironment } from '@src/relay/Environment';

   export async function loadCartSSR(cartId: string) {
     const environment = getCurrentEnvironment();
     return loadCartServerQuery(environment, cartId);
   }
   ```

2. **Обновление page компонентов**
   ```typescript
   // src/app/[locale]/(default)/page.tsx
   import { loadCartSSR } from '@src/utils/cart/loadCartSSR';
   import { cookies } from 'next/headers';

   export default async function HomePage() {
     const cartId = cookies().get('shopana_cart_id')?.value;
     const initialCartData = cartId ? await loadCartSSR(cartId) : null;

     return (
       <ClientHomePage initialCartData={initialCartData} />
     );
   }
   ```

3. **Передача данных в CartProvider**
   - Использовать `initialCartData` prop для передачи предзагруженных данных

**Результат**: Корзина загружается на сервере, улучшая UX

---

### Этап 5: Обновление компонентов UI

**Цель**: Адаптировать все UI компоненты корзины

**Задачи**:

1. **Инвентаризация компонентов**
   - CartButton/CartIcon
   - CartDrawer/CartSheet
   - CartItem
   - CartSummary
   - CheckoutButton
   - MiniCart

2. **Обновление каждого компонента**

   **Пример: CartButton**
   ```typescript
   // src/components/Cart/CartButton.tsx
   'use client';

   import { useCart } from '@shopana/storefront-sdk/cart';
   import { ShoppingCartIcon } from '@heroicons/react/24/outline';

   export function CartButton() {
     const { cart, loading } = useCart();
     const itemCount = cart?.lines?.length ?? 0;

     return (
       <button className="relative">
         <ShoppingCartIcon className="w-6 h-6" />
         {itemCount > 0 && (
           <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
             {itemCount}
           </span>
         )}
       </button>
     );
   }
   ```

3. **Обновление форм добавления в корзину**
   ```typescript
   // src/components/Product/AddToCartForm.tsx
   'use client';

   import { useAddItemToCart } from '@shopana/storefront-sdk/cart';
   import type { AddToCartInput } from '@shopana/storefront-sdk/cart';

   export function AddToCartForm({ variant }) {
     const { addItem, loading } = useAddItemToCart();

     const handleAddToCart = async () => {
       const input: AddToCartInput = {
         purchasableId: variant.id,
         purchasableSnapshot: {
           price: variant.price,
           compareAtPrice: variant.compareAtPrice,
         },
         quantity: 1,
       };

       await addItem(input, {
         onSuccess: () => {
           console.log('Added to cart!');
         },
         onError: (error) => {
           console.error('Failed to add to cart:', error);
         },
       });
     };

     return (
       <button
         onClick={handleAddToCart}
         disabled={loading}
       >
         {loading ? 'Adding...' : 'Add to Cart'}
       </button>
     );
   }
   ```

**Результат**: Все UI компоненты используют SDK

---

### Этап 6: Обновление тестов

**Цель**: Обеспечить покрытие тестами новой реализации

**Задачи**:

1. **Создание моков для SDK**
   ```typescript
   // src/__tests__/mocks/cart.mock.ts
   import { vi } from 'vitest';

   export const mockCartStore = {
     cart: null,
     loading: false,
     loaded: false,
     error: null,
     setCart: vi.fn(),
     setLoading: vi.fn(),
     setError: vi.fn(),
   };

   export const mockUseCart = () => ({
     cart: mockCartStore.cart,
     loading: false,
     loaded: true,
     error: null,
   });
   ```

2. **Обновление существующих тестов**
   - Заменить моки старой реализации на новые
   - Обновить expectations под новый API

3. **Написание интеграционных тестов**
   ```typescript
   // src/__tests__/cart/cart-integration.test.tsx
   import { render, screen, waitFor } from '@testing-library/react';
   import { CartProvider, createCartStoreZustand } from '@shopana/storefront-sdk/cart';
   import { AddToCartForm } from '@src/components/Product/AddToCartForm';

   describe('Cart Integration', () => {
     it('should add item to cart', async () => {
       const store = createCartStoreZustand();

       render(
         <CartProvider store={store} config={cartConfig}>
           <AddToCartForm variant={mockVariant} />
         </CartProvider>
       );

       const button = screen.getByText('Add to Cart');
       fireEvent.click(button);

       await waitFor(() => {
         expect(store.cart?.lines.length).toBe(1);
       });
     });
   });
   ```

**Результат**: Полное покрытие тестами

---

### Этап 7: Оптимизация и доработка

**Цель**: Оптимизировать производительность и UX

**Задачи**:

1. **Оптимистичные обновления**
   - Реализовать optimistic updates для мутаций
   - Использовать Relay optimistic response

2. **Обработка ошибок**
   ```typescript
   // src/components/Cart/ErrorBoundary.tsx
   import { useCartStore } from '@shopana/storefront-sdk/cart';

   export function CartErrorBoundary({ children }) {
     const { error } = useCartStore();

     if (error) {
       return (
         <div className="error-state">
           <p>Oops! Something went wrong with your cart.</p>
           <button onClick={() => window.location.reload()}>
             Reload
           </button>
         </div>
       );
     }

     return children;
   }
   ```

3. **Добавление аналитики**
   ```typescript
   // src/hooks/cart/useCartAnalytics.ts
   import { useAddItemToCart } from '@shopana/storefront-sdk/cart';
   import { trackEvent } from '@src/analytics';

   export function useCartWithAnalytics() {
     const { addItem, ...rest } = useAddItemToCart();

     const addItemWithTracking = async (input, options) => {
       trackEvent('add_to_cart', {
         product_id: input.purchasableId,
         quantity: input.quantity,
       });

       return addItem(input, options);
     };

     return {
       addItem: addItemWithTracking,
       ...rest,
     };
   }
   ```

4. **Улучшение UX**
   - Добавить лоадеры
   - Добавить тосты для успешных операций
   - Анимации для обновлений корзины

**Результат**: Оптимизированная и отполированная реализация

---

## Миграция существующего кода

### Mapping старого API на новый

| Старый API | Новый API (SDK) | Примечания |
|------------|-----------------|------------|
| `useCartContext()` | `useCartContext()` | Совместимый, но с новыми типами |
| `useCart()` | `useCart()` | Возвращает `{ cart, loading, loaded, error }` |
| `useAddToCart()` | `useAddItemToCart()` | Новое название, схожий API |
| `useRemoveFromCart()` | `useRemoveItemFromCart()` | Новое название |
| `useUpdateQuantity()` | `useUpdateCartLineQuantity()` | Более явное название |
| `useClearCart()` | `useClearCart()` | Совместимый |
| `cartKey` (fragment) | `cart` (модель) | SDK использует маппинг |

### Контрольный список миграции

**Для каждого компонента:**

- [ ] Обновить импорты хуков
- [ ] Обновить типы props
- [ ] Обновить обращения к данным корзины
- [ ] Обновить обработчики мутаций
- [ ] Обновить тесты
- [ ] Проверить работу в dev режиме
- [ ] Проверить SSR/SSG сценарии

**Для всего приложения:**

- [ ] Обновить Root Layout
- [ ] Обновить конфигурацию
- [ ] Создать barrel exports
- [ ] Обновить документацию
- [ ] Провести E2E тестирование
- [ ] Провести performance audit

---

## Тестирование

### Unit тесты

**Что тестировать:**
- Хуки корзины в изоляции
- Zustand store
- Маппинг данных
- Утилиты (cartId, cartMath)

**Инструменты:**
- Vitest
- @testing-library/react
- @testing-library/react-hooks

### Integration тесты

**Что тестировать:**
- Полный flow добавления в корзину
- Обновление количества
- Удаление товаров
- Очистка корзины
- Работа с cookies
- SSR загрузка

### E2E тесты

**Что тестировать:**
- Добавление товара в корзину со страницы продукта
- Переход в корзину
- Изменение количества
- Переход к оформлению заказа
- Сохранение корзины между сессиями

**Инструменты:**
- Playwright / Cypress

### Performance тесты

**Метрики:**
- Время первой загрузки корзины
- Время выполнения мутаций
- Размер bundle
- Количество re-renders

---

## Потенциальные проблемы

### 1. Несовместимость типов GraphQL

**Проблема**: Фрагменты в SDK могут отличаться от текущих

**Решение**:
- Использовать маппинг для преобразования данных
- Обновить фрагменты в SDK под нужды приложения
- Использовать адаптеры

### 2. Конфликты с существующими cookies

**Проблема**: Старая и новая реализация могут использовать разные форматы

**Решение**:
- Использовать миграционный скрипт
- Очистить cookies при деплое
- Добавить версионирование в cookie

### 3. Relay cache invalidation

**Проблема**: После мутаций может не обновляться UI

**Решение**:
- Правильно настроить Relay updater functions
- Использовать `store.invalidateStore()` после мутаций
- Добавить manual refetch при необходимости

### 4. SSR hydration mismatch

**Проблема**: Расхождение между серверным и клиентским рендерингом

**Решение**:
- Передавать `initialCartData` корректно
- Использовать `suppressHydrationWarning` где нужно
- Синхронизировать состояние до гидрации

### 5. Bundle size увеличение

**Проблема**: SDK может увеличить размер бандла

**Решение**:
- Использовать tree-shaking
- Импортировать только нужные части SDK
- Провести bundle analysis
- Lazy loading для cart модалов/drawer

---

## Финальный чеклист перед продакшеном

- [ ] Все тесты проходят (unit, integration, e2e)
- [ ] Performance не ухудшилась
- [ ] Bundle size в пределах допустимого
- [ ] SSR работает корректно
- [ ] Cookies работают правильно
- [ ] Все компоненты мигрированы
- [ ] Старый код удален или помечен как deprecated
- [ ] Документация обновлена
- [ ] Аналитика настроена
- [ ] Error tracking настроен
- [ ] Проведен code review
- [ ] Получено одобрение stakeholders

---

## Rollback план

В случае критических проблем:

1. **Быстрый откат**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Восстановление старой реализации**
   - Переименовать `*.old.tsx` обратно
   - Вернуть старые импорты
   - Откатить Root Layout

3. **Постепенный откат**
   - Использовать feature flag для переключения между реализациями
   - Откатить по компонентам, а не всё сразу

---

## Заключение

Интеграция модуля Cart SDK в корневое приложение - это комплексная задача, требующая:
- Тщательного планирования
- Поэтапного подхода
- Полного тестового покрытия
- Мониторинга производительности

При правильном выполнении план приведет к:
- Более чистому и maintainable коду
- Лучшей производительности
- Улучшенному DX (Developer Experience)
- Единообразному API для работы с корзиной
- Упрощению дальнейшей разработки

**Рекомендуемый timeline**: 2-3 недели с учетом тестирования и code review.

**Следующие шаги**:
1. Создать feature branch
2. Начать с Этапа 1 (Подготовка)
3. Проводить ежедневные standup для отслеживания прогресса
4. Делать промежуточные code reviews после каждого этапа
