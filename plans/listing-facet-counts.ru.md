# Счётчики фасетов листинга через `@defer` в одном вызове listing

Дата: 24 ноября 2026 года. Затрагивает два репозитория: `internal` (Postgres, сервис listing,
резолвер-фреймворк, шлюз) и `storefront` (SDK, runtime, тема `brand-bite-crunch`, mock server).
Код читался в рабочих копиях на эту дату. Ничего не запускалось.

Обозначения: **[код]** доказано чтением кода, **[решение]** предлагаемое решение, которое владелец
утверждает.

## Вывод

**Один запрос клиента, один вызов listing, ответ частями на всём пути.**

```
Apollo ──multipart──► Hive Gateway ──multipart (один запрос)──► listing (Yoga + @defer)
   ◄── часть 1: товары, фильтры без count ◄── часть 1 ◄── page SQL + structure SQL
   ◄── часть 2: count                     ◄── часть 2 ◄── counts SQL (стартовал вместе с page)
```

- В документе стоит `values { id label … ... @defer { count } }`.
- Шлюз не вырезает `@defer` для listing и пересылает ему документ одним запросом. Части ответа
  listing он раскладывает по своим отложенным фрагментам.
- `$preload` в listing запускает счётчики в том же тике, что страницу, но ждёт только страницу
  и структуру фильтров.

Что для этого нужно:

1. **Listing исполняет `@defer`.** Storefront-сервер listing переходит с Apollo Server на Yoga с
   `useDeferStream()`, `buildSubgraphSchema` остаётся. Apollo Server даёт incremental delivery
   только на `graphql@17.0.0-alpha.2`, а `@apollo/subgraph`, `@apollo/federation-internals` и
   `graphql-parse-resolve-info` объявляют `graphql ^16`. Корневой `resolutions` держит один
   `graphql` 16.12.0 на весь монорепозиторий **[код]**.
2. **Резолвер-фреймворк не ждёт отложенные поля.** Сейчас `@ApolloQuery` и `Executor.loadInstance`
   ждут всё поддерево до того, как его увидит graphql-js
   (`packages/graphql-resolver/src/decorators/ApolloQuery.ts:78`, `executor.ts:186-245`) **[код]**.
3. **Шлюз пересылает `@defer` в listing.** Hive Gateway вырезает его всегда
   (`@graphql-tools/delegate/dist/index.js:1526-1529`). Флага нет, upstream-работы нет **[код]**.
   Нужны yarn-патчи четырёх пакетов: `@graphql-tools/delegate`, `@graphql-tools/executor-http`,
   `@graphql-tools/batch-execute`, `@graphql-tools/batch-delegate`. Включается только для
   подграфа listing.
4. **Клиент:** `Defer20220824Handler` в Apollo Client, SSR до первой части.

Формат частей на всём пути один и тот же: спецификация 2022-08-24 (`incremental[{data, path,
label}]`, `hasNext`). Его отдаёт исполнитель Yoga (`@graphql-tools/executor`,
`execute.js:1212-1261`), понимает транспорт шлюза (`executor-http`, `mergeIncrementalResult`) и
ждёт `Defer20220824Handler` в Apollo **[код]**.

## Исходное состояние

### Postgres и сервис listing (`internal/services/listing/src`)

- Storefront-сервер `api/graphql-storefront/server.ts` **[код]**:
  - Apollo Server 4.12.2 на fastify 4, `buildSubgraphSchema(modules)` (`:111`);
  - плагины: `cacheEnvelopePlugin` (`packages/request-context/src/storefrontRequestScope.ts:234-268`),
    наблюдаемость `createApolloAdapter` (`packages/observability/src/adapters.ts:155`),
    `userErrorsPlugin` (`:37-60`), drain, подписки, `InlineTraceDisabled`;
  - `formatError` разворачивает `ResolverError` (`:119-134`);
  - контекст строится в `context` из `request.store` и `storefrontAccess`, `setContext` через ALS
    (`:140-170`).
- `userErrorsPlugin` и `cacheEnvelopePlugin` обрабатывают только `body.kind === "single"`
  (`server.ts:42`, `storefrontRequestScope.ts:246`) **[код]**.
- Как фреймворк выполняет запрос **[код]**:
  1. Корневое поле → прокси `@ApolloQuery` → `executeGraphql(info, …)`
     (`utils/graphqlArgsParser.ts:233-240`).
  2. `parseResolveInfo` сплющивает фрагменты, применяет `@skip`/`@include` и **игнорирует
     `@defer`**.
  3. `Executor.resolve` → `loadInstance`: каждое выбранное поле ждётся через `Promise.allSettled`.
  4. `adaptResultForGraphql` отдаёт graphql-js готовое дерево.
- Сущности `_entities`: `Category.__resolveReference` и `Vendor.__resolveReference` вызывают
  `XResolver.load(id, parseGraphqlInfo(info), ctx)` (`api/graphql-storefront/resolvers/types.ts:199-223`)
  и тем же путём резолвят всё поддерево, включая `count` **[код]**.
- `ProductConnectionResolver.$preload` ждёт `page` и `filters` одним `Promise.all`
  (`resolvers/storefront/ProductConnectionResolver.ts:121-136`). Загрузчик склеивает их в один
  statement `pageAndBranches`, когда оба ключа попали в одну пачку (`keys.length === 2`,
  `loaders/ListingConnectionLoader.ts:232-265`) **[код]**.
- `FilterValueResolver.count()` синхронный и читает готовые данные (`FilterResolver.ts:45-47`)
  **[код]**.
- Секции фильтров — один statement (`compileListingSectionsSql`,
  `StorefrontListingQueryRepository.ts:280-353`). Значения фасетов и счётчики считает одна секция
  `facetsWithCounts`. До `7f899d8af` (11.07.2026) это были отдельные `compileFacetsQuerySql` и
  `compileFacetCountsQuerySql` **[код]**.
- От счётчиков зависит структура **[код]**:
  - значения sale и рейтинга с нулём отбрасываются (`FilterResolver.ts:148-157`, `:163-171`);
  - группа sale видна, только если есть `count > 0` (`ProductConnectionResolver.ts:266-270`);
  - вендоры присоединяются по счётчикам (`~:736`), в SQL `WHERE count > 0 OR selected`;
  - промоакции и категории LEAVES: `count > 0`; COMMON_ANCESTOR выбирает предка по счётчикам.
  
  Значения TAG/FEATURE/OPTION уже видны с нулём (LS-068, `18af8ef68`).

### Шлюз (`internal/infra/federation`)

- Hive Gateway 2.11.2, gateway-runtime 2.10.7, `@graphql-tools/delegate` 12.1.1,
  `@graphql-tools/executor-http` 3.3.0, `@graphql-tools/batch-execute` 10.0.9. `deferStream` не
  задан, `useDeferStream()` включается только при `config.deferStream`
  (`gateway-runtime/dist/index.js:3145`) **[код]**.
- `@defer` вырезается в одном месте: `filterSelectionSet`, обработчик `INLINE_FRAGMENT.leave`
  (`delegate/dist/index.js:1526-1529`, вызов из `finalizeGatewayRequest` `:817`). Именованные
  spread (`FRAGMENT_SPREAD`, `:1405`) не вырезаются **[код]**.
- `executor-http` **[код]**:
  - умеет `multipart/mixed` (`handleMultipartMixedResponse`, `:475-508`, meros), но отдаёт
    накопленный объект на каждую часть; `path`, `label` и `hasNext` части теряются;
  - `Accept` без `deferSpec=20220824` (`:557`);
  - дедупликация запросов в полёте разделила бы один поток на двоих (`:826-840`).
- Делегирование `_entities` идёт через `batchDelegateToSchema` со списочным типом и попадает в
  ветку `Repeater` для `@stream` (`delegate/dist/index.js:3060-3120`,
  `batch-delegate/dist/index.js:14-46`). Части `data` от `@defer` там теряются, а `batchFn` падает
  на `Array.isArray` **[код]**.
- `batch-execute` при склейке запросов режет результат `splitResult` (`:254`). Для потока он вернёт
  пустые данные **[код]**.
- Сырой объект ответа подграфа и есть тот объект, на котором исполняется отложенный фрагмент шлюза:
  `resolveExternalObject` аннотирует его на месте (`:356`), вложенные поля читает
  `defaultMergedResolver` (`:2547-2612`). Значит, часть подграфа можно влить в этот объект на месте
  **[код]**.
- Отложенный фрагмент шлюза (`executeDeferredFragment`,
  `graphql-yoga/node_modules/@graphql-tools/executor/esm/execution/execute.js:1026`) ждёт промисы
  своих резолверов (`DeferredFragmentRecord.addData`, `:1332`). Значит, достаточно, чтобы
  `defaultMergedResolver` для `count` возвращал промис, который разрешает часть подграфа **[код]**.
- Патчи: yarn 4.10.3, протокол `patch:` в `resolutions` корневого `package.json` (`:70-73`), файлы в
  `.yarn/patches/`. Уже пропатчены delegate 12.1.1, federation 4.4.12, stitch 10.2.2. Каждый патч
  правит `dist/index.js` и `dist/index.cjs` **[код]**.
- Плагины шлюза **[код]**:
  - `subgraph-cache`: потоковый результат подграфа идёт как `uncached("stream")`
    (`plugins/subgraph-cache/index.ts:230-233`);
  - `cdn`: потоковый ответ клиенту обходит кеш (`plugins/cdn/operation.ts:171-173`);
  - `gateway-observability`: `duration_ms` подграфа считается по первой части (`:206-231`).

### Витрина (`storefront`)

- Apollo Client 4.0.9 **[код]**:
  - `incrementalHandler` не задан, по умолчанию `NotImplementedHandler` отвергает `@defer`;
  - `Defer20220824Handler` сам ставит `Accept: multipart/mixed;deferSpec=20220824`.
- Клиент создаётся в `packages/shopana-storefront-sdk/src/graphql/apollo/Environment.ts:118-210`.
  `createSessionRetryLink` проверяет ошибку сессии на каждой части (`:72-93`) **[код]**.
- SSR **[код]**:
  - `loadQuery` → `client.query` ждёт последнюю часть (`QueryManager.js:224`);
  - состояние кеша уходит перед `</body>`, когда React закончил (`entry.server.tsx:158-238`);
  - пользователю документ стримится (`onShellReady`), статике и ботам отдаётся целиком
    (`onAllReady`).
- CDN-воркер обходит документы с `@defer` и пропускает поток без буферизации
  (`deploy/worker/src/api-worker.ts:198-205`, `:532-535`). На пути нет сжатия и middleware
  **[код]**.
- Тема: `count` отключает значение при `0` и показывается при `> 0` (`atoms/Filters/*`). Скелетон
  есть: `FilterValueCount`, `FilterCountsLoadingContext`. Фасеты запрашивает и пагинация **[код]**.
- `Filter` и `FilterValue` хранятся внутри connection (`keyFields: false`, `cache.ts:280-285`).
  Части ответа Apollo вливает в результат до записи, отдельного поля в кеше не нужно **[код]**.
- Mock server: `createYoga` без `useDeferStream` (`mockServer/src/server.js:89`) **[код]**.

## Как это будет работать

### Документ

```graphql
fragment ListingFiltersFragment on ProductConnection {
  filters(groups: $groups) @include(if: $withFilters) {
    id
    label
    type
    presentation
    selectionMode
    facet { uiType }
    priceRange { … }
    values {
      id
      label
      selected
      input
      facetValue { ruleValues }
      promotion { … }
      swatch { … }
      ... @defer(label: "count") { count }
    }
  }
}
```

### Поток одного запроса

1. Apollo отправляет POST с `Accept: multipart/mixed;deferSpec=20220824`.
2. CDN-воркер пропускает поток (`bypass: stream`), Traefik передаёт его как есть.
3. Hive Gateway с `deferStream` строит план:
   - `categoryByHandle` идёт в catalog;
   - `products` идёт в listing через `_entities`.
   
   Пропатченный `filterSelectionSet` оставляет `@defer` в документе для listing. Метку он
   переписывает на уникальную метку шлюза и запоминает `метка → путь в ответе шлюза`.
4. Пропатченный `executor-http` шлёт listing запрос с `Accept: multipart/mixed;deferSpec=20220824`,
   без дедупликации в полёте и без склейки `batch-execute`.
5. Listing (Yoga, `useDeferStream`) исполняет документ:
   - `__resolveReference` → `CategoryResolver.load` → `ProductConnectionResolver.$preload`;
   - в одном тике стартуют `page`, `structure` и `counts`;
   - ждутся только `page` и `structure`;
   - фреймворк кладёт в дерево для `count` промис на `counts`, не дожидаясь его.
6. Listing отдаёт часть 1: `_entities[0].products` с товарами и фильтрами без `count`.
7. Шлюз:
   - пропатченный `delegateRequest` отдаёт часть 1 как обычный результат `_entities`, дальше
     работает обычное слияние федерации;
   - на каждый объект под отложенным фрагментом (каждое значение фильтра) он вешает
     `PENDING_DEFER`;
   - Yoga шлюза отдаёт клиенту свою часть 1: товары и фильтры. Отложенные фрагменты `count` ждут
     промис из `defaultMergedResolver`.
8. Counts SQL завершился. Listing отдаёт часть 2: `incremental[{path: ["_entities",0,"products",
   "filters",i,"values",j], data: {count}}]` на каждое значение.
9. Шлюз:
   - фоновый цикл в пропатченном `delegateRequest` по `path` находит сырой объект значения,
     вливает `count` и разрешает его `PENDING_DEFER`;
   - `defaultMergedResolver` возвращает `count`;
   - Yoga шлюза отдаёт клиенту часть 2 с путями в его ответе.
10. Apollo вливает часть 2 в результат и пишет в кеш. `dataState` меняется с `streaming` на
    `complete`, скелетоны сменяются числами.

### SSR

- `preloadListingPage` ждёт **первую** часть. React рендерит shell с товарами и фильтрами, счётчики
  стоят в Suspense-границе.
- Вторая часть пишется в кеш серверного клиента, граница досылается в HTML-поток.
- Состояние кеша, уже полное, уходит перед `</body>`. Браузер гидратирует без повторных запросов.
- Статика и боты (`onAllReady`) получают HTML сразу со счётчиками.

## Что включить и изменить

| Слой | Что | Где |
| --- | --- | --- |
| Postgres | `structure` и `counts` отдельными statement | `services/listing/src/repositories/storefront/sql` |
| Listing | части `page`, `structure`, `counts` в загрузчике | `loaders/ListingConnectionLoader.ts`, `cache/storefrontQueries.ts` |
| Listing | `$preload` не ждёт `counts`, `count()` ждёт | `ProductConnectionResolver.ts`, `FilterResolver.ts` |
| Listing | структура не зависит от `count` | `FilterResolver.ts`, `ProductConnectionResolver.ts`, SQL вендоров и промоакций |
| Фреймворк | разбор `@defer` в выборке, отложенные поля — промисы | `packages/graphql-resolver/src` |
| Listing | storefront-сервер на Yoga + `useDeferStream()` | `services/listing/src/api/graphql-storefront/server.ts` |
| Пакеты | envelop-версии плагинов кеш-конверта и наблюдаемости | `packages/request-context`, `packages/observability`, `packages/service-runtime` |
| Шлюз | `deferStream: true` | `infra/federation/gateway-storefront.config.ts` |
| Шлюз | yarn-патчи `delegate`, `executor-http`, `batch-execute`, `batch-delegate` | `.yarn/patches/`, `resolutions` в корневом `package.json` |
| Шлюз | наблюдаемость и кеш подграфов под поток | `infra/federation/gateway-observability.ts`, `plugins/subgraph-cache` |
| Apollo | `incrementalHandler: new Defer20220824Handler()`, повтор сессии до первой части | `packages/shopana-storefront-sdk/src/graphql/apollo/Environment.ts` |
| Runtime | `loadQuery` до первой части | `packages/shopana-storefront-runtime/src/core/page-services.ts`, `sdk/src/graphql/apollo/loadSerializableQuery.ts` |
| Тема | `... @defer { count }`, `withFilters`, Suspense-граница, `count: number \| null` | `themes/brand-bite-crunch/src/templates/collection`, `templates/search` |
| Mock server | `useDeferStream()`, задержка `count` | `mockServer/src/server.js`, `resolvers.js` |

## Этапы

### 1. Postgres: `structure` и `counts`

`internal/services/listing/src/repositories/storefront/sql`

**structure** зависит только от скоупа:
- значения фасетов в скоупе: семантика старого `compileFacetsQuerySql` (постинги ∩
  `scope_products`, OPTION ∩ `scope_variants`) на bitmap из `749ef3c86` плюс
  `unmatched_scope_values`;
- вендоры и промоакции скоупа без `count > 0`;
- категории из дерева. Сортировка, лимит LEAVES и предок COMMON_ANCESTOR — по счётчикам скоупа без
  фильтров **[решение]**;
- границы цены по скоупу **[решение]**, сейчас они под фильтрами;
- значения sale из `readFacetInputs.saleValues`, пороги рейтинга и наличие статичны.

**counts** зависит от скоупа и фильтров:
- нынешние секции `facetsWithCounts`, `vendorFacet`, `promotionFacet`, `virtualFacets`,
  `category_*`, только счётчики, дизъюнктивно, как сейчас;
- результат разреженный: `value key → count` для `count > 0`, остальное — 0.

**page** без изменений. Один statement допустим для `page + structure`, `counts` идёт отдельным,
параллельно.

`specs/docs/listing/facets-architecture.ru.md` обновить.

### 2. Загрузчик и кеш listing

`loaders/ListingConnectionLoader.ts`, `cache/storefrontQueries.ts`

- Части `page`, `structure`, `counts`. Склейка `keys.length === 2` (`:232-265`) объединяет только
  `page` и `structure`, `counts` идёт своим statement.
- Ключ `structure`: `ConnBase` без фильтров, не меняющих скоуп. Фильтры, меняющие набор фасетов
  (позитивные правила категорий и вендоров, категории динамической коллекции), остаются в ключе.
  Обход кеша по `filters.length > 0` для `structure` не применяется.
- `counts` и `page` обходят кеш при фильтрах, как сейчас.
- Теги:
  - `structure`: `listing:scope:*`, `facets`;
  - `counts`: те же плюс `offers`, когда зависит от цены.
- `version 4`.

### 3. Резолверы listing

`resolvers/storefront`

- `ProductConnectionResolver.$preload`:
  - `page` и `structure` ждутся, как сейчас;
  - `this.counts = connection.load({ ...base, part: "counts", branches })` стартует в том же
    тике, без ожидания, с `.catch`-защитой от необработанного отказа;
  - `counts` грузится, только если `$selection()` видит `filters.values.count` или
    `appliedFilters.count`.
- `filters()` строит группы и значения из `structure`, передаёт в `FilterResolverInput` и
  `FilterValueResolverInput` функцию `(group, valueKey) => Promise<number>`.
- `FilterValueResolver.count()` становится `async` и ждёт её. Ошибка счётчиков уходит ошибкой поля
  `count` в поздней части.
- `appliedFilters` ждёт `this.counts` так же.
- Видимость не зависит от `count` (LS-068 для всех групп) **[решение]**:
  - условия `count > 0` в `FilterResolver.ts:148-157`, `:163-171`, `ProductConnectionResolver.ts:266-270`,
    `~:736` и в SQL вендоров и промоакций уходят;
  - группа скрыта, только если в скоупе пусто.
  
  Это обязательно: поздняя часть не может убрать уже отданное значение.
- Спеки LS-068 и `facets-architecture.ru.md` переписать.

### 4. Резолвер-фреймворк

`packages/graphql-resolver/src`

**Разбор выборки** (`utils/graphqlArgsParser.ts`, `selection.ts`):
- собственный обход `info.fieldNodes` и `info.fragments` поверх `parseResolveInfo`, который
  `@defer` не видит:
  - `@defer(if:)` вычисляется по переменным;
  - поле отложено, только если оно не встречается вне отложенных фрагментов;
- отложенные поля помечаются в `QueryArgs`: `populate[key].deferred = true`;
- `$selection()` отдаёт признак отложенности, чтобы `$preload` делил загрузку.

**Исполнитель** (`executor.ts`):
- `loadInstance` для отложенных ключей кладёт в результат промис
  `result[key] = this.resolve(…)` с тем же отображением ошибок, что в `try`, и не добавляет его в
  `fieldTasks`;
- у промиса пустой `.catch`, чтобы не было необработанного отказа, когда graphql до поля не дошёл
  (например, родитель стал `null`).

**Адаптер результата** (`graphqlResult.ts`): `adaptResultForGraphql` цепляет `.then` к промисам.
graphql-js ждёт их внутри отложенной части.

**Остальные пути.** `__resolveReference` (`_entities`) и `createApolloFieldResolver` идут через тот
же разбор и исполнитель, отдельной правки им не нужно.

**Тесты:**
- отложенное поле не задерживает остальные;
- ошибка отложенного поля;
- поле и отложенное, и нет — исполняется один раз;
- `@defer(if: false)`.

### 5. Storefront-сервер listing на Yoga

`services/listing/src/api/graphql-storefront/server.ts`

- `createYoga({ schema: buildSubgraphSchema(modules), plugins: [useDeferStream(), …] })`.
  `useDeferStream` пересобирает схему через `toConfig()` и сохраняет `resolveReference` **[код]**.
- Маршрут fastify `POST /graphql` → `yoga.handleNodeRequestAndResponse`. Хуки `onRequest` и
  `preHandler` (`contextMiddleware.ts`) остаются. `context` Yoga строит тот же контекст из `req` и
  вызывает `setContext`.
- Плагины переходят на envelop **[решение]**:
  - `userErrorsPlugin`: `onExecuteDone` с `onNext`, правит каждую часть;
  - `cacheEnvelopePlugin`: пишет `extensions.cache` в **последнюю** часть, после того как counts
    SQL записал свои зависимости. Envelop-версия в `packages/request-context`;
  - наблюдаемость: envelop-адаптер в `packages/observability`, конец запроса по концу потока;
  - `formatError` → `maskedErrors` Yoga с той же развёрткой `ResolverError`.
- Плагины подписок, drain и `InlineTraceDisabled` уходят: подписок у listing нет. Apollo-версии
  плагинов остаются для других сервисов (`service-runtime`, `extensions/index.ts:197`).
- Admin-сервер listing не трогается.

### 6. Шлюз: патчи и настройка

`internal/infra/federation`, `.yarn/patches/`

Патчи включаются только для подграфов из списка `forwardDefer`. Как передать список в патч (поле
`subschemaConfig`, опция транспорта в `transportEntries` или переменная окружения), решается при
реализации патча.

1. **`@graphql-tools/delegate`**, дополнить существующий патч 12.1.1:
   - `filterSelectionSet` (`:1526`) и обработка `FRAGMENT_SPREAD` (`:1405`): для подграфа из
     `forwardDefer` в запросе `query` директива `@defer` сохраняется. `label` переписывается на
     уникальную метку шлюза, на контексте делегирования запоминается
     `метка → путь в ответе шлюза`;
   - `delegateRequest` (`:3060`): новая ветка перед `Repeater`, когда в запросе остался `@defer`:
     - первая часть проходит `transformResult` и отдаётся как обычный результат. Массив
       `_entities` дальше идёт через `batch-delegate` без изменений;
     - обход сырых данных первой части вешает на каждый объект под отложенным фрагментом
       `PENDING_DEFER = { promise, resolve, reject }`;
     - фоновый цикл читает остальные части. Для каждого `incremental[]` он находит объект по
       `path` в сырых данных, глубоко вливает `data`, аннотирует новые составные значения
       (`annotateExternalObject`), добавляет ошибки в `UNPATHED_ERRORS` объекта и разрешает его
       промис;
     - на `hasNext: false`, ошибке потока или `upstreamTimeout` все оставшиеся промисы
       разрешаются или отвергаются. Поток не может зависнуть;
   - `defaultMergedResolver` (`:2547`): ключа нет и есть `parent[PENDING_DEFER]` → вернуть
     `promise.then(() => ключ есть ? handleResult(…) : null)`.
2. **`@graphql-tools/executor-http`** 3.3.0, новый патч:
   - документ с `@defer` → `Accept: multipart/mixed;deferSpec=20220824, application/json`, без
     дедупликации в полёте (`:681`, `:826-840`);
   - `handleMultipartMixedResponse` (`:475-508`) отдаёт сырые части (`{data}`, затем
     `{incremental, hasNext}`), а не накопленный объект.
3. **`@graphql-tools/batch-execute`** 10.0.9, новый патч: запрос с `@defer` идёт в `executor(request)`
   напрямую, без префиксов `_v0_` и `splitResult`.
4. **`@graphql-tools/batch-delegate`**, новый патч: `batchFn` принимает результат первой части как
   массив. Это проверка того, что ветка из п. 1 отдаёт ему массив, а не `Repeater`.

Каждый патч правит `dist/index.js` и `dist/index.cjs` и добавляется в `resolutions` корневого
`package.json`, как существующие.

**Настройка и плагины:**
- `gateway-storefront.config.ts`: `deferStream: true`, `forwardDefer: ["listing"]`.
- `plugins/subgraph-cache`: потоковый ответ listing не кешируется (`uncached("stream")`).
  `extensions.cache` из последней части нужно прочитать и снять, чтобы теги ушли в CDN-плагин и
  не попали клиенту.
- `gateway-observability.ts`:
  - `duration_ms` подграфа по концу потока;
  - конец запроса клиента по `onEnd`, а не в `onResponse`;
  - ошибки из `incremental[].errors` считаются и логируются.
- Тесты в `gateway-storefront.config.test.ts` на подграфе-заглушке:
  - один запрос к подграфу с `@defer`;
  - `transformResult` и `_nullable_`-алиасы шлюза не клонируют объекты, вливание на месте работает;
  - счётчики всех значений уходят клиенту одной частью: все отложенные фрагменты ждут один промис;
  - части клиенту в правильных путях;
  - ошибка в поздней части;
  - обрыв потока подграфа (все промисы разрешены, ответ завершён);
  - родитель стал `null` до прихода части.

### 7. Клиент: SDK, runtime, тема

**Apollo** (`packages/shopana-storefront-sdk/src/graphql/apollo/Environment.ts`):
- `incrementalHandler: new Defer20220824Handler()` для браузера и сервера;
- `createSessionRetryLink`: ошибку сессии проверять только на первой части;
- `createQueryResultHoldLink` пропускает каждую часть (проверить тестом).

**SSR** (`runtime/src/core/page-services.ts`, `sdk/src/graphql/apollo/loadSerializableQuery.ts`):
- `loadQuery(document, variables, { until: 'initial' })` разрешается первой частью
  (`dataState: 'streaming'`) через `client.watchQuery`;
- запрос продолжает работать в клиенте запроса;
- `RequestResultCache` перезаписывается каждой частью, последняя полная (проверить тестом);
- при `streamTimeout` граница остаётся в fallback, и браузер перезапрашивает листинг: кеш без
  `complete`.

**Документы темы** (`templates/collection/apollo`, `templates/search/apollo`):
- `ListingFiltersFragment`, как в разделе «Документ», с `@include(if: $withFilters)`;
- товары во `ListingProductConnectionFragment` без `filters`;
- `getNextVariables` в `pagination.ts` ставит `withFilters: false`: «Показать ещё» без фасетов;
- черновик drawer: тот же фрагмент с `first: 0`. `totalCount` и структура приходят первой
  частью, счётчики второй.

**Данные и отображение** (`templates/collection`):
- `types.ts:15`: `count: number | null`. Codegen типизирует отложенный фрагмент объединением
  «есть / нет», маппер превращает отсутствие в `null`.
- `useListing`:
  - `streaming`: показывать счётчики прошлого результата у групп, которые не изменились, у
    `changedHandles` — `null`;
  - `complete`: новые.
- `ListingFilter` в Suspense-границе. Граница ждёт `dataState === 'complete'` запроса страницы
  (подписка на его `ObservableQuery`). `fallback` — тот же `ListingFilter` с
  `FilterCountsLoadingContext` «все группы».
- `atoms/Filters/*`:
  - `count === null`: скелетон, значение не отключено;
  - `count === 0`: отключено, как сейчас.

### 8. Mock server (`storefront/mockServer`)

- `createYoga({ plugins: [useDeferStream()] })`.
- `FilterValue.count` с задержкой, чтобы в dev и Storybook были видны две части.
- Тест: две части; список значений не зависит от `filters`.

### 9. Проверка и выкладка

**Проверка:**
- **internal:**
  - тесты фреймворка (этап 4), шлюза (этап 6), репозитория и резолверов (этапы 1–3);
  - `_entities` с `@defer` на Yoga-сервере listing;
  - e2e `e2e/tests/v.1/listing-e2e-api`.
- **storefront:** тесты `Environment`, `loadQuery`, `useListing`, маппера.
- **stage, в браузере:**
  - один запрос `multipart/mixed`;
  - в логах шлюза один запрос к listing;
  - части доходят раздельно через cloudflared и край Cloudflare;
  - SSR стримит границу, гидратация без повторных запросов.

**Выкладка.** Слоёв совместимости нет (AGENTS.md). Порядок:
1. listing на Yoga, фреймворк, SQL и резолверы. Шлюз пока вырезает `@defer`, listing отвечает
   одной частью.
2. Патчи шлюза и `deferStream`.
3. SDK, runtime и тема одной выкладкой.

## Цена и риски

- **Патчи шлюза.** Это четыре пакета `@graphql-tools`, около 150–250 строк. Каждое обновление
  Hive Gateway требует переноса патчей. Hive Router `@defer` не поддерживает
  (`internal/plans/hive-router-migration.ru.md`), при переходе на него вся работа этапа 6 теряется.
- **Кеш.** Потоковые ответы не кешируются ни CDN-воркером, ни плагином `cdn`, ни `subgraph-cache`.
  Клиентские переходы по листингу идут мимо Cloudflare и мимо кеша подграфов шлюза. Кеш listing
  (`structure`, счётчики без фильтров) остаётся.
- **Склейка.** Запросы к listing с `@defer` не склеиваются с соседними запросами к listing.
- **Зависания.** Каждый `PENDING_DEFER` должен разрешиться при любом исходе потока. Для этого нужны
  тесты обрыва и `null`-родителя.
- **Форматы.** Весь путь держится на спецификации 2022-08-24. Новый формат (`pending`,
  `completed`, `id`) не поддерживает ни `executor-http`, ни `Defer20220824Handler`.
- **Объём частей.** `@defer` на каждом значении даёт по записи `incremental` с `path` на каждое
  значение.

## Открытые решения владельца

1. Видимость всех групп по скоупу вместо `count > 0` (этап 3). Обязательно для `@defer`.
2. Границы цены по скоупу или под фильтрами (этап 1).
3. Сортировка, лимит и предок категорий по счётчикам скоупа (этап 1).
4. Потеря кеша CDN и подграфов шлюза для листингов с `@defer`.
5. Поддержка патчей `@graphql-tools` до перехода на Hive Router или отказ от перехода.
