# Локальная разработка с next-ecommerce-core

## Что настроено

Локальная разработка пакета `@shopana/next-ecommerce-core` настроена с использованием **TypeScript paths hack**, что позволяет:

✅ Редактировать файлы в `packages/next-ecommerce-core/src/` и видеть изменения мгновенно
✅ Не перезапускать dev сервер при изменениях
✅ Получать полную поддержку TypeScript и автокомплит
✅ Не использовать `npm link` или `yarn link`

## Как это работает

### 1. TypeScript Path Mapping

В `tsconfig.json` настроены алиасы, которые перенаправляют импорты на исходники:

```json
{
  "paths": {
    "@shopana/next-ecommerce-core": ["./packages/next-ecommerce-core/src/index.ts"],
    "@shopana/next-ecommerce-core/core": ["./packages/next-ecommerce-core/src/core/index.ts"],
    "@shopana/next-ecommerce-core/shop": ["./packages/next-ecommerce-core/src/shop/index.ts"],
    "@shopana/next-ecommerce-core/sdk": ["./packages/next-ecommerce-core/src/sdk/index.ts"]
  }
}
```

### 2. Next.js Transpilation

В `next.config.js` добавлен `transpilePackages`:

```js
transpilePackages: ['@shopana/next-ecommerce-core']
```

Next.js автоматически компилирует TypeScript файлы из пакета при каждом изменении.

## Варианты запуска

### Вариант 1: Только Next.js (рекомендуется)

Самый простой способ - просто запусти dev сервер:

```bash
yarn dev
```

Next.js будет автоматически компилировать изменения в пакете. Это работает благодаря `transpilePackages`.

### Вариант 2: С TypeScript Watch Mode

Если хочешь также генерировать `.d.ts` файлы и видеть ошибки TypeScript в реальном времени:

```bash
# Терминал 1: Watch mode для пакета
cd packages/next-ecommerce-core
yarn dev

# Терминал 2: Next.js dev server
yarn dev
```

### Вариант 3: Через Yarn Workspaces

```bash
yarn workspace @shopana/next-ecommerce-core dev & yarn dev
```

## Примеры импортов

После настройки можешь использовать пакет так:

```tsx
// В любом файле проекта
import { PageBuilder } from '@shopana/next-ecommerce-core/core';
import { useShop } from '@shopana/next-ecommerce-core/shop';
import { useProduct } from '@shopana/next-ecommerce-core/sdk';

// Или напрямую из исходников (для дебага)
import { PageBuilder } from '@shopana/next-ecommerce-core/core/PageBuilder';
```

## Проверка что все работает

### 1. Проверь TypeScript paths

Создай тестовый файл:

```tsx
// src/test-import.tsx
import { PageBuilder } from '@shopana/next-ecommerce-core/core';
import { useShop } from '@shopana/next-ecommerce-core/shop';

// Должен быть автокомплит и никаких ошибок TypeScript
```

### 2. Проверь hot reload

1. Запусти `yarn dev`
2. Открой `packages/next-ecommerce-core/src/sections/Hero/index.tsx`
3. Измени текст или стили
4. Сохрани файл
5. Браузер должен автоматически обновиться

## Структура пакета

```
packages/next-ecommerce-core/
├── src/                           # Исходники (редактируй здесь!)
│   ├── app/                       # Next.js страницы
│   │   └── [[...slug]]/page.tsx
│   ├── core/                      # Ядро фреймворка
│   │   ├── PageBuilder.tsx
│   │   ├── types.ts
│   │   └── ...
│   ├── shop/                      # Контекст магазина
│   │   ├── ShopContext.tsx
│   │   ├── useShop.ts
│   │   └── ...
│   ├── sdk/                       # SDK и хуки
│   │   ├── client/
│   │   │   └── hooks.ts           # useProduct, useCollection
│   │   └── server/
│   │       └── product.ts
│   ├── sections/                  # Готовые секции
│   │   ├── Hero/
│   │   ├── ProductHero/
│   │   └── ...
│   └── templates/                 # Шаблоны страниц
│       ├── home.ts
│       ├── product.ts
│       └── ...
├── dist/                          # Скомпилированные файлы (создаётся при build)
└── package.json
```

## Рабочий процесс

### Разработка новой секции

1. Создай файл `packages/next-ecommerce-core/src/sections/MySection/index.tsx`
2. Используй типы из `@shopana/next-ecommerce-core/core`:

```tsx
'use client';

import type { SectionProps } from '@shopana/next-ecommerce-core/core';
import { useShop } from '@shopana/next-ecommerce-core/shop';

interface MySectionSettings {
  title: string;
  subtitle?: string;
}

export default function MySection({ settings }: SectionProps<MySectionSettings>) {
  const shop = useShop();

  return (
    <section>
      <h2>{settings.title}</h2>
      <p>{shop.name}</p>
    </section>
  );
}
```

3. Используй в шаблоне:

```ts
// packages/next-ecommerce-core/src/templates/home.ts
import dynamic from 'next/dynamic';

const MySection = dynamic(() => import('../sections/MySection'));

export const homeTemplate = {
  name: 'home',
  sections: [
    {
      id: 'my-section',
      component: MySection,
      settings: {
        title: 'Welcome!'
      }
    }
  ]
};
```

4. Изменения применятся автоматически!

### Изменение типов

Редактируй файлы в `packages/next-ecommerce-core/src/core/`:
- `types.ts` - основные типы
- `entities.ts` - entity-интерфейсы

TypeScript автоматически подхватит изменения во всём проекте.

### Изменение логики SDK

Редактируй:
- `packages/next-ecommerce-core/src/sdk/client/hooks.ts` - клиентские хуки
- `packages/next-ecommerce-core/src/sdk/server/*.ts` - серверные методы

## Сборка для продакшена

Перед коммитом или деплоем:

```bash
cd packages/next-ecommerce-core
yarn build
```

Это создаст:
- Скомпилированный JS в `dist/`
- TypeScript декларации (`.d.ts`)
- Source maps

## Troubleshooting

### Изменения не применяются

1. **Перезапусти dev сервер**: `Ctrl+C` → `yarn dev`
2. **Очисти кеш Next.js**: `rm -rf .next`
3. **Убедись что `transpilePackages` настроен** в `next.config.js`

### TypeScript не видит типы

1. **Пересобери пакет**: `cd packages/next-ecommerce-core && yarn build`
2. **Перезапусти TypeScript сервер** в VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
3. **Проверь paths** в `tsconfig.json`

### Import errors

Используй правильные пути импорта:
- ✅ `@shopana/next-ecommerce-core/core`
- ✅ `@shopana/next-ecommerce-core/shop`
- ❌ `@shopana/next-ecommerce-core/dist/core`

## Полезные команды

```bash
# Разработка с hot reload
yarn dev

# Разработка пакета с TypeScript watch
cd packages/next-ecommerce-core && yarn dev

# Сборка пакета
cd packages/next-ecommerce-core && yarn build

# Очистка пакета
cd packages/next-ecommerce-core && yarn clean

# Проверка TypeScript
yarn tsc --noEmit
```

## Готово! 🎉

Теперь ты можешь редактировать файлы в `packages/next-ecommerce-core/src/` и видеть изменения мгновенно без перезапуска сервера.

Подробнее см. `packages/next-ecommerce-core/DEVELOPMENT.md`
