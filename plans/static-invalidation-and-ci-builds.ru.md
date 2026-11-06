# Инвалидация статики в Node-приложении темы и сборка через GitHub Actions

Дополняет и частично заменяет разделы «Инвалидация и перегенерация» и «Полная сборка в GitHub
Actions» плана `plans/static-site-generation.ru.md`. Отправитель событий описан в
`internal/plans/webhooks-service.ru.md`.

## Вывод

**Отдельного сообщения `storefront.invalidate` нет.** Тема подписывается на обычные вебхуки
internal: создаёт в admin endpoint со списком топиков (`productUpdated`, `categoryUpdated`,
`pageUpdated`, …) и получает данные события как есть. Решение «какие страницы затронуты» целиком
на стороне темы: только она знает, какие данные попали в какую страницу.

**Рендер выполняется только в GitHub Actions.** Node-приложение темы рендер не запускает. Оно
принимает вебхуки, хранит индекс зависимостей страниц и очередь, и через REST API GitHub ставит
workflow сборки. Это роль того же образа: `storefront-runtime static coordinator`, отдельный сервис
`theme-static` в Swarm с одной репликой и volume. SSR-реплики `theme` остаются без состояния.

**Workflow GitHub — только сигнал, работа лежит в очереди координатора.** Запущенный job забирает
у координатора все накопленные задания под аренду, рендерит их, публикует в R2, чистит CDN и
возвращает метаданные страниц. Метаданные включают зависимости, хэши и `validUntil`. Это снимает
главное ограничение GitHub: в группе `concurrency` ждёт только один запуск, а более новый
ожидающий запуск отменяет предыдущий. Отменённый запуск ничего не терял, потому что не успел
ничего забрать. Ещё один плюс: списки путей не упираются в лимит размера `inputs`.

**Индекс — обратный: от зависимости к страницам**, с видом зависимости и битовой маской
«аспектов». Он отвечает на вопрос «на каких страницах есть товар X в той части, которую изменил
`productUpdated`». Например, смена остатка не перерисовывает страницы, где товар показан только
в хлебных крошках. Индекс строится из нормализованного кеша Apollo, отрендеренного в job, поэтому
теме не нужно вручную описывать свои запросы.

## Поток

```text
admin: endpoint вебхука темы (топики каталога, контента, магазина)
internal events ──► webhooks ──POST /__builder/hooks/shopana──► theme-static (координатор)
                                                                │ проверка подписи, дедупликация
                                                                │ событие → изменения → страницы
                                                                │ очередь jobs (SQLite)
                                                                ▼
                                    GitHub REST: workflow_dispatch static-site.yml {mode: queue}
                                                                │
GitHub Actions job (образ темы) ◄──── POST /__builder/api/leases (OIDC) ─┘
   │ render → R2 → purge Cloudflare
   └──► POST /__builder/api/leases/:id/results (страницы, зависимости, хэши, validUntil)
                                                   │
                                          индекс обновлён, аренда закрыта
```

Задержка от изменения в admin до CDN:

- events и вебхук: 1–6 с;
- накопление в координаторе: 20 с;
- запуск job и загрузка образа: 30–60 с;
- рендер: секунды.

Итого 1–1,5 минуты против секунд у builder-а в Swarm из исходного плана. Это цена решения «всё
генерирует CI». Если её окажется много, тот же протокол аренды позволяет подключить
self-hosted runner на ноде Swarm без изменения координатора (см. «Риски»).

## Подписка темы на вебхуки

- Endpoint создаётся в admin (`system/webhooks`) на URL `https://<storefront-host>/__builder/hooks/shopana`.
  Секрет кладётся в secret стека `theme-static` как `SHOPANA_WEBHOOK_SECRETS`. Это список через
  запятую: на время ротации в нём лежат два секрета.
- Список топиков фиксирован в SDK: `STATIC_WEBHOOK_TOPICS` в `@shopana/storefront-sdk/static`.
  Команда `storefront-runtime static webhook-topics` печатает его для вставки в admin. Если
  приходит топик, которого нет в списке маппера, событие сохраняется, логируется и больше ничего
  не вызывает.
- Подпись проверяет `verifyShopanaWebhook` из пакета internal. Окно timestamp 5 минут. Ответ
  `401` без подробностей.
- Дедупликация по `x-shopana-delivery-id` (таблица `webhook_receipts`). Повтор той же доставки
  получает `200` без обработки.
- Ответ `200` отправляется после фиксации транзакции SQLite. Транзакция включает запись
  получения, разбор в изменения и постановку jobs, на всё уходит меньше 50 мс. Рендер в запросе
  не выполняется.
- Порядок событий неважен. Job всегда перечитывает текущее состояние через Storefront API, поэтому
  `productUpdated`, пришедший после `productDeleted`, просто ещё раз увидит `not-found`.

## Индекс: структура данных

SQLite (`better-sqlite3`, WAL) на volume `theme-static-data`. Единственный писатель — процесс
координатора.

```sql
-- Опубликованные (или известные) страницы.
CREATE TABLE pages (
  id            INTEGER PRIMARY KEY,
  locale        TEXT NOT NULL,              -- сегмент локали, '' для локали по умолчанию
  path          TEXT NOT NULL,              -- '/products/apple-chips'
  route         TEXT NOT NULL,              -- 'product' | 'category' | 'collection' | 'vendor' | 'page' | 'home' | …
  owner_key     TEXT,                       -- 'Product:<uuid>' для страницы сущности, NULL для home и т. п.
  status        TEXT NOT NULL,              -- 'published' | 'gone'
  html_hash     TEXT,
  data_hash     TEXT,
  build_id      TEXT NOT NULL,              -- серверный бандл, которым отрендерено
  render_started_at INTEGER NOT NULL,       -- мс; граница для схлопывания jobs
  rendered_at   INTEGER NOT NULL,
  valid_until   INTEGER,                    -- минимум по промо и окнам; NULL = бессрочно
  UNIQUE (locale, path)
);
CREATE INDEX pages_owner ON pages (owner_key, locale);
CREATE INDEX pages_valid_until ON pages (valid_until) WHERE valid_until IS NOT NULL;

-- Обратный индекс: зависимость → страницы.
CREATE TABLE page_deps (
  dep_key  TEXT NOT NULL,                   -- 'Product:<uuid>', 'Category:<uuid>#products', 'Query#products'
  kind     INTEGER NOT NULL,                -- 1 entity, 2 list, 3 query
  aspects  INTEGER NOT NULL,                -- битовая маска, см. ниже
  page_id  INTEGER NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  PRIMARY KEY (dep_key, page_id)
) WITHOUT ROWID;
CREATE INDEX page_deps_page ON page_deps (page_id);

-- Очередь.
CREATE TABLE jobs (
  id          INTEGER PRIMARY KEY,
  locale      TEXT NOT NULL,
  target      TEXT NOT NULL,                -- 'path:/products/x' или 'owner:Product:<uuid>'
  priority    INTEGER NOT NULL,             -- 0 своя страница сущности, 1 листинги, 2 прочее, 3 таймеры и сверка
  reasons     TEXT NOT NULL,                -- JSON: [{ topic, eventId, depKey }], до 20 записей
  created_at  INTEGER NOT NULL,
  not_before  INTEGER NOT NULL,
  state       TEXT NOT NULL,                -- 'queued' | 'leased'
  lease_id    TEXT,
  attempts    INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX jobs_queued_target ON jobs (locale, target) WHERE state = 'queued';
CREATE INDEX jobs_ready ON jobs (state, not_before, priority);

CREATE TABLE leases (
  id TEXT PRIMARY KEY, request_id TEXT, run_id TEXT, run_attempt INTEGER,
  mode TEXT NOT NULL, created_at INTEGER, heartbeat_at INTEGER, expires_at INTEGER,
  state TEXT NOT NULL                       -- 'active' | 'completed' | 'expired'
);

CREATE TABLE dispatches (                   -- запросы workflow_dispatch
  request_id TEXT PRIMARY KEY, mode TEXT NOT NULL, reason TEXT,
  dispatched_at INTEGER, claimed_at INTEGER, run_id TEXT, state TEXT NOT NULL
);

CREATE TABLE webhook_receipts (
  delivery_id TEXT PRIMARY KEY, event_id TEXT, topic TEXT, received_at INTEGER, changes INTEGER
);
```

Оценка объёма:

- текущие фикстуры дают около 3 000 страниц (1 000 товаров, 145 категорий, около 330 вендоров,
  две локали);
- в среднем около 60 зависимостей на страницу: в листинге 24 карточки с медиа и вендором, у
  товара похожие товары и отзывы;
- итого около 180 000 строк `page_deps`, меньше 30 МБ;
- поиск по `dep_key` идёт по первичному ключу, на одно событие уходят миллисекунды.

### Ключи зависимостей

Все ключи нормализуются в `<Typename>:<uuid>`. Global ID из кеша Apollo
(`Product:<base64url>`) декодируется тем же кодеком, что в internal (`packages/graphql-global-id`).
Его копия на 30 строк живёт в SDK. Global ID из вебхука декодируется так же. Индекс не зависит от
кодирования, а ключи совпадают со словарём тегов `${service}:${name}:${id}` из исходного плана
с точностью до префикса.

| Вид (`kind`) | Ключ                                   | Откуда берётся в снимке Apollo                                                          | Что означает                                        |
| ------------ | -------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------- |
| entity (1)   | `Product:<uuid>`                       | нормализованный объект `Product:…` (так же `ProductVariant`, `Category`, `Collection`, `Vendor`, `OnlineStorePage`, `OnlineStoreNavigationMenu`, `MediaImage`, `Store`) | страница показывает поля сущности                   |
| list (2)     | `Category:<uuid>#products`             | поле-connection на сущности: `Category:….products({…})`, `Collection:….products`, `Vendor:….products`, `Product:….relatedProducts`, `Product:….reviews` | страница показывает **состав** списка владельца     |
| query (3)    | `Query#products`, `Query#dynamicCollection`, `Query#storefrontPromotions`, `Query#search` | корневое поле `ROOT_QUERY` со списком без владельца-сущности (главная, «новинки», динамические коллекции) | страница показывает выборку, которую может изменить любое изменение каталога в аспекте маски |

Страница своей сущности дополнительно записывает `owner_key` из параметров маршрута и `preload`.
По нему job вида `owner:` находит старый путь, если у сущности изменился handle.

### Аспекты

Битовая маска указывает, какие части сущности страница реально показывает. Аспекты страницы
вычисляются из полей объекта в снимке по таблице `STATIC_FIELD_ASPECTS` в SDK. Тема может её
дополнить в `static.config.ts`. По умолчанию поле относится к `content`.

| Бит | Аспект       | Поля (пример для `Product`)                                         | Причины `productUpdated.reasons` |
| --- | ------------ | ------------------------------------------------------------------- | -------------------------------- |
| 1   | `content`    | `title`, `handle`, `description`, `seo`, `tags`, `options`           | `content`, `seo`, `options`, `tags`, прочие и неизвестные |
| 2   | `pricing`    | `priceRange`, `compareAtPriceRange`, `variants.price`, промо-бейдж   | `pricing`, `variant`             |
| 4   | `inventory`  | `availableForSale`, `quantityAvailable`                             | `inventory`, `variant`           |
| 8   | `media`      | `featuredImage`, `media`                                            | `media`                          |
| 16  | `membership` | только у list и query: состав списка                                | `category`, `collection`, `vendor`, `publication`, `status` |
| 32  | `reviews`    | `reviewsSummary`, `rating`, `reviews`                               | топики `review*`, `productQuestion*` |
| 64  | `loyalty`    | `loyaltyOpportunity`                                                | топики `loyaltyProgram*`         |
| 128 | `translation`| любое переводимое поле в нелокали по умолчанию                      | `resourceTranslationsUpdated`    |

Пример: товар в карточке категории даёт `entity Product:A` с маской `content|pricing|inventory|media`.
Тот же товар в хлебных крошках или в «недавно смотрели» даёт только `content`. Изменение
`inventory` перерисует категорию, но не страницы с крошками.

Таблица полей хранится в SDK рядом с type policies (`graphql/apollo/cache.ts`). Её проверяет
тест: каждое поле каждого фрагмента темы получает аспект явно или по умолчанию, и новые поля
не теряются молча.

### Извлечение зависимостей из снимка

`extractPageDeps(snapshot, fieldAspects)` в `@shopana/storefront-sdk/static`:

1. Для каждого ключа `Typename:id` из снимка добавить `entity`-зависимость. Маска — объединение
   аспектов присутствующих полей.
2. Для каждого поля вида `products({…})`, `relatedProducts`, `reviews(...)` у объекта-владельца
   добавить `list`-зависимость `<Owner>#<field>` с аспектами `membership` и аспектами элементов
   списка. Порядок сортировки зависит от цены или остатка, поэтому их изменения меняют и
   состав первой страницы.
3. Для каждого поля `ROOT_QUERY` со списком (кроме `xByHandle`, это ссылки на сущности) добавить
   `query`-зависимость `Query#<field>` с такими же правилами маски.
4. `DynamicCollection` без id (`cache.ts`) — это `query`-зависимость `Query#dynamicCollection`.
   Её правила ссылаются на категории, теги и вендоров, и состав может изменить любой товар.
5. Объекты, общие для каждой страницы (`Store`, меню шапки и подвала), помечаются как
   `layout`-ключи. В `page_deps` они не пишутся, иначе каждая страница имела бы одни и те же
   тысячи строк. Их изменения обрабатываются как полная сборка (см. ниже).

## Событие → изменения → страницы

`mapWebhookToChanges(envelope) → Change[]`, где
`Change = { key, kinds, aspects, own?: { route, owner }, gone?: boolean, full?: boolean, locales? }`.
Маппер — чистая функция в SDK с таблицей по топикам:

| Топик                                                            | Изменения                                                                                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `productUpdated`                                                 | `Product:<id>` entity с аспектами из `reasons`; своя страница; при `membership`-причинах `Category:<id>#products` для `affectedCategoryIds`, `Collection:<id>#products` для `affectedCollectionIds`, `Query#products`, `Query#dynamicCollection` |
| `productCreated`                                                 | своя страница (job `owner:`, путь определит рендер; не видна гостю → ничего); `Query#products`, `Query#dynamicCollection` с `membership` |
| `productDeleted`                                                 | своя страница `gone`; `Product:<id>` entity все аспекты (карточки у похожих); `Category:<id>#products` по `categoryIds`, коллекции, вендор, `Query#*` с `membership` |
| `categoryCreated/Updated`, `collection*`, `vendor*`               | своя страница; entity с `content`; `list` своего `#products` с `membership` при `reasons` о правилах коллекции                     |
| `*Deleted` для них                                                | своя страница `gone`; entity все аспекты                                                                                        |
| `tag*`                                                           | `Query#dynamicCollection` с `membership` (теги видны только через правила и фильтры)                                            |
| `pageCreated/Updated/Deleted`                                    | своя страница `/pages/:handle` (`gone` при удалении); entity `OnlineStorePage:<id>`                                             |
| `navigationMenu*`, `storeUpdated`, `storeLocalesUpdated`, `storeConfigurationUpdated` | `full`                                                                                     |
| `discount*`                                                      | `full` с аспектом `pricing`: все страницы, где есть хотя бы одна зависимость с битом `pricing` (у скидки нет списка товаров в событии) |
| `review*`, `productQuestion*`                                    | `Product:<data.productId>` entity с `reviews`; `Product:<id>#reviews` list                                                      |
| `reviewStoreConfigurationUpdated`, `loyaltyProgram*`             | все страницы с аспектом `reviews` / `loyalty`                                                                                   |
| `resourceTranslationsUpdated`                                    | entity `<resourceType>:<resourceId>` с `translation`, только локали из `data.locales`                                           |
| `fileUpdated`, `fileDeleted`                                     | `MediaImage:<id>` entity с `media`                                                                                              |
| `listingFacetMembershipChanged`, `facet*`                        | все `list` и `query` зависимости с `membership` (фильтры листингов)                                                             |

Поиск страниц по изменению:

```sql
SELECT p.id, p.locale, p.path, p.route
FROM page_deps d JOIN pages p ON p.id = d.page_id
WHERE d.dep_key = ?1 AND d.kind IN (…) AND (d.aspects & ?2) != 0 AND p.status = 'published'
  AND (?3 IS NULL OR p.locale IN (SELECT value FROM json_each(?3)));
```

Своя страница добавляется независимо от индекса. Для новой сущности её ещё нет в `pages`,
поэтому ставится job `owner:<key>` во всех локалях.

**Эскалация в полную сборку.** Изменение `full` сразу становится полной сборкой. Изменение
`full` с маской (скидка, лояльность) перерисовывает только страницы с этим аспектом. Если
одно событие затрагивает больше 40 % опубликованных страниц или больше 1 500 страниц,
координатор ставит одну полную сборку вместо тысяч отдельных jobs.

**Схлопывание.** На каждую пару `(locale, target)` в очереди максимум один job. Новый повод
дописывается в `reasons`, приоритет берётся минимальный. Результат рендера с
`render_started_at = T` удаляет все `queued` jobs этой страницы с `created_at < T`. Так полная
сборка поглощает накопившиеся точечные изменения, а изменение, пришедшее во время рендера,
остаётся в очереди и перерисует страницу ещё раз.

**Отставание кешей.** Если Storefront API отдаёт данные из Redis-кеша internal с TTL, job
получает `not_before = received_at + STATIC_READ_LAG_MS`, по умолчанию 0. Значение берётся из
фактической инвалидации кешей storefront в internal и проверяется на этапе 0.

## Источники jobs помимо вебхуков

- **Таймеры.** Scheduler каждые 30 с ставит страницы с `valid_until <= now` с приоритетом 3.
- **Сверка.** Раз в час координатор читает `updatedAt` товаров, категорий, коллекций, вендоров
  и страниц через Storefront API постранично (`first: 250`, сортировка по `updatedAt`, только
  записи новее последней сверки) и ставит страницы, у которых `rendered_at < updatedAt`. Это
  страховка от потерянных вебхуков: endpoint был выключен или доставка ушла в `FAILED`.
- **Промах SSR.** Сервис `theme` после рендера адреса, которого нет в статике (Worker пометил
  промах заголовком `x-shopana-static-miss: 1`), вызывает по внутренней сети
  `POST http://theme-static:3100/__builder/api/builds {mode: 'paths'}`.
- **Новый образ темы.** Деплой `deploy-theme.mjs` после смены `THEME_IMAGE` ставит полную сборку
  через тот же API с `image` нового релиза.
- **Ночная страховка.** Cron в workflow GitHub (см. ниже) вызывает полную сборку. Путь тот же:
  сначала запрос в координатор, потом аренда.

## REST API координатора

Одни и те же ручки на внутреннем порту `3100` и через Tunnel на публичном
hostname под `/__builder/*`. Worker из исходного плана перехватывает только HTML-маршруты и
`/__static/data/*`, поэтому префикс `/__builder` с ним не пересекается.

| Метод и путь                                   | Кто вызывает                 | Авторизация               | Назначение                                                                 |
| ---------------------------------------------- | ---------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| `POST /__builder/hooks/shopana`                | webhooks internal            | подпись вебхука           | приём события                                                              |
| `POST /__builder/api/builds`                   | оператор, CLI, `theme`, CI   | operator token или OIDC   | `{mode: 'full' \| 'paths' \| 'entities', paths?, entities?, locales?, reason, image?}` → `202 {requestId}`; ставит jobs и запускает dispatch |
| `GET /__builder/api/builds/:requestId`         | оператор, CLI                | operator token            | статус: jobs в очереди и в работе, `run_id`, ссылка на запуск              |
| `GET /__builder/api/pages?dep=Product:<uuid>`  | оператор                     | operator token            | отладка индекса: какие страницы зависят от ключа и почему                  |
| `GET /__builder/api/status`                    | мониторинг                   | operator token            | размер очереди, активная аренда, последняя полная сборка, возраст индекса  |
| `POST /__builder/api/leases`                   | job GitHub Actions           | OIDC GitHub               | `{requestId, runId, runAttempt, capacity}` → `{leaseId, mode, buildRef, jobs[], expiresAt}`; пустой `jobs` = очередь пуста |
| `POST /__builder/api/leases/:id/heartbeat`     | job                          | OIDC                      | продление аренды на 3 минуты                                               |
| `POST /__builder/api/leases/:id/results`       | job                          | OIDC                      | NDJSON по странице: `{jobIds, locale, path, route, ownerKey, outcome: 'published' \| 'unchanged' \| 'gone' \| 'failed', htmlHash, dataHash, deps, validUntil, renderStartedAt, error?}` |
| `POST /__builder/api/leases/:id/complete`      | job                          | OIDC                      | закрыть аренду; не вернувшиеся jobs обратно в очередь                      |

- **OIDC.** Job получает токен GitHub (`permissions: id-token: write`, audience
  `shopana-static-coordinator`). Координатор проверяет подпись по JWKS
  `token.actions.githubusercontent.com` и claims `repository`, `workflow_ref` (только
  `static-site.yml@refs/heads/main`) и `environment` (совпадает с окружением координатора). Общего
  секрета между CI и координатором нет.
- **Operator token** — длинный случайный токен из secret стека. Он нужен для ручных вызовов и
  деплоя.
- `deps` в результатах уже нормализованы: `[{ key, kind, aspects }]`. Запись результата —
  одна транзакция на страницу: `pages` upsert, `page_deps` замена набора, удаление поглощённых
  jobs. `gone` переводит страницу в `status = 'gone'` и удаляет её зависимости.
- Задание, которое трижды вернулось с `failed` или с истёкшей арендой, уходит в `dead_jobs` и
  видно в `status`. Страница при этом остаётся в прошлой версии, а не исчезает.

## GitHub Actions

### Workflow `.github/workflows/static-site.yml`

```yaml
name: Static site
run-name: static ${{ inputs.mode }} ${{ inputs.environment }} ${{ inputs.request_id || github.run_id }}

on:
  workflow_dispatch:
    inputs:
      environment: { type: choice, options: [stage, production], required: true }
      mode: { type: choice, options: [queue, full, paths], default: queue }
      request_id: { type: string, required: false }   # ставит координатор
      paths: { type: string, required: false }        # для mode=paths: через пробел или перевод строки
      locales: { type: string, required: false }
      image: { type: string, required: false }        # тег или digest образа темы; пусто = текущий релиз окружения
      reason: { type: string, required: false }
  schedule:
    - cron: '30 1 * * *'                               # ночная полная сборка (UTC), для обоих окружений матрицей

permissions:
  contents: read
  id-token: write
  packages: read

concurrency:
  group: static-site-${{ inputs.environment || 'scheduled' }}
  cancel-in-progress: false
```

Один job `render`, `environment: ${{ inputs.environment }}`, `timeout-minutes: 45`:

1. `docker login ghcr.io` и `docker pull` образа `image`. Если `image` пуст — образ, который
   координатор вернул в `GET /__builder/api/status` (`currentImage`).
2. Если `mode` не `queue` (ручной запуск из UI или `gh`, cron), запрос сначала регистрируется в
   координаторе: `POST /__builder/api/builds {mode, paths, locales, reason}`. Благодаря этому
   ручной запуск попадает в общую очередь и не пропадёт, даже если его job вытеснит следующий.
3. `docker run … storefront-runtime static run --coordinator "$COORDINATOR_URL" --request-id …
   --run-id "$GITHUB_RUN_ID" --budget 35m`. Цикл: аренда → рендер пачки (до 500 jobs, пул
   `worker_threads`, `concurrency` из `static.config.ts`) → загрузка в R2 изменившихся объектов →
   purge Cloudflare по URL пачками по 30 → результаты → следующая аренда. Цикл продолжается, пока
   очередь не пуста или не кончился бюджет. Изменения, пришедшие во время работы, забирает этот
   же запуск.
4. В режиме `full` первая аренда возвращает `mode: 'full'`. Job перечисляет все адреса по
   `static.config.ts`, рендерит их и отправляет результаты с флагом `fullBuild`. Затем
   `complete` с `{fullBuild: true, seenPages}`, и координатор переводит в `gone` страницы, которых
   нет в сборке. Объекты в R2 удаляются через 7 дней, как в исходном плане.
5. После `full` выполняется smoke против CDN, как `smoke` в `deploy-theme.mjs`.

Секреты окружения GitHub (`stage`, `production`): `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`CLOUDFLARE_PURGE_TOKEN`, `STOREFRONT_SERVER_GRAPHQL_URL`, `SHOPANA_STOREFRONT_PRIVATE_TOKEN`;
переменная `COORDINATOR_URL`. Токена координатора нет, вместо него OIDC.

### Запуск через REST API GitHub

Координатор ставит workflow сам:

```http
POST https://api.github.com/repos/shopanaio/storefront/actions/workflows/static-site.yml/dispatches
Authorization: Bearer <installation token GitHub App>
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28

{ "ref": "main",
  "inputs": { "environment": "stage", "mode": "queue",
              "request_id": "d-20261106-120000-7f3a", "reason": "productUpdated×14, timers×2" } }
```

- **Авторизация** — GitHub App `shopana-static-dispatch` с одним разрешением
  `Actions: Read and write`, установленный только в репозиторий тем. Координатор хранит
  `app_id`, `installation_id` и приватный ключ в secret стека и обновляет installation token раз в
  50 минут. Fine-grained PAT с тем же правом допустим на stage, но истекает и привязан к
  человеку.
- **Связь запроса и запуска.** Ответ dispatch не используется для определения run id: запуск сам
  сообщает `request_id` и `GITHUB_RUN_ID` при первой аренде. Координатор считает запрос
  `claimed`.
- Правила dispatch:
  - **Накопление.** Первый job после простоя запускает таймер на 20 с, следующие его не
    продлевают. Между двумя dispatch проходит не меньше 60 с.
  - **Один незабранный запрос.** Пока последний dispatch не забран первой арендой, новых нет.
    Если он не забран за 10 минут (GitHub не выделил runner или dispatch потерялся), запрос
    помечается `stale` и ставится новый.
  - **Активная аренда.** Пока у работающего запуска не кончился бюджет, новые jobs заберёт он.
    Dispatch ставится, только когда аренда закрыта, а очередь не пуста, или когда до конца
    бюджета меньше 3 минут. В группе `concurrency` новый запуск ждёт текущий.
  - **Полная сборка.** `mode: full` ставится так же. Если в очереди одновременно `full` и точечные
    jobs, их обработает один запуск.
- Ручной запуск без координатора:

  ```bash
  gh workflow run static-site.yml -f environment=stage -f mode=paths -f paths="/products/apple-chips /uk/categories/snacks"
  ```

  или через API координатора, что предпочтительнее, потому что сразу виден статус:

  ```bash
  curl -X POST "$COORDINATOR_URL/__builder/api/builds" -H "Authorization: Bearer $STATIC_OPERATOR_TOKEN" -d '{"mode":"entities","entities":["Product:0196…"],"reason":"manual"}'
  ```

## Восстановление индекса

Индекс — производные данные. Его потеря не теряет сайт, а только точность инвалидации до
следующей полной сборки.

- Раз в сутки и после каждой полной сборки координатор делает `VACUUM INTO` и кладёт снимок в R2
  `__builder/index/<date>.sqlite.gz`. Хранятся последние 7 снимков.
- При старте с пустым volume координатор восстанавливает последний снимок. Если снимка нет,
  ставит `full`. Вебхуки, пришедшие между снимком и рестартом, догоняет сверка по
  `updatedAt`.
- Таблица `dispatches` и аренды после восстановления сбрасываются. Активный запуск получит
  `410` на heartbeat и завершится, его jobs возвращаются в очередь по истечении аренды.

## Изменения по репозиториям

### `@shopana/storefront-sdk/static`

1. Добавить `extractPageDeps`, `STATIC_FIELD_ASPECTS`, `mapWebhookToChanges`, `STATIC_WEBHOOK_TOPICS`
   и декодер global ID.
2. Перевести `verifyShopanaWebhook` на зависимость от пакета internal.
3. Добавить тест покрытия аспектов полями фрагментов темы.

### `@shopana/storefront` (runtime)

1. Добавить роль `static coordinator`:
   - HTTP-сервер на `3100`;
   - SQLite-схема и миграции схемы при старте;
   - приём вебхука, очередь, dispatcher, клиент GitHub App;
   - проверка OIDC;
   - таймеры, сверка, снимки индекса в R2.
2. Добавить команду `static run` (клиент аренды для CI), выделенную из builder-а исходного плана:
   рендер, публикация и purge остаются там.
3. Добавить в SSR `theme` вызов `POST /__builder/api/builds` при промахе статики. Вызов
   неблокирующий, раз в 60 с на путь.

### Тема `brand-bite-crunch`

1. В `static.config.ts` при необходимости дополнить `fieldAspects` для полей темы.
2. Добавить `.github/workflows/static-site.yml`.

### Инфраструктура

1. `deploy/swarm/theme.yml`:
   - сервис `theme-static` из `THEME_IMAGE`, `replicas: 1`;
   - volume `theme-static-data`, placement по метке ноды с volume;
   - `stop_grace_period: 30s`, healthcheck `GET /__builder/api/health`.
2. Добавить ingress Tunnel `/__builder/*` → `theme-static:3100`.
3. Добавить секреты стека: `SHOPANA_WEBHOOK_SECRETS`, `STATIC_OPERATOR_TOKEN`, ключ GitHub App,
   ключи R2 для снимков индекса.
4. В `deploy-theme.mjs`:
   - учесть `theme-static` в `check`, `deploy` и `status`;
   - после смены образа вызывать `POST /__builder/api/builds {mode:'full', image}`.
5. GitHub:
   - App `shopana-static-dispatch`;
   - окружения `stage` и `production` с секретами R2 и Cloudflare;
   - правило защиты `production` без ручного approval, иначе dispatch будет ждать человека.

### `internal`

Изменения описаны в `internal/plans/webhooks-service.ru.md`: сервис `webhooks`, каталог топиков,
admin UI. От темы нужен только endpoint в admin со списком `STATIC_WEBHOOK_TOPICS`.

## Тестирование

- **Unit SDK:**
  - `extractPageDeps` на снимках реальных страниц (товар, категория, главная, страница контента);
  - аспекты карточки и крошек;
  - `DynamicCollection` → `query`;
  - layout-ключи не попадают в зависимости.
- **Unit маппера:**
  - каждый топик из `STATIC_WEBHOOK_TOPICS` даёт ожидаемые изменения;
  - `productUpdated` с `reasons: ['inventory']` не трогает страницы, где товар есть только с
    `content`.
- **Координатор (интеграционные тесты на временной SQLite):**
  - подпись и дедупликация;
  - схлопывание jobs и поглощение результатом с `renderStartedAt`;
  - эскалация в `full`;
  - истечение аренды;
  - `gone` при `fullBuild`;
  - правила dispatch: окно накопления, один незабранный запрос, `stale`.
- **Контракт GitHub:** мок `api.github.com` проверяет тело dispatch и обновление installation
  token. Мок JWKS проверяет claims OIDC.
- **E2E stage:**
  1. изменить цену товара в admin;
  2. дождаться вебхука, dispatch и аренды;
  3. проверить, что HTML товара и категорий с карточкой в R2 обновился, а страницы, где товар
     только в крошках, нет;
  4. проверить время до CDN.

## Этапы

1. **Этап 0, измерения.**
   - Время запуска job с загрузкой образа.
   - Реальное число зависимостей на страницу.
   - Задержка кешей Storefront API после события (`STATIC_READ_LAG_MS`).
2. **Индекс без координатора.** `extractPageDeps`, аспекты, маппер и `static run` в локальном
   режиме: CLI читает события из файла и рендерит затронутые страницы в каталог.
3. **Координатор:** вебхук, очередь, индекс, REST API, аренды, снимки.
4. **GitHub Actions:** workflow, OIDC, GitHub App, dispatcher.
5. **Swarm и Tunnel**, endpoint вебхука на stage, сверка и таймеры.
6. **Production** после недели на stage без ручных полных сборок.

Этап 3 начинается после того, как в internal готов этап 3 плана вебхуков. До этого координатор
проверяется на записанных конвертах.

## Риски и открытые вопросы

- **Минуты GitHub Actions.** Каждый запуск стоит примерно 1–2 минуты runner-а с загрузкой образа.
  При активном редактировании каталога окно в 60 с между dispatch даёт до 60 запусков в час.
  Если квоты частного репозитория не хватит, есть два варианта: увеличить окно или подключить
  self-hosted runner с меткой `static` на ноде Swarm. Протокол аренды и workflow при этом не
  меняются, меняется только `runs-on`.
- **Задержка 1–1,5 минуты** против секунд у builder-а в Swarm. Для цен и остатков это
  компенсирует слой 2 (GET persisted documents с коротким TTL) и клиентское уточнение остатков из
  исходного плана.
- **Скидки.** Без списка товаров в событии `discount*` перерисовывает все страницы с `pricing`, то
  есть почти весь сайт. Это решается, если `discountUpdated` начнёт сообщать затронутые
  товары или категории. Это доработка pricing, она не входит в первую версию.
- **Единственная реплика координатора.** Пока он недоступен, вебхуки получают ошибку соединения
  от Tunnel, и internal повторяет их до 35 часов. Сайт продолжает отдаваться из R2. Отдельное HA
  не требуется.
- **Изменение handle.** Job `owner:` рендерит новый путь и переводит старый в `gone`. Редирект со
  старого адреса — вопрос темы и SEO, вне этого плана.
