# Выделение storefront в пакет `theme-bite-crunch`

## Цель

Превратить корневой `@shopana/storefront` в тонкий Next.js-каркас, который выбирает и подключает тему и бренд. Весь код конкретной витрины Bite & Crunch переносится в локальный workspace-пакет `packages/theme-bite-crunch` (`@shopana/theme-bite-crunch`).

Тема владеет не только визуальными компонентами, но и всей storefront-specific реализацией: templates, layouts, UI, locales, API, Apollo documents, hooks, stores, utils, wishlist и box-builder. `brand-bite-crunch` остаётся отдельным пакетом цветов, логотипов и brand config. Checkout остаётся независимым корневым module и не зависит от темы.

После миграции корневой репозиторий содержит каркас приложения, SDK, brand-пакеты и checkout, но не содержит реализацию стандартной витрины.

## Целевая ответственность пакетов

### Корневой `@shopana/storefront`

В корне остаются:

- Next.js `src/app` entrypoints;
- выбор `THEME` и `BRAND`;
- platform bootstrap и environment config;
- подключение storefront SDK, выбранной темы и выбранного бренда;
- независимый `src/modules/checkout`;
- workspace, сборочная и Apollo-инфраструктура, необходимая для запуска пакетов.

Корневой app не содержит templates, storefront layouts, UI kit, storefront locales, page hooks, storefront API/Apollo-код, wishlist или box-builder.

### `@shopana/theme-bite-crunch`

Тема владеет:

- стандартными страницами витрины и их конфигурациями;
- layouts, sections, blocks, snippets и assets;
- storefront locales и visual/runtime providers;
- storefront-specific API clients и operations;
- Apollo queries, fragments, mutations, codegen config и generated operations темы;
- page/data hooks, stores, mappers, utils и storefront config;
- wishlist как theme extension;
- box-builder как theme extension и Git submodule.

Все зависимости между этими частями после переноса являются внутренними зависимостями темы. Код внутри `packages/theme-bite-crunch` не импортирует `@src/**` из корневого приложения.

### `@shopana/storefront-sdk`

SDK остаётся независимым от конкретной темы и содержит только общие контракты и runtime:

- `ThemeRegistry` и module registry;
- `Builder`, базовые types и contexts;
- общий routing и интеграцию с Next.js;
- универсальные GraphQL/Apollo transport primitives, если они не содержат Bite & Crunch-specific operations;
- общие model contracts и platform providers.

SDK не импортирует `@src/templates`, `@src/layouts`, `@shopana/theme` или конкретный theme package. Storefront-specific queries, loaders, fragments и hooks в SDK не остаются: они переносятся в тему.

### Brand packages

`brand-bite-crunch` и остальные brand packages содержат только:

- логотипы и brand assets;
- цвета и brand tokens;
- `BrandConfig`.

Brand package не содержит страниц, layouts, UI kit, hooks или API.

### Checkout

Checkout остаётся в `src/modules/checkout` и владеет собственными UI и прикладными зависимостями. Он может зависеть от storefront SDK, brand SDK, Ant Design и собственных vendors, но не импортирует `@shopana/theme` и внутренности theme package.

## Структура `theme-bite-crunch`

```text
packages/theme-bite-crunch/
├── package.json
├── codegen.ts
└── src/
    ├── api/
    ├── assets/
    ├── blocks/
    ├── config/
    ├── hooks/
    ├── layout/
    ├── locales/
    ├── graphql/
    │   ├── queries/
    │   ├── fragments/
    │   ├── mutations/
    │   └── __generated__/
    ├── sections/
    ├── snippets/
    ├── store/
    ├── templates/
    ├── utils/
    ├── registry.ts
    └── extensions/
        ├── wishlist/
        └── box-builder/   # Git submodule
```

Структуру можно расширять внутренними каталогами темы, если код остаётся storefront-specific и не создаёт обратной зависимости на root app.

## Выбор и подключение темы

- Добавить `THEME=bite-crunch` независимо от существующего `BRAND`.
- Значение по умолчанию: `bite-crunch`.
- `@shopana/theme` и `@shopana/theme/*` разрешаются в `packages/theme-${THEME}/src` для TypeScript, Webpack и Turbopack.
- Выбранный theme package добавляется в `transpilePackages`.
- Для неизвестного `THEME` конфигурация завершается явной ошибкой с именем отсутствующей темы.
- `BRAND` независимо выбирает `@shopana/brand`; изменение бренда не меняет реализацию страниц.

`theme-bite-crunch/package.json` должен определить exports для registry, templates, layout, sections, blocks, snippets, locales и других публичных theme entrypoints. Внутренние файлы темы импортируются относительными путями или через `@shopana/theme/*`, но не через `@src/*`.

## Theme registry и файловые соглашения

Добавить в storefront SDK `ThemeRegistry`, который регистрирует и разрешает:

- templates;
- layouts;
- sections;
- blocks.

Тема экспортирует готовый registry из `@shopana/theme/registry`. `registry.ts` создаёт отдельный экземпляр `ThemeRegistry`, сканирует относительные каталоги темы compile-time context-ами и загружает extensions. Корневой app явно передаёт этот registry в SDK entrypoints для page, layout и not-found. SDK не ищет файлы темы через filesystem во время runtime и не содержит импорт выбранной темы.

Файловые соглашения:

- `templates/product.ts` регистрируется как template `product`;
- `layout/theme.tsx` регистрируется как layout `theme`;
- `sections/product-main/index.tsx` регистрируется как section `product-main`;
- `blocks/button/index.tsx` регистрируется как block `button`;
- `extensions/**/register.ts` загружается как theme extension registration entrypoint;
- `snippets` и `assets` не регистрируются и импортируются напрямую внутри темы.

Регистрация должна быть детерминированной. При неизвестном `type`, отсутствии обязательного template, конфликте двух файлов с одним именем или повторной регистрации разных ресурсов выбрасывается диагностическая ошибка с видом ресурса и его именем. Повторное выполнение того же registration entrypoint при development/HMR должно быть безопасным.

## Публичные контракты Builder

Изменить SDK contracts:

- `BlockConfig.component` заменить на обязательный строковый `type`;
- `SectionConfig.component` заменить на обязательный строковый `type`;
- template хранит только сериализуемую структуру `type`, `settings`, `blocks` и `order`;
- `Builder` получает `ThemeRegistry` и разрешает section/block components по `type`;
- вложенные blocks разрешаются тем же registry;
- порядок sections и blocks определяется только массивами `order`;
- неизвестные section/block types не пропускаются молча, а завершаются диагностической ошибкой.

Стандартные page data loaders, metadata builders и Apollo operations являются exports темы и связываются с соответствующими templates в theme registry. SDK вызывает зарегистрированный theme contract, но не содержит switch с Bite & Crunch-specific imports или operations.

Обязательные templates для Bite & Crunch:

- `home`;
- `product`;
- `collection`;
- `search`;
- `blog`;
- `article`;
- `page`;
- `cart`;
- `list-collections`;
- `404`.

## Layouts и providers

Разделить platform shell и theme chrome.

Корневой layout продолжает владеть HTML document и общими providers, которые необходимы независимо от выбранной темы и должны быть доступны checkout. Theme layout получает `locale` и `children` и подключает только storefront-specific providers, locales, header/footer, drawers, modals и visual portals стандартной витрины.

Checkout не должен неявно зависеть от наличия theme provider. Всё, что необходимо checkout, должно предоставляться platform shell, brand SDK или самим checkout.

## Перенос storefront-кода в тему

Перенести в `theme-bite-crunch`:

- корневые `src/templates`;
- `src/layouts`;
- `src/ui-kit`;
- `src/i18n` и storefront messages;
- storefront-specific `src/hooks`;
- storefront-specific части `src/store`;
- storefront-specific `src/utils` и config;
- API operations, data loaders и CMS adapters конкретной витрины;
- Apollo queries, fragments, mutations и generated operations стандартных страниц;
- styles, fonts и images.

При переносе разложить UI по роли:

- законченные элементы страницы — `sections`;
- переиспользуемые настраиваемые элементы — `blocks`;
- низкоуровневые UI primitives — `snippets`;
- глобальные styles, images и fonts — `assets`.

Hooks, stores, mappers и Apollo documents размещаются рядом с владеющей ими feature либо в соответствующих общих каталогах темы. Нельзя оставлять в root app прокси-файлы только ради сохранения старых `@src/*` импортов.

После перевода импортов удалить опустевшие root theme-каталоги.

## Wishlist extension

- Перенести wishlist целиком в `packages/theme-bite-crunch/src/extensions/wishlist`.
- Перенести вместе с ним API, Apollo documents, hooks, context, providers, state, sections и page.
- `extensions/wishlist/register.ts` регистрирует `/wishlist` через существующий module registry.
- Wishlist UI использует внутренние sections/blocks/snippets темы.
- Theme header/layout получает wishlist provider и hooks из extension, не из root app.
- В root `src/modules/wishlist` после миграции ничего не остаётся.

## Box-builder extension

- Переместить Git submodule из `src/modules/storefront-box-builder-module` в `packages/theme-bite-crunch/src/extensions/box-builder`.
- Обновить `.gitmodules` и gitlink superproject.
- В отдельном submodule-репозитории обновить импорты на внутренние theme APIs либо `@shopana/theme/*`.
- Перенести необходимые box-builder hooks, state, API, Apollo documents, config и utils в extension или общие каталоги темы.
- Устранить все импорты box-builder из root `@src/**`.
- `extensions/box-builder/register.ts` продолжает регистрировать `/box-builder` через module registry.
- Изменения внутри submodule фиксируются отдельным commit; storefront хранит обновлённый gitlink.

## Изоляция checkout

Создать `src/modules/checkout/ui` и перенести или реализовать внутри checkout всё, что он сейчас получает из storefront UI:

- Badge;
- Money;
- Thumbnail;
- Drawer/DrawerBase;
- FloatingLabelInput;
- StickyButton;
- Confirm и portal host;
- toast;
- responsive helpers;
- ScopedIntlProvider;
- необходимые cart/auth presentation или checkout-owned эквиваленты.

Checkout не импортирует theme templates, drawers или modals. Если checkout требуется cart/auth поведение, оно использует общий SDK/platform contract либо собственную реализацию, но не theme component.

Brand logo checkout получает через `@shopana/brand-sdk` и platform-level `BrandProvider`.

## Последовательность миграции

1. Добавить package skeleton `theme-bite-crunch`, `THEME`, aliases, exports и `transpilePackages`.
2. Добавить `ThemeRegistry` и новые Builder contracts в storefront SDK.
3. Получить новую собранную версию SDK, необходимую root app для использования изменённых exports и types.
4. Подключить `@shopana/theme/registry` к SDK page, layout и not-found entrypoints.
5. Разделить platform shell и theme layout/providers.
6. Перенести storefront API, Apollo operations/generated types, hooks, stores, utils и config в тему.
7. Перенести UI kit, templates, layouts, locales и assets; заменить components в template configs строковыми `type`.
8. Перенести wishlist extension.
9. Перенести и обновить box-builder submodule.
10. Изолировать checkout от старого UI и theme imports.
11. Удалить старые root theme-каталоги и неиспользуемые SDK storefront implementations.
12. Провести статическую и маршрутную проверку критериев приёмки.

## Критерии приёмки

- Root `src` содержит только app/platform skeleton и `modules/checkout`; в нём отсутствует реализация стандартной витрины.
- `packages/theme-bite-crunch` не содержит импортов `@src/**`.
- SDK не импортирует `@src/templates`, `@src/layouts`, `@shopana/theme` или `@shopana/theme-bite-crunch`.
- SDK не содержит Bite & Crunch-specific API operations, Apollo queries/fragments, page loaders или hooks.
- Стандартные templates, layouts, sections и blocks разрешаются только через переданный `ThemeRegistry`.
- Templates содержат строковые `type`; components разрешаются registry с сохранением вложенных blocks и `order`.
- `home`, `product`, `collection`, `search`, `blog`, `article`, `page`, `cart`, `list-collections` и `404` загружаются из выбранной темы.
- `/wishlist` и `/box-builder` регистрируются из `theme-bite-crunch/extensions`.
- Box-builder не импортирует root `@src/**`.
- Checkout не импортирует `@src/ui-kit`, `@src/templates`, `@src/layouts`, `@src/i18n` или `@shopana/theme`.
- Checkout получает обязательные platform/brand contexts без зависимости от theme layout.
- `BRAND` независимо меняет цвета и логотип; `THEME` независимо выбирает templates, layouts и storefront implementation.
- Неизвестный `THEME`, отсутствующий обязательный template, неизвестный section/block `type` и конфликт регистрации дают явные диагностические ошибки.
- После миграции поиск старых theme imports и root theme directories не находит активного кода.

Build, test и tsc для проверки не запускать. Build storefront SDK выполняется только как необходимый шаг получения новой версии кода после изменения его публичных contracts.

## Зафиксированные решения

- Theme — обычный workspace-пакет, не отдельный репозиторий.
- Весь storefront-specific API, Apollo documents, hooks, state и UI принадлежит теме.
- Корневой storefront остаётся тонким Next.js-каркасом.
- Box-builder сохраняется как Git submodule внутри темы.
- Wishlist является theme extension.
- Checkout остаётся самостоятельным root module и владеет своими UI-зависимостями.
- Brand packages не получают страницы, hooks, API или UI kit.
