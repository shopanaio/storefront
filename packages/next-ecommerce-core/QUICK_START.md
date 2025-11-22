# Quick Start - Local Development

## 🚀 Быстрый старт

### Вариант 1: Простейший (рекомендуется)

```bash
# Из корня проекта
yarn dev
```

Всё! Next.js автоматически компилирует изменения в пакете.

### Вариант 2: С TypeScript watch

```bash
# Терминал 1
cd packages/next-ecommerce-core
yarn dev

# Терминал 2 (новый терминал)
cd ../..
yarn dev
```

## 📁 Что где редактировать

### Секции
`packages/next-ecommerce-core/src/sections/`

```tsx
'use client';
import type { SectionProps } from '../../core/types';

export default function MySection({ settings }: SectionProps<{ title: string }>) {
  return <section>{settings.title}</section>;
}
```

### Шаблоны
`packages/next-ecommerce-core/src/templates/`

```ts
import dynamic from 'next/dynamic';
const Hero = dynamic(() => import('../sections/Hero'));

export const homeTemplate = {
  name: 'home',
  sections: [{ id: 'hero', component: Hero, settings: { title: 'Hi' } }]
};
```

### Типы
`packages/next-ecommerce-core/src/core/types.ts`

### Entity
`packages/next-ecommerce-core/src/core/entities.ts`

### SDK Hooks
`packages/next-ecommerce-core/src/sdk/client/hooks.ts`

## 🔧 Команды

```bash
# Разработка (hot reload)
yarn dev

# Сборка пакета
yarn build

# Watch mode (TypeScript + декларации)
yarn dev

# Очистка
yarn clean
```

## 📦 Импорты

```tsx
// Core
import { PageBuilder, usePageData } from '@shopana/next-ecommerce-core/core';

// Shop
import { ShopProvider, useShop } from '@shopana/next-ecommerce-core/shop';

// SDK
import { useProduct, useCollection } from '@shopana/next-ecommerce-core/sdk';

// All in one
import { PageBuilder, ShopProvider, useProduct } from '@shopana/next-ecommerce-core';
```

## ✅ Проверка

Измени файл `src/sections/Hero/index.tsx`:
```tsx
<h1>TEST CHANGE</h1>
```

Сохрани → браузер обновится автоматически ✨

## 🐛 Если что-то сломалось

```bash
# 1. Очисти кеш
rm -rf .next
rm -rf packages/next-ecommerce-core/dist

# 2. Пересобери пакет
cd packages/next-ecommerce-core
yarn build

# 3. Перезапусти dev сервер
cd ../..
yarn dev
```

---

**Готово! Редактируй файлы в `src/` и видишь изменения мгновенно 🎉**
