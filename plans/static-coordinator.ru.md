# Координатор статики: точечная инвалидация, быстрые данные и кеш CDN

Один план всего, что осталось после реализованной статики (`plans/static-site-generation.ru.md`,
этапы 0–6): координатор `theme-static` с индексом зависимостей и очередью, быстро меняющиеся данные
вне HTML, рендер в GitHub Actions, Worker и кеш CDN (шаг B), кеш GraphQL `GET`. Заменяет прежние
отдельные планы инвалидации и быстрых данных и разделы основного плана о шаге B и слое 2.

**Состояние.** Этапы 1, 2, 4, 5, 6 и 7 (в коде, без деплоя) реализованы в ветках
`phl/static-pages-generation` этого репозитория и темы — раздел «Реализация». Этап 3 (internal) считается готовым, этап 0 не выполнялся:
параметры вынесены в env со значениями по умолчанию из плана.

Все оптимизации проектируются и делаются сразу, а не «сначала просто, потом быстро»: классы полей,
аспекты, eager/dirty/lazy, попадания, дочист, схлопывание, публикация по хэшу, purge по тегам. Каждая
из них меняет схему индекса, протокол аренды, формат ответа gateway или фрагменты темы, и добавлять
их потом означало бы мигрировать индекс и перерендеривать сайт.

**Термины.**

- **Координатор** — процесс `theme-static` (одна реплика, SQLite): лента событий, индекс, очередь,
  dirty, попадания, dispatch в GitHub Actions, очередь purge. Сам не рендерит.
- **Job** — запуск workflow `static-site.yml` в GitHub Actions: берёт задания под аренду, рендерит,
  публикует, возвращает результаты.
- **Лёгкий запрос** — persisted GraphQL-запрос SDK с живым ответом gateway и кешем по TTL. Это не
  статика: файлов в бакете для него нет, builder его не генерирует, в индекс он не входит.

## Вывод

**Источник изменений — лента событий internal по курсору.** Push-вебхуков нет. Координатор раз в
2 с читает события магазина после своего курсора и в одной транзакции SQLite сохраняет новый курсор,
задания и отметки dirty. Потерянных доставок нет, после простоя лента дочитывается с места
остановки. Устаревший курсор (`CURSOR_EXPIRED`) ставит полную сборку.

**Какие страницы затронуты, решает индекс «зависимость → страницы» с маской аспектов.** Он строится
из нормализованного снимка Apollo каждой отрендеренной страницы (`extractPageDeps`). Маппер в SDK
переводит событие в изменения ключей и аспектов, индекс даёт страницы. Изменение остатка не трогает
страницу, где товар есть только в хлебных крошках.

**Поля делятся на три класса.** Летучие (`quantityAvailable`, промо) в HTML не попадают вовсе и
приходят лёгкими запросами с TTL 30 с. Корректируемые (цена, наличие) остаются в HTML последним
известным значением, лёгкий запрос поправляет их после гидратации. Статические — всё остальное.
Поэтому `discount*` и таймеры промо не перерисовывают ни одной страницы, а `inventory` почти никогда
не доходит до бакета.

**Сразу рендерится только важное.** Своя страница изменённой сущности и верхние 300 страниц по
посещаемости идут в очередь (eager). Остальные получают `dirty` и отдаются в прошлой версии до
первого открытия (stale-while-revalidate) или фонового дочиста. Наличие всегда только dirty.
Массовое изменение не превращается ни в шторм рендеров, ни в полную сборку; полная сборка остаётся
для меню, магазина и локалей, которые есть в каждом документе.

**Публикуется только изменившееся.** Job сравнивает хэши HTML и данных с прошлой версией: совпали —
в бакет ничего не пишется и purge нет.

**Рендер в GitHub Actions по аренде.** Координатор ставит `workflow_dispatch` через GitHub App,
копит задания 20 с, держит не больше одного незабранного запуска; job забирает задания пачками под
аренду и отчитывается результатами. Дочист отдельного запуска не вызывает.

**Шаг A без purge, шаг B с purge по тегам.** На шаге A нода видит новую версию через
`STOREFRONT_STATIC_CACHE_TTL` (10 с), лёгкие запросы кеширует response cache gateway. На шаге B
Worker отдаёт HTML из R2 через кеш CDN, а координатор чистит теги страниц, товаров и промо.

## Что уже есть

Координатор опирается на реализованное в `phl/static-pages-generation`
(`packages/shopana-storefront-runtime/src/static/`, `packages/shopana-storefront-sdk/src/static/`).

**Builder.**

- `buildStaticSite`, `renderStaticPaths`, `publishStaticSite` (`builder.ts`); store `fs:` и
  `s3://` (`store.ts`, свой SigV4-клиент в `s3.ts`).
- `__static/manifest.json` пишется только поверх прочитанной версии (`If-Match` по ETag, до 5
  попыток с перечитыванием): полная сборка и `static render` одновременно сохраняют страницы друг
  друга. Вместе с ним пишется маленький `__static/server.json` для сервера (языки и статусы не 200).
- Полная сборка сразу удаляет страницы, данные и прочие файлы сайта, которых нет в новом manifest
  (`isStaticSiteKey`); ассеты прошлых сборок удаляются через 7 дней. Страница, рендер которой упал,
  сохраняет прошлые файлы.
- Хэш страницы — HTML без скрипта `window.__shopanaStatic` плюс `dataPageTypes`: повторный рендер
  тех же данных даёт тот же хэш, неизменённая страница не перезаписывается.
- `indexStaticPage` (`sdk/src/static/entities.ts`) уже извлекает из снимка ключи сущностей и
  ближайший момент изменения (`validUntil`, `endsAt`, `startsAt`, `activeFrom`, `activeTo`). Это
  основа `extractPageDeps`.
- Рендер статики узнаётся по `x-shopana-static-render` и случайному ключу процесса builder-а
  (`staticRenderHeaders`, `sdk/src/static/render.ts`); только с ним к gateway уходит
  `STOREFRONT_PRIVATE_TOKEN`.

**Гибридная нода** (`server.ts`).

- Отдаёт статику из store, остальное рендерит SSR (`x-shopana-static: hit | miss`). Адрес с
  параметром, который меняет страницу (всё, кроме меток кампаний), рендерит SSR.
- Отчёт координатору уже есть: раз в 30 с, пока есть что сообщить,
  `POST /__builder/api/hits` с `{ hits: { "<key>": n }, misses?: ["<key>"] }` и
  `Authorization: Bearer <STOREFRONT_STATIC_COORDINATOR_TOKEN>` на
  `STOREFRONT_STATIC_COORDINATOR_URL`. Промах попадает в отчёт, только если SSR ответил 200 и адрес
  похож на страницу каталога (семейство и один handle до 200 символов). До 10 000 ключей попаданий и
  1 000 промахов в отчёте.
- `/__builder/*` нода пропускает мимо статики.

**Браузер.**

- Клиентский переход статического документа рендерится сразу, а link статических ответов
  (`sdk/src/static/results.ts`) отвечает запросы из `/__static/data/*.json` адреса. В API уходят:
  запрос, которого в данных нет; ответ, который изменил бы то, что уже лежит в кеше; поля зрителя
  у покупателя с сессией. Данные запрашиваются только для типов страниц из `dataPageTypes`.
- `ViewerRefresh` (`useViewerRefresh.ts`) при смене сессии перезапрашивает активные запросы, в
  данных которых есть поля зрителя, целиком. Заменяется личным лёгким запросом (раздел «Вошедший
  покупатель»).
- `useStorefrontPromotions` перезапрашивает промо по `validUntil` и умеет `skip`.
- Тема (`storefront-brand-bite-and-crunch`, `phl/static-pages-generation`): поля `viewer*` отзывов
  и вопросов в клиентском `ContentViewerQuery`, шапка до монтирования в гостевом состоянии,
  промо-метка меню на клиенте, `static.config.ts`, `src/runtime/shell.tsx`.

**Инфраструктура.**

- Terraform `zone`: бакет R2 на окружение, ключ чтения для `theme`, ключ записи для GitHub Actions.
  `theme.yml`: `STOREFRONT_STATIC_STORE`, `STOREFRONT_STATIC_S3_ENDPOINT`, TTL 10 с.
- В репозитории темы `build-theme.yml` рендерит статику в образ, `static-full-build.yml` — полную
  сборку в бакет ночью и после сборки образа, без purge.

**Internal** (сделано, на момент записи не закоммичено): лента событий `webhooksQuery.eventFeed`,
`persistedDocuments` в gateway с `allowArbitraryDocuments: true`.

**Сделано по этому плану** — раздел «Реализация» в конце.

## Поток

```text
internal: лента событий магазина (API по курсору)
        ▲ опрос каждые STATIC_EVENTS_POLL_MS (2 с)
        │
theme-static (координатор)
   │ события → изменения (маппер SDK) → страницы (индекс, аспекты)
   │ своя страница и популярные → очередь (eager)
   │ остальные и всё наличие → dirty
   │ purgeTags изменений → очередь purge (шаг B)
   │ ◄── попадания и промахи от гибридной ноды (шаг A) и Worker-а (шаг B)
   │     dirty с попаданием → очередь; промах → рендер нового адреса
   │ таймеры valid_until → очередь; пустая очередь → дочист dirty
   ▼
GitHub REST: workflow_dispatch static-site.yml {mode: queue}
   ▼
job GitHub Actions (образ темы) ── аренда ──► рендер → сравнение хэшей
   │ изменилось: объекты в бакет, manifest поверх прочитанной версии; шаг B: purge тегов страниц
   │ не изменилось: ничего не пишется
   └──► результаты (страницы, зависимости, хэши, validUntil)
```

Задержка от правки в admin до новой версии своей страницы:

- фиксация события и опрос ленты: 1–3 с;
- накопление в координаторе: 20 с;
- запуск job и загрузка образа: 30–60 с;
- рендер: секунды;
- шаг A: до 10 с кеша ноды; шаг B: purge тега, меньше секунды.

Итого 1–1,5 минуты. Dirty-страница обновляется через ту же задержку после первого открытия; первый
посетитель видит прошлую версию. Летучие поля на любой странице свежие с точностью до 30 с.

## Лента событий internal

Два admin GraphQL-поля сервиса `webhooks` через gateway admin. Спецификация
`internal/specs/canonical/services/webhooks/query-webhooks-event-feed.md`, ADR
`internal/specs/docs/adrs/store-event-feed.ru.md`.

```graphql
webhooksQuery {
  # Начальный курсор: без since — «с текущего момента», с since — с первого события не раньше.
  eventFeedCursor(since: DateTime): { cursor, userErrors }
  # До 500 событий после курсора.
  eventFeed(topics: [String!]!, after: String!, first: Int = 100, apiVersion: String):
    { entries { cursor topic eventId envelope }, nextCursor, hasMore, userErrors }
}
```

- `envelope` — тело вебхука (`serializeEventEnvelope`, с тем же усечением `changes`); `id` равен
  `eventId`. Маппер работает с ним как с конвертом вебхука.
- Ошибки: `CURSOR_EXPIRED`, `CURSOR_INVALID`, `TOPICS_EMPTY`, `TOPIC_UNKNOWN`,
  `TOPICS_DUPLICATE`, `LIMIT_INVALID`, `API_VERSION_UNSUPPORTED`, `SINCE_INVALID`,
  `ACCESS_DENIED`.
- Курсор: `v1.` + base64url JSON с магазином, позицией и временем. Порядок
  `(transaction_id, dispatch_position)`, `transaction_id = pg_current_xact_id()`. Лента отдаёт только
  транзакции старше самой старой выполняющейся: поздно зафиксированные события не теряются, курсор
  не уменьшается. Долгая транзакция в кластере задерживает ленту, но не теряет событий. Чтение с
  primary.
- Хранение `domain_events` 90 дней; курсор или `since` старше 89 дней даёт `CURSOR_EXPIRED`.
- Магазин из admin context (`x-store-name` и Bearer-токен). Права: `store.webhooks:read` плюс
  чтение домена каждой группы топиков (`store.data`, `store.profile`, `store.localization`).

Координатор:

- **Доступ.** Служебный пользователь магазина с минимальной ролью; изменений в iam нет.
  Refresh-токен в secret стека (`SHOPANA_EVENTS_REFRESH_TOKEN`), имя магазина
  `SHOPANA_STORE_NAME`; access-токен координатор получает и продлевает сам. Отозванная сессия —
  ошибка в `status` и ожидание нового токена; события не теряются, пока курсор не устарел.
- **Топики** фиксированы в SDK: `STATIC_EVENT_TOPICS`. Событие без правила в маппере пишется в лог
  и ничего не вызывает.
- **Цикл.** Запрос с курсором → в одной транзакции SQLite: `event_log`, разбор в изменения, задания,
  dirty, очередь purge, `nextCursor` в `event_cursor`. `hasMore` — следующий запрос сразу, иначе
  через 2 с.
- **Повтор** события после сбоя между ответом и коммитом безопасен: дедупликация по id в
  `event_log`, обработка идемпотентна.
- **Порядок** маппер не использует: job всегда перечитывает текущее состояние через Storefront API,
  `productUpdated` после `productDeleted` просто увидит `not-found`.

## Классы полей

| Класс              | Поля                                                                                                            | В HTML и `__static/data`                | После гидратации                           | Перерендер страницы                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------ | -------------------------------------------- |
| **Летучие**        | `ProductVariant.quantityAvailable`, `ProductVariant.promotions`, `Query.storefrontPromotions`                   | нет; нейтральное состояние или скелетон | лёгкий ответ, TTL 30 с или до `validUntil` | никогда                                      |
| **Корректируемые** | `ProductVariant.availableForSale`, `currentlyNotInStock`, `Product.availableForSale`; `price`, `compareAtPrice` | последнее известное значение            | тот же лёгкий ответ поправляет кеш         | `pricing` сразу, `availability` только dirty |
| **Зрителя**        | `ProductVariant.loyalty`, `viewerEngagement`, `viewerCapabilities`, `viewerSubscription`, `savedForComparison`  | гостевое значение или не запрашивается  | личный лёгкий запрос при сессии            | никогда                                      |
| **Статические**    | всё остальное, включая `selectedOrFirstAvailableVariant`                                                        | да                                      | —                                          | по аспектам                                  |

- **Цена в HTML.** Она нужна в JSON-LD `Offer` и `og:product:price`, её видят бот и браузер без JS,
  замена после загрузки дала бы CLS. Меняется только правкой в admin с событием, поэтому `pricing`
  рендерится сразу. В лёгкий запрос цена входит по флагу `withPrice`: `false` в режиме бакета (окно
  1–1,5 минуты CI терпимо, корзина и checkout считают цену сами), `true` в режиме «статика в образе»,
  где HTML обновляется только с образом.
- **Наличие в HTML булевым.** HTML меняется лишь при переходе «есть ↔ нет», поэтому событие
  `inventory` почти никогда не меняет хэш. `quantityAvailable` уходит из HTML совсем.
- **Промо уходят из HTML целиком.** `discount*` и таймеры промо не перерисовывают страниц.
- Таблица классов — `static/fieldClasses.ts` в SDK: `VIEWER_FIELDS` (уже есть в `viewer.ts`) и
  `VOLATILE_FIELDS` — два экземпляра одного механизма с `strip*`. Тест: классы не пересекаются.
- Builder перед записью данных и хэшированием выбрасывает летучие поля (`stripVolatileFields`) и
  падает, если фрагмент темы всё-таки их запросил.
- `TIME_FIELDS` в `entities.ts` больше не видит `validUntil`, `endsAt`, `startsAt` промо: таймеры
  перерендера остаются только для окон коллекций и прочего контента.

## Индекс: структура данных

SQLite (встроенный `node:sqlite`, WAL; нативной зависимости нет, Node ≥ 22.13) на volume
`theme-static-data`; единственный писатель — процесс координатора. Схема мигрируется при старте
(`PRAGMA user_version`, `coordinator/db.ts`).

```sql
-- Известные страницы.
CREATE TABLE pages (
  id            INTEGER PRIMARY KEY,
  locale        TEXT NOT NULL,              -- сегмент локали, '' для локали по умолчанию
  path          TEXT NOT NULL,              -- '/products/apple-chips', как в манифесте
  route         TEXT NOT NULL,              -- тип страницы: 'product' | 'category' | … | 'home'
  owner_key     TEXT,                       -- 'Product:<uuid>' для страницы сущности
  status        TEXT NOT NULL,              -- 'published' | 'gone'
  html_hash     TEXT,
  data_hash     TEXT,
  build_id      TEXT NOT NULL,              -- серверный бандл рендера
  render_started_at INTEGER NOT NULL,       -- мс; граница схлопывания и снятия dirty
  rendered_at   INTEGER NOT NULL,
  valid_until   INTEGER,                    -- окна контента; NULL = бессрочно
  dirty_since   INTEGER,                    -- NULL = актуальна
  dirty_reasons TEXT,                       -- JSON: [{ topic, eventId, depKey }], до 20
  hits_7d       INTEGER NOT NULL DEFAULT 0,
  UNIQUE (locale, path)
);
CREATE INDEX pages_owner ON pages (owner_key, locale);
CREATE INDEX pages_valid_until ON pages (valid_until) WHERE valid_until IS NOT NULL;
CREATE INDEX pages_dirty ON pages (dirty_since, hits_7d) WHERE dirty_since IS NOT NULL;
CREATE INDEX pages_hits ON pages (hits_7d DESC) WHERE status = 'published';

-- Обратный индекс: зависимость → страницы.
CREATE TABLE page_deps (
  dep_key  TEXT NOT NULL,                   -- 'Product:<uuid>', 'Category:<uuid>#products', 'Query#products'
  kind     INTEGER NOT NULL,                -- 1 entity, 2 list, 3 query
  aspects  INTEGER NOT NULL,                -- битовая маска
  page_id  INTEGER NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  PRIMARY KEY (dep_key, page_id)
) WITHOUT ROWID;
CREATE INDEX page_deps_page ON page_deps (page_id);

CREATE TABLE page_hits (                    -- попадания по дням
  page_id INTEGER NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  day     INTEGER NOT NULL,
  hits    INTEGER NOT NULL,
  PRIMARY KEY (page_id, day)
) WITHOUT ROWID;

-- Сущности layout-а (магазин, меню): их изменение — полная сборка.
CREATE TABLE layout_deps (dep_key TEXT PRIMARY KEY, seen_at INTEGER NOT NULL) WITHOUT ROWID;

CREATE TABLE jobs (
  id          INTEGER PRIMARY KEY,
  locale      TEXT NOT NULL,
  target      TEXT NOT NULL,                -- 'path:/products/x', 'owner:Product:<uuid>' или 'full'
  priority    INTEGER NOT NULL,             -- 0 своя, 1 популярные и dirty с попаданием, 2 таймеры и промахи, 3 дочист
  reasons     TEXT NOT NULL,                -- JSON, до 20
  created_at  INTEGER NOT NULL,
  not_before  INTEGER NOT NULL,
  state       TEXT NOT NULL,                -- 'queued' | 'leased'
  lease_id    TEXT,
  attempts    INTEGER NOT NULL DEFAULT 0,
  api_id      TEXT,                         -- global id сущности задания owner: (из события)
  route       TEXT,                         -- тип страницы задания owner:
  request_id  TEXT,                         -- запрос POST /builds, поставивший задание
  last_error  TEXT
);
CREATE UNIQUE INDEX jobs_queued_target ON jobs (locale, target) WHERE state = 'queued';
CREATE INDEX jobs_ready ON jobs (state, not_before, priority);

CREATE TABLE dead_jobs (                    -- трижды failed или с истёкшей арендой
  id INTEGER PRIMARY KEY, locale TEXT, target TEXT, reasons TEXT, last_error TEXT, died_at INTEGER
);

CREATE TABLE leases (
  id TEXT PRIMARY KEY, request_id TEXT, run_id TEXT, run_attempt INTEGER,
  mode TEXT NOT NULL, created_at INTEGER, heartbeat_at INTEGER, expires_at INTEGER,
  state TEXT NOT NULL                       -- 'active' | 'completed' | 'expired'
);

CREATE TABLE dispatches (
  request_id TEXT PRIMARY KEY, mode TEXT NOT NULL, reason TEXT,
  dispatched_at INTEGER, claimed_at INTEGER, run_id TEXT, state TEXT NOT NULL
);

CREATE TABLE purge_queue (                  -- шаг B; без токена Cloudflare не заполняется
  tag TEXT PRIMARY KEY, enqueued_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0
) WITHOUT ROWID;

CREATE TABLE event_cursor (
  id INTEGER PRIMARY KEY CHECK (id = 1), cursor TEXT NOT NULL, updated_at INTEGER NOT NULL
);

CREATE TABLE event_log (
  event_id TEXT PRIMARY KEY, topic TEXT, occurred_at INTEGER, received_at INTEGER,
  changes INTEGER, eager INTEGER, dirty INTEGER, purged INTEGER
);

CREATE TABLE build_requests (               -- запросы POST /builds
  request_id TEXT PRIMARY KEY, mode TEXT NOT NULL, reason TEXT, image TEXT, created_at INTEGER NOT NULL
);

CREATE TABLE settings (                     -- currentImage, последняя полная сборка, дочист,
  key TEXT PRIMARY KEY, value TEXT NOT NULL -- повёрнутый refresh-токен ленты, язык по умолчанию
) WITHOUT ROWID;
```

Объём: около 3 000 страниц на текущих фикстурах (1 000 товаров, 145 категорий, около 330 вендоров,
две локали), в среднем около 60 зависимостей на страницу, итого около 180 000 строк `page_deps`,
меньше 30 МБ. Поиск по `dep_key` — первичный ключ, миллисекунды на событие. `event_log` чистится
старше 30 дней.

## Зависимости страницы

### Ключи

Ключи нормализуются в `<Typename>:<uuid>`. Global ID из снимка (`Product:<base64url>`) и из события
декодируется тем же кодеком, что в internal (`packages/graphql-global-id`); его копия на 30 строк
живёт в SDK.

| Вид        | Ключ                                                        | Откуда в снимке                                                                                                                     | Что означает                                                    |
| ---------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| entity (1) | `Product:<uuid>`                                            | нормализованный объект (`Product`, `ProductVariant`, `Category`, `Collection`, `Vendor`, `OnlineStorePage`, `MediaImage`)           | страница показывает поля сущности                               |
| list (2)   | `Category:<uuid>#products`                                  | connection на сущности: `Category.products`, `Collection.products`, `Vendor.products`, `Product.relatedProducts`, `Product.reviews` | страница показывает состав списка                               |
| query (3)  | `Query#products`, `Query#dynamicCollection`, `Query#search` | корневое поле со списком без владельца                                                                                              | выборку может изменить любое изменение каталога в аспекте маски |

Страница своей сущности дополнительно записывает `owner_key` из параметров маршрута и `preload`:
по нему job `owner:` находит старый путь, если у сущности изменился handle.

### Аспекты

Битовая маска: какие части сущности страница реально показывает. Вычисляется из полей объекта в
снимке по таблице `STATIC_FIELD_ASPECTS` в SDK рядом с type policies (`graphql/apollo/cache.ts`);
тема дополняет её `fieldAspects` в `static.config.ts`. Поле без записи относится к `content`.

| Бит | Аспект         | Поля (пример для `Product`)                                                  | Причины `productUpdated.reasons`                            | Рендер       |
| --- | -------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------ |
| 1   | `content`      | `title`, `handle`, `description`, `seo`, `tags`, `options`                   | `content`, `seo`, `options`, `tags`, прочие и неизвестные   | eager/dirty  |
| 2   | `pricing`      | `variants.price`, `variants.compareAtPrice`                                  | `pricing`, `variant`                                        | eager/dirty  |
| 4   | `availability` | `availableForSale`, `currentlyNotInStock`, `selectedOrFirstAvailableVariant` | `inventory`, `variant`                                      | только dirty |
| 8   | `media`        | `featuredImage`, `media`                                                     | `media`                                                     | eager/dirty  |
| 16  | `membership`   | у list и query: состав списка                                                | `category`, `collection`, `vendor`, `publication`, `status` | eager/dirty  |
| 32  | `reviews`      | `reviewsSummary`, `rating`, `reviews`                                        | топики `review*`, `productQuestion*`                        | eager/dirty  |
| 64  | `loyalty`      | гостевые базовые баллы `loyalty`                                             | топики `loyaltyProgram*`                                    | eager/dirty  |
| 128 | `translation`  | переводимое поле в нелокали по умолчанию                                     | `resourceTranslationsUpdated`                               | eager/dirty  |

- Аспекта промо нет: промо-поля летучие и в снимок не попадают.
- `pricing` и промо не связаны: catalog и listing отдают базовую цену варианта без скидок
  (`internal/services/catalog/src/resolvers/storefront/ProductVariantResolver.ts:71`), сортировка,
  фильтр и правила коллекций по цене работают по ней же, скидка считается только в checkout.
- В масках list и query `availability` остаётся там, где состав зависит от наличия (правило
  `inStock` динамической коллекции, сортировка по наличию), `pricing` — где есть правило или
  сортировка по цене.
- Пример: товар в карточке категории даёт `entity Product:A` с маской
  `content|pricing|availability|media`, тот же товар в хлебных крошках — только `content`.
- Тест покрытия: каждое поле каждого фрагмента темы получает аспект явно или по умолчанию; поле из
  `VOLATILE_FIELDS` во фрагменте страницы — ошибка.

### Извлечение из снимка

`extractPageDeps(snapshot, fieldAspects)` в `@shopana/storefront-sdk/static`, рядом с
`indexStaticPage`, на обоих форматах state (нормализованный и целые ответы):

1. Каждый ключ `Typename:id` — `entity` с объединением аспектов присутствующих полей.
2. Каждое поле-connection у владельца (`products({…})`, `relatedProducts`, `reviews(…)`) — `list`
   `<Owner>#<field>` с `membership` и аспектами элементов: порядок зависит от цены и наличия, их
   изменения меняют и состав первой страницы.
3. Каждое поле `ROOT_QUERY` со списком (кроме `xByHandle`, это ссылки) — `query` `Query#<field>` по
   тем же правилам.
4. `DynamicCollection` без id — `query` `Query#dynamicCollection`: его правила ссылаются на
   категории, теги и вендоров, состав может изменить любой товар.
5. Объекты, общие для каждой страницы (`Store`, меню шапки и подвала, `Localization`), и всё, что
   достижимо только через них (категории меню), — layout-ключи. В `page_deps` не пишутся (иначе у
   каждой страницы одни и те же тысячи строк): job возвращает их отдельно (`layout`), координатор
   хранит в `layout_deps`, и изменение такой сущности ставит полную сборку.
6. Поля варианта засчитываются и его товару (`Product:<uuid>`): события называют товары.
7. Owner страницы — сущность корневого `*ByHandle` (`productByHandle`, `categoryByHandle`, …).

Результат возвращается job-ом в `deps` уже нормализованным: `[{ key, kind, aspects }]`.

## Событие → изменения → страницы

`mapEventToChanges(envelope) → Change[]`, где
`Change = { key, kinds, aspects, own?: { route, owner, id }, gone?, full?, lazy?, locales?, purgeTags? }`
(`id` — global id сущности из события: по нему job нового или переименованного товара находит
адрес через `SdkStaticNodeHandle`). Чистая функция в SDK с таблицей по топикам (`events.ts`).
Контракт конверта, на который опирается маппер: id сущности — `data.<entity>Id`, `data.<entity>.id`
или `data.id` в любой форме global id (`gid://shopana/<Type>/<id>` текстом или base64url,
`<Type>:<id>` в base64url); `productUpdated.data.reasons`, `affectedCategoryIds`,
`affectedCollectionIds`, `affectedVendorIds`/`vendorId`; `resourceTranslationsUpdated.data`:
`resourceId`, `resourceType`, `locales`. Ключ `*` — все зависимости своих видов с аспектом маски,
пустой ключ — ни одной страницы (только `purgeTags`).

| Топик                                                                                 | Изменения                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `productUpdated`                                                                      | `Product:<id>` entity с аспектами из `reasons`; своя страница; при `membership`-причинах `Category:<id>#products` по `affectedCategoryIds`, `Collection:<id>#products` по `affectedCollectionIds`, `Query#products`, `Query#dynamicCollection`. Причина `inventory` даёт `lazy`. `purgeTags: ['sf-p-<productId>']` при `inventory`, `pricing`, `variant` |
| `productCreated`                                                                      | своя страница (job `owner:`, путь определит рендер; не видна гостю — ничего); `Query#products`, `Query#dynamicCollection` с `membership`                                                                                                                                                                                                                 |
| `productDeleted`                                                                      | своя страница `gone`; `Product:<id>` все аспекты; списки категорий, коллекций, вендора и `Query#*` с `membership`; `purgeTags: ['sf-p-<productId>']`                                                                                                                                                                                                     |
| `categoryCreated/Updated`, `collection*`, `vendor*`                                   | своя страница; entity с `content`; свой `#products` с `membership` при причинах о правилах коллекции                                                                                                                                                                                                                                                     |
| `*Deleted` для них                                                                    | своя страница `gone`; entity все аспекты                                                                                                                                                                                                                                                                                                                 |
| `tag*`                                                                                | `Query#dynamicCollection` с `membership`                                                                                                                                                                                                                                                                                                                 |
| `pageCreated/Updated/Deleted`                                                         | своя страница `/pages/:handle` (`gone` при удалении); `OnlineStorePage:<id>`                                                                                                                                                                                                                                                                             |
| `navigationMenu*`, `storeUpdated`, `storeLocalesUpdated`, `storeConfigurationUpdated` | `full`                                                                                                                                                                                                                                                                                                                                                   |
| `discount*`                                                                           | ни одной страницы; `purgeTags: ['sf-promo', 'sf-vol']`                                                                                                                                                                                                                                                                                                   |
| `review*`, `productQuestion*`                                                         | `Product:<data.productId>` с `reviews`; `Product:<id>#reviews`                                                                                                                                                                                                                                                                                           |
| `reviewStoreConfigurationUpdated`, `loyaltyProgram*`                                  | все страницы с аспектом `reviews` / `loyalty` (dirty, кроме верха по посещаемости)                                                                                                                                                                                                                                                                       |
| `resourceTranslationsUpdated`                                                         | `<resourceType>:<resourceId>` с `translation`, только локали `data.locales`                                                                                                                                                                                                                                                                              |
| `fileUpdated`, `fileDeleted`                                                          | `MediaImage:<id>` с `media`                                                                                                                                                                                                                                                                                                                              |
| `listingFacetMembershipChanged`, `facet*`                                             | все list и query с `membership`                                                                                                                                                                                                                                                                                                                          |

Поиск страниц:

```sql
SELECT p.id, p.locale, p.path, p.route, p.hits_7d
FROM page_deps d JOIN pages p ON p.id = d.page_id
WHERE d.dep_key = ?1 AND d.kind IN (…) AND (d.aspects & ?2) != 0 AND p.status = 'published'
  AND (?3 IS NULL OR p.locale IN (SELECT value FROM json_each(?3)));
```

## Eager, dirty, lazy

Каждая найденная страница либо ставится в очередь, либо помечается устаревшей:

- **Eager, приоритет 0:** своя страница сущности (`own`), в том числе новая (`owner:<key>` во всех
  локалях) и удалённая (`gone`).
- **Eager, приоритет 1:** верхние `STATIC_EAGER_TOP` (300) по `hits_7d` и главная каждой локали.
- **Dirty:** все остальные, а при `lazy` — все без исключения, включая свою страницу и верх.
  `dirty_since` ставится, если ещё не стоит; повод дописывается в `dirty_reasons`. Рендера нет.

Dirty-страница становится заданием:

1. **Попадание.** Отчёт ноды или Worker-а по dirty-странице ставит её с приоритетом 1. Первый
   посетитель получает прошлую версию, следующие после рендера — новую. Попадание по актуальной
   странице ничего не ставит, только считается в `page_hits`.
2. **Фоновый дочист.** Когда очередь пуста и аренды нет, не чаще раза в 5 минут — до
   `STATIC_SWEEP_BATCH` (200) dirty-страниц с приоритетом 3 по убыванию `hits_7d`.
3. **Полная сборка** снимает все отметки.

Правила:

- Рендер с `render_started_at = T` снимает `dirty_since`, только если `dirty_since < T`: изменение во
  время рендера оставляет отметку.
- **Схлопывание.** На пару `(locale, target)` в очереди максимум одно задание: новый повод
  дописывается в `reasons`, приоритет берётся минимальный. Результат с `render_started_at = T`
  удаляет все `queued` задания этой страницы с `created_at < T`. Полная сборка поглощает
  накопившиеся точечные.
- **Эскалация в полную сборку** только для `full` (меню, магазин, локали). Скидки, лояльность,
  фасеты и переводы дают dirty с eager по верху посещаемости.
- **Отставание кешей API.** Задание получает `not_before = received_at + STATIC_READ_LAG_MS` (по
  умолчанию 0; значение по замеру этапа 0).
- **Задание `owner:`.** Своя страница известной сущности ставится как `owner:<key>` с её путём:
  рендер находит адрес заново, и если handle изменился, старый путь уходит в `gone`. Без страницы в
  индексе (новая сущность) — `owner:<key>` во всех языках индекса.
- **Промах** из отчёта ноды ставит рендер адреса с приоритетом 2 (`path:`), если страницы нет в
  индексе или она `gone`.

## Попадания

- **Шаг A.** Отчёт гибридной ноды уже реализован (раздел «Что уже есть»). Координатор переводит
  ключи (`uk/products/x/index.html`) в `(locale, path)` по `locales` своего индекса, пишет
  `page_hits`, ставит dirty-страницы и промахи.
- **Шаг B.** Большинство запросов обслуживает кеш CDN. Worker сообщает только о промахах кеша CDN
  (`ctx.waitUntil(fetch(...))`, без ожидания ответа) тем же форматом и токеном. Для dirty-страницы
  этого достаточно: HTML в CDN живёт `s-maxage` (600 с), после истечения Worker перечитывает объект
  и сообщает о попадании. Для `hits_7d` берутся те же промахи: порядок по популярности они передают
  верно.
- `hits_7d` пересчитывается ночью из `page_hits` за 7 дней; `page_hits` старше 8 дней удаляются.

## Публикация только изменившегося

- Builder уже не перезаписывает файл с тем же хэшем, что в прошлом manifest, и сохраняет manifest
  поверх прочитанной версии.
- Аренда отдаёт с каждым заданием известные `htmlHash` и `dataHash` страницы. Совпали оба —
  `outcome: 'unchanged'`: объекты не пишутся, purge нет, координатор обновляет `rendered_at`,
  зависимости и `valid_until`.
- Изменился только один объект — пишется только он; тег страницы на шаге B чистится один раз.
- В хэш не входит ничего, что меняется от рендера к рендеру без изменения данных: скрипт
  `window.__shopanaStatic` исключён, летучие поля выброшены. Тест «повторный рендер даёт тот же хэш»
  и «два рендера с разными остатками без перехода наличия и разными промо дают один хэш».

## Быстрые данные: лёгкие запросы

### Запросы

`packages/shopana-storefront-sdk/src/modules/volatile/operations.graphql`, три гостевых:

```graphql
# Листинги: только то, что видно на карточке. Не локализовано: язык в ключе не нужен.
query SdkVolatileCards($ids: [ID!]!, $withPrice: Boolean!) {
  nodes(ids: $ids) {
    ... on ProductVariant {
      id
      availableForSale
      price @include(if: $withPrice) {
        amount
        currencyCode
      }
      compareAtPrice @include(if: $withPrice) {
        amount
        currencyCode
      }
      product {
        id
      }
    }
  }
}

# Страница товара: выбранный вариант целиком, остальным только наличие для свотчей опций.
query SdkVolatileVariant($id: ID!, $siblings: [ID!]!, $withPrice: Boolean!) {
  variant: node(id: $id) {
    ... on ProductVariant {
      id
      availableForSale
      currentlyNotInStock
      quantityAvailable
      price @include(if: $withPrice) {
        amount
        currencyCode
      }
      compareAtPrice @include(if: $withPrice) {
        amount
        currencyCode
      }
      product {
        id
        availableForSale
      }
      promotions {
        validUntil
        revision
        promotions {
          key
        }
      }
    }
  }
  siblings: nodes(ids: $siblings) {
    ... on ProductVariant {
      id
      availableForSale
    }
  }
}

# Тексты промо: один ответ на весь магазин (уже есть, modules/promotions).
query SdkStorefrontPromotions($kinds: [StorefrontPromotionKind!]) {
  storefrontPromotions(kinds: $kinds) {
    validUntil
    revision
    promotions {
      ...SdkStorefrontPromotion
    }
  }
}
```

- Состав фиксирован SDK; тема полей не дописывает. Запросы в allow-list gateway через манифест
  persisted documents SDK.
- Язык в ключе кеша CDN — параметр `locale` в URL `GET`-линка (`?locale=…&documentId=…`), не
  переменная запроса: неиспользуемая переменная — ошибка валидации GraphQL. Язык ответа gateway
  берёт из `Accept-Language`.
- Поля запросов — фрагменты `SdkVolatileCardFields` и `SdkVolatileVariantFields`
  (`modules/volatile/core/operations.graphql`); их же читают `useVolatileCard` и
  `useVolatileVariant` через `useFragment`.
- Промо варианта приходят ключами, тексты — из общего `storefrontPromotions`, соединение по `key`.
- id сортируются, режутся по 100 (около 6 КБ в URL при лимите Cloudflare 16 КБ): один набор — один
  URL — одна запись кеша.

### Жизненный цикл

```text
сборка SDK: текст запроса → манифест persisted documents → gateway (allow-list «гостевые»)
builder/SSR: фрагменты темы без летучих полей → HTML и __static/data без них
браузер:
HTML ──► гидратация ──► useEffect провайдера ──► GET ──► CDN / gateway ──► writeQuery ──► useFragment
скелетон   та же         id за один кадр,      без токена   s-maxage 30 с    ProductVariant:<id>  перерисовка
           разметка      сортировка, по 100    и visitor id
```

1. Сервер и builder летучих полей не запрашивают и лёгкие запросы не выполняют: провайдер запускает
   их из `useEffect`.
2. **Регистрация.** `useVolatileCard(id)` в карточке листинга и `useVolatileVariant(id, siblings)` в
   секции товара и колонках сравнения кладут id в `VolatileDataProvider` (`AppProviders`) и читают
   `ProductVariant:<id>` через `useFragment`. Сами хуки ничего не запрашивают.
3. **Батч.** Провайдер ждёт конца кадра, сортирует id, режет по 100, пропускает id, запрошенные
   меньше 30 с назад, и шлёт `GET` отдельным `HttpLink` без `Authorization` и visitor id. На странице
   товара заодно `SdkStorefrontPromotions`, если его нет в кеше.
4. **Ответ** пишется `writeQuery` в те же нормализованные записи, что пришли из снимка.
5. **Рендер.** `ready` — есть ли летучее поле у записи в кеше: `false` на сервере и при гидратации,
   поэтому разметка совпадает с HTML. Летучие: скелетон → значение. Корректируемые: значение снимка,
   DOM меняется только при расхождении.
6. **Повторы**, пока страница открыта: таймер `validUntil` промо (`useValidUntilRefetch` переезжает в
   провайдер), `visibilitychange` в `visible` для id старше 30 с, ошибка «нет в наличии» от мутации
   корзины, подгрузка листинга по курсору (только новые id).

Нейтральное состояние зависит только от наличия данных в кеше, не от `typeof window` и `Date.now()`:
данные появляются строго после гидратации.

### Что в HTML вместо значения

| Место                                     | В HTML                     | После ответа                              | CLS                    |
| ----------------------------------------- | -------------------------- | ----------------------------------------- | ---------------------- |
| Цена, зачёркнутая цена, бейдж скидки цены | снимок                     | поправка при `withPrice`, если отличается | нет                    |
| «В наличии» / «нет в наличии», кнопка     | снимок `availableForSale`  | поправка                                  | нет                    |
| Максимум в поле количества                | без ограничения            | `quantityAvailable` при `DENY`            | нет                    |
| Промо на странице товара                  | скелетон одной строки      | 0 промо — блок схлопывается, 2+ — растёт  | только при расхождении |
| Метка бесплатной доставки в шапке         | пусто (уже так)            | текст                                     | в меню                 |
| Колонки сравнения                         | снимок цены и наличия      | поправка по `variant.id`                  | нет                    |
| Баллы лояльности                          | базовые баллы гостя        | личный ответ при сессии                   | нет                    |
| Голоса, жалобы, подписка у отзывов        | не запрашиваются (уже так) | `ContentViewerQuery`                      | нет                    |

Скелетон промо — единственный новый плейсхолдер; без JS он прячется (`<noscript>`). Где поставить
блок промо, чтобы его рост не двигал кнопку «в корзину», решает дизайн. `selectedOrFirstAvailableVariant`
остаётся статическим: закончившийся вариант карточки поправка покажет «нет в наличии», другой
вариант выберет следующий рендер листинга (dirty по `availability`).

### Кеш, TTL, теги

Плагин gateway для `GET` с `documentId` из allow-list «гостевые и кешируемые» и без `Authorization`:

- `Cache-Control: public, max-age=0, s-maxage=<ttl>, stale-while-revalidate=<swr>`.
  `SdkVolatileCards`: 30 и 30. `SdkVolatileVariant`: `ttl = min(30, validUntil − now)`, `swr = 0`,
  если `validUntil` раньше `ttl + swr`. `SdkStorefrontPromotions`: `min(600, validUntil − now)`.
- `ETag` по хэшу ответа: после TTL CDN перепроверяет и получает `304` без тела.
- `Cache-Tag`: `sf-vol` и `sf-p-<productUuid>` для запросов по вариантам, `sf-promo` для
  `SdkStorefrontPromotions`. Cloudflare снимает заголовок перед отдачей.
- Ключ кеша CDN — полный URL; `Vary` Cloudflare не учитывает, язык, где нужен, в URL.
- С `Authorization` — `private, no-store`, как сейчас.

| Событие                                                              | Действие с лёгким ответом   |
| -------------------------------------------------------------------- | --------------------------- |
| `discount*`                                                          | purge `sf-promo` и `sf-vol` |
| `productUpdated` `inventory`, `pricing`, `variant`; `productDeleted` | purge `sf-p-<productId>`    |
| заказы, возвраты (событий нет)                                       | TTL 30 с                    |
| старт или конец промо по времени                                     | TTL до `validUntil`         |

### Без CDN и с CDN

- **Шаг A.** Лёгкий ответ идёт мимо ноды: Tunnel → Traefik → gateway. Gateway включает response
  cache Hive (в памяти, `session: () => null` для гостевых документов allow-list, ключ с
  `Accept-Language`, TTL как `s-maxage`) со склеиванием одновременных промахов; если Hive не склеивает,
  своя обёртка «один запрос в полёте на ключ». Нагрузка на подграфы — не больше одного запроса на
  набор id и локаль за 30 с на реплику gateway. Purge нет.
- **«Статика в образе».** Выигрыш больше всего: без лёгкого ответа остатки и промо устаревали бы до
  следующего образа; с ним и `withPrice: true` устаревают только цена и наличие, и их поправляет тот
  же ответ.
- **Шаг B.** Cache Rule для `GET /graphql` с `documentId` без `Authorization`, «respect origin», query
  string в ключе; response cache gateway остаётся вторым уровнем.

Масштаб: размер запроса от каталога не зависит (только id страницы). Для популярных страниц около
одного запроса в подграфы на страницу за 30 с, для редких — один на просмотр. Отклонено: шарды по
хэшу id (24 карточки в ~23 запросах), один файл всех остатков (~100 КБ на визит каждые 30 с), загрузка
по `IntersectionObserver` (ключи дробятся сильнее), отдельный JSON от ноды или Worker-а (дублирует
gateway), летучее в `__static/data` с коротким TTL (ломает публикацию по хэшу).

### Apollo: снимок и свежий ответ

- Свежий ответ пишется `writeQuery`: скаляры `ProductVariant:<id>` и `Product:<id>` заменяются,
  объекты без id сливаются (`cache.ts`), список `promotions` заменяется. Новые type policies не нужны.
- Порядок в документе: SSR-состояние → гидратация → лёгкий ответ; свежее побеждает без меток времени.
- При клиентском переходе снимок другой страницы уже не затирает свежие значения: link статических
  ответов отдаёт запрос в API, если ответ из данных изменил бы запись кеша. Отдельный
  `keepFreshVolatileFields` не нужен. Цена: страница, чей вариант уже обновлён лёгким ответом,
  целиком уходит в API. Если на stage это заметно снижает попадания статики, link начинает отвечать
  данными с выброшенными корректируемыми полями тех записей, что уже есть в кеше.

### Вошедший покупатель

От покупателя зависят `ProductVariant.loyalty` (баллы по тиру, `state`, `remainingUses`), `viewer*`
у отзывов и `savedForComparison`. Промо одинаковы для гостя и покупателя (BR-sp01), цен по сегментам
нет. Второй слой — личный лёгкий запрос:

```graphql
query SdkViewerLoyalty($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on ProductVariant {
      id
      loyalty {
        ...SdkLoyaltyPresentation
      }
    }
    ... on Product {
      id
      loyalty {
        ...SdkLoyaltyPresentation
      }
    }
  }
}
```

`SdkLoyaltyPresentation` (primary, purchase, review opportunity со всеми полями, награды баллами и
деньгами, `validUntil`, `revision`) — надмножество того, что показывает тема: объекты лояльности без
id сливаются в кеше, и личный ответ заменяет гостевые значения поле в поле, даже если фрагменты темы
выбирают только часть. Батч берёт id вариантов и товаров, зарегистрированных карточками и
страницей товара.

1. HTML гостевой: базовые баллы из снимка.
2. После гидратации — гостевой батч.
3. Когда сессия известна, провайдер шлёт личный батч по тем же id: `POST` с `Authorization`,
   `private, no-store`.
4. Ответ пишется в `ProductVariant:<id>.loyalty`, бейдж перерисовывает `useFragment`.
5. Вход и выход перезапускают личный батч; при выходе — гостевой запрос `loyalty`.

`ViewerRefresh` больше не перезапрашивает запросы с `loyalty`: на странице товара `ProductPageQuery`
с сотней вариантов не уходит в API. Он ставит личный батч (`VolatileBatcher.setViewer`) и
перезапрашивает только активные запросы с остальными полями зрителя (`VIEWER_REFETCH_FIELDS`:
`viewer*` отзывов, `savedForComparison`) — это и есть маленькие запросы `ContentViewerQuery` темы
и `SdkProductComparison` колонок. Отдельного запроса `savedForComparison` нет: колонки сравнения
без id, и запрос с частью их полей заменил бы список колонок в кеше. `VIEWER_FIELDS` остаётся для
link-а статических ответов.

Сегментные промо в будущем — отдельным полем схемы (`ProductVariant.viewerPromotions` в pricing), не
тем же `promotions`: гостевой кешируемый ответ не должен отдать промо чужого сегмента, а гостевое и
личное значения не должны затирать друг друга в кеше. Если появятся цены по сегментам, `price` тоже
станет личным полем.

## Кеш GraphQL `GET` (слой 2)

Слой 1 — данные страницы из статики — реализован (link статических ответов). Слой 2 — всё, что не
влезает в данные страницы: подгрузка листинга по курсору, фильтры и сортировка, поиск, страницы
вариантов, вопросы и отзывы, промо, остатки.

- Persisted documents SDK: id документа — SHA-256 его текста так, как его отправляет Apollo (с
  добавленными `__typename`, `persistedDocumentOf`). Сборка SDK пишет манифест для gateway:
  `dist/persisted-documents.json` (`{ id: текст }`, все операции SDK) и
  `dist/persisted-documents.cache.json` (`{ id: { operationName, class } }`, allow-list
  `GUEST_CACHEABLE_OPERATIONS`). Тот же id браузер считает сам (`crypto.subtle`), поэтому
  отдельного сгенерированного файла с id нет. Codegen темы включает то же для её документов.
- `GET`-линк (`createPersistedGetLink`, перед ссылкой сессии и visitor id) используется для всего
  allow-list «гостевые и кешируемые». У таких запросов нет `Authorization`, visitor id и cookie
  (`credentials: 'omit'`); локаль в query (`/graphql?locale=<locale>&documentId=…&variables=…`,
  переменные в каноническом JSON с отсортированными ключами) вместе с `Accept-Language`, потому что
  Cloudflare Free не учитывает `Vary`. Запросы с флагом контекста `shopanaViewer`, с сессией и
  мутации остаются `POST`.
- Тот же плагин gateway: TTL по классам операций — листинги и поиск 120 с, варианты, вопросы и
  отзывы 300 с, промо до `validUntil` (не больше 600 с), остатки 30 с; для остального
  `private, no-store`. `Cache-Tag` по ключам сущностей ответа (`Product:<uuid>`, …), их чистит
  координатор по тем же изменениям маппера.
- Cloudflare Cache Rule: `GET /graphql` без `Authorization` eligible, «respect origin», query string в
  ключе; bypass сужается до `POST`.
- Слой 2 требует CDN перед gateway и включается на шаге B; на шаге A его роль для лёгких запросов
  выполняет response cache gateway.

## Шаг B: Worker и кеш CDN перед нодой

```text
браузер → Cloudflare CDN → Worker ──► R2 (HTML, __static/data, 404, оболочки)
                               │ промах, /auth/*, /__env.js
                               └──► Tunnel → theme (гибридная нода: статика, SSR, auth-BFF)
              Cloudflare CDN ───────► R2 custom domain: /assets/*, /public/* (без Worker)
              Cloudflare CDN ───────► Tunnel → gateway: /graphql (GET кешируется, POST нет)
лента событий ◄── theme-static → GitHub Actions → R2 + purge тегов страниц
theme-static → purge тегов быстрых данных и GraphQL (без рендера)
полная сборка → R2 + purge тега прошлой сборки
```

Нода на шаге B не меняется: на промах Worker-а она снова смотрит в бакет и при промахе рендерит SSR.

**Worker** (`deploy/worker/src/worker.ts`; маршрут `<hostname>/*` и маршруты без Worker-а для
`/assets/*`, `/graphql*`, `/auth/*`, `/__builder/*`, `/__env.js`, `/apps/*`, `/.well-known/*`,
`/cdn-cgi/*`):

1. Ключ — `staticKeyForPath` из runtime (та же функция, что у ноды; `keys.ts` без Node built-ins).
   Query string обрабатывается так же, как у ноды: адрес с параметром, который меняет страницу
   (`isStaticQuery`), идёт на ноду.
2. Сначала Cache API (`caches.default`): ответ Worker-а кеш CDN сам не сохраняет. Нет в кеше —
   объект через R2 binding, в Cache API с `Cache-Control: public, max-age=0, s-maxage=600,
stale-while-revalidate=3600`, `ETag` и `Cache-Tag` из метаданных объекта (`pg:<pageKey>`,
   `build:<buildId>`). Промах Cache API — отчёт координатору (`ctx.waitUntil`). Работает ли purge по
   тегу для объектов Cache API, проверяется на этапе 0; если нет, HTML идёт через origin-fetch к R2
   custom domain с Cache Rules, а теги ставит Transform Rule или метаданные объекта.
3. Объекта нет — `fetch` на гибридную ноду через Tunnel с cookie и ответом как есть. Нода
   недоступна — семейная оболочка `__shell/<family>.html` (200) или `404.html` (404).
4. `/auth/*` и `/auth/headless/*` — на ноду без кеша, с `Set-Cookie` обратно.

Worker выполняется на каждый запрос маршрута, поэтому ассеты идут с R2 custom domain
`static.<hostname>` через origin rule `/assets/*` (без Worker-а), hostname тот же, cookie
first-party. Файлы `public/` (`/favicon.ico`) Worker отдаёт из префикса `public/` бакета через тот
же Cache API (`s-maxage=7200`): путь `/favicon.ico` не совпадает с ключом бакета, и перезапись пути
стоила бы ещё одного правила. `STOREFRONT_TRUSTED_PROXY_HOPS` перепроверяется на
stage (с Worker-ом может стать 2): ошибка ломает лимиты и антифрод IAM.

**Builder на шаге B** (`publish.cdn: 'cloudflare'`) пишет в метаданные объектов HTML и данных
`x-amz-meta-cache-tag: pg:<pageKey>,build:<buildId>` (`pageKey` — 16 символов SHA-256
`locale + '\n' + path`), Worker отдаёт их как `Cache-Tag`; копирует `public/` в бакет под
`public/`.

**Cloudflare.**

- Cache Rules: HTML и `/__static/data/` eligible, «respect origin»; `/assets/` и `/public/` год,
  immutable; `GET /graphql` без `Authorization` eligible; `POST /graphql`, `/auth/*` bypass. Сейчас
  HTML bypass (`deploy/terraform/modules/frontend-edge/main.tf`).
- Tunnel как сейчас: hostname на `theme:3000` для промахов и auth, на Traefik для `/graphql`, на
  `theme-static:3100` для `/__builder/*`. Worker route перехватывает HTML и данные раньше Tunnel.
- R2 custom domain `static.<hostname>` для ассетов.

**Purge по тегам.** С апреля 2025 года доступен на всех планах, включая Free; лимиты по
документации 5 запросов в минуту с запасом 25 и до 100 тегов в запросе (сверить на этапе 0).

| Ответ                                               | `Cache-Tag`                                            | Кто чистит                                      |
| --------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| HTML и данные страницы                              | `pg:<pageKey>`                                         | job после публикации изменившейся страницы      |
| Лёгкие запросы по вариантам и прочие `GET /graphql` | `sf-vol`, `sf-p-<productUuid>`, ключи сущностей ответа | координатор по `purgeTags` маппера, без рендера |
| `SdkStorefrontPromotions`                           | `sf-promo`                                             | координатор по `discount*`                      |
| Все объекты сборки                                  | `build:<buildId>`                                      | после полной сборки, вместо `purge_everything`  |

- Очередь `purge_queue` в координаторе отправляется пачками по 100 тегов с учётом лимита; если она
  растёт быстрее лимита, теги ждут, а CDN до purge или истечения `s-maxage` отдаёт прошлую версию.
- Токен с правом `Cache Purge` (`CLOUDFLARE_PURGE_TOKEN`) у координатора и у job. Без токена очередь
  purge не заполняется: это и есть шаг A.

**Стоимость шага B** при 300 000 просмотров в месяц (цены Cloudflare на ноябрь 2026):

| Статья                                | Объём                | Стоимость                         |
| ------------------------------------- | -------------------- | --------------------------------- |
| Вызовы Worker (HTML и данные)         | ~0,5–0,7 млн         | Free (100 000 в день) или план $5 |
| CPU Worker                            | ~1–2 млн CPU-мс      | в квоте                           |
| Хранение R2 (~12 000 объектов, ~2 ГБ) | 2 ГБ                 | в бесплатных 10 ГБ                |
| Чтения R2 (только промахи CDN)        | сотни тысяч          | меньше $0,10                      |
| Записи R2 (полная пересборка)         | 12 000 на пересборку | ~$0,05 за пересборку              |
| Исходящий трафик R2                   | любой                | $0                                |

Для production — Workers Paid ($5): на Free превышение дневного лимита заканчивается отказами.

## REST API координатора

Порт `3100`, через Tunnel на публичном hostname под `/__builder/*`. Нода и Worker `/__builder/*` не
перехватывают.

| Метод и путь                                  | Кто вызывает              | Авторизация             | Назначение                                                                                                                                                                              |
| --------------------------------------------- | ------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /__builder/api/hits`                    | нода, Worker              | internal token          | `{ hits: { "<key>": n }, misses?: ["<key>"] }` → `204` (формат ноды уже реализован)                                                                                                     |
| `POST /__builder/api/builds`                  | оператор, CLI, CI, деплой | operator token или OIDC | `{mode: 'full' \| 'paths' \| 'entities', paths?, entities?, locales?, reason, image?}` → `202 {requestId}`                                                                              |
| `GET /__builder/api/builds/:requestId`        | оператор, CLI             | operator token          | задания в очереди и в работе, `run_id`, ссылка на запуск                                                                                                                                |
| `GET /__builder/api/pages?dep=Product:<uuid>` | оператор                  | operator token          | какие страницы зависят от ключа, dirty ли и почему                                                                                                                                      |
| `GET /__builder/api/status`                   | мониторинг                | operator token          | очередь, dirty, курсор и его отставание, аренда, `currentImage`, последняя полная сборка, очередь purge, `dead_jobs`                                                                    |
| `GET /__builder/api/health`                   | Swarm                     | —                       | healthcheck                                                                                                                                                                             |
| `POST /__builder/api/leases`                  | job                       | OIDC                    | `{requestId, runId, runAttempt, capacity}` → `{leaseId, mode, image, jobs[{…, htmlHash, dataHash}], expiresAt}`; пустой `jobs` — очередь пуста                                          |
| `POST /__builder/api/leases/:id/heartbeat`    | job                       | OIDC                    | продление на 3 минуты; `410`, если аренды нет                                                                                                                                           |
| `POST /__builder/api/leases/:id/results`      | job                       | OIDC                    | NDJSON по странице: `{jobIds, locale, path, route, ownerKey, outcome: 'published' \| 'unchanged' \| 'gone' \| 'failed', htmlHash, dataHash, deps, validUntil, renderStartedAt, error?}` |
| `POST /__builder/api/leases/:id/complete`     | job                       | OIDC                    | закрыть аренду; `{fullBuild?, seenPages?}`; невернувшиеся задания обратно в очередь                                                                                                     |

- **OIDC.** Job получает токен GitHub (`id-token: write`, audience `shopana-static-coordinator`);
  координатор проверяет подпись по JWKS `token.actions.githubusercontent.com` и claims `repository`,
  `workflow_ref` (только `static-site.yml@refs/heads/main`), `environment`. Общего секрета нет.
- **Operator token** — длинный случайный токен из secret стека. **Internal token** — отдельный, только
  для отчётов о попаданиях (`STOREFRONT_STATIC_COORDINATOR_TOKEN` у `theme`).
- Запись результата — одна транзакция на страницу: upsert `pages`, замена набора `page_deps`,
  удаление поглощённых заданий, снятие `dirty_since` по правилу `render_started_at`. `gone` переводит
  страницу в `status = 'gone'` и удаляет её зависимости.
- Задание, трижды вернувшееся `failed` или с истёкшей арендой, уходит в `dead_jobs`; страница
  остаётся в прошлой версии и dirty.

## Job: `storefront-runtime static run`

Клиент аренды поверх реализованного builder-а (`renderStaticPaths`, `buildStaticSite`):

1. Аренда → рендер пачки (до 500 заданий, пул `worker_threads`, `concurrency` из `static.config.ts`)
   → `stripVolatileFields` → хэши → сравнение с `htmlHash`/`dataHash` аренды → запись изменившихся
   объектов → manifest поверх прочитанной версии (`commitManifest`) → шаг B: purge `pg:<pageKey>`
   изменившихся → результаты с `deps` (`extractPageDeps`) → следующая аренда. Пока очередь не пуста
   или не кончился бюджет (`--budget 35m`), heartbeat каждую минуту.
2. `owner:` задание: рендер страницы сущности по `owner_key`; новый путь публикуется, старый
   (если handle изменился) — `gone`.
3. `mode: full`: перечисление по `static.config.ts`, рендер всех адресов, удаление файлов вне нового
   manifest и ретайр ассетов (как `buildStaticSite`), `complete` с `{fullBuild: true, seenPages}`;
   координатор переводит в `gone` страницы вне сборки и снимает все dirty; шаг B — purge
   `build:<buildId>` прошлой сборки.
4. Локальный режим без координатора: `static run --events <файл>` читает события из NDJSON, берёт
   зависимости каждой страницы manifest из её данных (`extractPageDeps`), сопоставляет изменения
   (`changeReaches`), печатает, что было бы eager, dirty, новыми страницами, полной сборкой и purge,
   и рендерит затронутое в store. Для разработки маппера и аспектов.
5. «Не изменилось» решается по хэшам прошлого manifest (он и есть источник хэшей аренды): страница,
   чьи HTML и данные совпали, не пишется и не чистится (`unchanged`).
6. Аутентификация job: OIDC-токен GitHub (`ACTIONS_ID_TOKEN_REQUEST_URL`, audience
   `shopana-static-coordinator`, обновление каждые 4 минуты), для ручного запуска —
   `STATIC_OPERATOR_TOKEN`.

## GitHub Actions

### Workflow `static-site.yml` в репозитории темы

Заменяет `static-full-build.yml`: полная сборка — `mode: full` того же workflow.

```yaml
name: Static site
run-name: static ${{ inputs.mode }} ${{ inputs.environment }} ${{ inputs.request_id || github.run_id }}

on:
  workflow_dispatch:
    inputs:
      environment:
        { type: choice, options: [stage, production], required: true }
      mode: { type: choice, options: [queue, full, paths], default: queue }
      request_id: { type: string, required: false }
      paths: { type: string, required: false }
      locales: { type: string, required: false }
      image: { type: string, required: false } # пусто = currentImage координатора
      reason: { type: string, required: false }
  schedule:
    - cron: '30 1 * * *' # ночная полная сборка, матрица окружений

permissions:
  contents: read
  id-token: write
  packages: read

concurrency:
  group: static-site-${{ inputs.environment || 'scheduled' }}
  cancel-in-progress: false
```

Один job `render`, `environment: ${{ inputs.environment }}`, `timeout-minutes: 45`:

1. `docker pull` образа `image` или `currentImage` из `GET /__builder/api/status`.
2. Если `mode` не `queue` (ручной запуск, cron), запрос сначала регистрируется:
   `POST /__builder/api/builds`.
3. `docker run … storefront-runtime static run --coordinator "$COORDINATOR_URL" --request-id …
--run-id "$GITHUB_RUN_ID" --budget 35m`.
4. После `full` — `deploy-theme.mjs smoke`.

Секреты окружения GitHub: ключ записи в бакет, `CLOUDFLARE_PURGE_TOKEN` (шаг B),
`STOREFRONT_SERVER_GRAPHQL_URL`, `STOREFRONT_PRIVATE_TOKEN`; переменные `COORDINATOR_URL`,
`STOREFRONT_PUBLIC_URL`, `STOREFRONT_STATIC_STORE`, `STOREFRONT_STATIC_S3_ENDPOINT`. Токена
координатора нет, вместо него OIDC.

### Dispatch

```http
POST https://api.github.com/repos/shopanaio/storefront-brand-bite-and-crunch/actions/workflows/static-site.yml/dispatches
Authorization: Bearer <installation token GitHub App>
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28

{ "ref": "main",
  "inputs": { "environment": "stage", "mode": "queue",
              "request_id": "d-20261106-120000-7f3a", "reason": "productUpdated×14, hits×5" } }
```

- GitHub App `shopana-static-dispatch` с одним разрешением `Actions: Read and write`, только в
  репозитории темы. `app_id`, `installation_id` и ключ в secret стека; installation token
  обновляется раз в 50 минут.
- Запуск сообщает `request_id` и `GITHUB_RUN_ID` первой арендой — запрос `claimed`.
- **Накопление:** первое задание после простоя запускает таймер на 20 с, следующие его не
  продлевают; между двумя dispatch не меньше 60 с.
- **Один незабранный запрос:** пока последний dispatch не забран, новых нет; не забран за 10 минут —
  `stale` и новый.
- **Активная аренда:** новые задания забирает работающий запуск; dispatch ставится, когда аренда
  закрыта и очередь не пуста, или когда до конца бюджета меньше 3 минут.
- **Дочист** отдельного dispatch не вызывает: его задания забирает только запуск, поставленный ради
  eager-заданий или уже работающий.
- Ручной запуск:

  ```bash
  curl -X POST "$COORDINATOR_URL/__builder/api/builds" -H "Authorization: Bearer $STATIC_OPERATOR_TOKEN" -d '{"mode":"entities","entities":["Product:0196…"],"reason":"manual"}'
  ```

## Источники заданий кроме событий

- **Таймеры.** Раз в 30 с страницы с `valid_until <= now`, приоритет 2. Промо в HTML нет, поэтому
  только окна коллекций и прочего контента со временем.
- **Попадания и промахи** (выше).
- **Фоновый дочист** dirty.
- **Новый образ темы.** `deploy-theme.mjs` после смены `THEME_IMAGE` ставит `POST
/__builder/api/builds {mode: 'full', image}`; `currentImage` координатора обновляется.
- **Ночная полная сборка** — cron `static-site.yml`.
- **`CURSOR_EXPIRED`** — полная сборка.

## Восстановление индекса

Индекс — производные данные: его потеря не теряет сайт, только точность инвалидации до полной
сборки.

- Раз в сутки и после каждой полной сборки `VACUUM INTO`, снимок в бакет
  `__builder/index/<date>.sqlite.gz`, последние 7. Префикс `__builder/` — не файл сайта
  (`isStaticSiteKey`), полная сборка его не удаляет.
- Пустой volume при старте: последний снимок вместе с курсором, дочитывание ленты. Курсор снимка
  `CURSOR_EXPIRED` или снимка нет — `full`.
- `dispatches` и аренды после восстановления сбрасываются; активный запуск получит `410` на
  heartbeat, его задания вернутся в очередь по истечении аренды.

## Изменения по репозиториям

### `packages/shopana-storefront-sdk`

1. `static/fieldClasses.ts`: `VOLATILE_FIELDS`, `stripVolatileFields`; `viewer.ts` на общем
   механизме.
2. `STATIC_FIELD_ASPECTS` рядом с type policies, `extractPageDeps`, `mapEventToChanges`,
   `STATIC_EVENT_TOPICS`, декодер global ID; `entities.ts` без промо в `TIME_FIELDS`.
3. Клиент ленты событий для координатора.
4. `modules/volatile/`: запросы, `VolatileDataProvider` (гостевой и личный батчи, повторы,
   `withPrice` по режиму хранилища), `useVolatileCard`, `useVolatileVariant`; в `AppProviders`.
5. `graphql/apollo/Environment.ts`: `GET`-линк для allow-list без `Authorization` и visitor id,
   локаль в query.
6. `useViewerRefresh` — триггер личного батча вместо `refetch` запросов.
7. Codegen: persisted documents и манифест allow-list.

### `packages/shopana-storefront-runtime`

1. Роль `static coordinator` (`storefront-runtime static coordinator`): HTTP-сервер на `3100`,
   SQLite-схема с миграциями при старте, цикл ленты, маппер, индекс, eager/dirty/lazy, попадания,
   дочист, таймеры, схлопывание, dispatcher и клиент GitHub App, OIDC и токены, очередь purge,
   снимки индекса.
2. `static run`: аренда, рендер, `stripVolatileFields`, хэши, публикация, purge тегов страниц,
   результаты с `deps`; локальный режим `--events`.
3. Builder: отказ при летучем поле в снимке; `Cache-Tag` в метаданных объектов (шаг B); копия
   `public/` в бакет.
4. `keys.ts` остаётся без Node built-ins: его импортирует Worker.

### Тема `storefront-brand-bite-and-crunch`

1. Убрать `quantityAvailable` и `promotions` из `ProductPageVariantFragment`
   (`runtime/pages/product/ProductPageQuery.graphql`) и `quantityAvailable` из карточки
   (`templates/collection/apollo/useListingProductCardFragment.shopana.graphql`).
2. `mapApiProductToProduct.ts`, `mapListingProductCard.ts`: `maxQuantity` и промо из
   `useVolatileVariant`; регистрация id в `ListingProductCard`, секции товара и колонках сравнения.
3. `ProductPromotions`: скелетон до `ready`.
4. `templates/index/blocks/ProductCard.tsx`: убрать жёсткий `isAvailable: true`, если блок показывает
   реальные товары.
5. `fieldAspects` в `static.config.ts` для полей темы.
6. `.github/workflows/static-site.yml` вместо `static-full-build.yml`.

### `internal`

1. Лента событий — сделано; служебный пользователь с ролью для чтения ленты.
2. Gateway: плагин `Cache-Control`, `Cache-Tag`, `ETag` для гостевых persisted `GET`; response cache
   Hive с `Accept-Language` и склеиванием промахов; запросы SDK в манифесте allow-list.
3. Открытый вопрос: событие `productUpdated` с `inventory` при переходе «есть ↔ нет» от заказов.
   Сейчас его нет, и JSON-LD `availability` устаревает до ленивого рендера или ночной сборки.
4. В будущем: `ProductVariant.viewerPromotions` в pricing.

### Инфраструктура

1. `deploy/swarm/theme.yml`: сервис `theme-static` из `THEME_IMAGE`, `replicas: 1`, volume
   `theme-static-data` с placement по метке ноды, `stop_grace_period: 30s`, healthcheck
   `/__builder/api/health`; у `theme` — `STOREFRONT_STATIC_COORDINATOR_URL` и internal token.
2. Tunnel: `/__builder/*` → `theme-static:3100`.
3. Секреты стека: `SHOPANA_EVENTS_REFRESH_TOKEN`, `STATIC_OPERATOR_TOKEN`, internal token, ключ GitHub
   App, ключ бакета для снимков индекса, `CLOUDFLARE_PURGE_TOKEN` (шаг B). `deploy/runtime/start.cjs`
   разрешает `STOREFRONT_STATIC_COORDINATOR_TOKEN` в `server-env.json`.
4. `deploy-theme.mjs`: `theme-static` в `check`, `deploy`, `status`; после смены образа — полная
   сборка через API координатора.
5. GitHub: App `shopana-static-dispatch`; окружения `stage` и `production` с секретами.
6. Шаг B: `deploy/worker/` (`wrangler.toml`, R2 binding, route, переменная SSR-origin), Worker route,
   Cache Rules, custom domain R2 в `deploy/terraform/modules/frontend-edge`.

## Тестирование

Unit, typecheck, lint, build и интеграционные тесты координатора на временной SQLite; e2e и
Playwright — отдельно, по разрешению.

- **SDK, зависимости:** `extractPageDeps` на снимках товара, категории, главной, страницы контента
  в обоих форматах state; аспекты карточки и крошек; летучие поля не дают зависимостей;
  `DynamicCollection` → `query`; layout-ключи не попадают.
- **SDK, маппер:** каждый топик `STATIC_EVENT_TOPICS` даёт ожидаемые изменения; `inventory` →
  `lazy` и не трогает страницы только с `content`; `discount*` → нет страниц, `purgeTags`.
- **SDK, классы полей:** не пересекаются; `stripVolatileFields` на обоих форматах; тест покрытия
  аспектов полями фрагментов темы.
- **SDK, быстрые данные:** батч (за кадр, сортировка, по 100, повтор не раньше 30 с); `ready`
  `false` при серверном рендере; соединение ключей промо; `withPrice`; личный батч только с сессией и
  `Authorization`, гостевой никогда; `useViewerRefresh` не перезапрашивает `ProductPageQuery`.
- **Builder:** в HTML и данных нет летучих полей; два рендера с разными остатками без перехода
  наличия и разными промо дают один хэш; отказ при летучем поле во фрагменте.
- **Координатор:** курсор в одной транзакции с заданиями, повтор события не дублирует, `hasMore`
  читается сразу, `CURSOR_EXPIRED` → `full`; eager и dirty, `lazy` только dirty; попадание по dirty →
  приоритет 1, по актуальной — ничего; промах → `path:` задание; дочист только при пустой очереди и
  без dispatch; снятие dirty по `renderStartedAt`; `unchanged` не пишет и не чистит; схлопывание;
  истечение аренды и `dead_jobs`; `gone` при `fullBuild`; правила dispatch; очередь purge соблюдает
  лимит и пачку; восстановление из снимка.
- **Контракты:** мок `api.github.com` (тело dispatch, обновление installation token), мок JWKS
  (claims OIDC), мок ленты событий.
- **Gateway (internal):** `Cache-Control` по `validUntil`, `Cache-Tag` по товарам, `no-store` с
  `Authorization`.
- **Worker:** `workerd`/miniflare: ключи, Cache API, фолбэк на ноду, деградация в оболочку,
  `/auth/*` с cookie, отчёт о промахе.
- **Stage:** правка цены в admin → своя страница и популярные листинги обновлены за 1–1,5 минуты;
  непопулярный листинг dirty и обновляется после открытия; повторное сохранение без изменений —
  `unchanged`, в бакет не пишется; `discount*` не ставит рендеров; на шаге B `cf-cache-status: HIT`
  на втором запросе HTML и `GET /graphql`, `/auth/login` не кешируется.

## Этапы

Каждый этап поставляет свою часть целиком, со всеми оптимизациями.

0. **Измерения и проверки (1 день).** Время запуска job с загрузкой образа; реальное число
   зависимостей на страницу; отставание кешей Storefront API после события (`STATIC_READ_LAG_MS`);
   доля трафика в верхних 300 страницах на stage; чтение объекта R2 с ноды Swarm (p50/p95 полного и
   условного `GET`); лимиты purge по тегам на Free и purge для объектов Cache API;
   `stale-while-revalidate` на Cloudflare; response cache Hive с `Accept-Language` и склеивание
   промахов.
1. **SDK: данные (3 дня).** Классы полей, `STATIC_FIELD_ASPECTS`, `extractPageDeps`, маппер,
   `STATIC_EVENT_TOPICS`, декодер global ID, `TIME_FIELDS` без промо, клиент ленты.
2. **SDK и тема: быстрые данные (3,5 дня).** Лёгкие запросы, `GET`-линк, провайдер и хуки, личный
   батч вместо `refetch` в `useViewerRefresh`; фрагменты темы без летучих полей, регистрация id,
   скелетон промо, `fieldAspects`; тест покрытия аспектов.
3. **Gateway (1 день, internal).** Заголовки кеша и тегов, `ETag`, response cache, allow-list в
   манифесте. До включения быстрых данных на stage.
4. **Builder и `static run` (2 дня).** `stripVolatileFields` и отказ сборки, `deps` в результатах,
   клиент аренды, локальный режим `--events` для проверки маппера на реальных снимках.
5. **Координатор (1–1,5 недели).** Всё из раздела «Изменения по репозиториям», runtime, пункт 1: лента,
   индекс, eager/dirty/lazy, попадания и промахи, дочист, таймеры, схлопывание, REST API, аренды,
   OIDC, dispatcher и GitHub App, очередь purge (пустая без токена), снимки и восстановление.
6. **Stage, шаг A (2 дня).** `static-site.yml` вместо `static-full-build.yml`, `theme-static` в
   Swarm, Tunnel `/__builder/*`, секреты, internal token у `theme`, `deploy-theme.mjs`. _Готово,
   когда_ правка товара в admin обновляет его страницу на ноде не позднее двух минут, непопулярный
   листинг обновляется после открытия, `discount*` не ставит рендеров, а промо и остатки свежие с
   точностью до 30 с.
7. **Шаг B (3–4 дня).** Worker и тесты, `Cache-Tag` в метаданных, custom domain для ассетов, Cache
   Rules для HTML и `GET /graphql`, токен purge, smoke для CDN, `STOREFRONT_TRUSTED_PROXY_HOPS`.
   _Готово, когда_ статика отдаётся из CDN (`cf-cache-status: HIT`), промахи и `/auth/*` идут на ноду,
   правка товара обновляет страницу в CDN не позднее двух минут, а подгрузка второй страницы
   листинга двумя браузерами даёт `HIT` на втором.
8. **Production** после недели на stage без ручных полных сборок.

## Риски и открытые вопросы

- **Первый посетитель dirty-страницы видит прошлую версию** — осознанная цена для непопулярных
  страниц. Летучие поля свежие и там; цены и наличие поправляет лёгкий запрос при `withPrice` и
  всегда наличие. Максимум устаревания контента — до ночной сборки.
- **Минуты GitHub Actions.** Каждый запуск — 1–2 минуты runner-а с загрузкой образа. Dirty, дочист
  без dispatch и `unchanged` сокращают число запусков; если квоты не хватит, self-hosted runner с
  меткой `static` на ноде Swarm, меняется только `runs-on`.
- **Полная сборка при изменении layout.** Меню и настройки магазина — тысячи рендеров. Если это
  часто, меню переводится на клиентскую загрузку из слоя 2 с коротким TTL.
- **Единственная реплика координатора.** Пока он недоступен, лента не читается, но события не
  теряются; сайт отдаётся из бакета. HA не требуется.
- **Лимиты purge на Free.** При массовых изменениях очередь purge отстаёт; страница в CDN обновится
  по истечении `s-maxage` (600 с).
- **Purge по тегу для Cache API** не подтверждён документацией; проверка на этапе 0, запасной путь в
  разделе «Шаг B».
- **Нагрузка на gateway на шаге A.** Один `GET` лёгкого запроса на просмотр; без response cache это
  поток `nodes` в catalog и pricing. Response cache обязателен до включения быстрых данных на
  production. Фрагментация ключей на фильтрах и прокрутке меряется на stage; при плохом hit rate —
  батч по товарам.
- **Статика при клиентском переходе и свежие поправки.** Link статических ответов отдаёт в API
  запрос, чей ответ разошёлся бы с кешем; после лёгких ответов это может снизить долю ответов из
  статики. Меряется на stage, решение — в разделе «Apollo: снимок и свежий ответ».
- **SEO наличия.** Наличие от заказов устаревает в JSON-LD до ленивого рендера или ночной сборки
  (открытый вопрос к internal). Googlebot выполняет JS и получит свежий ответ.
- **CLS промо.** При расхождении снимка с ответом блок промо меняет высоту; вопрос к дизайну.
- **Изменение handle.** Задание `owner:` рендерит новый путь и переводит старый в `gone`; редирект со
  старого адреса — вопрос темы и SEO.
- **Worker на каждом запросе (шаг B).** $0,30 за миллион сверх квоты; при росте трафика HTML
  переезжает в Workers Static Assets ценой публикации снимком.
- **Proxy hops на шаге B.** Ошибка в `STOREFRONT_TRUSTED_PROXY_HOPS` ломает лимиты и антифрод IAM.
- **Приватность.** Гостевой лёгкий запрос никогда не несёт visitor id и токен (тест линка); личные
  поля никогда не попадают в гостевые запросы.

## Реализация

Ветка `phl/static-pages-generation`, PR #3. Что сделано по этапам и где.

**Этап 1 — SDK, данные** (`packages/shopana-storefront-sdk/src/static/`).

- `fieldClasses.ts`: `VOLATILE_FIELDS`, `CORRECTABLE_FIELDS` и общий механизм таблиц (`stripFields`,
  `findFields`, `showsFields`); `VIEWER_FIELDS` в `viewer.ts` на нём же. `stripVolatileFields`
  на обоих форматах state выбрасывает и записи нормализованного кеша, до которых доходили только
  выброшенные поля.
- `graphql/apollo/fieldAspects.ts`: `STATIC_ASPECTS`, `STATIC_FIELD_ASPECTS`, `mergeFieldAspects`;
  `fieldAspects` в `StaticSiteConfig`.
- `deps.ts`: `extractPageDeps(state, { fieldAspects, translated })` → `{ deps, layout, owner }`.
- `events.ts`: `STATIC_EVENT_TOPICS`, `mapEventToChanges`, `changeReaches`, `STATIC_OWNER_PATHS`;
  `globalId.ts` — декодер global id; `entities.ts` не видит промо (state сначала без летучих полей).
- `eventFeed.ts`: клиент ленты (`createEventFeedClient`) и источник access-токена по refresh-токену
  (`refreshTokenSource`, OAuth 2 `refresh_token` на `SHOPANA_EVENTS_TOKEN_URL`; повёрнутый
  refresh-токен координатор хранит в `settings`).

**Этап 2 — SDK, быстрые данные** (`packages/shopana-storefront-sdk/src/modules/volatile/`).

- Запросы `SdkVolatileCards`, `SdkVolatileVariant`, `SdkViewerLoyalty` и фрагменты
  `SdkLoyaltyPresentation` и др. (`core/operations.graphql`).
- `VolatileBatcher` (кадр, сортировка, по 100, не чаще 30 с, таймер `validUntil` промо варианта,
  `visibilitychange`, `refresh` для ошибки корзины, личный батч только с сессией и флагом
  `shopanaViewer`) и `VolatileDataProvider` в `AppProviders`; хуки `useVolatileCard`,
  `useVolatileVariant` (`ready` — полнота фрагмента в кеше, поэтому `false` на сервере и при
  гидратации), `useRefreshVolatile`. `withPrice` — `volatilePrices` статического документа
  (`true` для статики в образе, builder ставит его для store `fs`).
- `graphql/apollo/persisted.ts`: id документов, `GET`-линк, allow-list; манифест для gateway
  пишет `scripts/persisted-documents.mjs` при сборке SDK.
- `useViewerRefresh` — личный батч и перезапрос только запросов с `VIEWER_REFETCH_FIELDS`.
- `useValidUntilRefetch` остаётся в `useStorefrontPromotions` (общий набор промо), таймер промо
  варианта — в провайдере.
- Хуки читают фрагменты с `withPrice` батчера: полнота фрагмента совпадает с тем, что приходит.
- **Тема** (`storefront-brand-bite-and-crunch`, `3688c6e`): `quantityAvailable` и `promotions` убраны
  из `ProductPageVariantFragment` и фрагмента карточки; `useVariantFastData` (на `useVolatileVariant`)
  даёт странице товара предел количества при `DENY` и промо после гидратации, `ProductPromotions`
  показывает до ответа скелетон одной строки (без JS скрыт `<noscript>`-стилем); карточки листинга и
  колонки сравнения регистрируют варианты (`useVolatileCard`), колонки берут из ответа наличие и
  цену. Наличие и цены самой страницы и карточек ответ поправляет в кеше, их запросы перерисовываются
  сами. `fieldAspects` в `static.config.ts` (сравнение, «часто покупают вместе», комплектация,
  `inventoryItem`, элементы комплекта). Тест `src/staticFields.test.ts`: ни один документ темы не
  выбирает летучие поля, каждое поле цены, наличия и медиа сущности имеет свой аспект (он нашёл
  `featuredMedia` категорий и коллекций без аспекта — добавлено в SDK). `HomeSlideshowProductCard`
  с жёстким `isAvailable: true` нигде не использовался — удалён.

**Этап 4 — builder и `static run`** (`packages/shopana-storefront-runtime/src/static/`).

- `renderer.ts`: отказ при летучем поле, `deps` в результате рендера.
- `builder.ts`: `renderStaticPages` (по адресу или по `owner`, `published | unchanged | gone |
failed`, хэши, зависимости, теги изменившихся страниц, purge), `onPage` полной сборки, теги CDN в
  метаданных, `public/` в бакет, purge `build:<id>` после полной сборки.
- `run.ts`: клиент аренды (`createCoordinatorClient`, `jobTokenSource`), `runStaticJobs`
  (`--budget`, heartbeat раз в минуту, результаты пачками по 200), `--events`
  (`planStaticEvents`, `runStaticEvents`); `purge.ts` — purge тегов Cloudflare.

**Этап 5 — координатор** (`src/static/coordinator/`): `db.ts` (схема и миграции), `state.ts`
(события, eager/dirty/lazy, layout, попадания, таймеры, дочист, схлопывание, аренды, результаты,
полная сборка, dead jobs, запросы операторов, статус), `feed.ts` (цикл ленты, `CURSOR_EXPIRED` и
`CURSOR_INVALID` → полная сборка), `dispatcher.ts`, `github.ts` (GitHub App, dispatch, OIDC по
JWKS), `purgeQueue.ts` (5 в минуту, запас 25, по 100), `snapshots.ts`, `http.ts` (REST API),
`main.ts` (`storefront-runtime static coordinator`, конфигурация из env). Таймер накопления
dispatch стартует с первого задания после пустой очереди и не сбрасывается dispatch-ем.

**Этап 6 — stage, шаг A (этот репозиторий):** `theme-static` в `deploy/swarm/theme.yml` (volume,
метка ноды `shopana.static`, healthcheck), `deploy/runtime/start-static.cjs` и `static-env.json`,
internal token в `server-env.json`, `/__builder/*` в Tunnel (`static_coordinator_origin`) и в
исключениях Cache Rules/challenge, `deploy-theme.mjs` (секрет, ожидание `1/1`, smoke health,
полная сборка после нового образа), `/data` в Dockerfile. В теме (`545cd33`)
`.github/workflows/static-site.yml` заменил `static-full-build.yml`: `docker run` образа из входа
или `currentImage` координатора, `static run --store … --coordinator …`; `full` и `paths` сначала
регистрируются `POST /builds`. Все значения — из переменных и секретов окружения GitHub
(`COORDINATOR_URL`, `STOREFRONT_PUBLIC_URL`, `NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_API_KEY`,
`STOREFRONT_STATIC_STORE`, `STOREFRONT_STATIC_S3_ENDPOINT`, `CLOUDFLARE_ZONE_ID`; секреты
`STOREFRONT_SERVER_GRAPHQL_URL`, `STOREFRONT_PRIVATE_TOKEN`, ключ записи бакета,
`CLOUDFLARE_PURGE_TOKEN`), в файле workflow их нет. Ночью — полная сборка stage.

**Этап 7 — шаг B в коде:** `deploy/worker/` (Worker, `wrangler.toml`, тесты на Node с фейками
R2 и Cache API вместо miniflare: его нет в зависимостях workspace), `static_cdn` в Terraform
`zone` (маршруты Worker-а, custom domain бакета, origin rule ассетов, Cache Rules HTML и
`GET /graphql`), `STATIC_CDN=on` в `deploy-theme.mjs` (smoke `HIT`, два hops). Ничего не
применено и не задеплоено.

**Тесты.** SDK: `static/coordinator.test.ts` (классы полей, global id, зависимости в обоих
форматах, маппер по всем топикам, клиент ленты), `modules/volatile/volatile.test.tsx` (батч,
`ready`, личный батч, `GET`-линк, `ViewerRefresh`). Runtime: `builder.test.ts` (результаты и
зависимости, `unchanged`, отказ при летучем поле, `owner` и смена handle, теги и purge, `static
run`, OIDC-токен job, `--events`), `purge.test.ts`, `coordinator/coordinator.test.ts` (события,
попадания, результаты, схлопывание, dead jobs, истечение аренды, полная сборка, таймеры, дочист,
dispatch, цикл ленты, очередь purge, снимки, GitHub App и OIDC, REST API, запуск сервиса). Worker:
`deploy/worker/src/worker.test.ts`. Terraform: `terraform test` модулей `cloudflare` и
`frontend-edge` с mock provider. `scripts/deploy-theme.test.mjs`.

**Не проверено:** всё, что требует stage, internal и Cloudflare (этап 0, «Готово, когда» этапов 6
и 7), e2e и браузер, рендер реальной темы (`static build` против mock-сервера), запуск
`static-site.yml`. Образ темы должен быть собран с ревизией фреймворка, где есть `static run`:
`build-theme.yml` закрепляет свою ревизию `shopanaio/storefront`.
