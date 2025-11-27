# План рефакторинга: modules → widgets

## Цель

1. Переименовать `src/modules/` → `src/widgets/`
2. Перенести registry в SDK
3. Использовать file-based convention вместо явной регистрации
4. Виджет указывает свой route в конфиге
5. В `page.tsx` остаётся только реэкспорт

---

## Архитектура

### Структура виджета

```
src/widgets/
├── checkout/
│   ├── index.ts          ← конфиг виджета с route
│   ├── page.tsx          ← компонент страницы
│   └── vendors/          ← вендоры (опционально)
├── box-builder/
│   ├── index.ts
│   └── page.tsx
└── wishlist/
    ├── index.ts
    └── page.tsx
```

### Конфиг виджета

```typescript
// src/widgets/checkout/index.ts
import type { WidgetConfig } from '@shopana/storefront-sdk/widgets';

export default {
  route: '/checkout',              // или '/checkout/:step?'
  component: () => import('./page'),
} satisfies WidgetConfig;
```

### Автоматический дискаверинг

SDK использует `require.context('@src/widgets', ...)` который резолвится webpack'ом основного проекта благодаря тому, что `@shopana/storefront-sdk/next/page` экспортируется как source `.tsx` файл.

---

## Изменения в SDK

### 1. Создать типы виджетов

**Файл:** `packages/shopana-storefront-sdk/src/widgets/types.ts`

```typescript
export interface WidgetConfig {
  /**
   * Route pattern для матчинга URL.
   * Поддерживает параметры: '/checkout/:step?'
   */
  route: string;

  /**
   * Lazy loader компонента страницы.
   */
  component: () => Promise<{ default: React.ComponentType<WidgetPageProps> }>;
}

export interface WidgetPageProps {
  params: {
    locale: string;
    [key: string]: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}
```

### 2. Создать индекс виджетов

**Файл:** `packages/shopana-storefront-sdk/src/widgets/index.ts`

```typescript
export type { WidgetConfig, WidgetPageProps } from './types';
```

### 3. Обновить exports в package.json

**Файл:** `packages/shopana-storefront-sdk/package.json`

```json
{
  "exports": {
    "./widgets": "./dist/widgets/index.js",
    // ... остальные exports
  }
}
```

### 4. Обновить page.tsx с поддержкой виджетов

**Файл:** `packages/shopana-storefront-sdk/src/next/page.tsx`

```typescript
import type { WidgetConfig } from '../widgets/types';
import { match } from 'path-to-regexp';

// Автоматический дискаверинг виджетов из основного проекта
// Webpack резолвит @src к ./src основного проекта
let widgets: WidgetConfig[] = [];

try {
  const widgetsContext = require.context(
    '@src/widgets',
    true,
    /^\.\/[^/]+\/index\.ts$/
  );
  widgets = widgetsContext.keys().map((key) => widgetsContext(key).default);
} catch {
  // Папка widgets не существует - это нормально
}

/**
 * Находит виджет по pathname.
 */
function findWidget(pathname: string): {
  widget: WidgetConfig;
  params: Record<string, string>;
} | null {
  for (const widget of widgets) {
    const matcher = match(widget.route, { decode: decodeURIComponent });
    const result = matcher(pathname);
    if (result) {
      return {
        widget,
        params: result.params as Record<string, string>,
      };
    }
  }
  return null;
}

export function createSDKPage(options: CreateSDKPageOptions) {
  const { environmentConfig } = options;

  async function Page(props: PageProps) {
    const requestContext = await getRequestContext();
    const pathname = requestContext.pathname;

    // Проверяем виджеты
    const matched = findWidget(pathname);
    if (matched) {
      const { widget, params } = matched;
      const Component = (await widget.component()).default;

      return (
        <Component
          params={{
            locale: requestContext.locale,
            ...params,
          }}
          searchParams={await props.searchParams}
        />
      );
    }

    // Fallback на стандартную SDK логику
    const { pageType, params: routeParams } = parseRoute(pathname);

    // ... существующая логика
  }

  return { Page, generateMetadata };
}
```

### 5. Обновить главный index.ts

**Файл:** `packages/shopana-storefront-sdk/src/index.ts`

```typescript
// Widgets
export type { WidgetConfig, WidgetPageProps } from './widgets';

// ... остальные exports
```

---

## Изменения в сторфронте

### 1. Переименовать папку

```bash
mv src/modules src/widgets
```

### 2. Обновить tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@src/widgets/*": ["./src/widgets/*"],
      // удалить @checkout/* или обновить путь
    }
  }
}
```

### 3. Конвертировать модули в виджеты

**Файл:** `src/widgets/checkout/index.ts`

```typescript
import type { WidgetConfig } from '@shopana/storefront-sdk/widgets';

export default {
  route: '/checkout',
  component: () => import('./page/page'),
} satisfies WidgetConfig;
```

**Файл:** `src/widgets/box-builder/index.ts`

```typescript
import type { WidgetConfig } from '@shopana/storefront-sdk/widgets';

export default {
  route: '/box-builder',
  component: () => import('./page/page'),
} satisfies WidgetConfig;
```

**Файл:** `src/widgets/wishlist/index.ts`

```typescript
import type { WidgetConfig } from '@shopana/storefront-sdk/widgets';

export default {
  route: '/wishlist',
  component: () => import('./page/page'),
} satisfies WidgetConfig;
```

### 4. Упростить page.tsx

**Файл:** `src/app/[locale]/[[...slug]]/page.tsx`

```typescript
import { createSDKPage } from '@shopana/storefront-sdk/next/page';
import { environmentConfig } from '@src/config/environment.config';

const { Page, generateMetadata } = createSDKPage({
  environmentConfig,
});

export default Page;
export { generateMetadata };
```

### 5. Удалить старые файлы

- `src/widgets/registry.ts` (перенесён в SDK)
- `src/widgets/index.ts` (больше не нужен)
- Все `register.ts` файлы в виджетах

---

## Файлы для изменения

| Действие | Путь |
|----------|------|
| Создать | `packages/shopana-storefront-sdk/src/widgets/types.ts` |
| Создать | `packages/shopana-storefront-sdk/src/widgets/index.ts` |
| Изменить | `packages/shopana-storefront-sdk/src/next/page.tsx` |
| Изменить | `packages/shopana-storefront-sdk/src/index.ts` |
| Изменить | `packages/shopana-storefront-sdk/package.json` |
| Переименовать | `src/modules/` → `src/widgets/` |
| Создать | `src/widgets/checkout/index.ts` |
| Создать | `src/widgets/box-builder/index.ts` (переименовать из storefront-box-builder-module) |
| Создать | `src/widgets/wishlist/index.ts` |
| Изменить | `src/app/[locale]/[[...slug]]/page.tsx` |
| Изменить | `tsconfig.json` |
| Удалить | `src/widgets/registry.ts` |
| Удалить | `src/widgets/checkout/register.ts` |
| Удалить | `src/widgets/*/register.ts` |

---

## Порядок выполнения

1. **SDK: Создать типы и экспорты виджетов**
2. **SDK: Обновить page.tsx с автодискаверингом**
3. **SDK: Пересобрать** (`yarn workspace @shopana/storefront-sdk build`)
4. **Storefront: Переименовать modules → widgets**
5. **Storefront: Создать index.ts конфиги для каждого виджета**
6. **Storefront: Удалить register.ts и registry.ts**
7. **Storefront: Упростить page.tsx**
8. **Storefront: Обновить tsconfig.json**
9. **Тестирование**

---

## Примечания

- `path-to-regexp` уже есть в зависимостях SDK
- `require.context` работает потому что SDK экспортирует source файл (`./src/next/page.tsx`)
- Виджеты матчатся в порядке их дискаверинга (алфавитный по имени папки)
- Для более сложных роутов можно использовать паттерны: `/checkout/:step?`, `/product/:handle`
