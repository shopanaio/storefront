# Создание Shopify-подобного пакета `theme-bite-crunch`

## Кратко

Создать локальный workspace-пакет `packages/theme-bite-crunch` (`@shopana/theme-bite-crunch`). Он содержит стандартные страницы витрины, UI kit, wishlist и подключённый box-builder. `brand-bite-crunch` остаётся отдельным пакетом цветов, логотипов и брендовых настроек. Checkout остаётся независимым module со своим UI.

## Структура и регистрация темы

- Создать структуру:
  ```text
  packages/theme-bite-crunch/
  └── src/
      ├── assets/
      ├── blocks/
      ├── config/
      ├── layout/
      ├── locales/
      ├── sections/
      ├── snippets/
      ├── templates/
      └── extensions/
          ├── wishlist/
          └── box-builder/   # Git submodule
  ```
- Добавить `THEME=bite-crunch` и алиас `@shopana/theme` независимо от существующих `BRAND` и `@shopana/brand`.
- Ядро автоматически регистрирует файлы по путям:
  - `templates/product.ts` → template `product`;
  - `layout/theme.tsx` → layout `theme`;
  - `sections/product-main/index.tsx` → section `product-main`;
  - `blocks/button/index.tsx` → block `button`;
  - `extensions/**/register.ts` → дополнительные маршруты/modules.
- `snippets` и `assets` не регистрируются: их напрямую импортируют sections, blocks и theme extensions.
- Template хранит строковые `type`, `settings`, `blocks` и `order`. `Builder` разрешает section/block-компоненты через SDK registry.
- SDK перестаёт импортировать `@src/templates` и `@src/layouts`; page, layout и not-found разрешаются только через theme registry.

## Перенос UI и modules

- Перенести корневые templates, layouts, UI kit, стили, локализацию и page-specific hooks/utils в соответствующие каталоги `theme-bite-crunch`.
- Разложить UI kit по Shopify-роли:
  - законченные элементы страницы → `sections`;
  - переиспользуемые настраиваемые элементы → `blocks`;
  - низкоуровневые UI-примитивы → `snippets`;
  - глобальные стили, изображения и шрифты → `assets`.
- Перенести wishlist целиком в `src/extensions/wishlist`; его `register.ts` продолжает регистрировать `/wishlist` через существующий module registry, а UI импортируется из `@shopana/theme/snippets` и `@shopana/theme/sections`.
- Переместить путь submodule box-builder в `src/extensions/box-builder`, обновить `.gitmodules` и его импорты на `@shopana/theme/*`. Его маршрут продолжает регистрироваться существующим `register.ts`.
- Checkout оставить в `src/modules/checkout`. Создать внутри него `ui/` и перенести туда все необходимые реализации Badge, Money, Thumbnail, Drawer, input, Confirm, toast и responsive helpers. Checkout может зависеть от SDK, brand SDK, Ant Design и собственных vendors, но не от theme.
- Инфраструктурный код, не являющийся UI — GraphQL clients, data loaders, routing и registry — оставить в SDK. Brand logo в checkout получать через `@shopana/brand-sdk`, без зависимости от theme.
- После устранения всех импортов удалить корневые `src/templates`, `src/layouts`, `src/ui-kit`, `src/i18n` и остальные опустевшие theme-каталоги.

## Публичные контракты

- Добавить в storefront SDK `ThemeRegistry` с регистрацией и разрешением templates, layouts, sections и blocks.
- Изменить `PageTemplate`, `SectionConfig` и `BlockConfig`: вместо поля `component` использовать обязательный строковый `type`.
- Добавить регистрацию theme contexts и автоматическую загрузку `extensions/**/register.ts`.
- Layout получает `locale` и `children`, чтобы theme самостоятельно подключала locales, BrandProvider, визуальные providers и глобальные порталы.
- При неизвестном `type`, отсутствующем обязательном template или повторной регистрации возвращать явную диагностическую ошибку с именем ресурса.

## Проверка и критерии приёмки

- В SDK и корневом app отсутствуют прямые импорты старых templates/layouts/UI kit.
- Стандартные страницы разрешаются из `@shopana/theme/templates`.
- Sections и blocks разрешаются по строковому `type`, включая вложенные blocks и сохранение `order`.
- `/wishlist` и `/box-builder` регистрируются из `theme-bite-crunch/extensions`.
- Checkout работает без импортов `@src/ui-kit`, `@src/templates` и `@shopana/theme`.
- `BRAND` независимо меняет цвета/логотип, `THEME` независимо выбирает реализацию страниц.
- После миграции `rg '@src/(ui-kit|templates|layouts|i18n)'` не находит активных импортов вне истории/документации.
- Build, test и tsc для проверки не запускать; build допустим только при необходимости получить новую собранную версию SDK.

## Зафиксированные решения

- Theme — обычный workspace-пакет, не отдельный репозиторий.
- Box-builder сохраняется как Git submodule, но располагается внутри theme.
- Wishlist становится theme extension.
- Checkout остаётся самостоятельным и владеет всеми своими UI-зависимостями.
- `brand-bite-crunch` не получает страницы или UI kit и сохраняет текущую ответственность.
