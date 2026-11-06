# Генератор статических HTML-страниц витрины (SSG) на базе storefront SDK

## Вывод

**Генератор строится поверх уже собранного серверного бандла React Router, а не поверх
`prerender` из `react-router.config.ts`.** Встроенный `prerender` React Router работает только внутри
`vite build`: любая перегенерация страницы означает полную сборку темы. Нам нужна Gatsby-подобная
модель: один раз собрать код, затем рендерить любой набор адресов сколько угодно раз. Поэтому
генератор («builder») импортирует `.runtime/build/server/index.js`, прогоняет через
`createRequestHandler` синтетические гостевые запросы и пишет файлы.

**Рендер всегда гостевой.** В HTML попадает то, что одинаково для всех покупателей: каталог, цены,
промо-бейджи, базовые баллы лояльности, агрегаты отзывов, меню, контент. Всё, что зависит от
сессии, корзины или visitor id, рендерится клиентом после гидратации: корзина, аккаунт, вишлист,
сравнение, состояние голосов в отзывах, множитель баллов по тиру, прогресс промо в корзине. Для
этих мест в теме остаются скелетоны или «гостевое» состояние (см. раздел «Персонализация»).

**Одна версия страницы на адрес.** Сегодня тема выбирает мобильный или десктопный стек по
User-Agent на сервере, и статика потребовала бы двух вариантов каждой страницы и маршрутизации по
устройству на CDN. От этого отказываемся: зависимость рендера от UA убирается по отдельному плану
`plans/ua-free-rendering.ru.md` (в HTML мобильная версия, уточнение после гидратации; затем одно
приложение с обеими обвязками). Это предусловие генератора, а не его часть.

**Хостинг в два шага: сначала гибридная нода (SSG + SSR), потом Worker и кеш CDN перед ней.**

- **Шаг A, без Worker и кеша CDN.** Node-приложение темы работает как гибридный сервер, по модели
  Next.js: на `GET` HTML-адреса оно ищет готовый файл в хранилище статики и отдаёт его, а если
  файла нет, рендерит страницу обычным SSR. Хранилище это S3-совместимый бакет (R2 по S3 API),
  в разработке каталог на диске. Builder в GitHub Actions пишет в бакет, нода только читает.
  `/auth/*`, ассеты и всё, что не HTML, нода обслуживает как сейчас. Cloudflare на этом шаге
  остаётся тем, что есть сегодня: Tunnel и Cache Rules с bypass для HTML.
- **Шаг B, Worker и кеш CDN перед нодой.** Worker читает тот же бакет через R2 binding, отдаёт
  HTML и `page-data.json` с `s-maxage`, а промахи и `/auth/*` проксирует на ту же гибридную ноду
  через Tunnel. Ключи объектов и функция «путь → ключ» у Worker и ноды общие. Нода при этом не
  меняется: промах Worker-а приходит к ней, она ещё раз смотрит в бакет (объект мог появиться
  между запросами) и при промахе рендерит SSR.

Точечная перегенерация и полная пересборка идут в GitHub Actions на обоих шагах; на шаге A шаг
purge пропускается, потому что кеша CDN для HTML нет. Цена шага A: операции чтения R2 в
бесплатной квоте. Цена шага B: бесплатный план Workers или $5 в месяц. Своего nginx и переезда на
DigitalOcean не требуется; App Platform, Spaces и snapshot-платформы разобраны в разделе
«Хостинг» и отклонены.

**Инвалидация: точечная по триггеру плюс полная по расписанию, и то и другое.** Точечная
перегенерация идёт от событий internal (`productUpdated`, `categoryUpdated`, `pageUpdated`, …):
тема подписывается на обычные вебхуки internal со списком топиков. Соответствие «сущность →
страницы» координатор темы строит из нормализованного кеша Apollo каждой отрендеренной страницы.
Рендер выполняется в GitHub Actions (`plans/static-invalidation-and-ci-builds.ru.md`). Полная пересборка нужна при
смене макета (меню, настройки магазина, локали, новый образ темы) и как страховка раз в сутки.
Отдельно нужны таймеры: промо и окна коллекций меняют вывод по времени без каких-либо событий.

**Кеш GraphQL для клиентских переходов, два слоя.** Для каждой страницы builder пишет
`page-data.json` (снимок кеша Apollo после рендера), который клиентский loader подхватывает перед
`loadData`, так что переход на уже сгенерированную страницу не ходит в API. Остальные гостевые
запросы (подгрузка списков, фильтры, поиск, варианты, промо) идут через `GET` с persisted
documents и кешируются Cloudflare по TTL, который отдаёт gateway. Второй слой требует кеша CDN и
поэтому появляется только после шага B.

В internal сейчас нет ни тегов ответов, ни CDN purge, ни исходящих вебхуков по каталогу: кеш по
тегам (`@shopana/cache`) это внутренний кеш данных Redis, вебхуки есть только у notifications и
только по заказам и клиентам. Нужные точки расширения есть, они описаны в разделе «Изменения в
internal».

## Что есть сейчас

Факты, на которые опирается план (пути относительно корня соответствующего репозитория).

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
- Выбор стека по UA: `ResponsiveProvider` и `AppSwitch` рендерят Mobile или Desktop приложение и
  до гидратации догружают нужный чанк по `navigator.userAgent`. Убирается по
  `plans/ua-free-rendering.ru.md`.
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
не генерируются: HTML один на адрес без параметров, параметры обрабатывает клиент.

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

**Где остаются плейсхолдеры и скелетоны.** Правило: в HTML и при гидратации компонент показывает
гостевое состояние или скелетон; после монтирования и определения сессии данные подтягиваются
клиентом и заменяют его на месте, без перезагрузки страницы.

| Место                                              | В статике                        | После гидратации                                             |
| -------------------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| Кнопка корзины, счётчик в шапке и таб-баре         | скелетон счётчика                | `useCart` по cookie корзины                                  |
| Кнопка аккаунта / имя покупателя                   | «Войти» (гостевое)               | `useIsAuthenticated`, затем `useCustomer`                    |
| Сердечко вишлиста, кнопка «сравнить»               | неактивное состояние             | `useAccountProductActions`, `useProductComparisons`          |
| «Начислим N баллов» на карточке и странице товара  | базовые баллы гостя              | повторный запрос `ProductVariant.loyalty` при наличии сессии |
| Баланс и тир лояльности, страница Points           | нет в статике (аккаунт оболочка) | `useLoyaltyAccount`                                          |
| Промо-бейджи на товаре, промо в шапке              | гостевой снимок с `validUntil`   | повторный запрос по таймеру `validUntil` и при `discount*`   |
| Прогресс промо и промокод в корзине                | нет (корзина оболочка)           | `Checkout.promotionProgress`, `usePromoCodes`                |
| Остаток и «нет в наличии»                          | снимок на момент генерации       | лёгкий `GET`-запрос остатков варианта с коротким TTL         |
| Голоса и жалобы на отзывах, подписка на вопросы    | поля не запрашиваются            | отдельный запрос `viewer*` с visitor id или токеном          |
| Рекомендации по корзине, подборки ассистента       | скелетон блока                   | `cartRecommendations`, `petProductSelection`                 |
| Поиск, `/selections/:id`                           | оболочка с layout и скелетоном   | `loadData` в браузере, как сейчас при клиентском переходе    |
| `/cart`, `/checkout`, `/account/*`, `/box-builder` | оболочка                         | модуль грузится в браузере; `ClosedPageGuard` уводит гостя   |

Цены, `compareAtPrice`, описания, медиа, фасеты и агрегаты отзывов остаются в статике без
скелетонов: они одинаковы для всех.

## Архитектура генератора

Генератор делится между двумя пакетами так же, как сейчас поделена ответственность между SDK и
runtime (`packages/shopana-storefront-sdk/ARCHITECTURE.md`): SDK знает о данных, конфигурации и
клиенте, runtime о React Router и серверном бандле.

```text
theme: static.config.ts  ─┐
                           ├─► @shopana/storefront-sdk/static   (конфиг, перечисление адресов,
                           │     индекс страниц, клиентский режим статики, обновление персонализации)
                           └─► @shopana/storefront/static        (рендер через server bundle,
                                 CLI `storefront-runtime static …`, публикация в хранилище,
                                 гибридный сервер `storefront-runtime start`)
```

### Конфигурация в теме

`themes/<theme>/static.config.ts`:

```ts
import { defineStaticSite } from '@shopana/storefront-sdk/static';

export default defineStaticSite({
  locales: 'all', // или список сегментов
  pages: {
    home: true,
    product: { enumerate: 'products' }, // Query.products по курсору, только published
    category: { enumerate: 'categories' },
    collection: { enumerate: 'menus' }, // Query.collections нет: берём из меню и списка ниже
    vendor: { enumerate: 'vendors' },
    page: { enumerate: 'onlineStorePages' },
    policies: { enumerate: 'store.policies' },
    'list-collections': true,
    blog: { enumerate: 'theme' }, // пока mock: тема отдаёт список сама
  },
  extraCollections: ['new', 'sale'],
  shells: [
    '/cart',
    '/checkout',
    '/checkout/return',
    '/account',
    '/search',
    '/selections',
    '/newsletter/confirm',
    '/box-builder',
  ],
  notFound: true,
  output: '.static',
  concurrency: 8,
  publish: { store: 's3' | 'fs', cdn: 'none' | 'cloudflare' }, // на шаге A cdn: none
});
```

Перечислители работают через тот же `loadQuery` SDK с серверным клиентом Apollo и пагинируют
курсором `first: 250`. Товар попадает в список, только если `productByHandle` вернёт его
гостю: недоступные товары и так дают `not-found` в `preload`, генератор просто не пишет файл.

### Рендер одной страницы

1. Builder импортирует серверный бандл один раз: `const build = await import(serverBuildPath)`,
   `const handle = createRequestHandler(build, 'production')` из `react-router`.
2. Для адреса `{ locale, path }` строится `Request` без cookie с заголовками
   `x-shopana-static-render: 1` и `Accept-Language`. Runtime в режиме «полный документ»:
   - отвечает после `onAllReady`, без стриминга, независимо от `isbot`;
   - не читает cookie вовсе (сессия и корзина всегда пусты) и не создаёт visitor id;
   - `publicEnvironmentScript` отключён: вместо него в `<head>` подключается внешний
     `/__env.js` (см. «Публичный env»);
   - закрытые модули и оболочки рендерятся как shell (см. ниже), а не редиректом.
3. Ответ handler разбирается: статус, `Location`, тело. `404` для генерируемой страницы означает
   «не публиковать» (и удалить старый объект, если был). `307` на локаль это конфигурационная
   ошибка.
4. Из тела извлекаются `__shopanaApolloState` (снимок кеша) и метаданные; из снимка строится
   список сущностей страницы (ключи вида `Product:…`, `ProductVariant:…`, `Category:…`,
   `Collection:…`, `Vendor:…`, `OnlineStorePage:…`, `OnlineStoreNavigationMenu:…`,
   `StorefrontPromotion:…`, `Store:…`) и минимум из всех `validUntil`, `endsAt`, `startsAt`,
   `activeFrom`, `activeTo`, встретившихся в данных.
5. Пост-обработка HTML:
   - удаление emotion-правил, id которых не встречается в разметке (`css-<hash>` в `class`):
     лечит накопление глобального кеша emotion в долгоживущем процессе без правок `AntdRegistry`;
   - подстановка `<script>window.__shopanaStatic={buildId, renderedAt, locale, path}`;
   - проверка, что в HTML нет приватных значений (как делает `smoke` в `deploy-theme.mjs`).
6. Запись: `<locale-path>/index.html`, `__static/data/<locale-path>.json` (снимок кеша), запись в
   индекс страниц.

Рендер идёт в пуле `worker_threads`; каждый воркер держит свой экземпляр бандла и
перезапускается после N страниц (защита от утечек emotion, кешей antd-style и модульных
singletons вроде `setEnvironmentConfig`). Запросы к GraphQL идут с серверным
`STOREFRONT_SERVER_GRAPHQL_URL` и ограничиваются параллелизмом `concurrency`.

### Оболочки (shell) для клиентских страниц

Для адресов из `shells` builder рендерит документ с layout соответствующего типа страницы
(`loadRouteLayout`/`loadModuleLayout`) и скелетоном вместо контента. В `__shopanaHydratedPage`
пишется новый вид `{ kind: 'shell', pathname }`; `clientLoader` страницы, увидев shell, выполняет
обычную клиентскую ветку (резолвит адрес, грузит модуль, выполняет `loadData`), а `ClosedPageGuard`
уводит гостя с `/account`. Это тот же путь, что сегодня при клиентском переходе на эти страницы.

Отдельно генерируются «семейные» оболочки `__shell/products.html`, `__shell/categories.html`,
`__shell/collections.html`, `__shell/vendors.html`, `__shell/pages.html`. Их отдаёт гибридный
сервер в режиме `--static-only` и Worker шага B, когда файла нет, а SSR недоступен (деградация);
в обычном режиме промах уходит на живой рендер. Клиент дорисует страницу из API; если и API вернёт `not-found`, покажется 404 темы.
Статус для оболочки `200`, для совсем неизвестных префиксов `404.html` со статусом 404.

### Гибридный сервер `storefront-runtime start`

`start` больше не запускает `react-router-serve`: runtime получает свой сервер
`src/static/server.ts` на `express` и `@react-router/express` с тем же preload
`bin/forwarded-for.js`, той же раздачей `build/client` и тем же `createRequestHandler`. Перед
handler-ом стоит middleware статики. Он включается переменной `STOREFRONT_STATIC_STORE`
(`s3://<bucket>/<prefix>` или `fs:<каталог>`); без неё сервер работает как сегодня, только SSR.

Порядок обработки запроса:

1. `/assets/*` и файлы `public/` отдаются из `build/client`, как сейчас (`immutable` для ассетов).
2. `/__env.js` сервер собирает сам из своего `process.env` (см. «Публичный env»).
3. Мимо статики идут: метод не `GET`/`HEAD`, `/auth/*`, `/auth/headless/*`, запросы данных React
   Router (`*.data`), `/__builder/*`.
4. `/__static/data/*.json` отдаётся из хранилища или отвечает `404`, без SSR: клиент на `404`
   делает обычную загрузку.
5. HTML-адрес переводится в ключ функцией `staticKeyForPath` (`src/static/keys.ts`): `/` →
   `index.html`, `/uk/products/x` → `uk/products/x/index.html`. Query string в ключ не входит:
   HTML один на адрес, параметры обрабатывает клиент. Эту же функцию импортирует Worker шага B.
6. Файл есть: ответ `200` с `ETag` объекта, `Cache-Control: public, max-age=0, must-revalidate`,
   `x-shopana-static: hit`; на `If-None-Match` `304`. Cookie не читаются: HTML гостевой для всех,
   персонализацию дорисовывает клиент. Отдельные статусы для `404.html` и оболочек берутся из
   manifest.
7. Файла нет: запрос уходит в SSR, как сегодня (`private, no-store`, `x-shopana-static: miss`).
   Если адрес относится к генерируемому семейству (товар, категория, коллекция, вендор, страница),
   сервер сам сообщает координатору о промахе (`POST /__builder/api/builds {mode: 'paths'}`,
   не чаще раза в минуту на адрес). Заголовок промаха от Worker для этого не нужен.
8. Хранилище недоступно или ответило ошибкой: SSR, как при промахе, и предупреждение в лог. Отказ
   бакета не превращается в `5xx` сайта.

Чтение из бакета идёт с кешем в памяти процесса: LRU по ключу на ~50 МБ, запись хранит тело и
`ETag`. Через `STOREFRONT_STATIC_CACHE_TTL` (по умолчанию 10 с) запись перепроверяется условным
`GET` с `If-None-Match`, на что бакет отвечает `304` без тела. Промахи кешируются на тот же срок.
Итого новая версия страницы видна на всех репликах не позже чем через TTL после публикации, и
purge на шаге A не нужен.

`start --static-only` отключает SSR: промах отдаёт семейную оболочку или `404.html`. Это режим
тестов гидратации без сети и проверка деградации, которую на шаге B делает Worker.

### Клиентская сторона

- **`page-data.json` перед `loadData`.** В режиме статики `clientLoader`
  (`src/react-router/page.tsx:708`) сначала запрашивает `/__static/data/<locale-path>.json`
  (`fetch` с кешем браузера и CDN). Снимок вливается в кеш Apollo через существующий путь
  гидратации снимков (`ApolloCacheHydrator` / `mergeApolloCacheStates`) с приоритетом уже
  имеющихся записей для персонализированных полей. Затем `loadData` и секции находят всё в кеше
  (`cache-first`), запросов к API нет. `404` на JSON означает «страницы нет в статике», дальше
  обычная клиентская загрузка. JSON отдаёт гибридный сервер на шаге A и Worker на шаге B, путь
  один и тот же.
- **Обновление персонализации после гидратации.** Новый SDK-хук `useViewerRefresh()` в
  `AppProviders`: когда `useIsAuthenticated` становится `true` или появляется visitor id, он
  вызывает `cache.evict` по полям `ProductVariant.loyalty`, `Product.loyalty`,
  `*.viewerEngagement`, `*.viewerCapabilities`, `*.viewerSubscription`,
  `ProductComparisonColumn.savedForComparison` и `cache.gc()`, после чего активные запросы
  перезапрашивают только эти поля. Клиентские запросы покупателя уже пропускаются без сессии и
  используют `cache-and-network` (`modules/customer/react/internal.ts:38`).
- **Сессия.** HTML всегда гостевой (`initialSession` пуст). После гидратации `SessionContext`
  видит cookie `shopana_signed_in` и получает access-токен через `/auth/token` или `/auth/refresh`
  у Node-приложения; дальше запросы покупателя идут в gateway напрямую.
- **Промо по времени.** `useStorefrontPromotions` сейчас `cache-first`
  (`modules/promotions/react/useStorefrontPromotions.ts:42`); в режиме статики хук ставит таймер
  на `validUntil` из снимка и делает `refetch` по его наступлении, то же для
  `ProductLoyaltyPresentation.validUntil`.
- **Смена локали и `router.refresh()`** в статике делают полную навигацию
  (`window.location.assign`), чтобы не требовать `.data`-ответов от сервера.
- **Компоненты шапки** читают корзину и сессию только после монтирования (`useHydrated()`), чтобы
  гидратация совпадала с гостевым HTML.

### Публичный env

Сейчас `NEXT_PUBLIC_*` вшивается в каждый HTML. В статике это означало бы перегенерацию всего
сайта при ротации публичного ключа. Поэтому документы, и статические, и SSR, подключают
синхронным `<script src="/__env.js">` до модулей приложения один скрипт
`globalThis.__shopanaPublicEnv = {...}`. Его отдаёт гибридный сервер из своего `process.env` с
`Cache-Control: no-cache`; builder его не пишет. Ротация ключа это перезапуск сервиса темы с новым
env. На шаге B Worker этот путь не перехватывает, он идёт через Tunnel на ноду.

### Выход генератора

Локально (CLI, тесты) это каталог (`fs`); на stage и в продакшене те же ключи в бакете R2,
доступном по S3 API (`s3`):

```text
<locale-path>/index.html         404.html, __shell/*.html
__static/data/<locale-path>.json sitemap*.xml, robots.txt
assets/<hash>.*                  (из build/client/assets, иммутабельные)
public/…                         (копия public/, виджеты embed; читается с шага B)
__static/manifest.json           (buildId, список страниц, хэши, сущности, validUntil, статусы)
```

Ассеты прошлых сборок нужны уже на шаге A: статический HTML, отрендеренный прошлым образом,
ссылается на старые хэши, а в `build/client` нового образа их нет. Поэтому нода отдаёт
`/assets/*`, которых нет в её `build/client`, из бакета. `public/` на шаге A отдаётся из образа,
копия в бакете пишется сразу, чтобы шаг B не требовал миграции.

В бакете нет атомарного переключения каталога, поэтому HTML и JSON перезаписываются на месте
(каждый объект сам по себе атомарен), ассеты с хэшами только добавляются, а объекты прошлой
сборки, которых нет в новом manifest, удаляются через 7 дней: HTML в кеше и открытые вкладки ещё
ссылаются на старые хэши.

## Кеш GraphQL для клиентских переходов

Цель: переход между страницами не должен ждать живого API, а повторные одинаковые запросы
разных покупателей должны обслуживаться CDN.

**Слой 1: `page-data.json` (аналог `page-data.json` в Gatsby).** Описан выше. Это кеш именно
тех данных, которые страница показывает выше сгиба: `preload` и запросы секций. Он создаётся и
инвалидируется вместе с HTML, поэтому согласован с ним и чистится в CDN точечно по URL. Для
гостя переход «категория → товар → категория» делает 0 запросов к GraphQL.

**Слой 2: `GET` persisted documents с TTL на CDN.** Всё, что не влезает в страничный снимок:
подгрузка листинга по курсору, фильтры и сортировка, поиск, страницы вариантов, вопросы и
отзывы, `storefrontPromotions`, остатки.

- Codegen темы и SDK включает persisted documents (`@graphql-codegen` client preset,
  `documentMode: 'documentId'`): клиент шлёт `documentId` и переменные, а не текст запроса.
  Список документов с разрешением на кеш публикуется gateway вместе со схемой.
- В `createApolloClient` (`graphql/apollo/Environment.ts:118`) появляется второй `HttpLink` с
  `useGETForQueries: true` для операций из allow-list «гостевые и кешируемые». У таких запросов
  **нет** `Authorization` и `x-shopana-storefront-visitor-id`; локаль передаётся **в URL**
  (`/graphql/<locale>?documentId=…&variables=…`), а не только в `Accept-Language`, потому что
  Cloudflare Free не учитывает `Vary` в ключе кеша. Запросы с сессией и мутации остаются `POST`.
- Gateway (`infra/federation/gateway-storefront.config.ts`) получает плагин, который для `GET` с
  `documentId` из allow-list и без `Authorization` ставит `Cache-Control: public, max-age=0,
s-maxage=<ttl>, stale-while-revalidate=<ttl*5>`. TTL по классам операций: листинги и поиск
  120 с, варианты и вопросы/отзывы 300 с, промо до `validUntil` (не больше 600 с), остатки
  30 с. Для всего остального `private, no-store`, как сейчас.
- Cloudflare Cache Rule: `GET /graphql/*` без `Authorization` eligible for cache, Edge TTL
  «respect origin», query string в ключе. Существующее правило bypass для `/graphql` сужается до
  `POST`.
- Инвалидация этого слоя только по TTL: purge по тегам на Cloudflare Free нет, а множество
  комбинаций переменных не перечислить. Точность там, где она нужна, даёт слой 1.

Слой 2 требует CDN перед gateway, то есть Cloudflare; CDN объектного хранилища (Spaces CDN,
R2 без Cloudflare-зоны) его не даёт. Поэтому слой 2 делается после шага B, а на шаге A клиент
пользуется только слоем 1.

## Инвалидация и перегенерация

### Что служит источником изменений

В internal все изменения уже проходят через events (`services/events`, таблица `domain_events`,
доставка `@EventHandler`/`@BatchEventHandler` по точному типу). Для статики важны:

| Событие                                                                                                        | Что перегенерировать                                                                            |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `productCreated`, `productUpdated` (reasons, `affectedCategoryIds`, `affectedCollectionIds`), `productDeleted` | страница товара; страницы, где он встречается (индекс); категории и коллекции из payload        |
| `categoryCreated`, `categoryUpdated`, `categoryDeleted`, `collection*`, `vendor*`                              | своя страница, `/collections`, страницы с этой сущностью в индексе (карточки, хлебные крошки)   |
| `pageCreated`, `pageUpdated`, `pageDeleted`                                                                    | `/pages/:handle`                                                                                |
| `navigationMenu*`, `storeUpdated`, `storeLocalesUpdated`                                                       | полная пересборка (меню и магазин есть в каждом документе)                                      |
| `discount*`, `loyaltyProgram*`                                                                                 | страницы с `StorefrontPromotion`/`LoyaltyOpportunity` в индексе; сегодня это шапка, то есть все |
| `review*`, `reviewStoreConfigurationUpdated`, `productQuestion*`                                               | страница товара (агрегаты)                                                                      |
| `listingFacetMembershipChanged`, `facet*`, `searchSettingsUpdated`                                             | листинги (категории, коллекции, вендоры)                                                        |
| `fileUpdated`                                                                                                  | страницы с медиа (по `MediaImage:` в индексе)                                                   |

Чтобы `discount*` и промо-метка в шапке не превращали каждое изменение скидки в полную
пересборку, промо в layout (`useHeaderMenuItemLabel`) в режиме статики грузится клиентом через
слой 2, а не из снимка. Тогда скидки затрагивают только страницы товаров и листинги.

Payload событий содержит id и причины, не состояние; builder всегда перечитывает данные.

### Вебхуки internal и координатор в теме

Заменено планом `plans/static-invalidation-and-ci-builds.ru.md`. Отдельного сообщения
`storefront.invalidate` нет. Тема подписывается в admin на обычные вебхуки internal со списком
топиков (сервис `webhooks`, `internal/plans/webhooks-service.ru.md`). Роль `static coordinator`
того же образа (сервис `theme-static`, одна реплика) хранит индекс зависимостей страниц и очередь.
Рендер выполняется только в GitHub Actions: координатор ставит workflow через REST API, а job
забирает задания под аренду.

CLI для разработки и CI: `storefront-runtime static build` (полная генерация в каталог или в
бакет), `storefront-runtime static render /products/x /categories/y`, `storefront-runtime static
run` (клиент аренды координатора). Локальная раздача статики это тот же
`storefront-runtime start` с `STOREFRONT_STATIC_STORE=fs:.static`, без SSR с флагом
`--static-only`. Отдельной команды `static serve` нет.

На шаге A публикация в CI пишет объекты в бакет и пропускает purge (`cdn: 'none'`): новую версию
нода увидит через `STOREFRONT_STATIC_CACHE_TTL`. С шага B включается purge Cloudflare по URL.

### Что правильно: по триггеру или по расписанию

Оба механизма, у каждого своя роль:

- **Точечно по триггеру** основной путь: изменение товара видно на сайте через секунды, стоимость
  несколько рендеров.
- **Промах SSR** на гибридной ноде ставит рендер этого адреса, так что новый товар попадает в
  статику после первого посещения.
- **Полная пересборка** при изменениях, которые входят в каждый документ (меню, магазин,
  локали, новый образ темы), и ночью как страховка от дрейфа.
- **Сверка по `updatedAt`** страховка от потерянных вебхуков без полной пересборки.
- **Таймеры** для изменений без событий (промо по расписанию, окна коллекций).

Оценка полной пересборки для текущих фикстур: 1 000 товаров + 145 категорий + ~330 вендоров,
две локали ≈ 3 000 рендеров; при 150–300 мс на рендер и 8 воркерах 1–2 минуты без учёта
ограничений GraphQL. Это измеряется на этапе 0.

## Хостинг и CDN

### Шаг A: гибридная нода

```text
браузер → Cloudflare (Tunnel, HTML bypass, как сейчас) → theme ──► бакет R2 по S3 API
                                                          │        (HTML, page-data.json, 404,
                                                          │         оболочки; кеш в памяти)
                                                          └──► SSR при промахе, /auth/*
                                                               → gateway
internal webhooks → theme-static (индекс, очередь) → GitHub Actions → бакет (без purge)
GitHub Actions (ночь, релиз образа) → полная сборка → бакет (без purge)
промах SSR на theme → theme-static → GitHub Actions → бакет
```

- Обе реплики темы читают один бакет, поэтому видят одну версию сайта; локальный диск реплики для
  этого не годится (см. «Отклонённые варианты»).
- Ключи: у сервиса `theme` ключ S3 только на чтение, у GitHub Actions на запись.
- Бакет R2 выбран уже на шаге A, хотя Worker ещё нет: на шаге B Worker читает тот же бакет через
  binding без переноса данных. Подходит и любой другой S3-совместимый бакет (Spaces, MinIO), но
  тогда на шаге B нужна полная сборка в R2.
- Нагрузка на ноду: рендер исчезает для сгенерированных адресов, но каждый запрос HTML всё ещё
  доходит до неё. Ответ из памяти стоит единицы миллисекунд, так что двух реплик хватает с
  запасом; снижение трафика до ноды даёт только шаг B.

### Шаг B: Worker и кеш CDN перед нодой

```text
браузер → Cloudflare CDN → Worker ──► R2 (HTML, page-data.json, 404, оболочки)
                               │ промах, /auth/*, /__env.js
                               └──► Tunnel → theme (гибридная нода: статика, SSR, auth-BFF)
              Cloudflare CDN ───────► R2 custom domain: /assets/*, /public/* (без Worker)
              Cloudflare CDN ───────► Tunnel → gateway: /graphql (GET кешируется, POST нет)
internal webhooks → theme-static (индекс, очередь) → GitHub Actions → R2 + purge по URL
GitHub Actions (ночь, релиз образа) → полная сборка → R2 + purge all
```

Нода на шаге B не меняется: на промах Worker-а она снова смотрит в бакет и при промахе рендерит
SSR. Её кеш в памяти и проверка бакета остаются, хотя основную раздачу берёт на себя Worker.

### Worker (шаг B)

Один скрипт на 30–50 строк, маршрут только на HTML-адреса и `/__static/data/*`:

1. Переписывает путь в ключ функцией `staticKeyForPath` из runtime (та же, что у ноды):
   `/` → `index.html`, `/uk/products/x` → `uk/products/x/index.html`, `/__static/data/...json`
   как есть.
2. Читает объект через R2 binding. Есть: отдаёт с `Cache-Control: public, max-age=0,
s-maxage=86400, stale-while-revalidate=3600` и `ETag` объекта.
3. Нет: `fetch` того же запроса на гибридную ноду (hostname Tunnel) с прокидыванием cookie и
   ответом как есть. Если нода недоступна, отдаёт семейную оболочку `__shell/<family>.html` со
   статусом 200 или `404.html` со статусом 404.
4. `/auth/*` и `/auth/headless/*` проксирует на SSR-origin без кеша, с `Set-Cookie` обратно.

Worker выполняется на каждый запрос своего маршрута, в том числе при попадании в кеш CDN, поэтому
ассеты и `public/` на него не вешаются: они отдаются с R2 custom domain по Cache Rules. Ключ
cookie-политики не меняется: hostname тот же, cookie first-party. `STOREFRONT_TRUSTED_PROXY_HOPS`
темы перепроверяется на stage (с Worker-ом на пути может стать 2).

### Cloudflare (шаг B)

- Cache Rules: HTML и `/__static/data/` eligible, «respect origin»; `/assets/` и `/public/` год,
  immutable; `GET /graphql/*` без `Authorization` eligible; `POST /graphql`, `/auth/*` bypass.
  Сейчас HTML bypass (`deploy/terraform/modules/frontend-edge/main.tf`), правило меняется.
- Purge: `POST /zones/{zone}/purge_cache` с `files` (до 30 за вызов) из builder-а;
  `purge_everything` после полной пересборки. Токен с правом `Cache Purge` секрет builder-а.
- Tunnel остаётся как сейчас: публичный hostname ведёт на `theme:3000` для промахов и auth, на
  Traefik для `/graphql`. Worker route перехватывает HTML и JSON раньше Tunnel.
- R2: один бакет на окружение, custom domain вида `static.<hostname>` для ассетов или тот же
  hostname через Worker; учётные данные S3 API для builder-а и GitHub Actions.

### Сборка в GitHub Actions

Все сборки, полные и точечные, выполняет workflow `static-site.yml` в репозитории темы. Его
запускают координатор через `workflow_dispatch`, ночной cron и деплой нового образа. Протокол
аренды, inputs и авторизация описаны в `plans/static-invalidation-and-ci-builds.ru.md`.

### Стоимость

Шаг A: только R2. Нода читает объект при первом обращении и после каждого TTL, так что чтений
порядка «горячие страницы × реплики × (сутки / TTL)», в пределах бесплатных 10 млн операций
чтения в месяц при текущем трафике. Выше квоты $0,36 за миллион.

Шаг B:

| Статья                                        | Объём при 300 000 просмотров в месяц | Стоимость                         |
| --------------------------------------------- | ------------------------------------ | --------------------------------- |
| Вызовы Worker (HTML + JSON)                   | ~0,5–0,7 млн                         | Free (100 000 в день) или $5 план |
| CPU Worker                                    | ~1–2 млн CPU-мс                      | в квоте                           |
| Хранение R2 (~12 000 объектов, ~2 ГБ)         | 2 ГБ                                 | в бесплатной квоте 10 ГБ          |
| Чтения R2 (только промахи CDN)                | сотни тысяч                          | меньше $0,10                      |
| Записи R2 (полная пересборка 12 000 объектов) | 12 000 на пересборку                 | ~$0,05 за пересборку              |
| Исходящий трафик R2                           | любой                                | $0                                |

Для продакшена брать Workers Paid ($5): на Free превышение дневного лимита заканчивается
отказами. Цены по официальным страницам Cloudflare на ноябрь 2026.

### Отклонённые варианты

| Вариант                                | Почему нет                                                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| DigitalOcean App Platform, static site | каждая публикация полный деплой; годится только для «полной пересборки по расписанию»                                   |
| DigitalOcean Spaces + Spaces CDN       | index-документ работает только на `-static` endpoint, своей 404 и редиректов нет; впереди всё равно нужен прокси        |
| Cloudflare Pages, Netlify, Vercel      | публикация снимком с лимитами на число деплоев (Pages 500 в месяц на Free, Netlify 100 в день, Vercel 100/6 000 в день) |
| Cloudflare Workers Static Assets       | запросы к ассетам бесплатны, но публикация снимком и лимит 20 000 файлов на Free; запасной вариант, если R2 не подойдёт |
| Свой nginx на дроплете или ноде Swarm  | работает, но добавляет сервер и его обслуживание ради того, что гибридная нода и Worker делают сами                     |
| Статика на локальном диске реплики     | у каждой из двух реплик своя версия сайта, GitHub Actions не может писать на диск ноды Swarm; только для разработки      |
| Сохранять SSR-ответ промаха в бакет    | как ISR в Next.js, но второй писатель рядом с builder-ом, гонки с публикацией и HTML без индекса зависимостей           |
| Auth в Worker или прямые вызовы IAM    | ломает контракт конфиденциального клиента (client secret, HttpOnly cookie, IP покупателя) без выигрыша                  |

## Изменения по репозиториям

### `packages/shopana-storefront-runtime` (`@shopana/storefront`)

1. Режим «полный документ»: заголовок `x-shopana-static-render`, `onAllReady` без `isbot`,
   отключение чтения cookie и visitor id (`headers.ts`, `entry.server.tsx`), shell-ветка в
   `createRuntimePageLoader` (`server.ts:129`) и вид `{ kind: 'shell' }` в `hydration.ts`.
2. `src/static/`: `createStaticRenderer(build)` (Request → `{ status, html, cacheState,
entities, validUntil }`), пул воркеров, CSS-pruning, запись в каталог и в R2 (S3 API),
   sitemap/robots, manifest.
3. Гибридный сервер `src/static/server.ts`: свой `express` с `@react-router/express` вместо
   `react-router-serve`, middleware статики, драйверы хранилища `fs` и `s3`, кеш в памяти с
   условным `GET`, старые ассеты из бакета, отдача `/__env.js`, сообщение о промахе координатору,
   `--static-only`. `src/static/keys.ts` с `staticKeyForPath` общий для сервера и Worker-а.
   Зависимость `@react-router/serve` удаляется.
4. CLI `bin/storefront-runtime.js`: `start` запускает гибридный сервер; команда `static`
   (`build | render | run | publish`).
5. `/__env.js` вместо инлайна `publicEnvironmentScript` во всех документах, и в статике, и в SSR.

### `packages/shopana-storefront-sdk`

1. `src/static/`: `defineStaticSite`, перечислители адресов по GraphQL, индекс сущностей из
   `NormalizedCacheObject`, правила «событие → страницы», схема manifest.
2. Клиентский режим статики: загрузка `page-data.json` в `clientLoader`-сервисах, `useViewerRefresh`,
   таймеры `validUntil` в `useStorefrontPromotions`, полная навигация при смене локали.
3. Транспорт: второй `HttpLink` с `GET` и persisted `documentId` для allow-list операций, без
   `Authorization` и visitor id; локаль в URL.
4. Codegen SDK и темы: persisted documents и манифест разрешённых к кешу операций.

### Тема `brand-bite-crunch`

1. Рендер без UA по `plans/ua-free-rendering.ru.md` (предусловие, выполняется отдельно).
2. `static.config.ts`, список оболочек, перечислитель коллекций (из меню плюс список).
3. Убрать `viewerEngagement`/`viewerCapabilities`/`viewerSubscription` из SSR-запросов отзывов и
   вопросов, вынести в отдельный клиентский запрос.
4. Шапка и таб-бар: скелетон корзины и аккаунта до монтирования; промо-метка в меню клиентский
   запрос.
5. Карточки и страница товара: показ базовых баллов гостя, обновление на месте после входа.
6. `scripts/deploy-theme.mjs smoke`: на шаге A проверять `x-shopana-static: hit` и `304` на
   `If-None-Match` для сгенерированной страницы, `miss` и SSR для неизвестной, `__shopanaStatic`
   и отсутствие секретов; на шаге B добавить `s-maxage` и `cf-cache-status`. Проверка, что
   гостевой переход не делает запросов к `/graphql`.
7. Workflow полной сборки `.github/workflows/static-full-build.yml`.

### `internal`

1. Сервис `webhooks` с подпиской endpoint на список топиков и admin UI
   (`internal/plans/webhooks-service.ru.md`); тема создаёт endpoint со своим списком топиков.
2. Gateway: плагин `Cache-Control` для `GET` persisted documents из allow-list и маршрут
   `/graphql/<locale>`; persisted documents в Hive/Mesh конфиге.
3. Опционально: теги `catalog:*`, `onlineStore:*` в `packages/cache/src/tags.ts` и их `touch` в
   workflow-ах для согласованного словаря, не для доставки.
4. Остатки: лёгкий запрос `productVariant { availableForSale quantityAvailable }` в allow-list с
   TTL 30 с; событие `stockLevelChanged` (есть заглушка
   `services/catalog/src/handlers/InventoryEventHandlers.ts:21`) отдельная задача, для статики
   не требуется.

### Инфраструктура

Шаг A:

1. `deploy/terraform/modules/frontend-edge`: бакет R2 на окружение и два ключа S3 API (чтение
   для `theme`, запись для GitHub Actions). Cache Rules не меняются.
2. `deploy/swarm/theme.yml`: `STOREFRONT_STATIC_STORE`, ключ чтения и адрес координатора у
   сервиса `theme`; сервис `theme-static` (координатор) из того же образа с volume для SQLite;
   `deploy-theme.mjs` учитывает его в `check`, `deploy`, `status`.
3. Секреты CI: ключ записи в бакет, секрет подписи вебхука, серверный GraphQL URL и приватный
   storefront-токен (`shopana-storefront-private-token`), чтобы gateway не считал builder обычным
   браузером.

Шаг B:

1. `deploy/worker/`: Worker с `wrangler.toml` (R2 binding, route на hostname, переменная
   SSR-origin), деплой через Terraform или wrangler в CI.
2. `deploy/terraform/modules/frontend-edge`: custom domain R2 для ассетов, Worker route, новые
   Cache Rules.
3. Секрет CI: токен Cloudflare purge; `cdn: 'cloudflare'` в публикации.

## Тестирование

Mock-сервер `@shopana/mock-server` участвует только в разработке и тестах: он отдаёт полную схему с
фикстурами (1 000 товаров, 145 категорий, промо с детерминированными часами, лояльность, отзывы,
мок IAM). В продакшене builder и CI ходят в настоящий gateway.

- **Генерация.** `static build` против mock: число файлов, 404 для отсутствующих, отсутствие
  `Authorization` и visitor id в запросах builder-а, отсутствие `viewer*` полей в снимках,
  побайтовое совпадение HTML при повторном рендере.
- **Гибридный сервер.** Тесты на `src/static/server.ts` с драйвером `fs`: файл есть → `hit`,
  `ETag`, `304`; файла нет → SSR и сообщение координатору; неканоническая форма адреса → SSR и
  `307`; `/auth/*`, `POST` и `*.data` мимо статики; `HEAD`; запись в кеше перепроверяется после
  TTL; ошибка хранилища → SSR, а не `5xx`; старый ассет отдаётся из хранилища; `--static-only`
  отдаёт оболочку и `404.html`.
- **Гидратация без сети.** Playwright открывает статический HTML (`start --static-only`), блокирует
  `/graphql` и проверяет: нет ошибок гидратации, переход на соседнюю страницу берёт
  `page-data.json` и не делает GraphQL-запросов.
- **Персонализация.** Вход через mock IAM (`x-mock-customer-id`): после гидратации баллы
  лояльности обновляются на тировые, счётчик корзины и аккаунт появляются, `viewer*` поля
  подгружаются.
- **Инвалидация.** Подписанный вебхук `productUpdated` → перегенерация только
  ожидаемых страниц (по индексу), гибридная нода отдаёт новую версию не позже TTL, на шаге B
  purge вызван для HTML и JSON; `navigationMenuUpdated` → полная
  пересборка; таймер `validUntil` → перегенерация страниц с промо.
- **Worker (шаг B).** Тесты на `workerd`/miniflare: переписывание ключей, фолбэк на origin, деградация в
  оболочку, проксирование `/auth/*` с cookie.
- **Stage.** `deploy-theme.mjs smoke` на шаге A: `x-shopana-static: hit` и `304` для
  сгенерированной страницы, неизвестный адрес отвечает живым рендером (`miss`), а через пару минут
  уже из статики (`hit`). На шаге B дополнительно `s-maxage` и `cf-cache-status: HIT` на втором
  запросе, `/auth/login` не кешируется, `GET /graphql` кешируется, `POST` нет.

## Этапы

**0. Проверки до кода (1–2 дня).**
Прогнать текущий серверный бандл через `createRequestHandler` с синтетическим запросом и
замерить время рендера и размер HTML на 50 товарах и 10 категориях; подтвердить, что Hive Gateway
принимает `GET` с `documentId`; замерить чтение объекта из бакета R2 по S3 API с ноды Swarm
(p50/p95 для полного и условного `GET`). _Готово, когда_ есть таблица «страница, мс, КБ», ответ
по `GET` в gateway и цифры чтения из бакета.

**1. Рендер без UA (предусловие, идёт отдельной сессией по `plans/ua-free-rendering.ru.md`).**
_Готово, когда_ HTML одного адреса не зависит от User-Agent и этапы 1–3 того плана закрыты.

**2. Режим «полный документ» в runtime и CLI `static build` (неделя).**
Заголовок режима, `onAllReady`, без cookie и visitor id, shell-страницы, `/__env.js`,
CSS-pruning, пул воркеров, запись в каталог и в бакет, manifest. Полная генерация на
mock-сервере. _Готово, когда_ полная генерация на mock-сервере укладывается в оценку этапа 0, а
повторный рендер даёт тот же HTML.

**3. Гибридный сервер `start` (3–4 дня).**
Свой сервер вместо `react-router-serve`, middleware статики, драйверы `fs` и `s3`, кеш в памяти,
старые ассеты из хранилища, `/__env.js`, сообщение о промахе, `--static-only`, тесты сервера.
_Готово, когда_ сайт с mock-сервера открывается через `start` с `fs:.static`: сгенерированные
адреса отдаются как `hit`, остальные рендерит SSR, `/auth/*` работает, гидратация без ошибок.

**4. Клиентский режим статики в SDK и теме (неделя).**
`page-data.json` в `clientLoader`, `useViewerRefresh`, таймеры `validUntil`, скелетоны шапки,
вынос `viewer*` полей, промо-метка меню на клиент, полная навигация при смене локали.
_Готово, когда_ сценарии «гость без сети» и «персонализация после входа» проходят.

**5. Шаг A на stage: бакет и полная сборка в GitHub Actions (2–3 дня).**
Бакет R2 и ключи в Terraform, `STOREFRONT_STATIC_STORE` у `theme`, workflow полной сборки без
purge, обновлённый smoke. _Готово, когда_ `pet.shopana.dev` отдаёт сгенерированные страницы с
ноды как `hit`, неизвестные адреса рендерит SSR, ночная пересборка и пересборка по релизу образа
проходят без ручных действий. С этого момента stage живёт в режиме «полная пересборка по
расписанию».

**6. Точечная инвалидация (1–1,5 недели, обе стороны).**
Internal: сервис `webhooks` (`internal/plans/webhooks-service.ru.md`). Storefront: координатор,
индекс зависимостей, очередь, таймеры, сверка, промах SSR, workflow `static-site.yml`,
`theme-static` в стеке (`plans/static-invalidation-and-ci-builds.ru.md`), публикация без purge.
_Готово, когда_ правка товара в админке stage обновляет страницу на ноде не позднее двух минут,
а тест инвалидации на mock-сервере проходит.

**7. Шаг B: Worker и кеш CDN перед нодой (3–4 дня).**
Проверка Worker с R2 binding и cookie auth на тестовом hostname, Worker и его тесты, custom
domain для ассетов, Cache Rules в Terraform, purge по URL и после полной сборки, smoke для CDN,
перепроверка `STOREFRONT_TRUSTED_PROXY_HOPS`. _Готово, когда_ `pet.shopana.dev` отдаёт статику
из CDN (`cf-cache-status: HIT`), промахи и `/auth/*` идут на гибридную ноду, а правка товара
обновляет страницу в CDN не позднее двух минут.

**8. Кеш GraphQL `GET` на CDN (неделя).**
Persisted documents в codegen, второй `HttpLink`, плагин `Cache-Control` в gateway, Cache Rule.
_Готово, когда_ подгрузка второй страницы листинга двумя разными браузерами даёт
`cf-cache-status: HIT` на втором, а запрос с сессией `BYPASS`.

Этапы 2–4 можно вести параллельно с этапом 1: режим «полный документ», гибридный сервер и
клиентский режим не зависят от UA, а проверка «одна версия на адрес» делается в конце этапа 3.
Шаг A (этапы 5–6) полностью рабочий сам по себе; к этапам 7–8 можно переходить, когда понадобится
разгрузить ноду и ускорить отдачу из CDN.

## Риски и открытые вопросы

- **Устаревшие остатки и промо в HTML.** В промежутке между событием и перегенерацией страница
  показывает старое. Клиентский запрос остатков с TTL 30 с и таймеры `validUntil` сокращают окно;
  полная гарантия есть только в корзине и чекауте, где цены и остатки считает сервер.
- **Полная пересборка при изменении layout.** Любое изменение меню или настроек магазина это
  тысячи рендеров. Если это окажется частым, меню тоже переводится на клиентскую загрузку из слоя
  2 с коротким TTL.
- **Задержка обновления на шаге A.** Новая версия страницы видна на ноде через
  `STOREFRONT_STATIC_CACHE_TTL` после публикации; уменьшать TTL можно, это только больше условных
  `GET` в бакет.
- **Бакет на пути каждого запроса на шаге A.** Холодная запись кеша стоит запрос в R2 (замер на
  этапе 0). Если задержка окажется заметной, кеш прогревается по manifest после старта реплики.
- **Worker на каждом запросе (шаг B).** Worker вызывается и при попадании в кеш CDN; при росте трафика
  это $0,30 за миллион запросов сверх квоты. Если станет заметно, HTML переезжает в Workers Static
  Assets (запросы бесплатны) ценой публикации снимком.
- **Нет атомарного переключения в R2.** Полная пересборка перезаписывает объекты по одному; в
  окне пересборки часть страниц уже новая, часть старая. Безопасно, пока ассеты обеих сборок
  лежат рядом (7 дней), и неприемлемо только для несовместимых изменений схемы данных, которые и
  так требуют нового образа.
- **Proxy hops (шаг B).** С Worker-ом на пути `STOREFRONT_TRUSTED_PROXY_HOPS` темы и IP покупателя для IAM
  надо перепроверить на stage; ошибка ломает лимиты и антифрод IAM.
- **Размер HTML.** Снимок Apollo и инлайновые стили antd делают документ тяжёлым; CSS-pruning и
  уже сделанный статический CSS снижают, но измерить нужно на этапе 0. Как следующий шаг
  не инлайнить `__shopanaApolloState`, а подключать `page-data.json` и в документ.
- **Блог.** Данных в API нет; пока генерируется из mock темы, после появления API
  (`articles`) добавляются перечислитель и события.
- **Коллекции.** В storefront API нет `Query.collections`; список берётся из меню и конфигурации
  темы, поэтому коллекция вне меню не попадёт в статику без явного указания.
- **Персонализированные цены в будущем.** Сейчас цен по сегментам нет; если появятся, цена
  переходит в клиентский слой по той же схеме, что и баллы лояльности, а HTML остаётся гостевым.
- **Consistency между HTML и JSON.** Оба пишутся одной операцией и чистятся одним пакетом purge;
  в окне между ними клиент может получить новый JSON к старому HTML, это безопасно, так как
  JSON только дополняет кеш Apollo.
