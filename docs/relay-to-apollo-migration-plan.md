# План миграции Relay → Apollo Client

## 1. Цель миграции

Полностью заменить Relay в storefront и `@shopana/storefront-sdk` на Apollo Client, сохранив текущую модульную структуру и максимально похожие контракты React-хуков.

Главные ограничения:

- миграция выполняется постепенно, по одному домену; Relay и Apollo временно работают параллельно;
- компоненты не содержат GraphQL-текст и не объявляют фрагменты;
- запросы, мутации и фрагменты описываются как обычные Apollo GraphQL documents в отдельных `*.apollo.graphql` файлах;
- типы операций и фрагментов генерируются GraphQL Code Generator, ручные GraphQL-типы не создаются;
- Relay-директивы `@connection`, `@refetchable`, `@argumentDefinitions`, `@arguments` и `@inline` не переносятся в Apollo documents;
- публичные UI-компоненты, domain providers и Zustand stores по возможности сохраняют существующие props и возвращаемые значения;
- после миграции последнего домена Relay compiler, provider, runtime и generated artifacts удаляются.

Стандартное имя нового пагинационного хука — `usePaginationQuery`. Вариант `usePaginatioQeury` из постановки считаем опечаткой и не закрепляем в API.

## 2. Исходное состояние проекта

На момент составления плана в проекте уже присутствует часть Apollo-инфраструктуры:

- `@apollo/client` 4 и `@apollo/client-integration-nextjs` установлены;
- `ApolloAppProvider` уже оборачивает приложение рядом с `RelayEnvironmentProvider`;
- существуют `createApolloClient`, request-scoped Next client и Apollo SSR loader;
- существует основной `codegen.ts` и команда `codegen`, которые уже генерируют schema types; временный `codegen.apollo.ts` не должен становиться отдельным постоянным workflow и будет слит с основной конфигурацией;
- Apollo cache создаётся централизованно, но `typePolicies` пока пусты;
- Apollo GraphQL documents пока отсутствуют.

Текущий Relay footprint без generated artifacts:

- 113 файлов импортируют `react-relay`, `relay-runtime` или `react-relay/hooks`: 51 в `src`, 62 в SDK;
- 56 файлов объявляют Relay GraphQL operations/fragments: 23 в `src`, 33 в SDK;
- 62 Relay artifact-файла находятся в `__generated__`;
- `usePaginationFragment` используется в 9 файлах;
- `useLazyLoadQuery` — в 8, `usePreloadedQuery` — в 10, `useFragment` — в 12;
- `readInlineData` — в 9, `fetchQuery` — в 3, `useMutation` — в 17;
- обнаружены 4 `@connection`, 4 `@refetchable`, 7 `@argumentDefinitions`, 6 `@arguments` и 8 `@inline`.

Это делает поэтапную миграцию обязательной: одномоментная замена создаст слишком большой diff и одновременно затронет SSR, cache normalization, пагинацию, cart/session и checkout.

## 3. Целевая архитектура

### 3.1. Размещение GraphQL documents

Сохраняем текущие domain-папки, меняем только формат документов:

```text
packages/shopana-storefront-sdk/src/
  graphql/apollo/
    Environment.ts
    cache.ts
    generated/
      operations.ts
    hooks/
      useFragment.ts
      useLazyLoadQuery.ts
      usePaginationQuery.ts
      usePreloadedQuery.ts
      useMutation.ts
      fetchQuery.ts
    pagination/
      definePaginationQuery.ts
      types.ts
  modules/collection/core/graphql/
    fragments/
      CollectionListing.apollo.graphql
      CollectionProductCard.apollo.graphql
    queries/
      Collection.apollo.graphql
      CollectionPagination.apollo.graphql
  modules/product/core/graphql/
    fragments/
      ProductReviews.apollo.graphql
    queries/
      Product.apollo.graphql
      ProductReviewsPagination.apollo.graphql

codegen/apollo/
  storefront-operations.ts
```

Правила размещения:

1. Один именованный fragment/query/mutation на файл, кроме очень тесно связанных private fragments.
2. Fragment располагается в `core/graphql/fragments`, query — в `core/graphql/queries`, mutation — в `core/graphql/mutations`.
3. Компонент импортирует generated `TypedDocumentNode` и generated types, но не `gql`/`graphql` tag.
4. Во время совместной работы клиентов используется суффикс `.apollo.graphql`, чтобы Relay compiler не видел Apollo documents. После полного удаления Relay суффикс можно отдельно сократить до `.graphql` механическим changeset-free рефакторингом.
5. Имя операции уникально во всём monorepo и содержит доменный контекст: `SDKCollectionQuery`, `SDKCollectionPaginationQuery`, `StorefrontCreateReviewMutation`.
6. Fragment всегда включает `__typename` и стабильный ключ нормализации (`id`, если тип его имеет).
7. Компонентный fragment содержит только данные одного UI-контракта. Родительская query собирает его через fragment spread.

Пример Apollo fragment без Relay-директив:

```graphql
fragment SDKCollectionProductCard on Product {
  __typename
  id
  title
  handle
  featuredImage {
    url
    altText
  }
}
```

Пример отдельной owning query:

```graphql
query SDKCollectionPagination(
  $handle: String!
  $first: Int = 24
  $after: Cursor
  $sort: ListingSort = MANUAL
  $filters: [ListingFilterInput!] = []
) {
  category: categoryByHandle(handle: $handle) {
    __typename
    id
    title: name
    handle
    listing: products(
      first: $first
      after: $after
      sort: $sort
      filters: $filters
    ) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...SDKCollectionProductCard
        }
      }
    }
  }
}
```

### 3.2. Code generation

Используется существующий `codegen.ts` и существующая команда `codegen`. Отдельный постоянный Apollo codegen workflow не создаётся. В текущую конфигурацию добавляются Apollo outputs, а временные `codegen.apollo.ts` и `codegen:apollo` удаляются после переноса настроек.

- существующий output `codegen/schema-client.ts` сохраняет текущую schema-конфигурацию, включая `relay-schema-extensions`, пока Relay остаётся в проекте;
- Apollo outputs используют реальную `schema.shopana.graphql` без `relay-schema-extensions`;
- каждый Apollo output обрабатывает только свои внешние documents:
  - `src/**/*.apollo.graphql` → `codegen/apollo/storefront-operations.ts`;
  - `packages/shopana-storefront-sdk/src/**/*.apollo.graphql` → `packages/shopana-storefront-sdk/src/graphql/apollo/generated/operations.ts`;
- SDK-generated код находится внутри `packages/shopana-storefront-sdk/src`, поэтому попадает в SDK build и публикуемый `dist`;
- plugins: `typescript`, `typescript-operations`, `typed-document-node`;
- `documentMode`/output должны давать готовые `TypedDocumentNode<TData, TVariables>`;
- scalar mapping объявляется один раз в существующем `codegen.ts` и переиспользуется всеми outputs;
- для Apollo outputs включить `useTypeImports`, `immutableTypes`, `enumsAsTypes` и `nonOptionalTypename`;
- fragment spreads должны генерировать композиционные типы, не Relay `$key`/`$data` типы;
- все codegen plugins, используемые напрямую конфигурацией, закрепить как прямые `devDependencies`, не полагаться на транзитивные зависимости.

В миграционных PR запускается существующая команда `codegen`; после генерации проверяется отсутствие незакоммиченного diff. Если проекту понадобится отдельный check-режим, он должен быть обёрткой над тем же `codegen.ts`, а не второй Apollo-конфигурацией. В рамках текущих проектных правил миграционные PR проверяются codegen и точечным lint; `build`, `test` и `tsc` для проверки не запускаются. Build запускается только когда действительно нужна новая версия кода.

### 3.3. Compatibility hooks

Новые хуки располагаются в SDK, а storefront импортирует их из одного стабильного entry point, например:

```ts
import {
  useFragment,
  useLazyLoadQuery,
  usePaginationQuery,
  usePreloadedQuery,
} from '@shopana/storefront-sdk/graphql/apollo';
```

Имена намеренно похожи на Relay, но типы основаны на `TypedDocumentNode` и generated Apollo types.

#### `useFragment`

Цель — сохранить модель «родитель передаёт ссылку/объект, дочерний компонент читает свой fragment».

Предлагаемый контракт:

```ts
const product = useFragment(ProductCardFragmentDocument, productRef);
```

Реализация использует Apollo `useFragment({ fragment, from })` и:

- принимает normalized object/reference с `__typename + id`;
- возвращает fragment data или `null`;
- в development сообщает о `complete: false` с именем fragment и missing fields;
- остаётся reactive при обновлении Apollo cache.

На первом этапе prop может быть типом generated fragment data. Если потребуется Relay-подобная непрозрачность `$key`, поверх generated types вводится `FragmentKey<T>` с обязательными `__typename`/`id`; это отдельное улучшение и не должно блокировать миграцию.

#### `useLazyLoadQuery`

Relay-похожий Suspense hook:

```ts
const data = useLazyLoadQuery(ProductQueryDocument, variables, {
  fetchPolicy: 'store-or-network',
});
```

Внутри используется Apollo `useSuspenseQuery`. Compatibility layer переводит ограниченный набор политик:

| Relay-like policy | Apollo policy |
| --- | --- |
| `store-or-network` | `cache-first` |
| `store-and-network` | `cache-and-network` |
| `network-only` | `network-only` |
| `store-only` | `cache-only` |

Не следует копировать все Relay options. Поддерживается только реально используемое подмножество, остальные callsites переводятся на явные Apollo options.

#### `usePaginationQuery`

Основной compatibility hook заменяет `usePaginationFragment`, но владеет полноценной Apollo query: Apollo fragment сам по себе не создаёт refetch query и не имеет `@argumentDefinitions`.

Возвращаемый контракт сохраняет привычную форму:

```ts
const {
  data,
  loadNext,
  hasNext,
  isLoadingNext,
  refetch,
  error,
} = usePaginationQuery(CollectionPagination, variables);
```

`CollectionPagination` — типизированный descriptor, объявленный рядом с query, а не в компоненте:

```ts
export const CollectionPagination = definePaginationQuery({
  query: SDKCollectionPaginationDocument,
  getConnection: (data) => data.category?.listing,
  getNextVariables: ({ variables, count, endCursor }) => ({
    ...variables,
    first: count,
    after: endCursor,
  }),
});
```

Поведение:

- initial read выполняется через Apollo query hook;
- `loadNext(count)` вызывает `fetchMore` с `after = endCursor`;
- объединение страниц выполняет cache field policy, не компонент и не `updateQuery`;
- `hasNext` читается из `pageInfo.hasNextPage`;
- `isLoadingNext` отличает `fetchMore` от initial load/refetch;
- повторный `loadNext` во время активной загрузки игнорируется или возвращает тот же promise;
- `refetch(nextVariables)` сбрасывает cursor (`after: null`) и выбирает отдельную cache entry для новых sort/filter arguments;
- hook возвращает promise из `loadNext`/`refetch`, чтобы callsite мог обрабатывать ошибку;
- отменённый/unmounted запрос не обновляет локальный UI state;
- дубликаты edges дедуплицируются по `node.__typename + node.id`, с fallback на `edge.cursor`.

Descriptor нужен, потому что структура connections различается (`category.listing`, `product.reviews`, search results). Он сохраняет единый UI API без небезопасного поиска поля `pageInfo` во всём response.

#### `usePreloadedQuery`

Заменяет Relay preload flow на Apollo Next.js flow:

- для Server Component → Client Component использовать зарегистрированный `PreloadQuery` и Apollo query ref;
- для существующих imperative loaders временно использовать `createApolloServerQueryLoader`/`SerializableApolloQuery`;
- cache hydration происходит до первого client read;
- hook возвращает generated query data, без Relay `ConcreteRequest` и `PreloadedQuery` типов.

Не следует поддерживать два Apollo preload-протокола внутри одного домена. При миграции домен сразу выбирает основной `PreloadQuery` flow; serializable loader остаётся bridge для metadata/loaders и удаляется там, где больше не нужен.

#### Мутации и imperative API

Apollo уже предоставляет `useMutation`, но Relay и Apollo имеют разные commit-контракты. Для минимального diff создаётся тонкий SDK adapter с Relay-похожей формой:

```ts
const [commit, isInFlight] = useMutation(AddToCartDocument);

commit({
  variables,
  optimisticResponse,
  onCompleted,
  onError,
});
```

Adapter переводит вызов в Apollo mutate promise. Cache update не прячется за универсальной магией: каждая доменная mutation экспортирует typed cache updater либо использует `cache.modify`, `writeFragment`, `evict` или `refetchQueries` осознанно.

Для трёх `fetchQuery` callsites добавляется Promise-based `fetchQuery(client, document, variables, options)`. Relay Observable API не эмулируется; если callsite использует subscription/unsubscribe, он мигрирует на Apollo ObservableQuery явно.

`readInlineData` не переносится. Relay `@inline` заменяется обычным named fragment, а чтение выполняется одним из способов:

- `useFragment` в React-компоненте;
- `cache.readFragment` для imperative cache read;
- generated fragment data в чистом mapper, если данные уже входят в operation result.

### 3.4. Cache normalization и pagination policies

`createApolloCache` должен стать единственным источником cache policies для server и browser clients.

Минимальный набор:

1. Для Node-типов использовать стандартный ключ `__typename + id`.
2. Для типов без `id` явно задать `keyFields` или `keyFields: false` после аудита schema.
3. Для каждой cursor connection определить field policy, исключающий `first/after` из identity, но учитывающий аргументы, меняющие набор/порядок:
   - `Category.products`: `sort`, `filters`;
   - `Product.reviews`: `sort` и будущие review filters;
   - search connections: query text, entity type, sort, filters;
   - вложенные media/variants connections — по их фактическим arguments.
4. Merge должен:
   - заменять данные при initial/refetch без cursor;
   - добавлять следующую страницу при наличии `after`;
   - сохранять актуальные `pageInfo`, `totalCount`, filters и available sorts;
   - дедуплицировать edges;
   - не мутировать frozen Apollo data.
5. Одинаковые policies используются при SSR, hydration и client navigation.

До миграции collection/product reviews необходимо сделать маленький cache-policy spike на двух страницах: initial SSR page, `loadNext`, смена sort/filter, возврат назад из карточки, повторный переход на страницу. Только после этого общий helper распространяется на остальные connections.

### 3.5. SSR, RSC и provider lifecycle

Целевое состояние:

- на сервере создаётся отдельный Apollo Client на каждый request;
- browser client является singleton внутри `ApolloNextAppProvider` lifecycle;
- cookies и Authorization формируются одинаково в Relay-период и после него;
- initial cache state создаётся тем же cache factory, что и browser cache;
- один домен не загружает одинаковую initial query одновременно через Relay и Apollo;
- server-loaded данные не передаются отдельной копией в props, если они уже гидратированы в Apollo cache;
- после миграции cart/session `AppProvider` загружает их через Apollo и больше не создаёт Relay environment.

Во время coexistence порядок providers можно оставить текущим: Apollo снаружи, Relay внутри. Это уменьшает structural diff. Удаление Relay provider выполняется отдельным финальным шагом.

## 4. Пошаговый план работ

### Этап 0. Зафиксировать baseline и границы

1. Сохранить машинно-проверяемый inventory:
   - Relay imports;
   - GraphQL tags;
   - Relay directives;
   - `__generated__` artifacts;
   - hooks по типам использования;
   - SSR loaders/providers по доменам.
2. Создать migration board с одной карточкой на домен и checklist из раздела 6.
3. Зафиксировать правило: новый или изменяемый GraphQL-код пишется только на Apollo, кроме критического hotfix в ещё не мигрированном Relay-домене.
4. Зафиксировать публичные типы/exports SDK, которые нельзя сломать без отдельной major migration.

Результат: понятный scope и счётчик Relay footprint, уменьшающийся в каждом PR.

### Этап 1. Довести Apollo foundation

1. Расширить существующий `codegen.ts` Apollo outputs и общим scalar mapping.
2. Перенести настройки из временного `codegen.apollo.ts`, затем удалить его и script `codegen:apollo`.
3. Ограничить Apollo documents до внешних `*.apollo.graphql` файлов и закрепить раздельные storefront/SDK outputs.
4. Закрепить прямые codegen dependencies и generated output policy.
5. Реализовать и экспортировать compatibility hooks.
6. Реализовать `definePaginationQuery` и общий cursor merge helper.
7. Добавить cache policies сначала для `Category.products` и `Product.reviews`.
8. Проверить одинаковую конфигурацию cache в RSC и browser.
9. Добавить ESLint/GraphQL lint guardrails:
   - запрет `graphql`/`gql` tags в `*.tsx` и UI-папках;
   - запрет Relay directives в `*.apollo.graphql`;
   - запрет импорта Relay из уже мигрированных доменов;
   - уникальные operation/fragment names.
10. Документировать шаблон нового fragment/query/mutation.

Результат: инфраструктура позволяет мигрировать следующий домен без новых общих решений.

### Этап 2. Pilot на низкорисковом вертикальном срезе

Рекомендуемый pilot: Greeting или predictive search, затем review mutations.

Для каждого pilot:

1. Вынести documents в `core/graphql/{fragments,queries,mutations}/*.apollo.graphql`.
2. Запустить существующую команду `codegen`.
3. Заменить Relay hook на compatibility hook.
4. Сохранить публичный domain hook и его return shape.
5. Удалить Relay operation и его локальный artifact только после удаления всех импортов.
6. Проверить loading/error/empty/success состояния и cache result.
7. Зафиксировать недостающие возможности compatibility API; расширять его только при втором реальном use case.

Результат: доказана работа conventions, codegen, auth и error handling на production-shaped пути.

### Этап 3. Read-only домены

Мигрировать в порядке возрастания связанности:

1. home;
2. search;
3. collection;
4. product base data;
5. product reviews pagination.

Collection и reviews являются контрольными доменами для пагинации. В их PR обязательно отдельно проверить initial SSR data, `loadNext`, refetch с новым sort/filter и отсутствие дубликатов.

На этом этапе Relay `$key` props заменяются generated fragment data/reference types, но presentation-компоненты и mapper output не меняются без необходимости.

### Этап 4. Write-heavy домены

1. review mutations: create, vote helpful, report abuse;
2. checkout query и checkout mutations;
3. box-builder mutations/cleanup;
4. cart;
5. session/auth.

Для каждой mutation заранее определить cache strategy:

- entity update → `cache.writeFragment`/`cache.modify`;
- insert/remove connection edge → domain helper с dedupe;
- invalidation → `evict` + `gc` только при необходимости;
- сервер является единственным источником сложного агрегата → ограниченный `refetchQueries`;
- optimistic UI → typed `optimisticResponse` с `__typename` и key fields.

Cart и session мигрируются последними, потому что они участвуют в root provider, SSR cookies, Zustand hydration и влияют почти на все страницы.

### Этап 5. Переключить root SSR/provider

1. Перевести `loadCartServerQuery` и `loadSessionServerQuery` на Apollo documents/client.
2. Удалить из `App` Relay-specific `Environment`, `ConcreteRequest`, `SerializablePreloadedQuery` и `useSerializablePreloadedQuery`.
3. Перевести cart/session initial state extraction на generated Apollo result types без `any`.
4. Убедиться, что root Apollo cache гидратируется один раз и stores создаются из тех же данных.
5. Удалить `RelayEnvironmentProvider` и `QueryProvider` после того, как их больше не использует ни один descendant.
6. Сделать `ApolloEnvironmentConfig` основным config type; временный alias с Relay config оставить только на один compatibility release SDK, если это нужно consumers.

### Этап 6. Удалить Relay toolchain

Только когда inventory показывает ноль runtime imports и ноль Relay documents:

1. Удалить `react-relay`, `relay-runtime`, `relay-compiler`, `babel-plugin-relay`, `@types/react-relay`.
2. Удалить Relay scripts из root и SDK `package.json`.
3. Удалить Relay шаги из `build`, `dev:next`, Dockerfile и документации.
4. Удалить `relay.shopana.json`, `relay-schema-extensions`, `bin/relay`.
5. Удалить `graphql/relay`, `next/relay` и все `__generated__/*.graphql.ts` artifacts.
6. Удалить Relay block из `next.config.js`.
7. Обновить README: Apollo setup, schema refresh, codegen, SSR и conventions.
8. После удаления зависимостей сгенерировать changeset через разрешённую npm-команду; changeset-файл вручную не редактировать.

Удаление выполнять отдельным PR: так rollback последнего инфраструктурного шага не смешивается с функциональными изменениями доменов.

## 5. Маппинг Relay → Apollo

| Relay | Целевой Apollo подход |
| --- | --- |
| `graphql` tag в TS | внешний `*.apollo.graphql` + generated `TypedDocumentNode` |
| generated `__generated__/*.graphql.ts` | Apollo outputs существующего `codegen.ts`: отдельные generated operations для storefront и SDK |
| fragment `$key` | normalized object/reference + generated fragment type |
| `useFragment(fragment, key)` | compatibility `useFragment(document, reference)` |
| `readInlineData` + `@inline` | named Apollo fragment + hook/cache read/generated mapper input |
| `useLazyLoadQuery` | compatibility hook поверх `useSuspenseQuery` |
| `usePreloadedQuery` | Apollo `PreloadQuery`/query ref; bridge loader только где нужен |
| `usePaginationFragment` | `usePaginationQuery(descriptor, variables)` |
| `@refetchable` | отдельная именованная pagination/refetch query |
| `@argumentDefinitions`/`@arguments` | variables owning query |
| `@connection` | Apollo `typePolicies.fields.*.keyArgs/merge/read` |
| `loadNext` | `fetchMore` внутри compatibility hook |
| fragment `refetch` | query `refetch` со сбросом cursor |
| Relay `useMutation` | Apollo mutation adapter + domain cache updater |
| Relay `fetchQuery` | Apollo client `query`/`watchQuery` через SDK wrapper |
| Relay environment | Apollo Client из единого cache/network factory |

## 6. Checklist миграции одного домена

Каждый domain PR считается законченным, если:

- [ ] все его fragments/queries/mutations находятся во внешних `*.apollo.graphql`;
- [ ] в UI-компонентах нет GraphQL tags или GraphQL-текста;
- [ ] documents не содержат Relay client directives;
- [ ] operation variables и result types generated, нет новых `any`;
- [ ] public domain hook/provider сохраняет прежний UI-friendly контракт либо изменение явно описано;
- [ ] initial SSR/client fetch не дублируется двумя клиентами;
- [ ] loading, error, empty и success состояния сохранены;
- [ ] для connection проверены initial page, next page, end-of-list и dedupe;
- [ ] для sort/filter refetch cursor сбрасывается, старые edges не подмешиваются;
- [ ] mutation имеет явно выбранную cache strategy;
- [ ] optimistic response содержит нормализуемые поля;
- [ ] из домена удалены Relay imports, документы и неиспользуемые artifacts;
- [ ] существующий `codegen` проходит и не оставляет незакоммиченный diff;
- [ ] точечный lint проходит;
- [ ] обновлён migration inventory.

## 7. Проверка без build/test/tsc

С учётом проектных инструкций для обычного миграционного PR используются:

1. Существующий project codegen — одновременно обновляет schema types, парсит Apollo documents, проверяет schema fields и генерирует operation types/`TypedDocumentNode`.
2. GraphQL ESLint — names, known fields/arguments/fragments, unused fragments, запрещённые directives.
3. Точечный ESLint изменённых TS/TSX файлов.
4. `rg`-guardrails по мигрированному домену:
   - нет `react-relay`/`relay-runtime`;
   - нет Relay directives;
   - нет GraphQL tags в components;
   - нет импортов старых `__generated__` artifacts.
5. Ручная runtime-проверка затронутого flow в уже запущенном dev-приложении, если оно доступно, без запуска build.
6. Сравнение GraphQL network payload и UI-состояний до/после для critical flows.

Build выполняется только если нужна новая сборка/версия, а не как средство проверки. `test` и `tsc` для верификации не запускаются.

## 8. Риски и меры снижения

### Неверный merge connections

Риск: дубликаты, потеря edges, смешивание sort/filter результатов.

Мера: descriptor + централизованный merge helper, явные `keyArgs`, pilot на collection/reviews и обязательный pagination checklist.

### Двойная загрузка при SSR

Риск: Relay и Apollo отправляют одинаковую query, Apollo client не видит server cache.

Мера: мигрировать целый query boundary, не отдельный дочерний компонент; один request-scoped client; одинаковый cache factory на server/client.

### Потеря fragment isolation

Риск: компоненты начинают принимать большие query results и зависеть от лишних полей.

Мера: отдельные named fragments, generated fragment types, compatibility `useFragment`, запрет GraphQL declarations в компонентах.

### Cache update после мутаций

Риск: сервер обновился, UI остался со старым normalized state.

Мера: cache strategy фиксируется для каждой mutation; не использовать один непрозрачный универсальный updater.

### Расхождение auth между клиентами

Риск: Apollo запросы работают в browser, но теряют cookies/token в RSC.

Мера: единый environment config и auth link, request cookies передаются в server client, auth pilot до cart/session.

### Разрастание compatibility layer

Риск: получится второй Relay runtime поверх Apollo.

Мера: адаптировать только реально используемые возможности; не эмулировать Relay compiler directives, fragment ownership или Observable API; пометить layer как migration-friendly, но оставить небольшим и Apollo-native внутри.

## 9. Rollback strategy

- Один PR мигрирует один domain/query boundary.
- Старый Relay document удаляется только после переключения всех consumers в этом boundary.
- Relay provider и compiler остаются до финального этапа, поэтому rollback domain PR не требует восстановления общей инфраструктуры.
- Не делать dual write в два cache: домен в конкретном render path читает и пишет либо Relay, либо Apollo.
- Финальное удаление Relay — отдельный PR после нулевого inventory.

## 10. Definition of Done всей миграции

Миграция завершена, когда:

1. В runtime/source нет импортов `react-relay` и `relay-runtime`.
2. В source нет Relay GraphQL directives и Relay-generated artifacts.
3. Все GraphQL documents внешние, schema-valid и проходят существующий project codegen.
4. Все cursor connections управляются Apollo cache policies.
5. Root SSR, cart и session работают через один Apollo lifecycle.
6. Relay dependencies, compiler configs, scripts, Next config и Docker steps удалены.
7. README описывает только Apollo workflow.
8. Public SDK exports не содержат Relay types.
9. Migration inventory равен нулю по всем Relay-категориям.
10. Compatibility hooks остаются тонкими, типизированными и не требуют Relay compiler semantics.
