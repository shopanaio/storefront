# План переноса storefront app в theme packages

## Цель

Перестроить monorepo так, чтобы:

- `@shopana/storefront` оставался framework/runtime-пакетом;
- `@shopana/storefront-sdk` оставался общим storefront SDK;
- `@shopana/brand-bite-crunch` стал полноценным пакетом темы и владел всем текущим приложением;
- checkout стал независимым подключаемым пакетом `@shopana/checkout`;
- box-builder стал обычным модулем внутри Bite & Crunch, а не отдельным git submodule;
- корень репозитория перестал быть приложением и остался только workspace-оркестратором;
- `brand-default`, `brand-xyz`/`brand-piknik` и пустой `brand-theme` были удалены.

На первом этапе имя `@shopana/brand-bite-crunch` сохраняется. Переименование
`brand-*` в `theme-*` не смешивается с механическим переносом.

## Целевая структура

```text
storefront/
├── package.json                    # private workspace, без app dependencies
├── Dockerfile                      # собирает выбранный theme workspace
├── mockServer/                     # общая dev-инфраструктура
├── packages/
│   ├── shopana-storefront-runtime/ # @shopana/storefront
│   ├── shopana-storefront-sdk/     # @shopana/storefront-sdk
│   ├── checkout/                   # @shopana/checkout
│   ├── brand-sdk/                  # общий контракт темы
│   ├── brand-bite-crunch/          # полное storefront-приложение темы
│   │   ├── package.json
│   │   ├── next.config.js          # theme override для runtime
│   │   ├── public/
│   │   ├── codegen/
│   │   ├── scripts/
│   │   ├── storybook/
│   │   └── src/
│   │       ├── assets/
│   │       ├── components/         # существующие brand components
│   │       ├── config/
│   │       ├── hooks/
│   │       ├── i18n/
│   │       ├── layouts/
│   │       ├── modules/
│   │       │   ├── box-builder/
│   │       │   ├── checkout/       # только theme adapter/register
│   │       │   └── wishlist/
│   │       ├── runtime/
│   │       ├── store/
│   │       ├── templates/
│   │       ├── ui-kit/
│   │       └── utils/
│   └── storefront-contracts/
└── docs/
```

`.runtime` создаётся внутри `packages/brand-bite-crunch`, а не в корне
monorepo.

## Границы пакетов

| Пакет                        | Ответственность                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `@shopana/storefront`        | Next.js, генератор `.runtime`, CLI `init/dev/build/start`, Next facades                      |
| `@shopana/storefront-sdk`    | framework-agnostic storefront data/runtime API и registry                                    |
| `@shopana/checkout`          | checkout state, API, UI flow, vendors, регистрация checkout page                             |
| `@shopana/brand-bite-crunch` | тема, layouts, templates, UI kit, i18n, app config, wishlist, box-builder и composition root |
| корневой workspace           | установка, общие команды, Docker/CI и локальная dev-инфраструктура                           |

`@shopana/brand-sdk` пока сохраняется как общий контракт темы. Его удаление или
слияние с другим contracts-пакетом является отдельной задачей.

## Карта механического переноса

| Сейчас                                         | После переноса                                          | Действие                                                              |
| ---------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| `src/modules/checkout/**`                      | `packages/checkout/src/**`                              | сначала копирование, затем переключение импортов и удаление оригинала |
| `src/modules/storefront-box-builder-module/**` | `packages/brand-bite-crunch/src/modules/box-builder/**` | превратить gitlink в обычные файлы внутри theme repo                  |
| `src/modules/wishlist/**`                      | `packages/brand-bite-crunch/src/modules/wishlist/**`    | перенос без изменения поведения                                       |
| остальной `src/**`                             | `packages/brand-bite-crunch/src/**`                     | merge с существующими `assets`, `components`, `config.ts`, `index.ts` |
| `public/**`                                    | `packages/brand-bite-crunch/public/**`                  | перенос theme assets                                                  |
| `codegen/apollo/**`                            | `packages/brand-bite-crunch/codegen/**`                 | оставить только операции темы                                         |
| checkout GraphQL documents/generated files     | `packages/checkout/src/graphql/**`                      | checkout получает собственный output codegen                          |
| `bin/widgets/**`                               | `packages/brand-bite-crunch/scripts/widgets/**`         | перенести theme-specific scripts                                      |
| `bin/webpack/**`                               | `packages/brand-bite-crunch/scripts/webpack/**`         | использовать из theme `next.config.js`                                |
| `storybook/**`                                 | `packages/brand-bite-crunch/storybook/**`               | Storybook становится частью темы                                      |
| root app scripts                               | scripts Bite & Crunch                                   | root scripts становятся только делегатами workspace                   |

Пустой `src/app` не переносится. Неиспользуемый `overrides/` удаляется после
проверки, что в нём нет локальных файлов окружения.

## Карта изменения импортов

### Импорты темы

Большинство `@src/*` можно сохранить: после переноса `@src` должен указывать на
`packages/brand-bite-crunch/src` относительно theme-owned `.runtime`.

| Старый импорт             | Новый импорт                                              |
| ------------------------- | --------------------------------------------------------- |
| `@shopana/brand`          | `@shopana/brand-bite-crunch` либо локальный `@src/config` |
| `@src/modules/checkout`   | `@shopana/checkout`                                       |
| `@src/modules/checkout/*` | публичный export `@shopana/checkout/*`                    |
| `@checkout/*`             | публичный export `@shopana/checkout/*`                    |
| box-builder → checkout    | `@shopana/checkout`                                       |
| `next/*` в theme source   | `@shopana/storefront/next/*`                              |

Внутренние импорты box-builder на `@src/ui-kit`, `@src/store`, templates и
hooks остаются допустимыми, потому что box-builder становится частью той же
темы. Путь самого модуля приводится к `@src/modules/box-builder/*`.

### Импорты внутри checkout

В опубликованном checkout не должно остаться ни одного импорта `@src/*`,
`@checkout/*`, `../../../../codegen/*` или Bite & Crunch package.

Для внутренних импортов использовать package-local alias `#checkout/*`,
описанный одновременно в `package.json#imports` и `tsconfig.json`, либо
относительные пути. Наружу экспортировать только стабильные entrypoints:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./register": "./src/register.ts",
    "./types": "./src/types.ts",
    "./package.json": "./package.json"
  }
}
```

Не открывать через `exports` каждый внутренний component/state файл только для
того, чтобы избежать исправления импортов.

## Разрыв зависимостей checkout от темы

Текущий checkout напрямую зависит от root UI и theme behavior. До удаления
корневого app каждый такой импорт должен быть классифицирован.

### Перенести внутрь checkout или SDK

- `ScopedIntlProvider`;
- `composeProductTitle`;
- generic toast/confirm plumbing;
- checkout-specific `Money`, `Thumbnail`, form fields и modal primitives;
- `useIsMobile`, если он не содержит theme behavior;
- GraphQL generated operations checkout;
- checkout breakpoints/tokens с собственными defaults.

Если utility уже нужен нескольким пакетам и не содержит UI темы, переносить его
в `@shopana/storefront-sdk`, а не копировать между theme и checkout.

### Передавать через theme adapter

Theme-specific поведение оформить одним явным `CheckoutThemeAdapter`:

- logo/branding;
- открытие auth modal;
- переходы после checkout;
- cart drawer slot;
- theme tokens или component overrides;
- необязательные тексты/иконки, которые не являются частью checkout domain.

Предпочтительный composition entrypoint:

```ts
import { registerCheckoutModule } from '@shopana/checkout/register';
import { checkoutThemeAdapter } from '@src/integrations/checkout';

registerCheckoutModule({ theme: checkoutThemeAdapter });
```

Файл `src/modules/checkout/register.ts` внутри Bite & Crunch остаётся тонким
composition adapter, чтобы существующий runtime `require.context` продолжил
обнаруживать модуль без специального знания о checkout.

## Порядок реализации

### 0. Подготовить git boundaries

1. Зафиксировать SHA трёх текущих submodules.
2. Сохранить незакоммиченные изменения box-builder до изменения `.gitmodules`.
3. Убедиться, что Bite & Crunch submodule доступен для записи как отдельный repo.
4. Не удалять gitlink box-builder, пока его файлы не появились внутри Bite & Crunch.

### 1. Создать `@shopana/checkout`

1. Создать `packages/checkout/package.json`, `tsconfig.json`, README и exports.
2. Скопировать `src/modules/checkout` в `packages/checkout/src`, пока оставив
   старую директорию рабочей.
3. Перенести checkout GraphQL documents и настроить локальный generated output.
4. Распределить React/ReactDOM, Next facade, storefront SDK и next-intl в peers;
   checkout-specific библиотеки — в dependencies.
5. Переписать checkout-internal imports на `#checkout/*`/relative imports.
6. Удалить все зависимости checkout на root `@src` через перенос generic code
   или `CheckoutThemeAdapter`.
7. Экспортировать `Checkout`, `CheckoutSkeleton`, types и registration API.

### 2. Переключить текущий app на package checkout

1. Заменить imports из `@src/modules/checkout` и `@checkout` на
   `@shopana/checkout`.
2. Временно оставить `src/modules/checkout/register.ts` как adapter.
3. Переключить box-builder activity `Checkout` на `@shopana/checkout`.
4. Убедиться статическим поиском, что вне старой checkout-директории нет старых
   import prefixes.
5. Только после переключения удалить старое содержимое checkout, сохранив
   theme registration adapter.

Checkout переносится первым, потому что box-builder зависит от него.

### 3. Подготовить runtime к app внутри workspace package

1. Разделить понятия `themeRoot` и `workspaceRoot` в генераторе.
2. CLI, запущенный через `yarn workspace @shopana/brand-bite-crunch ...`, должен
   создавать `.runtime` рядом с `package.json` темы.
3. Убрать из runtime templates физические предположения вида
   `./packages/brand-bite-crunch` и dynamic `BRAND` selection.
4. Оставить в generic runtime tsconfig только theme-local `@src`, `@codegen`,
   `.runtime/.next/types` и package resolution через workspace/node_modules.
5. Перенести brand-specific aliases, images, env и transpile list в
   `packages/brand-bite-crunch/next.config.js` как root override темы.
6. В `transpilePackages` темы явно добавить `@shopana/brand-bite-crunch`,
   `@shopana/checkout`, `@shopana/storefront` и `@shopana/storefront-sdk`.
7. `outputFileTracingRoot` и `turbopack.root` должны указывать на workspace root,
   а Next app directory — на theme `.runtime`.

### 4. Расширить Bite & Crunch до полного theme package

1. Обновить manifest текущего `@shopana/brand-bite-crunch`.
2. Добавить dependencies приложения и `@shopana/checkout` в theme package.
3. Перенести root `src` с merge, не заменяя существующие brand assets/config.
4. Перенести `public`, codegen, widget scripts и Storybook config.
5. Добавить theme scripts: `runtime:init`, `dev`, `build`, `start`, `codegen`,
   `widgets:build`, `storybook`.
6. Перенести env/config loading, сохранив относительное разрешение от theme root.
7. Заменить `@shopana/brand` imports на self-package/local theme imports.
8. Проверить, что внутри темы нет ссылок на бывший root `../../src`.

### 5. Поглотить box-builder

1. Скопировать содержимое box-builder submodule в
   `packages/brand-bite-crunch/src/modules/box-builder` как обычные файлы.
2. Перенести его текущий незакоммиченный импорт Next facade.
3. Заменить `@src/modules/storefront-box-builder-module/*` на
   `@src/modules/box-builder/*`.
4. Заменить checkout import на `@shopana/checkout`.
5. Обновить `register.ts`, dynamic loader paths, widget scripts и public assets.
6. Удалить box-builder entry из root `.gitmodules` и только затем удалить gitlink.
7. Историю отдельного box-builder repo не смешивать с механическим переносом;
   если история нужна, выполнять отдельный subtree migration.

### 6. Удалить остальные brands

1. Удалить `packages/brand-default`.
2. Удалить git submodule `packages/brand-xyz` и его запись `.gitmodules`.
3. Удалить пустой `packages/brand-theme`.
4. Удалить `BRAND`, `brandPackage`, `brandPathAbsolute` и fallback branches.
5. Удалить документацию, Docker args, aliases и scripts для удалённых brands.
6. Оставить в `.gitmodules` только Bite & Crunch, если тема продолжает жить в
   отдельном repo.

### 7. Удалить root app

1. Переименовать root package в нейтральный private workspace, например
   `@shopana/storefront-workspace`.
2. Перенести runtime dependencies из root manifest в Bite & Crunch или checkout.
3. Оставить в root только workspace/dev orchestration dependencies.
4. Заменить root scripts на делегаты:

   ```json
   {
     "dev": "yarn workspace @shopana/brand-bite-crunch dev",
     "build": "yarn workspace @shopana/brand-bite-crunch build",
     "start": "yarn workspace @shopana/brand-bite-crunch start"
   }
   ```

5. Удалить root `src`, `public`, app codegen output, Storybook app config и
   theme-specific scripts после сравнения с destination.
6. Обновить ESLint globs с `src/**/*` на
   `packages/brand-bite-crunch/src/**/*` и `packages/checkout/src/**/*`.

### 8. Обновить Docker, CI и документацию

1. Builder запускает theme workspace build, а не root app build.
2. Runner использует `packages/brand-bite-crunch/.runtime` и theme `public`.
3. `WORKDIR`/CLI start должны запускаться с theme root.
4. Docker больше не принимает `BRAND`; выбор темы делается build target или
   workspace name.
5. CI cache keys включают manifests runtime, SDK, checkout и выбранной темы.
6. README описывает создание новой темы копированием полного package contract,
   а не добавлением logo/config-only brand.

## Распределение dependencies

При переносе не копировать весь root manifest в тему вслепую.

- React и ReactDOM остаются peer dependencies публичных packages и direct
  dependencies runnable theme package.
- Next остаётся только dependency `@shopana/storefront`.
- Apollo/storefront SDK peers checkout добавляются в theme dependencies.
- Ant Design, forms, validation, Nova Poshta и checkout-only библиотеки
  переносятся в `@shopana/checkout`.
- animation, layout, product-card и template-only библиотеки переносятся в
  Bite & Crunch.
- Storybook, codegen, ESLint и TypeScript остаются dev dependencies владельца
  соответствующей команды либо root workspace.

После распределения построить таблицу `dependency → importing package` через
статический поиск и удалить root dependency только когда её больше не импортирует
ни один root-owned файл.

## Проверка каждого этапа

Согласно правилам проекта не использовать `build`, `test` или `tsc` как
проверку миграции.

Разрешённая проверка:

1. Запустить `storefront-runtime init` из директории Bite & Crunch во временный
   `.runtime`.
2. Проверить `node --check` для JS config/CLI/scripts.
3. Проверить JSON manifests через `node`.
4. Проверить `require.resolve`/package exports для `@shopana/storefront`,
   `@shopana/storefront-sdk`, `@shopana/checkout` и Bite & Crunch.
5. Статическим поиском подтвердить отсутствие:
   - root `src` после cutover;
   - `@shopana/brand`;
   - `@src/modules/checkout` и `@checkout`;
   - `@src/*` внутри `packages/checkout`;
   - прямых `next`/`next/*` imports в theme source;
   - `brand-default`, `brand-xyz`, `brand-piknik` и `BRAND` branches.
6. Убедиться, что generated routes импортируют theme `@src` и находят оба
   register adapters: checkout и box-builder.
7. Проверить, что `.runtime/.next` и неизвестные generated files переживают
   повторный `init`.
8. Проверить `git diff --check`, состояние root repo и состояние оставшегося
   Bite & Crunch submodule отдельно.

Functional build выполняется только отдельным запросом, когда понадобится новая
версия кода.

## Рекомендуемая разбивка изменений

1. **Checkout package:** новый пакет, локальные imports, adapter API.
2. **Checkout cutover:** root и box-builder используют `@shopana/checkout`.
3. **Runtime package-root support:** `.runtime` генерируется внутри theme package.
4. **Bite & Crunch app move:** root app переносится в theme package.
5. **Box-builder absorption:** удаляется вложенный submodule.
6. **Brand cleanup:** удаляются default/xyz и dynamic brand selection.
7. **Root cleanup:** workspace-only manifest, Docker/CI/docs.

Каждый шаг должен оставлять один источник истины. Не поддерживать длительно две
копии checkout или root/theme app параллельно.

## Критерии завершения

- В корне нет runnable storefront app, `src` и `public`.
- `yarn workspace @shopana/brand-bite-crunch runtime:init` создаёт автономный
  theme `.runtime`.
- Bite & Crunch содержит layouts, templates, UI kit, i18n, wishlist и box-builder.
- Box-builder больше не является git submodule.
- Checkout устанавливается как `@shopana/checkout` и подключается тонким theme adapter.
- Checkout не импортирует Bite & Crunch или root aliases.
- Удалены default и xyz/piknik brands и все runtime branches их выбора.
- Корневой manifest не содержит React, Next, Ant Design или app-only dependencies.
- Docker/CI запускают конкретный theme workspace.
- Старые import prefixes отсутствуют по всему репозиторию.
