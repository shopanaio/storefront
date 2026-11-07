# Точечная инвалидация статики и сборка через GitHub Actions

Дополняет план `plans/static-site-generation.ru.md` (этап 7 «Точечная инвалидация»). Там описаны
гибридная нода (шаг A: готовый HTML из бакета, промах рендерится SSR) и Worker с кешем CDN перед
ней (шаг B). Здесь описано, как статика обновляется после изменений в internal без полной
пересборки. Полная пересборка по расписанию (ночью) и при релизе образа остаётся без изменений.

Точечная инвалидация работает только с хранилищем-бакетом. В режиме «статика в образе»
(`build/static`) её нет: данные обновляются с новым образом.

## Вывод

**Источник изменений — лента событий internal, которую координатор читает по курсору.**
Push-вебхуков нет. Координатор раз в несколько секунд запрашивает у internal события магазина
после своего курсора по списку топиков и сохраняет новый курсор в той же транзакции, что и
постановку заданий. Потерянных доставок не бывает, после простоя лента перечитывается с места
остановки, порядок сохраняется. Если курсор устарел (`CURSOR_EXPIRED`), координатор ставит полную
сборку и начинает с текущего момента. Ежечасная сверка по `updatedAt` не нужна, страховкой
остаётся ночная полная сборка.

**Решение «какие страницы затронуты» на стороне темы.** Обратный индекс «зависимость →
страницы» с маской аспектов строится из нормализованного кеша Apollo каждой отрендеренной
страницы. Маппер переводит событие в изменения зависимостей, индекс даёт список страниц.

**Затронутые страницы помечаются устаревшими, а рендерятся сразу только важные.** Сразу (eager)
рендерятся своя страница изменённой сущности и самые посещаемые страницы. Остальные получают
отметку `dirty` и продолжают отдаваться в прошлой версии; рендер ставится, когда страницу
открывают (stale-while-revalidate, как ISR в Next.js), или фоновым дочистом, когда очередь пуста.
Массовое изменение больше не вызывает шторм рендеров и не эскалируется в полную сборку.

**Быстро меняющиеся данные отделяются от HTML** (`plans/static-volatile-data.ru.md`).
`quantityAvailable` и промо в HTML не попадают вовсе, наличие (`availableForSale`) и цена
остаются в HTML последним известным значением. Свежие значения приходят живыми лёгкими
GraphQL-запросами SDK с кешем 30 с. Эти ответы не статика: builder их не генерирует, в индекс они
не входят. События `discount*` и таймеры промо больше не вызывают рендер, `inventory` почти не
меняет HTML, а с публикацией по хэшу почти не доходит до бакета.

**Публикуется только то, что изменилось.** Job сравнивает хэши HTML и JSON с прошлой версией.
Совпали — объект не перезаписывается, purge не делается, в индексе обновляются только зависимости
и время рендера.

**Purge по тегам Cloudflare на шаге B.** С апреля 2025 года purge по тегу доступен на всех
планах, включая Free. HTML и JSON страницы несут тег страницы, быстро меняющиеся ответы и ответы
GraphQL — теги сущностей. На шаге A purge нет вообще: гибридная нода видит новую версию через TTL
своего кеша.

**Рендер выполняется в GitHub Actions.** Координатор (`theme-static`, одна реплика с SQLite)
рендер не запускает: он держит ленту, индекс и очередь и ставит workflow через REST API GitHub.
Запущенный job забирает накопленные задания под аренду, рендерит, публикует и возвращает
метаданные страниц.

## Поток

```text
internal: лента событий магазина (API по курсору)
        ▲ опрос каждые STATIC_EVENTS_POLL_MS (2 с)
        │
theme-static (координатор)
   │ курсор + события → изменения → страницы (индекс, аспекты)
   │ своя страница и популярные → очередь (eager)
   │ остальные → dirty
   │ ◄── попадания по страницам от гибридной ноды (шаг A) и Worker-а (шаг B)
   │     dirty-страница с попаданием → очередь
   │ пустая очередь → фоновый дочист dirty
   ▼
GitHub REST: workflow_dispatch static-site.yml {mode: queue}
   ▼
GitHub Actions job (образ темы) ── аренда ──► рендер → сравнение хэшей
   │ изменилось: запись в бакет; шаг B: purge по тегам страниц
   │ не изменилось: ничего не пишется
   └──► результаты в координатор (страницы, зависимости, хэши, validUntil)
```

Задержка от изменения в admin до новой версии своей страницы:

- фиксация события и опрос ленты: 1–3 с;
- накопление в координаторе: 20 с;
- запуск job и загрузка образа: 30–60 с;
- рендер: секунды;
- шаг A: до `STOREFRONT_STATIC_CACHE_TTL` (10 с) в кеше ноды; шаг B: purge по тегу, меньше
  секунды.

Итого 1–1,5 минуты. Dirty-страница обновляется через ту же задержку после первого открытия;
первый посетитель видит прошлую версию.

## Лента событий internal

Реализовано в internal (6 ноября 2026, не закоммичено на момент записи): два admin
GraphQL-поля сервиса `webhooks` через gateway admin. Спецификация
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

- `envelope` — тело вебхука, построенное той же `serializeEventEnvelope`, с тем же усечением
  `changes`; `id` равен `eventId`. Маппер работает с ним как с конвертом вебхука.
- Ошибки: `CURSOR_EXPIRED`, `CURSOR_INVALID`, `TOPICS_EMPTY`, `TOPIC_UNKNOWN`,
  `TOPICS_DUPLICATE`, `LIMIT_INVALID`, `API_VERSION_UNSUPPORTED`, `SINCE_INVALID`,
  `ACCESS_DENIED`.
- Курсор: `v1.` + base64url JSON с магазином, позицией и временем, привязан к магазину. Порядок
  ленты `(transaction_id, dispatch_position)`, где `transaction_id` — новая колонка
  `domain_events` со значением `pg_current_xact_id()`. Лента отдаёт только строки транзакций
  старше самой старой ещё выполняющейся транзакции, поэтому поздно зафиксированные события не
  теряются, а курсор не уменьшается. Цена: долгая транзакция в кластере Postgres задерживает
  ленту, но не теряет события. Чтение только с primary.
- Хранение `domain_events` — 90 дней (`DOMAIN_EVENTS_RETENTION_DAYS`); курсор или `since` старше
  89 дней даёт `CURSOR_EXPIRED`.
- Магазин берётся из admin context (`x-store-name` и Bearer-токен), не из параметров. Права:
  `store.webhooks:read` плюс чтение домена каждой группы топиков (`store.data` для каталога,
  онлайн-магазина, медиа, отзывов, листинга и лояльности; `store.profile` для магазина;
  `store.localization` для переводов).

Открытые вопросы со стороны internal:

- **Токен координатора.** Изменений в iam нет и не будет. Координатор ходит в gateway admin как
  служебный пользователь магазина с минимальной ролью (`store.webhooks:read` и чтение доменов
  топиков) и сам продлевает его сессию refresh-токеном. Если сессию отозвали, координатор пишет
  ошибку в `status` и ждёт нового refresh-токена в secret стека; события за это время не
  теряются, пока курсор не устарел.
- Права ленты строже журнала доставок вебхуков (тот виден с `store.webhooks:read`).

Со стороны координатора:

- Список топиков фиксирован в SDK: `STATIC_EVENT_TOPICS` в `@shopana/storefront-sdk/static`.
  Событие с топиком без правила в маппере сохраняется в лог и ничего не вызывает.
- Цикл опроса: запрос с курсором → в одной транзакции SQLite запись событий в
  `event_log` (id, топик, время, число изменений), разбор в изменения, постановка jobs и
  пометка dirty, сохранение `nextCursor` в `event_cursor`. Если `hasMore`, следующий запрос сразу,
  иначе через `STATIC_EVENTS_POLL_MS`.
- Повтор события после сбоя между ответом API и коммитом безопасен: обработка идемпотентна,
  дедупликация по id события в `event_log`.
- `CURSOR_EXPIRED`: курсор сбрасывается на «сейчас», ставится `full`.
- Порядок событий внутри ленты сохраняется, но маппер на нём не строится: job всегда перечитывает
  текущее состояние через Storefront API, поэтому `productUpdated` после `productDeleted` просто
  ещё раз увидит `not-found`.
- Refresh-токен служебного пользователя хранится в secret стека `theme-static` как
  `SHOPANA_EVENTS_REFRESH_TOKEN`, имя магазина — `SHOPANA_STORE_NAME`; запросы идут в gateway
  admin с access-токеном, который координатор получает и продлевает сам.

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
  dirty_since   INTEGER,                    -- мс; NULL = актуальна
  dirty_reasons TEXT,                       -- JSON: [{ topic, eventId, depKey }], до 20 записей
  hits_7d       INTEGER NOT NULL DEFAULT 0, -- попадания за 7 дней, для eager и дочиста
  UNIQUE (locale, path)
);
CREATE INDEX pages_owner ON pages (owner_key, locale);
CREATE INDEX pages_valid_until ON pages (valid_until) WHERE valid_until IS NOT NULL;
CREATE INDEX pages_dirty ON pages (dirty_since, hits_7d) WHERE dirty_since IS NOT NULL;

-- Обратный индекс: зависимость → страницы.
CREATE TABLE page_deps (
  dep_key  TEXT NOT NULL,                   -- 'Product:<uuid>', 'Category:<uuid>#products', 'Query#products'
  kind     INTEGER NOT NULL,                -- 1 entity, 2 list, 3 query
  aspects  INTEGER NOT NULL,                -- битовая маска, см. ниже
  page_id  INTEGER NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  PRIMARY KEY (dep_key, page_id)
) WITHOUT ROWID;
CREATE INDEX page_deps_page ON page_deps (page_id);

-- Попадания по дням, из отчётов ноды и Worker-а.
CREATE TABLE page_hits (
  page_id INTEGER NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  day     INTEGER NOT NULL,                 -- дни от эпохи
  hits    INTEGER NOT NULL,
  PRIMARY KEY (page_id, day)
) WITHOUT ROWID;

-- Очередь рендера.
CREATE TABLE jobs (
  id          INTEGER PRIMARY KEY,
  locale      TEXT NOT NULL,
  target      TEXT NOT NULL,                -- 'path:/products/x' или 'owner:Product:<uuid>'
  priority    INTEGER NOT NULL,             -- 0 своя страница, 1 популярные и dirty с попаданием, 2 таймеры, 3 дочист
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

CREATE TABLE event_cursor (                 -- одна строка
  id INTEGER PRIMARY KEY CHECK (id = 1), cursor TEXT NOT NULL, updated_at INTEGER NOT NULL
);

CREATE TABLE event_log (
  event_id TEXT PRIMARY KEY, topic TEXT, occurred_at INTEGER, received_at INTEGER,
  changes INTEGER, eager INTEGER, dirty INTEGER
);
```

Оценка объёма:

- текущие фикстуры дают около 3 000 страниц (1 000 товаров, 145 категорий, около 330 вендоров,
  две локали);
- в среднем около 60 зависимостей на страницу: в листинге 24 карточки с медиа и вендором, у
  товара похожие товары и отзывы;
- итого около 180 000 строк `page_deps`, меньше 30 МБ;
- поиск по `dep_key` идёт по первичному ключу, на одно событие уходят миллисекунды;
- `event_log` чистится старше 30 дней.

### Ключи зависимостей

Все ключи нормализуются в `<Typename>:<uuid>`. Global ID из кеша Apollo
(`Product:<base64url>`) декодируется тем же кодеком, что в internal (`packages/graphql-global-id`).
Его копия на 30 строк живёт в SDK. Global ID из события декодируется так же.

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
| 2   | `pricing`    | `priceRange`, `compareAtPriceRange`, `variants.price`, `variants.compareAtPrice` | `pricing`, `variant`             |
| 4   | `inventory`  | `availableForSale`, `quantityAvailable`                             | `inventory`, `variant`           |
| 8   | `media`      | `featuredImage`, `media`                                            | `media`                          |
| 16  | `membership` | только у list и query: состав списка                                | `category`, `collection`, `vendor`, `publication`, `status` |
| 32  | `reviews`    | `reviewsSummary`, `rating`, `reviews`                               | топики `review*`, `productQuestion*` |
| 64  | `loyalty`    | `loyaltyOpportunity`                                                | топики `loyaltyProgram*`         |
| 128 | `translation`| любое переводимое поле в нелокали по умолчанию                      | `resourceTranslationsUpdated`    |
| 256 | `promotions` | `ProductVariant.promotions`, корневое `storefrontPromotions`        | топики `discount*`               |

`pricing` и `promotions` — разные аспекты. Catalog и listing отдают базовую цену варианта без
скидок: `price` и `compareAtPrice` берутся из состояния варианта
(`internal/services/catalog/src/resolvers/storefront/ProductVariantResolver.ts:71`), а сортировка,
фильтр и правила динамических коллекций по цене работают по той же цене. Скидка вычисляется
только в checkout. Pricing в storefront отдаёт лишь описание автоматических акций
(`ProductVariant.promotions`, `Query.storefrontPromotions`): бейдж, тексты, тип и размер,
`startsAt`/`endsAt`. Поэтому изменение скидки никогда не меняет цены и состав листингов.

Пример: товар в карточке категории даёт `entity Product:A` с маской `content|pricing|inventory|media`.
Тот же товар в хлебных крошках или в «недавно смотрели» даёт только `content`. Изменение
`inventory` перерисует категорию, но не страницы с крошками.

**Классы полей** по `plans/static-volatile-data.ru.md`:

- **Летучие** (`quantityAvailable`, `ProductVariant.promotions`, `Query.storefrontPromotions`)
  не попадают в снимок страницы. `extractPageDeps` их не видит, аспект `promotions` и
  `quantityAvailable` в маске не появляются, и события только с ними не находят страниц.
  Свежесть обеспечивают TTL лёгких запросов и purge их тегов на шаге B.
- **Корректируемые** (`availableForSale`, `currentlyNotInStock`, `price`, `compareAtPrice`)
  остаются в HTML и в индексе. `pricing` рендерится как обычно (своя страница и популярные сразу,
  остальные dirty), `inventory` всегда только dirty: на странице значение и так поправит лёгкий
  запрос, а HTML меняется лишь при переходе «есть ↔ нет».
- Цена в лёгком запросе идёт по флагу `withPrice`: `false` в режиме бакета, `true` в режиме
  «статика в образе», где точечной перегенерации нет.

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

`mapEventToChanges(envelope) → Change[]`, где
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
| `discount*`                                                      | все страницы с аспектом `promotions`: бейджи `ProductVariant.promotions` и баннеры `Query#storefrontPromotions`. В событии нет списка вариантов, поэтому затронуты все такие страницы; цены и листинги не трогаются |
| `review*`, `productQuestion*`                                    | `Product:<data.productId>` entity с `reviews`; `Product:<id>#reviews` list                                                      |
| `reviewStoreConfigurationUpdated`, `loyaltyProgram*`             | все страницы с аспектом `reviews` / `loyalty`                                                                                   |
| `resourceTranslationsUpdated`                                    | entity `<resourceType>:<resourceId>` с `translation`, только локали из `data.locales`                                           |
| `fileUpdated`, `fileDeleted`                                     | `MediaImage:<id>` entity с `media`                                                                                              |
| `listingFacetMembershipChanged`, `facet*`                        | все `list` и `query` зависимости с `membership` (фильтры листингов)                                                             |

Поиск страниц по изменению:

```sql
SELECT p.id, p.locale, p.path, p.route, p.hits_7d
FROM page_deps d JOIN pages p ON p.id = d.page_id
WHERE d.dep_key = ?1 AND d.kind IN (…) AND (d.aspects & ?2) != 0 AND p.status = 'published'
  AND (?3 IS NULL OR p.locale IN (SELECT value FROM json_each(?3)));
```

### Eager или dirty

Каждая найденная страница либо сразу ставится в очередь, либо помечается устаревшей:

- **Eager, приоритет 0:** своя страница сущности (`own`), в том числе новая (`owner:<key>` во всех
  локалях) и удалённая (`gone`).
- **Eager, приоритет 1:** страницы из верхних `STATIC_EAGER_TOP` (по умолчанию 300) по `hits_7d`
  и главная каждой локали.
- **Dirty:** все остальные. `dirty_since` ставится, если ещё не стоит; повод дописывается в
  `dirty_reasons`. Рендера нет.

Dirty-страница становится заданием в трёх случаях:

1. **Попадание.** Гибридная нода (шаг A) и Worker (шаг B) сообщают о попаданиях по страницам
   (см. «Попадания»). Попадание по dirty-странице ставит её с приоритетом 1. Первый посетитель
   получает прошлую версию, следующие после рендера — новую.
2. **Фоновый дочист.** Когда очередь пуста и аренды нет, координатор ставит до
   `STATIC_SWEEP_BATCH` (200) dirty-страниц с приоритетом 3 по убыванию `hits_7d`, не чаще раза в
   5 минут. Так dirty не живёт вечно и не копится к ночи.
3. **Полная сборка** снимает все отметки.

Рендер с `render_started_at = T` снимает `dirty_since`, если `dirty_since < T`. Изменение,
пришедшее во время рендера, оставляет отметку.

**Эскалация в полную сборку** остаётся только для `full`-изменений (меню, магазин, локали):
они есть в каждом документе. Массовые изменения (скидка, лояльность, фасеты) больше не
превращаются в полную сборку: страницы становятся dirty, eager ограничен верхом по посещаемости.

**Схлопывание.** На каждую пару `(locale, target)` в очереди максимум один job. Новый повод
дописывается в `reasons`, приоритет берётся минимальный. Результат рендера с
`render_started_at = T` удаляет все `queued` jobs этой страницы с `created_at < T`. Так полная
сборка поглощает накопившиеся точечные изменения.

**Отставание кешей.** Если Storefront API отдаёт данные из Redis-кеша internal с TTL, job
получает `not_before = received_at + STATIC_READ_LAG_MS`, по умолчанию 0. Значение берётся из
фактической инвалидации кешей storefront в internal и измеряется на этапе 0.

## Попадания

Попадания нужны для двух вещей: рендер dirty-страницы при первом открытии и выбор eager-страниц.

- **Шаг A.** Гибридная нода считает попадания HTML по ключу в памяти и раз в 30 с отправляет
  координатору `POST /__builder/api/hits` с `{ "<key>": count }`. Промах (`miss`) по адресу
  генерируемого семейства идёт в тот же отчёт с флагом `miss` и ставит рендер новой страницы.
- **Шаг B.** Большинство запросов обслуживает кеш CDN, и до Worker-а они не доходят как
  отдельные события. Worker сообщает только о промахах кеша CDN (`ctx.waitUntil(fetch(...))`,
  без ожидания ответа). Для dirty-страницы этого достаточно: HTML в CDN живёт `s-maxage`
  (по умолчанию 600 с), после истечения Worker перечитывает объект, отдаёт его и сообщает о
  попадании, координатор ставит рендер. Для `hits_7d` на шаге B берутся эти же промахи кеша:
  порядок страниц по популярности они передают верно.
- Ночью `hits_7d` пересчитывается из `page_hits` за 7 дней.

## Публикация только изменившегося

- Аренда отдаёт с каждым заданием известные `htmlHash` и `dataHash` страницы.
- Job после рендера считает хэши. Совпали оба — `outcome: 'unchanged'`: в бакет ничего не
  пишется, purge не делается, координатор обновляет `rendered_at`, зависимости и `valid_until`.
- Изменился только JSON или только HTML — пишется только изменившийся объект; тег страницы
  чистится один раз на оба.
- В HTML нет ничего, что меняется от рендера к рендеру без изменения данных: `renderedAt` и
  `buildId` из `window.__shopanaStatic` в хэш не входят (хэш считается по документу без этого
  скрипта). Это проверяет тест «повторный рендер даёт тот же хэш».

## Purge по тегам (шаг B)

С 1 апреля 2025 года Cloudflare открыл purge по тегу, префиксу и хосту на всех планах, включая
Free. Лимиты Free по документации: 5 запросов purge в минуту с запасом 25 запросов и до 100 тегов
в запросе; блог при запуске называл 500 ключей в минуту. Цифры сверяются на этапе 8 плана статики.

Теги:

| Ответ                                             | `Cache-Tag`                                      | Кто чистит и когда                                                     |
| ------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| HTML и `page-data.json` страницы                  | `pg:<pageKey>` (хэш `locale + path`, 16 символов) | job после публикации изменившейся страницы                             |
| Лёгкие запросы SDK (`SdkVolatileCards`, `SdkVolatileVariant`) и прочие `GET /graphql` persisted documents (слой 2) | ключи сущностей ответа (`Product:<uuid>`, `ProductVariant:<uuid>`), ставит плагин gateway | координатор по событию: те же ключи, что в изменениях маппера, без рендера |
| `SdkStorefrontPromotions` (тексты промо магазина)  | `sf-promo`                                        | координатор по `discount*`                                              |
| Все объекты сборки                                | `build:<buildId>`                                 | после полной сборки вместо `purge_everything`, чтобы не трогать ассеты  |

- Тег страницы один на HTML и JSON: одна операция purge на страницу вместо двух URL.
- Purge собирается в очередь координатора и отправляется пачками по 100 тегов с учётом лимита.
  Если очередь растёт быстрее лимита, теги просто ждут своей очереди: до purge или до истечения
  `s-maxage` кеш CDN отдаёт прошлую версию.
- Ответы Worker-а кеш CDN сам не сохраняет: Worker стоит перед кешем. Поэтому Worker кладёт
  ответ из R2 в Cache API (`caches.default.put`) с `Cache-Tag`. Работает ли purge по тегу для
  объектов Cache API, проверяется на этапе 8 плана статики до реализации; если нет, HTML
  отдаётся через origin-fetch к R2 custom domain с Cache Rules, и теги ставит Transform Rule или
  метаданные объекта.
- Токен Cloudflare с правом `Cache Purge` у координатора (`CLOUDFLARE_PURGE_TOKEN`), а не у CI:
  purge по быстрым данным и GraphQL идёт без рендера.

На шаге A purge нет: гибридная нода перечитывает объект через `STOREFRONT_STATIC_CACHE_TTL`, а
лёгкие запросы кеширует response cache gateway с TTL 30 с.

## Источники jobs помимо событий

- **Таймеры.** Scheduler каждые 30 с ставит страницы с `valid_until <= now` с приоритетом 2.
  Промо в HTML нет, поэтому таймеры остаются только для окон коллекций и прочих полей со
  временем, которые остались в HTML.
- **Попадания и промахи** (см. выше).
- **Фоновый дочист** dirty-страниц.
- **Новый образ темы.** Деплой `deploy-theme.mjs` после смены `THEME_IMAGE` ставит полную сборку
  через API координатора с `image` нового релиза.
- **Ночная полная сборка.** Cron в workflow GitHub вызывает полную сборку. Путь тот же: сначала
  запрос в координатор, потом аренда.
- **`CURSOR_EXPIRED`** ленты событий ставит полную сборку.

## REST API координатора

Одни и те же ручки на внутреннем порту `3100` и через Tunnel на публичном hostname под
`/__builder/*`. Гибридная нода не перехватывает `/__builder/*`, Worker тоже.

| Метод и путь                                   | Кто вызывает                 | Авторизация               | Назначение                                                                 |
| ---------------------------------------------- | ---------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| `POST /__builder/api/hits`                     | гибридная нода, Worker       | internal token            | `{ hits: { "<key>": n }, misses?: ["<key>"] }` → `204`; ставит dirty и промахи в очередь |
| `POST /__builder/api/builds`                   | оператор, CLI, CI            | operator token или OIDC   | `{mode: 'full' \| 'paths' \| 'entities', paths?, entities?, locales?, reason, image?}` → `202 {requestId}`; ставит jobs и запускает dispatch |
| `GET /__builder/api/builds/:requestId`         | оператор, CLI                | operator token            | статус: jobs в очереди и в работе, `run_id`, ссылка на запуск              |
| `GET /__builder/api/pages?dep=Product:<uuid>`  | оператор                     | operator token            | отладка индекса: какие страницы зависят от ключа, dirty ли они и почему    |
| `GET /__builder/api/status`                    | мониторинг                   | operator token            | очередь, dirty, курсор ленты и его отставание, аренда, последняя полная сборка, очередь purge |
| `POST /__builder/api/leases`                   | job GitHub Actions           | OIDC GitHub               | `{requestId, runId, runAttempt, capacity}` → `{leaseId, mode, buildRef, jobs[{…, htmlHash, dataHash}], expiresAt}`; пустой `jobs` = очередь пуста |
| `POST /__builder/api/leases/:id/heartbeat`     | job                          | OIDC                      | продление аренды на 3 минуты                                               |
| `POST /__builder/api/leases/:id/results`       | job                          | OIDC                      | NDJSON по странице: `{jobIds, locale, path, route, ownerKey, outcome: 'published' \| 'unchanged' \| 'gone' \| 'failed', htmlHash, dataHash, deps, validUntil, renderStartedAt, error?}` |
| `POST /__builder/api/leases/:id/complete`      | job                          | OIDC                      | закрыть аренду; не вернувшиеся jobs обратно в очередь                      |

- **OIDC.** Job получает токен GitHub (`permissions: id-token: write`, audience
  `shopana-static-coordinator`). Координатор проверяет подпись по JWKS
  `token.actions.githubusercontent.com` и claims `repository`, `workflow_ref` (только
  `static-site.yml@refs/heads/main`) и `environment` (совпадает с окружением координатора). Общего
  секрета между CI и координатором нет.
- **Operator token** — длинный случайный токен из secret стека для ручных вызовов и деплоя.
- **Internal token** — отдельный токен для отчётов о попаданиях от `theme` и Worker-а; у него нет
  других прав.
- `deps` в результатах уже нормализованы: `[{ key, kind, aspects }]`. Запись результата —
  одна транзакция на страницу: `pages` upsert, `page_deps` замена набора, удаление поглощённых
  jobs, снятие `dirty_since`. `gone` переводит страницу в `status = 'gone'` и удаляет её
  зависимости.
- Задание, которое трижды вернулось с `failed` или с истёкшей арендой, уходит в `dead_jobs` и
  видно в `status`. Страница при этом остаётся в прошлой версии и остаётся dirty.

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
   координаторе: `POST /__builder/api/builds {mode, paths, locales, reason}`.
3. `docker run … storefront-runtime static run --coordinator "$COORDINATOR_URL" --request-id …
   --run-id "$GITHUB_RUN_ID" --budget 35m`. Цикл: аренда → рендер пачки (до 500 jobs, пул
   `worker_threads`, `concurrency` из `static.config.ts`) → сравнение хэшей → загрузка в бакет
   изменившихся объектов → на шаге B purge тегов `pg:<pageKey>` изменившихся страниц →
   результаты → следующая аренда. Цикл продолжается, пока очередь не пуста или не кончился
   бюджет.
4. В режиме `full` первая аренда возвращает `mode: 'full'`. Job перечисляет все адреса по
   `static.config.ts`, рендерит их и отправляет результаты с флагом `fullBuild`. Затем
   `complete` с `{fullBuild: true, seenPages}`, и координатор переводит в `gone` страницы, которых
   нет в сборке, и снимает все dirty. На шаге B purge `build:<buildId>` прошлой сборки. Объекты
   прошлой сборки удаляются: ассеты через 7 дней, страницы вне нового manifest сразу.
5. После `full` выполняется `smoke`, как в `deploy-theme.mjs`.

Секреты окружения GitHub (`stage`, `production`): ключ записи в бакет,
`CLOUDFLARE_PURGE_TOKEN` (шаг B), `STOREFRONT_SERVER_GRAPHQL_URL`,
`SHOPANA_STOREFRONT_PRIVATE_TOKEN`; переменная `COORDINATOR_URL`. Токена координатора нет, вместо
него OIDC.

### Запуск через REST API GitHub

Координатор ставит workflow сам:

```http
POST https://api.github.com/repos/shopanaio/storefront/actions/workflows/static-site.yml/dispatches
Authorization: Bearer <installation token GitHub App>
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28

{ "ref": "main",
  "inputs": { "environment": "stage", "mode": "queue",
              "request_id": "d-20261106-120000-7f3a", "reason": "productUpdated×14, hits×5" } }
```

- **Авторизация** — GitHub App `shopana-static-dispatch` с одним разрешением
  `Actions: Read and write`, установленный только в репозиторий тем. Координатор хранит
  `app_id`, `installation_id` и приватный ключ в secret стека и обновляет installation token раз в
  50 минут.
- **Связь запроса и запуска.** Запуск сам сообщает `request_id` и `GITHUB_RUN_ID` при первой
  аренде. Координатор считает запрос `claimed`.
- Правила dispatch:
  - **Накопление.** Первый job после простоя запускает таймер на 20 с, следующие его не
    продлевают. Между двумя dispatch проходит не меньше 60 с.
  - **Один незабранный запрос.** Пока последний dispatch не забран первой арендой, новых нет.
    Если он не забран за 10 минут, запрос помечается `stale` и ставится новый.
  - **Активная аренда.** Пока у работающего запуска не кончился бюджет, новые jobs заберёт он.
    Dispatch ставится, только когда аренда закрыта, а очередь не пуста, или когда до конца
    бюджета меньше 3 минут.
  - **Дочист** не вызывает отдельный dispatch: задания дочиста забирает только запуск, который
    уже работает или поставлен ради eager-заданий. Иначе дочист жёг бы минуты Actions ради
    страниц, которые никто не открывает.
  - **Полная сборка.** `mode: full` ставится так же.
- Ручной запуск:

  ```bash
  curl -X POST "$COORDINATOR_URL/__builder/api/builds" -H "Authorization: Bearer $STATIC_OPERATOR_TOKEN" -d '{"mode":"entities","entities":["Product:0196…"],"reason":"manual"}'
  ```

## Восстановление индекса

Индекс — производные данные. Его потеря не теряет сайт, а только точность инвалидации до
следующей полной сборки.

- Раз в сутки и после каждой полной сборки координатор делает `VACUUM INTO` и кладёт снимок в
  бакет `__builder/index/<date>.sqlite.gz`. Хранятся последние 7 снимков.
- При старте с пустым volume координатор восстанавливает последний снимок вместе с курсором ленты
  и дочитывает события после него. Если курсор снимка уже `CURSOR_EXPIRED` или снимка нет,
  ставит `full`.
- Таблица `dispatches` и аренды после восстановления сбрасываются. Активный запуск получит
  `410` на heartbeat и завершится, его jobs возвращаются в очередь по истечении аренды.

## Изменения по репозиториям

### `@shopana/storefront-sdk/static`

1. `extractPageDeps`, `STATIC_FIELD_ASPECTS`, быстрые аспекты, `mapEventToChanges`,
   `STATIC_EVENT_TOPICS`, декодер global ID.
2. Клиент ленты событий internal (после отчёта сессии API).
3. Тест покрытия аспектов полями фрагментов темы.

### `@shopana/storefront` (runtime)

1. Роль `static coordinator`:
   - HTTP-сервер на `3100`;
   - SQLite-схема и миграции схемы при старте;
   - цикл чтения ленты, очередь, dirty, eager по посещаемости, дочист, dispatcher, клиент GitHub
     App;
   - приём попаданий, проверка OIDC и токенов;
   - очередь purge по тегам с учётом лимитов (шаг B);
   - таймеры, снимки индекса в бакет.
2. Команда `static run` (клиент аренды для CI): рендер, сравнение хэшей, публикация, purge тегов
   страниц.
3. Гибридная нода: счётчик попаданий и промахов и отчёт `POST /__builder/api/hits` раз в 30 с
   вместо вызова `builds` на каждый промах.
4. `Cache-Tag: pg:<pageKey>, build:<buildId>` в метаданных объектов HTML и JSON.

### Тема `brand-bite-crunch`

1. В `static.config.ts` при необходимости дополнить `fieldAspects` для полей темы.
2. `.github/workflows/static-site.yml`.

### Worker (шаг B)

1. Ответ из R2 через Cache API с `Cache-Tag` из метаданных объекта.
2. Отчёт о промахе кеша CDN в координатор через `ctx.waitUntil`.

### Инфраструктура

1. `deploy/swarm/theme.yml`:
   - сервис `theme-static` из `THEME_IMAGE`, `replicas: 1`;
   - volume `theme-static-data`, placement по метке ноды с volume;
   - `stop_grace_period: 30s`, healthcheck `GET /__builder/api/health`;
   - у `theme` адрес координатора и internal token.
2. Ingress Tunnel `/__builder/*` → `theme-static:3100`.
3. Секреты стека: `SHOPANA_EVENTS_REFRESH_TOKEN`, `STATIC_OPERATOR_TOKEN`, internal token, ключ GitHub App,
   ключ бакета для снимков индекса, `CLOUDFLARE_PURGE_TOKEN` (шаг B).
4. `deploy-theme.mjs`: `theme-static` в `check`, `deploy` и `status`; после смены образа
   `POST /__builder/api/builds {mode:'full', image}`.
5. GitHub: App `shopana-static-dispatch`; окружения `stage` и `production` с секретами; правило
   защиты `production` без ручного approval.

### `internal`

1. API чтения событий магазина по курсору: сделано (`webhooksQuery.eventFeed`, см. «Лента событий internal»).
   Сервис `webhooks` статике не нужен.
2. Служебный пользователь магазина с ролью для чтения ленты; изменений в iam нет.
3. Плагин gateway, который ставит `Cache-Tag` по сущностям ответа для `GET` persisted documents
   (шаг B, слой 2).

## Тестирование

- **Unit SDK:**
  - `extractPageDeps` на снимках реальных страниц (товар, категория, главная, страница контента);
  - аспекты карточки и крошек;
  - быстрые аспекты не попадают в зависимости страниц;
  - `DynamicCollection` → `query`;
  - layout-ключи не попадают в зависимости.
- **Unit маппера:**
  - каждый топик из `STATIC_EVENT_TOPICS` даёт ожидаемые изменения;
  - `productUpdated` с `reasons: ['inventory']` не трогает страницы, где товар есть только с
    `content`.
- **Координатор (интеграционные тесты на временной SQLite, лента и GitHub замоканы):**
  - чтение ленты: курсор сохраняется в одной транзакции с jobs, повтор события не дублирует
    jobs, `hasMore` читается сразу, `CURSOR_EXPIRED` → `full`;
  - eager и dirty: своя страница и верх по посещаемости в очереди, остальные dirty;
  - попадание по dirty → job приоритета 1; попадание по актуальной — ничего;
  - дочист: только при пустой очереди, пачкой, без отдельного dispatch;
  - снятие dirty результатом с `renderStartedAt`; изменение во время рендера оставляет dirty;
  - `unchanged` не пишет объекты и не чистит теги;
  - очередь purge соблюдает лимит запросов и размер пачки;
  - схлопывание, истечение аренды, `gone` при `fullBuild`, правила dispatch.
- **Контракт GitHub:** мок `api.github.com` проверяет тело dispatch и обновление installation
  token. Мок JWKS проверяет claims OIDC.
- **Stage (ручная проверка):**
  1. изменить цену товара в admin;
  2. страница товара и популярные листинги обновляются за 1–1,5 минуты;
  3. непопулярный листинг с этим товаром dirty, после открытия обновляется;
  4. повторное сохранение товара без изменений даёт `unchanged` и не пишет в бакет.

## Этапы

1. **Этап 0, измерения.**
   - Время запуска job с загрузкой образа.
   - Реальное число зависимостей на страницу.
   - Задержка кешей Storefront API после события (`STATIC_READ_LAG_MS`).
   - Распределение посещаемости по страницам на stage: какая доля трафика в верхних 300.
2. **Лента событий в internal** (параллельно, отдельная сессия).
3. **Индекс без координатора.** `extractPageDeps`, аспекты, маппер и `static run` в локальном
   режиме: CLI читает события из файла и рендерит затронутые страницы в каталог; сравнение хэшей.
4. **Координатор:** чтение ленты, очередь, индекс, eager/dirty, попадания, дочист, REST API,
   аренды, снимки.
5. **GitHub Actions:** workflow, OIDC, GitHub App, dispatcher.
6. **Swarm и Tunnel** на stage, отчёты о попаданиях от гибридной ноды.
7. **Быстрые данные** по `plans/static-volatile-data.ru.md`: быстрые аспекты в SDK и маппере.
8. **Шаг B:** теги в Worker-е и Cache API, очередь purge по тегам, теги GraphQL в gateway.
9. **Production** после недели на stage без ручных полных сборок.

## Риски и открытые вопросы

- **Первый посетитель dirty-страницы видит прошлую версию.** Для непопулярных страниц это
  осознанная цена. Цены и остатки после выноса быстрых данных актуальны и на такой странице;
  до выноса окно устаревания на непопулярных страницах — до первого открытия плюс 1–1,5 минуты,
  максимум до ночной сборки.
- **Минуты GitHub Actions.** Каждый запуск стоит 1–2 минуты runner-а с загрузкой образа. Dirty,
  дочист без отдельного dispatch и `unchanged` сокращают число запусков. Если квоты не хватит,
  подключается self-hosted runner с меткой `static` на ноде Swarm; меняется только `runs-on`.
- **Лимиты purge на Free.** При массовых изменениях очередь purge может отставать от публикации.
  Страница в CDN обновится по истечении `s-maxage` (600 с), даже если purge не дошёл.
- **Purge по тегу для Cache API.** Не подтверждено документацией; проверяется до реализации шага
  B, запасной путь описан в «Purge по тегам».
- **Скидки.** `discount*` без списка вариантов затрагивает все страницы с аспектом `promotions`.
  После выноса промо из HTML событие не вызывает рендер: на шаге B оно чистит тег `sf-promo` и
  теги вариантов, на шаге A свежие промо приходят по TTL лёгких запросов.
- **Единственная реплика координатора.** Пока он недоступен, лента не читается, но события не
  теряются: после старта он дочитывает их с курсора, если тот не устарел. Сайт продолжает
  отдаваться из бакета. Отдельное HA не требуется.
- **Изменение handle.** Job `owner:` рендерит новый путь и переводит старый в `gone`. Редирект со
  старого адреса — вопрос темы и SEO, вне этого плана.
