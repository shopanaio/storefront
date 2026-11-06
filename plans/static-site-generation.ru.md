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

**Хостинг: статика в R2 за Cloudflare Worker, Node-приложение темы остаётся как SSR-фолбэк,
auth-BFF и builder.** Worker переписывает путь в ключ объекта, отдаёт HTML и `page-data.json` из
R2, а промахи, `/auth/*` и оболочки проксирует на существующий контейнер темы через Tunnel.
Ассеты отдаются с R2 напрямую. Точечная перегенерация делается builder-ом внутри того же
Node-образа, полная пересборка идёт в GitHub Actions по расписанию и при релизе образа. Цена при
текущих объёмах: бесплатный план Workers или $5 в месяц, R2 копейки. Своего nginx и переезда на
DigitalOcean не требуется; App Platform, Spaces и snapshot-платформы разобраны в разделе
«Хостинг» и отклонены.

**Инвалидация: точечная по триггеру плюс полная по расписанию, и то и другое.** Точечная
перегенерация идёт от событий internal (`productUpdated`, `categoryUpdated`, `pageUpdated`, …) через
новый исходящий вебхук `storefront.invalidate`; соответствие «сущность → страницы» builder строит
сам из нормализованного кеша Apollo каждой отрендеренной страницы. Полная пересборка нужна при
смене макета (меню, настройки магазина, локали, новый образ темы) и как страховка раз в сутки.
Отдельно нужны таймеры: промо и окна коллекций меняют вывод по времени без каких-либо событий.

**Кеш GraphQL для клиентских переходов, два слоя.** Для каждой страницы builder пишет
`page-data.json` (снимок кеша Apollo после рендера), который клиентский loader подхватывает перед
`loadData`, так что переход на уже сгенерированную страницу не ходит в API. Остальные гостевые
запросы (подгрузка списков, фильтры, поиск, варианты, промо) идут через `GET` с persisted
documents и кешируются Cloudflare по TTL, который отдаёт gateway.

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
                                 CLI `storefront-runtime static …`, роль builder, публикация в R2)
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
  publish: { target: 'r2' | 'local', cdn: 'cloudflare' | 'none' },
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
`__shell/collections.html`, `__shell/vendors.html`, `__shell/pages.html`. Worker отдаёт их, когда
объекта в R2 нет, а SSR-фолбэк недоступен (деградация); в обычном режиме промах уходит на живой
рендер. Клиент дорисует страницу из API; если и API вернёт `not-found`, покажется 404 темы.
Статус для оболочки `200`, для совсем неизвестных префиксов `404.html` со статусом 404.

### Клиентская сторона

- **`page-data.json` перед `loadData`.** В режиме статики `clientLoader`
  (`src/react-router/page.tsx:708`) сначала запрашивает `/__static/data/<locale-path>.json`
  (`fetch` с кешем браузера и CDN). Снимок вливается в кеш Apollo через существующий путь
  гидратации снимков (`ApolloCacheHydrator` / `mergeApolloCacheStates`) с приоритетом уже
  имеющихся записей для персонализированных полей. Затем `loadData` и секции находят всё в кеше
  (`cache-first`), запросов к API нет. `404` на JSON означает «страницы нет в статике», дальше
  обычная клиентская загрузка.
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
сайта при ротации публичного ключа. Поэтому builder пишет один объект `/__env.js`
(`globalThis.__shopanaPublicEnv = {...}`) с заголовком `Cache-Control: no-cache`, а документы
подключают его синхронным `<script src>` до модулей приложения. Ротация ключа это перезапись
одного объекта и его purge.

### Выход генератора

Локально (CLI, тесты) это каталог; в продакшене те же ключи в бакете R2:

```text
<locale-path>/index.html         404.html, __shell/*.html
__static/data/<locale-path>.json __env.js, sitemap*.xml, robots.txt
assets/<hash>.*                  (из build/client/assets, иммутабельные)
public/…                         (копия public/, виджеты embed)
__static/manifest.json           (buildId, список страниц, хэши, сущности, validUntil)
```

В R2 нет атомарного переключения каталога, поэтому HTML и JSON перезаписываются на месте
(каждый объект сам по себе атомарен), ассеты с хэшами только добавляются, а объекты прошлой
сборки, которых нет в новом manifest, удаляются через 7 дней: HTML в CDN и открытые вкладки ещё
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
R2 без Cloudflare-зоны) его не даёт.

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

### Исходящий вебхук из internal

Сегодня исходящие вебхуки есть только у notifications и принимают только событийные типы
уведомлений (`services/notifications/src/scripts/webhook/NotificationWebhookCreateScript.ts:21`).
Предлагается не расширять notifications, а добавить в `apps/online-store` (владелец витринного
контента) обработчик публикации:

- `@BatchEventHandler` на перечисленные выше типы, по образцу
  `services/listing/src/handlers/ListingProductBatchEventHandlers.ts:32`; батчи по организации,
  повтор с backoff уже дают durable-доставку.
- Таблица `online_store.publish_targets (store_id, url, secret_version, status)` и admin-мутация
  для регистрации URL builder-а (один магазин один статический сайт, несколько target на
  stage/production).
- Сообщение `storefront.invalidate` с телом
  `{ storeId, occurredAt, changes: [{ type: 'product', id, reasons, affectedCategoryIds }, …] }`,
  подпись по схеме notifications (`x-shopana-timestamp`, `x-shopana-signature: v1=…`,
  `x-shopana-delivery-id`, код в `DeliveryExecutionScript.ts:135`), повтор при не-2xx.
- Полная пересборка отдельный тип `storefront.rebuild` на `storeUpdated`,
  `storeLocalesUpdated`, `navigationMenu*`.

Кеш по тегам (`packages/cache/src/tags.ts`, доставка `cacheDeliveryWorkflow` в
`packages/workflow-runtime/src/cache/InvalidationDelivery.ts:15`) не подходит как источник: тегов
для каталога и контента нет, а доставка знает только строку тега без причин. Но словарь тегов
стоит выровнять: индекс страниц builder-а и будущие теги `catalog:product:<id>`,
`catalog:category:<id>`, `onlineStore:page:<id>` именуются по одной схеме `${service}:${name}:${id}`,
чтобы один и тот же идентификатор означал одно и то же в Redis-кеше, в вебхуке и в индексе статики.

### Builder внутри Node-приложения темы

Builder это роль того же Docker-образа темы, а не отдельный проект: у образа уже есть серверный
бандл, env, доступ к GraphQL и IAM. В стеке Swarm появляется второй сервис из того же образа,
`theme-builder`, с одной репликой и командой `storefront-runtime static service`; сервис `theme`
(SSR-фолбэк и auth) остаётся с двумя репликами. Одна реплика builder-а снимает вопрос блокировок
очереди.

- `POST /hooks/invalidate` принимает `storefront.invalidate`, проверяет подпись, кладёт
  изменения в очередь; `POST /hooks/rebuild`, `POST /admin/render` (список путей),
  `GET /status`, `GET /manifest`.
- Очередь и индекс в SQLite (`better-sqlite3`) на volume сервиса: таблицы `pages`
  (path, locale, hash, rendered_at, build_id, valid_until), `page_entities` (entity_key → path),
  `jobs` (path, priority, reason, not_before), `timers`.
- Коалесценция: окно 10 с, один job на путь, приоритет «товар > листинг > остальное», лимит
  параллельности к GraphQL.
- Таймеры: по каждой странице хранится `valid_until` (минимум по промо, лояльности, окнам
  коллекций); по наступлении страница ставится в очередь.
- Сверка: раз в час сравнивает `updatedAt` товаров, категорий, коллекций, страниц
  (`Query.products`, `categories`, `vendors`, `onlineStorePages`) с `rendered_at` и догоняет
  пропущенные вебхуки, аналог `cache.reconcileInvalidations` в internal.
- Промах как триггер: сервис `theme`, отрендерив адрес, которого нет в статике, вызывает
  `POST /admin/render` у builder-а. Повторный запрос уже статический, по сути ISR.
- Публикация: `PutObject` в R2 по S3 API (HTML, JSON, manifest), затем purge Cloudflare по URL
  пакетами по 30 (HTML и JSON страницы). Полная пересборка, запущенная по `storefront.rebuild`
  или по расписанию, выполняется тем же сервисом; полная сборка при релизе образа идёт в GitHub
  Actions (см. «Хостинг»).

Тот же код доступен как CLI для разработки и CI:
`storefront-runtime static build` (полная генерация в каталог или в R2),
`storefront-runtime static render /products/x /categories/y`, `storefront-runtime static publish`,
`storefront-runtime static serve` (локальная раздача каталога с логикой Worker-а, без Cloudflare).

### Что правильно: по триггеру или по расписанию

Оба механизма, у каждого своя роль:

- **Точечно по триггеру** основной путь: изменение товара видно на сайте через секунды, стоимость
  несколько рендеров.
- **Полная пересборка** при изменениях, которые входят в каждый документ (меню, магазин,
  локали, новый образ темы), и ночью как страховка от дрейфа.
- **Сверка по `updatedAt`** страховка от потерянных вебхуков без полной пересборки.
- **Таймеры** для изменений без событий (промо по расписанию, окна коллекций).

Оценка полной пересборки для текущих фикстур: 1 000 товаров + 145 категорий + ~330 вендоров,
две локали ≈ 3 000 рендеров; при 150–300 мс на рендер и 8 воркерах 1–2 минуты без учёта
ограничений GraphQL. Это измеряется на этапе 0.

## Хостинг и CDN

### Схема

```text
браузер → Cloudflare CDN → Worker ──► R2 (HTML, page-data.json, __env.js, 404, оболочки)
                               │ промах, /auth/*
                               └──► Tunnel → theme (SSR-фолбэк, auth-BFF) → gateway
              Cloudflare CDN ───────► R2 custom domain: /assets/*, /public/* (без Worker)
              Cloudflare CDN ───────► Tunnel → gateway: /graphql (GET кешируется, POST нет)
internal events → storefront.invalidate → theme-builder → R2 + purge по URL
GitHub Actions (ночь, релиз образа) → полная сборка → R2 + purge all
```

### Worker

Один скрипт на 30–50 строк, маршрут только на HTML-адреса и `/__static/data/*`:

1. Переписывает путь в ключ: `/` → `index.html`, `/uk/products/x` → `uk/products/x/index.html`,
   `/__static/data/...json` как есть.
2. Читает объект через R2 binding. Есть: отдаёт с `Cache-Control: public, max-age=0,
s-maxage=86400, stale-while-revalidate=3600` и `ETag` объекта.
3. Нет: `fetch` того же запроса на SSR-origin (hostname Tunnel) с прокидыванием cookie и ответом
   как есть (`no-store`). Если origin недоступен, отдаёт семейную оболочку `__shell/<family>.html`
   со статусом 200 или `404.html` со статусом 404.
4. `/auth/*` и `/auth/headless/*` проксирует на SSR-origin без кеша, с `Set-Cookie` обратно.

Worker выполняется на каждый запрос своего маршрута, в том числе при попадании в кеш CDN, поэтому
ассеты и `public/` на него не вешаются: они отдаются с R2 custom domain по Cache Rules. Ключ
cookie-политики не меняется: hostname тот же, cookie first-party. `STOREFRONT_TRUSTED_PROXY_HOPS`
темы перепроверяется на stage (с Worker-ом на пути может стать 2).

### Cloudflare

- Cache Rules: HTML и `/__static/data/` eligible, «respect origin»; `/assets/` и `/public/` год,
  immutable; `GET /graphql/*` без `Authorization` eligible; `POST /graphql`, `/auth/*` bypass.
  Сейчас HTML bypass (`deploy/terraform/modules/frontend-edge/main.tf`), правило меняется.
- Purge: `POST /zones/{zone}/purge_cache` с `files` (до 30 за вызов) из builder-а;
  `purge_everything` после полной пересборки. Токен с правом `Cache Purge` секрет builder-а.
- Tunnel остаётся как сейчас: публичный hostname ведёт на `theme:3000` для промахов и auth, на
  Traefik для `/graphql`. Worker route перехватывает HTML и JSON раньше Tunnel.
- R2: один бакет на окружение, custom domain вида `static.<hostname>` для ассетов или тот же
  hostname через Worker; учётные данные S3 API для builder-а и GitHub Actions.

### Полная сборка в GitHub Actions

Workflow в репозитории темы, по cron ночью (таймзона магазина) и по событию публикации образа
`ghcr.io/shopanaio/storefront-brand-bite-and-crunch/theme`:

1. Запускает контейнер образа с production-env (серверный GraphQL URL, приватный storefront-токен,
   ключи R2, токен purge).
2. `storefront-runtime static build --publish r2`: полная генерация, загрузка только изменившихся
   объектов (сравнение хэшей с manifest в R2), новый `manifest.json`, удаление устаревших объектов
   старше 7 дней.
3. `purge_everything` и smoke против CDN.

Builder-сервис в Swarm делает то же по `storefront.rebuild`, но релиз образа удобнее закрыть в
CI: там же, где образ собирается.

### Стоимость

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
| Свой nginx на дроплете или ноде Swarm  | работает, но добавляет сервер и его обслуживание ради того, что умеет Worker на 50 строк                                |
| Auth в Worker или прямые вызовы IAM    | ломает контракт конфиденциального клиента (client secret, HttpOnly cookie, IP покупателя) без выигрыша                  |

## Изменения по репозиториям

### `packages/shopana-storefront-runtime` (`@shopana/storefront`)

1. Режим «полный документ»: заголовок `x-shopana-static-render`, `onAllReady` без `isbot`,
   отключение чтения cookie и visitor id (`headers.ts`, `entry.server.tsx`), shell-ветка в
   `createRuntimePageLoader` (`server.ts:129`) и вид `{ kind: 'shell' }` в `hydration.ts`.
2. `src/static/`: `createStaticRenderer(build)` (Request → `{ status, html, cacheState,
entities, validUntil }`), пул воркеров, CSS-pruning, запись в каталог и в R2 (S3 API),
   sitemap/robots, manifest.
3. CLI `bin/storefront-runtime.js`: команда `static` (`build | render | publish | serve | service`).
4. `__env.js` вместо инлайна `publicEnvironmentScript` в режиме статики.
5. Роль builder `src/static/service.ts` (HTTP-хуки, очередь, таймеры, сверка, публикация, purge)
   и вызов `POST /admin/render` из SSR-ветки при промахе.

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
6. `scripts/deploy-theme.mjs smoke`: вместо `no-store` проверять `__shopanaStatic`, `s-maxage` и
   отсутствие секретов; добавить проверку, что гостевой переход не делает запросов к `/graphql`.
7. Workflow полной сборки `.github/workflows/static-full-build.yml`.

### `internal`

1. `apps/online-store`: обработчик публикации (`@BatchEventHandler` на события каталога,
   контента, скидок, лояльности, отзывов), таблица target-ов, admin-мутация, подписанный
   исходящий вебхук `storefront.invalidate` / `storefront.rebuild`; спецификация в
   `specs/canonical/services/apps/` с BR/SC по правилам `specs/AGENTS.md`.
2. Gateway: плагин `Cache-Control` для `GET` persisted documents из allow-list и маршрут
   `/graphql/<locale>`; persisted documents в Hive/Mesh конфиге.
3. Опционально: теги `catalog:*`, `onlineStore:*` в `packages/cache/src/tags.ts` и их `touch` в
   workflow-ах для согласованного словаря, не для доставки.
4. Остатки: лёгкий запрос `productVariant { availableForSale quantityAvailable }` в allow-list с
   TTL 30 с; событие `stockLevelChanged` (есть заглушка
   `services/catalog/src/handlers/InventoryEventHandlers.ts:21`) отдельная задача, для статики
   не требуется.

### Инфраструктура

1. `deploy/worker/`: Worker с `wrangler.toml` (R2 binding, route на hostname, переменная
   SSR-origin), деплой через Terraform или wrangler в CI.
2. `deploy/terraform/modules/frontend-edge`: R2 bucket и custom domain, Worker route, новые Cache
   Rules.
3. `deploy/swarm/theme.yml`: сервис `theme-builder` из того же образа с volume для SQLite;
   `deploy-theme.mjs` учитывает его в `check`, `deploy`, `status`.
4. Секреты builder-а и CI: ключи R2, токен Cloudflare purge, секрет подписи вебхука, серверный
   GraphQL URL и приватный storefront-токен (`shopana-storefront-private-token`), чтобы gateway
   не считал builder обычным браузером.

## Тестирование

Mock-сервер `@shopana/mock-server` участвует только в разработке и тестах: он отдаёт полную схему с
фикстурами (1 000 товаров, 145 категорий, промо с детерминированными часами, лояльность, отзывы,
мок IAM). В продакшене builder и CI ходят в настоящий gateway.

- **Генерация.** `static build` против mock: число файлов, 404 для отсутствующих, отсутствие
  `Authorization` и visitor id в запросах builder-а, отсутствие `viewer*` полей в снимках,
  побайтовое совпадение HTML при повторном рендере.
- **Гидратация без сети.** Playwright открывает статический HTML (`static serve`), блокирует
  `/graphql` и проверяет: нет ошибок гидратации, переход на соседнюю страницу берёт
  `page-data.json` и не делает GraphQL-запросов.
- **Персонализация.** Вход через mock IAM (`x-mock-customer-id`): после гидратации баллы
  лояльности обновляются на тировые, счётчик корзины и аккаунт появляются, `viewer*` поля
  подгружаются.
- **Инвалидация.** Подписанный `storefront.invalidate` с `productUpdated` → перегенерация только
  ожидаемых страниц (по индексу), purge вызван для HTML и JSON; `navigationMenuUpdated` → полная
  пересборка; таймер `validUntil` → перегенерация страниц с промо.
- **Worker.** Тесты на `workerd`/miniflare: переписывание ключей, фолбэк на origin, деградация в
  оболочку, проксирование `/auth/*` с cookie.
- **Edge.** `deploy-theme.mjs smoke`: `Cache-Control` HTML с `s-maxage` и `cf-cache-status: HIT`
  на втором запросе, `/auth/login` не кешируется, `GET /graphql` кешируется, `POST` нет,
  неизвестный адрес отвечает живым рендером, а через минуту уже из статики.

## Этапы

**0. Проверки до кода (1–2 дня).**
Прогнать текущий серверный бандл через `createRequestHandler` с синтетическим запросом и
замерить время рендера и размер HTML на 50 товарах и 10 категориях; подтвердить, что Hive Gateway
принимает `GET` с `documentId`; поднять тестовый Worker с R2 binding и фолбэком на stage-тему и
убедиться, что cookie auth проходят через Worker. _Готово, когда_ есть таблица «страница, мс, КБ»,
ответ по `GET` в gateway и рабочий Worker на тестовом hostname.

**1. Рендер без UA (предусловие, идёт отдельной сессией по `plans/ua-free-rendering.ru.md`).**
_Готово, когда_ HTML одного адреса не зависит от User-Agent и этапы 1–3 того плана закрыты.

**2. Режим «полный документ» в runtime и CLI `static build` (неделя).**
Заголовок режима, `onAllReady`, без cookie и visitor id, shell-страницы, `__env.js`,
CSS-pruning, пул воркеров, запись в каталог и в R2, manifest, `static serve`. Полная генерация
на mock-сервере. _Готово, когда_ сайт с mock-сервера открывается из каталога статики,
гидратируется без ошибок, и полная генерация укладывается в оценку этапа 0.

**3. Клиентский режим статики в SDK и теме (неделя).**
`page-data.json` в `clientLoader`, `useViewerRefresh`, таймеры `validUntil`, скелетоны шапки,
вынос `viewer*` полей, промо-метка меню на клиент, полная навигация при смене локали.
_Готово, когда_ сценарии «гость без сети» и «персонализация после входа» проходят.

**4. Worker, R2, полная сборка в GitHub Actions, stage (3–4 дня).**
Worker и его тесты, R2 и Cache Rules в Terraform, workflow полной сборки, обновлённый smoke.
_Готово, когда_ `pet.shopana.dev` отдаёт статику из CDN, `/auth/*` и неизвестные адреса идут
через фолбэк, ночная пересборка и пересборка по релизу образа проходят без ручных действий. С
этого момента stage живёт в режиме «полная пересборка по расписанию».

**5. Точечная инвалидация (1–1,5 недели, обе стороны).**
Internal: обработчик в `apps/online-store`, таблица target-ов, admin-мутация, спецификация, e2e в
`e2e/tests` по правилам `e2e/AGENTS.md`. Storefront: роль builder, индекс сущностей, очередь,
таймеры, сверка, публикация в R2 и purge, `theme-builder` в стеке. _Готово, когда_ правка товара в
админке stage обновляет страницу в CDN не позднее минуты, а тест инвалидации на mock-сервере
проходит.

**6. Кеш GraphQL `GET` на CDN (неделя).**
Persisted documents в codegen, второй `HttpLink`, плагин `Cache-Control` в gateway, Cache Rule.
_Готово, когда_ подгрузка второй страницы листинга двумя разными браузерами даёт
`cf-cache-status: HIT` на втором, а запрос с сессией `BYPASS`.

Этапы 2 и 3 можно вести параллельно с этапом 1: режим «полный документ» и клиентский режим не
зависят от UA, а проверка «одна версия на адрес» делается в конце этапа 2.

## Риски и открытые вопросы

- **Устаревшие остатки и промо в HTML.** В промежутке между событием и перегенерацией страница
  показывает старое. Клиентский запрос остатков с TTL 30 с и таймеры `validUntil` сокращают окно;
  полная гарантия есть только в корзине и чекауте, где цены и остатки считает сервер.
- **Полная пересборка при изменении layout.** Любое изменение меню или настроек магазина это
  тысячи рендеров. Если это окажется частым, меню тоже переводится на клиентскую загрузку из слоя
  2 с коротким TTL.
- **Worker на каждом запросе.** Worker вызывается и при попадании в кеш CDN; при росте трафика
  это $0,30 за миллион запросов сверх квоты. Если станет заметно, HTML переезжает в Workers Static
  Assets (запросы бесплатны) ценой публикации снимком.
- **Нет атомарного переключения в R2.** Полная пересборка перезаписывает объекты по одному; в
  окне пересборки часть страниц уже новая, часть старая. Безопасно, пока ассеты обеих сборок
  лежат рядом (7 дней), и неприемлемо только для несовместимых изменений схемы данных, которые и
  так требуют нового образа.
- **Proxy hops.** С Worker-ом на пути `STOREFRONT_TRUSTED_PROXY_HOPS` темы и IP покупателя для IAM
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
