# Генератор статических HTML-страниц витрины (SSG) на базе storefront SDK

Этапы 0–6 этого плана реализованы (ветки `phl/static-pages-generation` в `shopanaio/storefront` и
`shopanaio/storefront-brand-bite-and-crunch`): документ описывает то, что сделано. Всё дальнейшее —
координатор точечной инвалидации, быстро меняющиеся данные вне HTML, Worker и кеш CDN (шаг B), кеш
GraphQL `GET` — в одном плане `plans/static-coordinator.ru.md`.

## Вывод

**Генератор строится поверх уже собранного серверного бандла React Router, а не поверх
`prerender` из `react-router.config.ts`.** Встроенный `prerender` работает только внутри
`vite build`: любая перегенерация страницы означает полную сборку темы. Builder импортирует
`.runtime/build/server/index.js`, прогоняет через `createRequestHandler` синтетические гостевые
запросы и пишет файлы: код собирается один раз, адреса рендерятся сколько угодно раз.

**Рендер всегда гостевой.** В HTML попадает то, что одинаково для всех покупателей: каталог, цены,
базовые баллы лояльности, агрегаты отзывов, меню, контент. Всё, что зависит от сессии, корзины или
visitor id, рендерит клиент после гидратации (раздел «Персонализация»).

**Одна версия страницы на адрес.** Рендер не зависит от User-Agent (`plans/ua-free-rendering.ru.md`).
Адрес с параметром, который меняет страницу (`sort`, `filter.*`, `variant`), рендерит сервер;
метки кампаний (`utm_*`, `gclid`, …) статику не отменяют.

**Хостинг: гибридная нода (SSG + SSR), шаг A.** Node-приложение темы (`storefront-runtime start`)
на `GET` HTML-адреса ищет готовый файл в хранилище статики и отдаёт его, а без файла рендерит SSR.
Хранилище — каталог `build/static` в образе (статика в образе) или бакет R2 по S3 API, который
пишет builder в GitHub Actions, а нода только читает. `/auth/*`, ассеты и всё, что не HTML, нода
обслуживает как раньше. Cloudflare остаётся прежним: Tunnel и Cache Rules с bypass для HTML.

**Перегенерация сейчас полная:** при сборке образа (статика в образе) и ночью и после каждой сборки
образа (бакет), плюс `storefront-runtime static render` для отдельных адресов. Точечная по событиям —
в `plans/static-coordinator.ru.md`.

**Клиентские переходы берут данные из статики.** Переход рендерится сразу, как из API, а запросы
страницы отвечаются из `/__static/data/*.json` её адреса (слой 1 кеша GraphQL).

## Исходное состояние

Факты, на которые опирался план до этапов 2–6 (пути относительно корня соответствующего репозитория).
Часть из них этапы изменили: свой сервер `start` вместо `react-router-serve`, `/__env.js` вместо
инлайна `__shopanaPublicEnv`, новые проверки `smoke`.

**Runtime темы.**

- Тема `brand-bite-crunch` работает на React Router: `"storefront": {"framework": "react-router"}` в
  `themes/brand-bite-crunch/package.json`. Сгенерированное приложение: одна catch-all страница под
  layout плюс ресурсные маршруты `/auth/:action`, `/auth/headless/:action`
  (`packages/shopana-storefront-runtime/templates/react-router/app/routes.ts`). `ssr: true`,
  `prerender` не задан.
- Серверный конвейер: middleware определяет локаль и открывает request scope
  (`src/react-router/server.ts:82`), root loader грузит `loadAppData()`: магазин, локали, корзину
  по cookie, сессию по cookie, меню (`packages/shopana-storefront-sdk/src/server/app.ts:46`),
  page loader выполняет `loadData` → `preload` → `generateMetadata` (`server.ts:129`). Закрытые
  модули (`/account`) отвечают редиректом без сессии (`server.ts:197`).
- Рендер (`src/react-router/entry.server.tsx`): стриминг для людей, `onAllReady` для ботов и
  `HEAD`; в `<head>` вставляются стили antd/emotion и `__shopanaPublicEnv` (все `NEXT_PUBLIC_*` из
  `process.env` в момент рендера), перед `</body>` `__shopanaApolloState` (весь кеш запроса) и
  `__shopanaHydratedPage`. Заголовок `Cache-Control: private, no-store`.
- После гидратации приложение SPA: `clientLoader` страницы выполняет `loadData` браузерным
  клиентом Apollo и не ходит на сервер (`src/react-router/page.tsx:708`). Root loader
  перезапрашивается только при смене локали, submit формы и `router.refresh()` (`root.tsx:69`).
- Auth: `/auth/*` и `/auth/headless/*` это серверные обработчики конфиденциального OAuth-клиента
  (обмен кода с client secret, токены в запечатанных HttpOnly cookie, headless-вход через IAM с
  адресом покупателя). Они не рендерят HTML и не входят в статику, но требуют Node-процесс на том
  же hostname.
- Рендер без UA выполнен по `plans/ua-free-rendering.ru.md`: HTML одного адреса не зависит от
  User-Agent.
- Стили: статический CSS для `createStyles` уже собирается плагином `antdStyleStatic`
  (`themes/brand-bite-crunch/scripts/static-styles/`), но `AntdRegistry` всё ещё отдаёт в каждый
  документ все emotion-правила, накопленные процессом (`src/ui-kit/Theme/AntdRegistry.tsx:21`).
  Для долгоживущего builder это критично.
- Запуск: `storefront-runtime start` запускает `react-router-serve` над `build/server/index.js`
  (`bin/storefront-runtime.js:99`) с preload `bin/forwarded-for.js`. Своего сервера у runtime нет.
- Редиректы на форму адреса с префиксом локали зависят только от пути
  (`localePrefixRedirect`, `src/react-router/locale-routing.ts:22`), не от cookie и
  `Accept-Language`. Поэтому файл статики для канонического адреса всегда совпадает с тем, что
  отдал бы SSR, а неканонический адрес файла не имеет и уходит в SSR, который делает редирект.
- Деплой: Docker-образ с `react-router-serve`, стек Swarm `shopana-theme-<env>` из двух реплик темы
  и двух `cloudflared`, Cloudflare Tunnel и Cache Rules, которые сейчас не кешируют HTML
  (`deploy/terraform/modules/frontend-edge/main.tf`). `scripts/deploy-theme.mjs smoke` проверяет
  `Cache-Control: no-store` и наличие `__shopanaPublicEnv` в HTML, это придётся менять.

**Страницы темы** (`themes/brand-bite-crunch/src/runtime/pages/*`, модули `src/modules/*/register.ts`).

| Адрес (префикс локали `as-needed`)   | Тип          | Серверные данные                                     | Класс для статики |
| ------------------------------------ | ------------ | ---------------------------------------------------- | ----------------- |
| `/`                                  | home         | нет `preload`, секции запрашивают сами при рендере   | статическая       |
| `/products/:handle`, `/p/:handle`    | product      | `ProductPageQuery` + все страницы вариантов          | статическая       |
| `/categories/:handle`                | category     | первые 40 товаров без фильтров, фасеты               | статическая       |
| `/collections/:handle`, `/c/:handle` | collection   | то же                                                | статическая       |
| `/vendors/:handle`                   | vendor       | то же                                                | статическая       |
| `/collections`                       | list-colls   | секции                                               | статическая       |
| `/pages/:handle`                     | page         | `OnlineStorePageQuery`                               | статическая       |
| `/policies/:handle`                  | модуль       | `PolicyPageQuery`                                    | статическая       |
| `/blogs/:blog`, `/blogs/:blog/:h`    | blog/article | локальные mock-данные, API ещё нет                   | статическая       |
| `/search?q=`                         | search       | листинг по `q`                                       | оболочка          |
| `/selections/:id`                    | selection    | подборка ассистента, `robots: noindex`               | оболочка          |
| `/cart`                              | cart         | нет; корзина по cookie на клиенте                    | оболочка          |
| `/checkout`, `/checkout/return`      | модуль       | нет; корзина на клиенте                              | оболочка          |
| `/account/*`                         | модуль       | `session: 'required'`, редирект без сессии           | оболочка          |
| `/newsletter/confirm?token=`         | модуль       | нет                                                  | оболочка          |
| `/box-builder`                       | модуль       | `dynamic(ssr: false)`                                | оболочка          |
| `/auth/*`, `/auth/headless/*`        | BFF          | обмен OAuth-кода с client secret, шифрованные cookie | только сервер     |
| любой неизвестный адрес              | 404          | данные 404 темы                                      | статическая       |

Листинги: пагинация курсорная («показать ещё»), фильтры и сортировка в query string
(`filter.<handle>=`, `sort=`), всё это после первой страницы клиент. Query-string-варианты страниц
не генерируются: HTML один на адрес без параметров. Адрес с параметром, который меняет страницу
(всё, кроме `utm_*`, `gclid`, `fbclid` и других меток кампаний), рендерит сервер: статический HTML
без параметров разошёлся бы с ним при гидрации.

## Персонализация: скидки, лояльность и прочие динамические данные

Разбор по internal (`infra/federation/supergraph-storefront.graphql`, `specs/canonical/services/*`).

**Цены и скидки.**

- `ProductVariant.price` и `compareAtPrice` это списочная цена из `catalog.item_pricing`, одна
  валюта магазина, не зависит ни от покупателя, ни от корзины, ни от тира лояльности
  (`services/catalog/src/resolvers/storefront/ProductVariantResolver.ts:71`). Цена «со скидкой» на
  карточке товара не вычисляется. Изменение цены даёт `productUpdated` с reason `pricing`.
- Промо на товаре и в витрине (`ProductVariant.promotions`, `Query.storefrontPromotions`) только
  автоматические, видимые всем, активные в своём окне; **одинаковы для гостя и для покупателя с
  сессией** (`specs/canonical/services/pricing/storefront-promotions.md`, BR-sp01). Но они зависят от
  времени: обёртка несёт `evaluatedAt`, `validUntil`, `revision`; запланированное промо появляется
  в момент старта без события (BR-sp04). События `discountCreated`, `discountUpdated`,
  `discountDeleted` приходят только при правках в админке.
- Промокоды, скидки по сегментам и клиентам, правила по количеству применяются только в чекауте:
  `Checkout.appliedPromotions`, `Checkout.promotionProgress`. На странице товара их нет.

**Лояльность.**

- `ProductVariant.loyalty` (`purchaseOpportunity`, `primaryOpportunity`) резолвится в контексте
  зрителя: гость видит базовые баллы, покупатель с тиром Gold ×1,5 умноженные
  (`specs/canonical/services/loyalty/tier-benefits.md`, BR-tb04). `LoyaltyOpportunity.state`
  (`AVAILABLE | AUTHENTICATION_REQUIRED | COMPLETED | LIMIT_REACHED | BUDGET_EXHAUSTED`) и
  `remainingUses` тоже per-viewer. Есть `validUntil` и `revision`.
- `Customer.loyaltyAccount` (баланс, тир, транзакции, награды), `CheckoutLoyaltyEarning`,
  `CheckoutLoyaltyRedemption` только с сессией.
- Цен, зависящих от тира, нет.

**Остальное.**

- Отзывы: агрегаты `Product.reviewSummary` публичны; `viewerEngagement`, `viewerCapabilities`,
  `viewerSubscription` зависят от покупателя или visitor id, а без обоих поле отвечает ошибкой
  (`specs/canonical/services/reviews/contract-storefront-reviews-read.md`, BR-rr03). Гостевой рендер
  без cookie visitor id **не должен запрашивать эти поля**.
- `savedForComparison` на колонках сравнения и `customerComparison*` per-viewer.
- Остатки: `availableForSale`, `quantityAvailable`, `currentlyNotInStock` меняются при заказах и
  возвратах **без событий** (`services/catalog/src/application/*Inventory*`); админские правки дают
  `productUpdated` с reason `inventory`. В статике остаётся «гостевой» снимок, клиент обновляет его.
- Корзина и `cartRecommendations`, `checkout*`, `customer`, `order*` только клиент.
- Visitor id (`x-shopana-storefront-visitor-id`) при гостевом рендере **не передаётся**: иначе он
  попадёт в кеш и в HTML.

**Что сделано для персонализации.** Правило: в HTML и при гидратации компонент показывает гостевое
состояние или скелетон; после монтирования и определения сессии данные подтягиваются клиентом на
месте, без перезагрузки.

| Место                                           | В статике                          | После гидратации                                                     |
| ----------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------- |
| Корзина, счётчик, аккаунт в шапке и таб-баре    | гостевое состояние до монтирования | `useCart`, `useIsAuthenticated`, `useCustomer`                       |
| Голоса и жалобы на отзывах, подписка на вопросы | поля не запрашиваются              | клиентский `ContentViewerQuery` темы                                 |
| Промо-метка в меню шапки                        | пусто                              | `useStorefrontPromotions` на клиенте                                 |
| Баллы лояльности                                | базовые баллы гостя                | `ViewerRefresh` перезапрашивает запросы с полями зрителя после входа |
| Поиск, корзина, checkout, аккаунт, box-builder  | оболочка с layout и скелетоном     | страница грузится в браузере; `ClosedPageGuard` уводит гостя         |

Летучие поля (остатки, промо) и личный лёгкий запрос лояльности вместо перезапроса целых запросов —
в `plans/static-coordinator.ru.md`, «Быстрые данные».

## Архитектура генератора

Генератор делится между двумя пакетами так же, как ответственность между SDK и runtime: SDK знает о
данных, конфигурации и клиенте, runtime о React Router и серверном бандле.

```text
theme: static.config.ts  ─┐
                           ├─► @shopana/storefront-sdk/static   (конфиг, перечисление адресов,
                           │     индекс страницы, ключ рендера, manifest, клиентская статика)
                           └─► @shopana/storefront static/       (рендер через server bundle,
                                 CLI `storefront-runtime static …`, store, гибридный сервер)
```

### Конфигурация в теме

`static.config.ts` в корне темы (`defineStaticSite`):

```ts
export default defineStaticSite({
  locales: 'all',
  pages: {
    home: true,
    product: { enumerate: 'products' },
    category: { enumerate: 'categories' },
    collection: { enumerate: 'menus' }, // Query.collections нет: из меню и extraCollections
    vendor: { enumerate: 'vendors' },
    page: { enumerate: 'onlineStorePages' },
    policies: { enumerate: 'store.policies' },
    'list-collections': true,
    blog: { enumerate: blogPaths }, // API блога нет: тема перечисляет сама
  },
  extraCollections: ['new', 'sale'],
  shells: [
    '/cart',
    '/checkout',
    '/checkout/return',
    '/account',
    '/search',
    '/newsletter/confirm',
    '/box-builder',
  ],
  notFound: true,
  concurrency: 8,
  publish: { store: 'fs', cdn: 'none' },
});
```

Перечислители (`enumerateStaticRoutes`) ходят серверным клиентом Apollo в языке страницы,
пагинируют курсором по 100 и падают на списке длиннее 100 000. Товар, который гостю не виден, даёт
404 при рендере, и файла у него нет.

### Рендер одной страницы

1. Builder импортирует серверный бандл и вызывает `createRequestHandler(build, 'production')`.
2. Запрос для адреса `{ locale, path }` идёт без cookie с `x-shopana-static-render: page | shell`,
   случайным ключом процесса builder-а (`staticRenderHeaders`), `Accept-Language` и `Host` публичного
   origin (`STOREFRONT_PUBLIC_URL`). Runtime узнаёт рендер статики только по ключу своего процесса,
   поэтому запрос снаружи с теми же заголовками остаётся обычным. В режиме статики runtime:
   - отвечает после `onAllReady`, без стриминга;
   - не читает cookie, `Authorization` и visitor id;
   - отправляет в gateway `STOREFRONT_PRIVATE_TOKEN`, и только в этом режиме;
   - рендерит оболочку (`shell`) вместо закрытой страницы, без редиректа.
3. Ответ разбирается: статус, `Location`, тело. `404` страницы — «не публиковать», `3xx` — ошибка
   конфигурации (неканонический адрес).
4. Из тела извлекается `__shopanaApolloState`; `indexStaticPage` даёт ключи сущностей и ближайший
   момент изменения данных (`validUntil`).
5. Пост-обработка: emotion-правила, классов которых нет в разметке, удаляются; `assertNoPrivateValues`
   проверяет, что в HTML нет секретов сервера, visitor id и инлайновых настроек; в `<head>`
   вставляется `window.__shopanaStatic = { buildId, renderedAt, locale, path, validUntil,
dataPageTypes }`.
6. Запись: `<locale-path>/index.html` и `__static/data/<locale-path>.json` (state страницы).

Рендер идёт в пуле `worker_threads`; воркер держит свой экземпляр бандла и заменяется после
`pagesPerWorker` (200) страниц. `robots.txt` и sitemap-ы builder берёт у самого приложения.

### Оболочки (shell) для клиентских страниц

Для адресов из `shells` builder рендерит документ с layout соответствующего типа страницы
(`loadRouteLayout`/`loadModuleLayout`) и скелетоном вместо контента. В `__shopanaHydratedPage`
пишется новый вид `{ kind: 'shell', pathname }`; `clientLoader` страницы, увидев shell, выполняет
обычную клиентскую ветку (резолвит адрес, грузит модуль, выполняет `loadData`), а `ClosedPageGuard`
уводит гостя с `/account`. Это тот же путь, что сегодня при клиентском переходе на эти страницы.

Отдельно генерируются «семейные» оболочки `__shell/products.html`, `__shell/categories.html`,
`__shell/collections.html`, `__shell/vendors.html`, `__shell/pages.html`. Их отдаёт гибридный
сервер в режиме `--static-only` (и Worker шага B, `plans/static-coordinator.ru.md`), когда файла нет, а SSR недоступен (деградация);
в обычном режиме промах уходит на живой рендер. Клиент дорисует страницу из API; если и API вернёт `not-found`, покажется 404 темы.
Статус для оболочки `200`, для совсем неизвестных префиксов `404.html` со статусом 404.

### Гибридный сервер `storefront-runtime start`

Свой сервер `src/static/server.ts` на `express` и `@react-router/express` вместо
`react-router-serve`, с preload `bin/forwarded-for.js`. Хранилище — `STOREFRONT_STATIC_STORE`
(`s3://<bucket>/<prefix>` или `fs:<каталог>`); без переменной `build/static`, если там есть
`__static/server.json`; иначе только SSR.

Порядок обработки запроса:

1. `/assets/*` и файлы `public/` из `build/client` (ассеты `immutable`); ассет прошлой сборки, которого
   нет в `build/client`, — из хранилища.
2. `/__env.js` из `process.env` сервера, с `ETag` и `no-cache` (см. «Публичный env»).
3. Мимо статики: методы кроме `GET`/`HEAD`, `/auth/*`, запросы данных React Router (`*.data`),
   `/__builder/*`. Заголовки рендера статики из запроса снаружи удаляются.
4. `/__static/data/*.json` из хранилища или `404`, без SSR.
5. HTML-адрес переводится в ключ `staticKeyForPath` (`src/static/keys.ts`, без Node built-ins):
   `/` → `index.html`, `/uk/products/x` → `uk/products/x/index.html`. Адрес с query string из одних
   меток кампаний отдаётся как без неё; с любым другим параметром — SSR (`miss`).
6. Файл есть: `200` (статус `404.html` из индекса), `ETag`, `Cache-Control: public, max-age=0,
must-revalidate`, `x-shopana-static: hit`; `304` на `If-None-Match`. Языки и статусы сервер берёт
   из маленького `__static/server.json`, а не из manifest.
7. Файла нет: SSR (`private, no-store`, `x-shopana-static: miss`). С `STOREFRONT_STATIC_COORDINATOR_URL`
   сервер раз в 30 с, пока есть что сообщить, отправляет координатору попадания и промахи
   (`POST /__builder/api/hits`, `Authorization: Bearer <STOREFRONT_STATIC_COORDINATOR_TOKEN>`). Промах
   попадает в отчёт, только если SSR ответил 200 и адрес похож на страницу каталога. Координатора
   пока нет: `plans/static-coordinator.ru.md`.
8. Хранилище недоступно: SSR и предупреждение в лог, никогда `5xx` сайта.

Бакет читается через кеш в памяти процесса: LRU по ключу на 50 МБ с телом и `ETag`, через
`STOREFRONT_STATIC_CACHE_TTL` (10 с) запись перепроверяется условным `GET`, промахи кешируются на тот
же срок. После ошибки бакет не опрашивается 2 с, затем дольше, до минуты: страница, которой нет в
кеше, сразу рендерится SSR. Новая версия страницы видна на всех репликах не позже TTL, purge не нужен.
Каталог (`fs`) читается на каждый запрос, `ETag` файла считается раз на его версию.

`start --static-only` отключает SSR: промах отдаёт семейную оболочку или `404.html`.

### Статика в образе

Генерация пишет в `<runtimeDir>/build/static` рядом с `build/client`; гибридный сервер находит его
сам.

```sh
storefront-runtime build                 # build/server, build/client
storefront-runtime static build          # build/static, gateway из env
storefront-runtime start                 # статика из build/static, промахи SSR
```

- Локально — против mock-сервера или stage-gateway (`STOREFRONT_SERVER_GRAPHQL_URL`).
- В GitHub Actions `build-theme.yml` темы делает `build`, `static build` против gateway окружения
  с приватным токеном и `docker build`. Dockerfile берёт в образ ту же `.runtime/build` (server,
  client, static), которой отрендерена статика, а не пересобирает тему. Образ привязан к окружению,
  tag с суффиксом `-<environment>`.
- Почему не прямо в `build/client`: там файлы раздаёт `express.static` раньше гибридной логики, в
  обход правил для `/auth/*`, `*.data`, статусов и заголовков.
- Данные в HTML обновляются только с новым образом.

### Клиентская сторона

- **Данные страницы при клиентском переходе.** Переход статического документа рендерится сразу, как
  из API, со скелетонами секций. Loader не ждёт данных: он запускает загрузку
  `/__static/data/<адрес>.json`, и link статических ответов браузерного клиента Apollo
  (`sdk/src/static/results.ts`) отвечает запросы страницы из этих данных, каждый один раз. В API
  уходят: запрос, которого в данных нет; все запросы, если данные не загрузились; ответ, который
  изменил бы то, что уже лежит в кеше; поля зрителя у покупателя с сессией. Данные запрашиваются
  только для типов страниц из `dataPageTypes` документа: у корзины, аккаунта и поиска их нет.
- **Оболочка** после гидратации грузит страницу своего адреса так же, как клиентский переход.
- **Персонализация.** `ViewerRefresh` в `AppProviders` при смене сессии перезапрашивает активные
  запросы с полями зрителя. HTML всегда гостевой; после гидратации `SessionContext` видит cookie
  `shopana_signed_in` и получает access-токен у Node-приложения.
- **Промо** перезапрашиваются в момент `validUntil` (`useValidUntilRefetch` в
  `useStorefrontPromotions`).
- **Смена локали** делает полную навигацию (`LocalizationContext`), **`router.refresh()`** в
  статическом документе — перезагрузку: `.data`-ответов у статики нет.

### Публичный env

Документы, и статические, и SSR, подключают синхронным `<script src="/__env.js">` до модулей
`globalThis.__shopanaPublicEnv = {...}`. Его отдаёт гибридный сервер (и dev-сервер) из своего
`process.env` с `ETag` и `Cache-Control: no-cache`: повторная загрузка получает `304`. Builder его
не пишет; ротация публичного ключа — перезапуск сервиса темы.

### Выход генератора

Каталог (`fs`, по умолчанию `build/static`) или бакет R2 по S3 API с теми же ключами.

```text
<locale-path>/index.html         404.html, __shell/*.html
__static/data/<locale-path>.json robots.txt, sitemap.xml, sitemaps/*.xml
assets/<hash>.*                  ассеты этой и прошлых сборок
__static/manifest.json           buildId, языки, dataPageTypes, файлы: хэши, сущности, validUntil, статусы
__static/server.json             для сервера: языки и статусы не 200
```

- Хэш страницы — HTML без `window.__shopanaStatic` плюс `dataPageTypes`; файл с тем же хэшем не
  перезаписывается и сохраняет `renderedAt`.
- В бакете нет атомарного переключения: HTML и JSON перезаписываются на месте, ассеты только
  добавляются. Ассеты прошлой сборки, которых нет в новой, удаляются через 7 дней: HTML в кеше
  браузера и открытые вкладки ещё ссылаются на них. Страницы, их данные и прочие файлы сайта, которых
  нет в новом manifest, удаляются сразу; удаляются только файлы, которые пишет builder.
- Страница, рендер которой упал, сохраняет прошлые файлы.
- Manifest пишется только поверх прочитанной версии (`If-Match`, с перечитыванием): полная сборка и
  `static render` одновременно сохраняют страницы друг друга.

## Кеш GraphQL для клиентских переходов

Слой 1 (данные страницы из статики) реализован, см. «Клиентская сторона»: для гостя переход
«категория → товар → категория» по сгенерированным страницам не ходит в API за данными страниц.
Слой 2 (`GET` persisted documents с кешем CDN) — в `plans/static-coordinator.ru.md`.

## Перегенерация

- **Статика в образе:** с каждой сборкой образа (`build-theme.yml`, ночью для stage).
- **Бакет:** `static-full-build.yml` темы ночью, по ручному запуску и после каждой сборки образа;
  без purge, реплики видят новые страницы через `STOREFRONT_STATIC_CACHE_TTL`.
- **Отдельные адреса:** `storefront-runtime static render /products/x /categories/y`.
- **Копирование:** `storefront-runtime static publish --from fs:… --to s3://…`.

Оценка полной пересборки для текущих фикстур: 1 000 товаров + 145 категорий + ~330 вендоров, две
локали ≈ 3 000 рендеров; при 150–300 мс на рендер и 8 воркерах 1–2 минуты без учёта ограничений
GraphQL.

## Хостинг (шаг A)

Статика в образе:

```text
браузер → Cloudflare (Tunnel, HTML bypass) → theme ──► build/static в образе
                                               └──► SSR при промахе, /auth/* → gateway
GitHub Actions (релиз, ночь) → build → static build → docker build → деплой образа
```

Бакет:

```text
браузер → Cloudflare (Tunnel, HTML bypass) → theme ──► бакет R2 по S3 API (кеш в памяти)
                                               └──► SSR при промахе, /auth/* → gateway
GitHub Actions (ночь, после сборки образа) → полная сборка → бакет (без purge)
```

- Обе реплики темы читают один бакет и видят одну версию сайта.
- Ключ S3 сервиса `theme` только на чтение, GitHub Actions — на запись (Terraform `zone`).
- R2 выбран уже на шаге A: на шаге B Worker читает тот же бакет через binding без переноса данных.
- Рендер исчезает для сгенерированных адресов, но каждый запрос HTML доходит до ноды; ответ из
  памяти стоит единицы миллисекунд. Снижение трафика до ноды даёт только шаг B.

Стоимость шага A: только R2. Нода читает объект при первом обращении и после каждого TTL — порядка
«горячие страницы × реплики × (сутки / TTL)», в пределах бесплатных 10 млн операций чтения в месяц;
выше $0,36 за миллион.

### Отклонённые варианты

| Вариант                                | Почему нет                                                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DigitalOcean App Platform, static site | каждая публикация полный деплой; годится только для «полной пересборки по расписанию»                                                                         |
| DigitalOcean Spaces + Spaces CDN       | index-документ работает только на `-static` endpoint, своей 404 и редиректов нет; впереди всё равно нужен прокси                                              |
| Cloudflare Pages, Netlify, Vercel      | публикация снимком с лимитами на число деплоев (Pages 500 в месяц на Free, Netlify 100 в день, Vercel 100/6 000 в день)                                       |
| Cloudflare Workers Static Assets       | запросы к ассетам бесплатны, но публикация снимком и лимит 20 000 файлов на Free; запасной вариант, если R2 не подойдёт                                       |
| Свой nginx на дроплете или ноде Swarm  | работает, но добавляет сервер и его обслуживание ради того, что гибридная нода и Worker делают сами                                                           |
| Статика на локальном диске реплики     | у каждой из двух реплик своя версия сайта, GitHub Actions не может писать на диск ноды Swarm; статика в образе не то же самое: она одинакова во всех репликах |
| Статика прямо в `build/client`         | `express.static` отдаёт её раньше гибридной логики: HTML в обход `/auth/*`, статусов из manifest и заголовков                                                 |
| Сохранять SSR-ответ промаха в бакет    | как ISR в Next.js, но второй писатель рядом с builder-ом, гонки с публикацией и HTML без индекса зависимостей                                                 |
| Auth в Worker или прямые вызовы IAM    | ломает контракт конфиденциального клиента (client secret, HttpOnly cookie, IP покупателя) без выигрыша                                                        |

## Что сделано по репозиториям

### `packages/shopana-storefront-runtime` (`@shopana/storefront`)

1. Режим статики: `x-shopana-static-render` с ключом процесса, `onAllReady`, без cookie и visitor id,
   shell-ветка в `createRuntimePageLoader`, вид `{ kind: 'shell' }` в `hydration.ts`.
2. `src/static/`: `createStaticRenderer`, пул воркеров, CSS-pruning, проверка приватных значений,
   store `fs` и `s3` (свой SigV4-клиент), кеш в памяти с условным `GET` и паузой после ошибки,
   builder (`build`, `render`, `publish`), manifest с условной записью и индекс сервера.
3. Гибридный сервер `src/static/server.ts`; `@react-router/serve` удалён.
4. CLI: `start [--static-only]`, `static build | render | publish`.
5. `/__env.js` вместо инлайна во всех документах.
6. Link статических ответов при клиентском переходе, оболочки в браузере.

### `packages/shopana-storefront-sdk`

1. `src/static/`: `defineStaticSite`, перечислители, `indexStaticPage`, ключ рендера статики
   (`render.ts`), схема manifest и индекса сервера, link статических ответов (`results.ts`),
   `ViewerRefresh`, `useValidUntilRefetch`.
2. `STOREFRONT_PRIVATE_TOKEN` к gateway только с рендером статики.

### Тема `storefront-brand-bite-and-crunch`

1. `static.config.ts`, `src/runtime/shell.tsx`.
2. Поля `viewer*` отзывов и вопросов в клиентском `ContentViewerQuery`.
3. Шапка и таб-бар в гостевом состоянии до монтирования, промо-метка меню на клиенте.
4. `build-theme.yml` со статикой в образе, `static-full-build.yml` для бакета.

### `internal`

`persistedDocuments` в gateway с манифестом по `HIVE_STOREFRONT_PERSISTED_DOCUMENTS_URL` и
`allowArbitraryDocuments: true` (этап 0; на момент записи не закоммичено).

### Инфраструктура

1. `deploy/terraform/modules/frontend-edge`: бакет R2 на окружение, ключ чтения для `theme` и записи
   для GitHub Actions. Cache Rules не меняются.
2. `deploy/swarm/theme.yml`: `STOREFRONT_STATIC_STORE`, `STOREFRONT_STATIC_S3_ENDPOINT`, TTL;
   `deploy/runtime/start.cjs` пропускает ключ чтения из `server-env.json` и запускает `start`.
3. `deploy-theme.mjs smoke`: `hit`, `ETag` и `304` главной, `miss` и `no-store` неизвестного товара,
   `/__env.js`, отсутствие секретов в HTML.
4. Секреты CI темы: ключ записи в бакет, серверный GraphQL URL, приватный storefront-токен.

## Тестирование

Mock-сервер `@shopana/mock-server` участвует только в разработке и тестах (1 000 товаров, 145
категорий, промо с детерминированными часами, лояльность, отзывы, мок IAM). В продакшене builder и
CI ходят в настоящий gateway.

- **Есть (unit):** builder (страницы всех языков, данные, оболочки, 404, manifest и индекс сервера,
  неизменённые файлы, удаление ушедших страниц, сохранение упавших, страница `static render` во время
  полной сборки, `publish`); гибридный сервер (`hit`, `ETag`, `304`, `HEAD`, SSR при промахе, query
  string, `/auth/*`, `*.data`, данные страниц, `/__env.js`, старые ассеты, отказ хранилища, TTL кеша,
  отчёт координатору, `--static-only`); store `fs` и `s3` (условная запись, `ETag`); кеш бакета с
  паузой после ошибки; ключи; CSS-pruning; ключ рендера и private token; link статических ответов.
- **Не выполнено:** генерация на mock-сервере с замером времени и побайтовым совпадением HTML при
  повторном рендере; гидратация без сети в браузере (`start --static-only`, `/graphql` заблокирован);
  вход через mock IAM и обновление персонализации.

## Этапы

**0. `GET` с `documentId` в Hive Gateway. Выполнен** (6 ноября 2026) на
`@graphql-hive/gateway-runtime` 2.10.7 в процессе, через `gateway.fetch`.

| Запрос                                             | Текущий конфиг                     | С `persistedDocuments`                                               |
| -------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------- |
| `GET /graphql?query=…`                             | `200`, данные                      | ошибка `CANNOT_SEND_PQ_ID_AND_BODY`                                  |
| `GET /graphql?documentId=…`                        | ошибка `Must provide query string` | `200`, данные                                                        |
| `GET /graphql?documentId=…&variables=…`            | —                                  | `200`, переменные применяются                                        |
| `GET` с неизвестным `documentId`                   | —                                  | ошибка `PERSISTED_QUERY_NOT_IN_LIST`                                 |
| `GET` с `documentId` мутации                       | —                                  | `405`, мутации только через `POST`                                   |
| `POST {documentId}`                                | —                                  | `200`, данные                                                        |
| `GET /graphql?query=…` и `allowArbitraryDocuments` | —                                  | `200`, данные                                                        |
| `GET /graphql/uk?documentId=…`                     | `404`                              | `200` с `graphqlEndpoint: '/graphql/:locale?'`, но ломает websockets |
| `GET /graphql?locale=uk&documentId=…`              | —                                  | `200`, лишний параметр не мешает                                     |

Выводы: нужна опция `persistedDocuments` с манифестом и `allowArbitraryDocuments: true` (сделано в
internal); мутации по `GET` gateway отклоняет сам; локаль передаётся в query, endpoint остаётся
`/graphql` (локаль в пути ломает upgrade websockets, перезапись пути теряет request-id и
`storefront-access`); плагин `storefront-access` от метода не зависит.

**1. Рендер без UA. Выполнен** по `plans/ua-free-rendering.ru.md`.

**2. Режим статики в runtime и `static build`. Реализован.** Не проверено условие готовности:
полная генерация на mock-сервере за 1–2 минуты и тот же HTML при повторном рендере.

**3. Гибридный сервер `start`. Реализован.** Не проверено в браузере: сгенерированные адреса как
`hit`, остальные SSR, `/auth/*`, гидратация без ошибок, одинаковый HTML для мобильного и
десктопного UA.

**4. Клиентский режим статики. Реализован**, кроме быстрых данных и личного лёгкого запроса
лояльности (`plans/static-coordinator.ru.md`). Не проверены сценарии «гость без сети» и
«персонализация после входа».

**5. Статика в образе. Реализована.** Не проверено, что `pet.shopana.dev` после деплоя образа из
GitHub Actions отдаёт сгенерированные страницы как `hit`.

**6. Бакет на stage. Реализован в коде и Terraform.** Не выполнены: `apply` профиля `zone`, ключи в
`server-env.json` и секретах CI, замер чтения из бакета с ноды (p50/p95), ночная пересборка и
пересборка по релизу образа на stage.

Дальше — `plans/static-coordinator.ru.md`.

## Риски и открытые вопросы

- **Задержка обновления.** Новая версия страницы видна на ноде через `STOREFRONT_STATIC_CACHE_TTL`
  после публикации; меньше TTL — больше условных `GET` в бакет. До координатора данные страниц
  обновляются только полной пересборкой.
- **Бакет на пути запроса.** Холодная запись кеша стоит запрос в R2 (замер на stage). Если задержка
  заметна, кеш прогревается по manifest после старта реплики.
- **Нет атомарного переключения в R2.** В окне полной пересборки часть страниц новая, часть старая.
  Безопасно, пока ассеты обеих сборок лежат рядом (7 дней); несовместимые изменения схемы данных и
  так требуют нового образа.
- **Размер HTML.** Снимок Apollo и инлайновые стили делают документ тяжёлым; CSS-pruning и
  статический CSS снижают. Следующий шаг — не инлайнить `__shopanaApolloState`, а брать данные
  страницы из `__static/data`.
- **Блог.** Данных в API нет; генерируется из mock темы, после появления API — перечислитель и
  события.
- **Коллекции.** `Query.collections` нет; коллекция вне меню и `extraCollections` не попадёт в
  статику.
- **Персонализированные цены в будущем** переходят в клиентский слой, как лояльность; HTML остаётся
  гостевым.
- **HTML и JSON.** Пишутся по отдельности; новый JSON к старому HTML безопасен: link статических
  ответов не затирает кеш и отдаёт расхождения в API.
