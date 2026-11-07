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

**Одна версия страницы на адрес.** Рендер темы больше не зависит от User-Agent: это сделано по
отдельному плану `plans/ua-free-rendering.ru.md`. Поэтому на адрес нужен один HTML, без двух
вариантов страницы и маршрутизации по устройству на CDN.

**Хостинг в два шага: сначала гибридная нода (SSG + SSR), потом Worker и кеш CDN перед ней.**

- **Шаг A, без Worker и кеша CDN.** Node-приложение темы работает как гибридный сервер, по модели
  Next.js: на `GET` HTML-адреса оно ищет готовый файл в хранилище статики и отдаёт его, а если
  файла нет, рендерит страницу обычным SSR. Хранилище бывает двух видов. **Статика в образе**:
  генерация запускается локально или в GitHub Actions при сборке образа и пишет файлы в каталог
  `build/static` рядом с `build/client`, который нода раздаёт; S3 не нужен. **Бакет**:
  S3-совместимый (R2 по S3 API), в него пишет builder в GitHub Actions, нода только читает; это
  нужно для точечной перегенерации без пересборки образа. `/auth/*`, ассеты и всё, что не HTML,
  нода обслуживает как сейчас. Cloudflare на этом шаге остаётся тем, что есть сегодня: Tunnel и
  Cache Rules с bypass для HTML.
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

**Инвалидация: точечная по событиям плюс полная по расписанию.** Полная пересборка остаётся
ночью, при релизе образа и при смене макета (меню, настройки магазина, локали). Точечная
описана в `plans/static-invalidation-and-ci-builds.ru.md`: координатор темы читает ленту событий
internal по курсору, по индексу «зависимость → страницы» (из кеша Apollo, с масками аспектов)
сразу рендерит свою страницу сущности и популярные страницы, а остальные помечает устаревшими и
рендерит при первом открытии или фоновым дочистом. Остатки и промо выносятся из HTML в живые
лёгкие запросы, цена и наличие остаются в HTML с поправкой после гидратации
(`plans/static-volatile-data.ru.md`), публикуется только
изменившееся по хэшу, на шаге B purge идёт по тегам Cloudflare. Рендер выполняется в GitHub
Actions.

**Кеш GraphQL для клиентских переходов, два слоя.** Для каждой страницы builder пишет
`page-data.json` (снимок кеша Apollo после рендера), который клиентский loader подхватывает перед
`loadData`, так что переход на уже сгенерированную страницу не ходит в API. Остальные гостевые
запросы (подгрузка списков, фильтры, поиск, варианты, промо) идут через `GET` с persisted
documents и кешируются Cloudflare по TTL, который отдаёт gateway, и чистятся по тегам сущностей.
Второй слой требует кеша CDN и поэтому появляется только после шага B.

В internal сейчас нет ни тегов ответов, ни CDN purge, ни чтения ленты событий извне: кеш по
тегам (`@shopana/cache`) это внутренний кеш данных Redis. Нужные изменения описаны в разделе
«`internal`».

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

**Где остаются плейсхолдеры и скелетоны.** Правило: в HTML и при гидратации компонент показывает
гостевое состояние или скелетон; после монтирования и определения сессии данные подтягиваются
клиентом и заменяют его на месте, без перезагрузки страницы.

| Место                                              | В статике                        | После гидратации                                             |
| -------------------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| Кнопка корзины, счётчик в шапке и таб-баре         | скелетон счётчика                | `useCart` по cookie корзины                                  |
| Кнопка аккаунта / имя покупателя                   | «Войти» (гостевое)               | `useIsAuthenticated`, затем `useCustomer`                    |
| Сердечко вишлиста, кнопка «сравнить»               | неактивное состояние             | `useAccountProductActions`, `useProductComparisons`          |
| «Начислим N баллов» на карточке и странице товара  | базовые баллы гостя              | личный лёгкий запрос `SdkViewerVariants` при наличии сессии  |
| Баланс и тир лояльности, страница Points           | нет в статике (аккаунт оболочка) | `useLoyaltyAccount`                                          |
| Промо-бейджи на товаре, промо в шапке              | нет; скелетон                    | лёгкие запросы `SdkVolatileVariant` и `SdkStorefrontPromotions` |
| Прогресс промо и промокод в корзине                | нет (корзина оболочка)           | `Checkout.promotionProgress`, `usePromoCodes`                |
| Наличие и «нет в наличии»                          | снимок на момент генерации       | поправка лёгким запросом `SdkVolatileCards` / `SdkVolatileVariant`, TTL 30 с |
| Остаток (`quantityAvailable`)                      | нет                              | лёгкий запрос `SdkVolatileVariant`                           |
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
handler-ом стоит middleware статики. Хранилище задаётся переменной `STOREFRONT_STATIC_STORE`
(`s3://<bucket>/<prefix>` или `fs:<каталог>`). Без переменной сервер берёт `fs:build/static`,
если там есть `__static/manifest.json`, то есть статику, сгенерированную в этот же каталог
сборки (см. «Статика в образе»); если нет, работает как сегодня, только SSR.

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
   Промахи по адресам генерируемых семейств (товар, категория, коллекция, вендор, страница) и
   попадания по всем HTML-адресам сервер считает в памяти и раз в 30 с отправляет координатору
   (`POST /__builder/api/hits`). Координатор ставит рендер промахов и устаревших (dirty) страниц,
   по которым были попадания (`plans/static-invalidation-and-ci-builds.ru.md`, «Попадания»).
   Без адреса координатора в env отчёт не отправляется.
8. Хранилище недоступно или ответило ошибкой: SSR, как при промахе, и предупреждение в лог. Отказ
   бакета не превращается в `5xx` сайта.

Чтение из бакета идёт с кешем в памяти процесса: LRU по ключу на ~50 МБ, запись хранит тело и
`ETag`. Через `STOREFRONT_STATIC_CACHE_TTL` (по умолчанию 10 с) запись перепроверяется условным
`GET` с `If-None-Match`, на что бакет отвечает `304` без тела. Промахи кешируются на тот же срок.
Итого новая версия страницы видна на всех репликах не позже чем через TTL после публикации, и
purge на шаге A не нужен.

`start --static-only` отключает SSR: промах отдаёт семейную оболочку или `404.html`. Это режим
тестов гидратации без сети и проверка деградации, которую на шаге B делает Worker.

Драйвер `fs` читает файл с диска на каждый запрос и берёт `ETag` из хэша в manifest; кеш в
памяти и перепроверка по TTL нужны только драйверу `s3`.

### Статика в образе: генерация локально и при сборке образа

Самый простой режим, без бакета и без координатора. Генерация пишет в каталог
`<runtimeDir>/build/static`, который лежит рядом с `build/client` и попадает в Docker-образ вместе
с остальной сборкой; гибридный сервер находит его сам.

```sh
storefront-runtime build                 # как сейчас: build/server, build/client
storefront-runtime static build          # по умолчанию пишет в build/static, gateway из env
storefront-runtime start                 # статика из build/static, промахи SSR
```

- **Локально** это три команды выше на машине разработчика, против mock-сервера или stage-gateway
  (`STOREFRONT_SERVER_GRAPHQL_URL`).
- **В GitHub Actions** workflow сборки образа темы делает `build`, затем `static build` против
  gateway своего окружения с приватным storefront-токеном, затем `docker build`, который копирует
  `build/static` вместе с `build/client`. Ночной cron пересобирает образ, а значит и статику.
- HTML и ассеты из одной сборки, поэтому вопроса со старыми хэшами ассетов здесь нет.
- Почему не прямо в `build/client` (`public`): там файлы раздаёт `express.static` раньше
  гибридной логики, и HTML отдавался бы в обход правил для `/auth/*`, `*.data`, статусов из
  manifest и заголовков. Отдельный каталог читает только middleware статики.
- Ограничение: данные в HTML обновляются только с новым образом. Точечной перегенерации,
  промахов SSR в очередь и таймеров `validUntil` в этом режиме нет: страница, которой нет в
  образе, всегда рендерится SSR. Для цен и промо это задержка до следующей пересборки образа;
  когда она мешает, окружение переходит на бакет.
- `static render /products/x` в этом режиме дописывает файлы в тот же каталог. Это удобно
  локально и на одной реплике, но в Swarm с двумя репликами не используется.

### Клиентская сторона

- **`page-data.json` перед `loadData`.** В режиме статики `clientLoader`
  (`src/react-router/page.tsx:708`) сначала запрашивает `/__static/data/<locale-path>.json`
  (`fetch` с кешем браузера и CDN). Снимок вливается в кеш Apollo через существующий путь
  гидратации снимков (`ApolloCacheHydrator` / `mergeApolloCacheStates`) с приоритетом уже
  имеющихся записей для персонализированных полей. Затем `loadData` и секции находят всё в кеше
  (`cache-first`), запросов к API нет. `404` на JSON означает «страницы нет в статике», дальше
  обычная клиентская загрузка. JSON отдаёт гибридный сервер на шаге A и Worker на шаге B, путь
  один и тот же.
- **Обновление персонализации после гидратации.** SDK-хук `useViewerRefresh()` в
  `AppProviders` без `cache.evict`: когда `useIsAuthenticated` становится `true`, он запускает
  личный лёгкий запрос `SdkViewerVariants` (`POST` с `Authorization`, `private, no-store`) по id
  вариантов, зарегистрированным на странице, и маленькие запросы `viewer*` отзывов и
  `savedForComparison`. Ответы пишутся в те же нормализованные записи; до них видны гостевые
  значения из снимка. `evict` отклонён: `ProductPageQuery` читается через `useSuspenseQuery`, и
  Apollo перезапросил бы весь запрос, а секция ушла бы в Suspense. Подробно в
  `plans/static-volatile-data.ru.md`, «Вошедший покупатель». Клиентские запросы покупателя уже
  пропускаются без сессии и используют `cache-and-network` (`modules/customer/react/internal.ts:38`).
- **Сессия.** HTML всегда гостевой (`initialSession` пуст). После гидратации `SessionContext`
  видит cookie `shopana_signed_in` и получает access-токен через `/auth/token` или `/auth/refresh`
  у Node-приложения; дальше запросы покупателя идут в gateway напрямую.
- **Остатки и промо** приходят живыми лёгкими запросами SDK (`SdkVolatileCards`,
  `SdkVolatileVariant`, `SdkStorefrontPromotions`): батч id за кадр, `GET` persisted документа
  без `Authorization`, кеш 30 с, повтор по `validUntil` промо и `visibilitychange`
  (`plans/static-volatile-data.ru.md`, «Жизненный цикл лёгкого запроса»). Таймер на
  `ProductLoyaltyPresentation.validUntil` перезапускает личный запрос.
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

Каталог (`fs`, по умолчанию `build/static`): локально, в тестах и в режиме «статика в образе».
Бакет R2, доступный по S3 API (`s3`), с теми же ключами: окружения с точечной перегенерацией.

```text
<locale-path>/index.html         404.html, __shell/*.html
__static/data/<locale-path>.json sitemap*.xml, robots.txt
assets/<hash>.*                  (из build/client/assets, иммутабельные)
public/…                         (копия public/, виджеты embed; читается с шага B)
__static/manifest.json           (buildId, список страниц, хэши, сущности, validUntil, статусы)
```

В режиме бакета ассеты прошлых сборок нужны уже на шаге A: статический HTML, отрендеренный прошлым образом,
ссылается на старые хэши, а в `build/client` нового образа их нет. Поэтому нода отдаёт
`/assets/*`, которых нет в её `build/client`, из бакета. `public/` на шаге A отдаётся из образа,
копия в бакете пишется сразу, чтобы шаг B не требовал миграции.

В бакете нет атомарного переключения каталога, поэтому HTML и JSON перезаписываются на месте
(каждый объект сам по себе атомарен), ассеты с хэшами только добавляются. Ассеты прошлой сборки,
которых нет в новой, удаляются через 7 дней: HTML в кеше и открытые вкладки ещё ссылаются на старые
хэши. Страницы, их data и прочие файлы сайта, которых нет в новом manifest, удаляются сразу: сервер
отдаёт всё, что есть в бакете, и снятый товар иначе продавался бы ещё неделю. Manifest пишется
условно (`If-Match` по ETag прочитанной версии): полная сборка и `static render` одновременно не
теряют страниц друг друга. Серверу нужен только маленький индекс `__static/server.json` (языки и
статусы не 200), а не весь manifest.

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
  **нет** `Authorization` и `x-shopana-storefront-visitor-id`; локаль передаётся **в query**
  (`/graphql?locale=<locale>&documentId=…&variables=…`) вместе с `Accept-Language`, потому что
  Cloudflare Free не учитывает `Vary` в ключе кеша, а query string входит в ключ. Gateway параметр
  `locale` не читает, язык берётся из `Accept-Language`; клиент ставит оба из одной локали.
  Запросы с сессией и мутации остаются `POST`.
- Gateway (`infra/federation/gateway-storefront.config.ts`) получает `persistedDocuments` с
  `getPersistedOperation` по манифесту codegen и `allowArbitraryDocuments: true` (сделано, см.
  этап 0) и плагин, который для `GET` с
  `documentId` из allow-list и без `Authorization` ставит `Cache-Control: public, max-age=0,
s-maxage=<ttl>, stale-while-revalidate=<ttl*5>`. TTL по классам операций: листинги и поиск
  120 с, варианты и вопросы/отзывы 300 с, промо до `validUntil` (не больше 600 с), остатки
  30 с. Для всего остального `private, no-store`, как сейчас.
- Тот же плагин ставит `Cache-Tag` по ключам сущностей ответа (`Product:<uuid>`, …), и
  координатор чистит их по событиям (`plans/static-invalidation-and-ci-builds.ru.md`, «Purge по
  тегам»).
- Cloudflare Cache Rule: `GET /graphql` без `Authorization` eligible for cache, Edge TTL
  «respect origin», query string в ключе. Существующее правило bypass для `/graphql` сужается до
  `POST`.
- Инвалидация этого слоя: TTL плюс purge по тегам сущностей. Purge по тегу с апреля 2025 года
  доступен на всех планах Cloudflare, включая Free (с лимитом числа запросов). Перечислять
  комбинации переменных не нужно: тег сущности чистит все ответы, где она была.

Слой 2 требует CDN перед gateway, то есть Cloudflare; CDN объектного хранилища (Spaces CDN,
R2 без Cloudflare-зоны) его не даёт. Поэтому слой 2 делается после шага B, а на шаге A клиент
пользуется только слоем 1.

## Инвалидация и перегенерация

Устройство точечной инвалидации целиком описано в
`plans/static-invalidation-and-ci-builds.ru.md`. Коротко:

- **Источник:** лента событий internal, которую координатор `theme-static` читает по курсору.
  Payload событий содержит id и причины, не состояние; рендер всегда перечитывает данные.
- **Какие страницы:** обратный индекс «зависимость → страницы» с масками аспектов из кеша Apollo
  каждой отрендеренной страницы; маппер событие → изменения в SDK.
- **Когда рендерить:** своя страница сущности и популярные сразу, остальные помечаются dirty и
  рендерятся при первом открытии (по отчётам о попаданиях от ноды и Worker-а) или фоновым
  дочистом.
- **Что публиковать:** только объекты с изменившимся хэшем.
- **Быстрые данные:** остатки и промо вне HTML, наличие и цена в HTML с поправкой лёгким
  запросом (`plans/static-volatile-data.ru.md`); события промо не вызывают рендер, `inventory`
  только помечает страницы dirty.
- **Purge:** на шаге A нет; на шаге B по тегам страниц, быстрых данных и сущностей GraphQL.

Чтобы `discount*` и промо-метка в шапке не превращали каждое изменение скидки в полную
пересборку, промо в layout (`useHeaderMenuItemLabel`) в режиме статики грузится клиентом через
слой 2, а не из снимка.

CLI для разработки и CI: `storefront-runtime static build` (полная генерация в каталог или в
бакет), `storefront-runtime static render /products/x /categories/y`, `storefront-runtime static
run` (клиент аренды координатора). Локальная раздача статики это тот же
`storefront-runtime start` с `STOREFRONT_STATIC_STORE=fs:.static`, без SSR с флагом
`--static-only`. Отдельной команды `static serve` нет.

На шаге A публикация в CI пишет объекты в бакет и пропускает purge (`cdn: 'none'`): новую версию
нода увидит через `STOREFRONT_STATIC_CACHE_TTL`. С шага B включается purge Cloudflare по тегам.

### Что правильно: по триггеру или по расписанию

Оба механизма, у каждого своя роль:

- **Точечно по событиям** основной путь: своя страница изменённой сущности видна на сайте через
  1–1,5 минуты, непопулярные страницы обновляются при первом открытии.
- **Промах SSR** на гибридной ноде ставит рендер этого адреса, так что новый товар попадает в
  статику после первого посещения.
- **Полная пересборка** при изменениях, которые входят в каждый документ (меню, магазин,
  локали, новый образ темы), и ночью как страховка от дрейфа.
- **Таймеры** для изменений без событий (окна коллекций; промо после выноса в быстрые данные
  обходятся TTL).

Оценка полной пересборки для текущих фикстур: 1 000 товаров + 145 категорий + ~330 вендоров,
две локали ≈ 3 000 рендеров; при 150–300 мс на рендер и 8 воркерах 1–2 минуты без учёта
ограничений GraphQL.

## Хостинг и CDN

### Шаг A: гибридная нода

Вариант 1, статика в образе:

```text
браузер → Cloudflare (Tunnel, HTML bypass, как сейчас) → theme ──► build/static в образе
                                                          └──► SSR при промахе, /auth/* → gateway
GitHub Actions (релиз, ночной cron) → build → static build → docker build → деплой образа
```

Вариант 2, бакет:

```text
браузер → Cloudflare (Tunnel, HTML bypass, как сейчас) → theme ──► бакет R2 по S3 API
                                                          │        (HTML, page-data.json, 404,
                                                          │         оболочки; кеш в памяти)
                                                          └──► SSR при промахе, /auth/*
                                                               → gateway
лента событий internal ◄── theme-static (курсор, индекс, очередь, dirty) → GitHub Actions → бакет
GitHub Actions (ночь, релиз образа) → полная сборка → бакет (без purge)
попадания и промахи на theme → theme-static → GitHub Actions → бакет
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
лента событий internal ◄── theme-static → GitHub Actions → R2 + purge по тегам страниц
theme-static → purge по тегам быстрых данных и GraphQL (без рендера)
GitHub Actions (ночь, релиз образа) → полная сборка → R2 + purge тега прошлой сборки
```

Нода на шаге B не меняется: на промах Worker-а она снова смотрит в бакет и при промахе рендерит
SSR. Её кеш в памяти и проверка бакета остаются, хотя основную раздачу берёт на себя Worker.

### Worker (шаг B)

Один скрипт на 30–50 строк, маршрут только на HTML-адреса и `/__static/data/*`:

1. Переписывает путь в ключ функцией `staticKeyForPath` из runtime (та же, что у ноды):
   `/` → `index.html`, `/uk/products/x` → `uk/products/x/index.html`, `/__static/data/...json`
   как есть.
2. Сначала ищет ответ в Cache API (`caches.default`). Ответ Worker-а кеш CDN сам не сохраняет:
   Worker стоит перед кешем. Нет в кеше: читает объект через R2 binding, кладёт в Cache API с
   `Cache-Control: public, max-age=0, s-maxage=600, stale-while-revalidate=3600`, `ETag` и
   `Cache-Tag` из метаданных объекта (`pg:<pageKey>`, `build:<buildId>`) и отдаёт. Промах Cache
   API отправляется координатору как попадание (`ctx.waitUntil`): так dirty-страница
   перерендеривается после истечения `s-maxage`. Работает ли purge по тегу для объектов Cache
   API, проверяется в начале этапа 8; если нет, HTML идёт через origin-fetch к R2 custom domain с
   Cache Rules.
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
- Purge по тегам: `POST /zones/{zone}/purge_cache` с `tags`, до 100 тегов в запросе, лимит
  Free по документации 5 запросов в минуту с запасом 25 (сверить на этапе 8). Очередь purge
  держит координатор; job чистит теги изменившихся страниц, после полной сборки чистится тег
  `build:<buildId>` прошлой сборки, а не `purge_everything`. Токен с правом `Cache Purge` у
  координатора и в CI.
- Tunnel остаётся как сейчас: публичный hostname ведёт на `theme:3000` для промахов и auth, на
  Traefik для `/graphql`. Worker route перехватывает HTML и JSON раньше Tunnel.
- R2: один бакет на окружение, custom domain вида `static.<hostname>` для ассетов или тот же
  hostname через Worker; учётные данные S3 API для builder-а и GitHub Actions.

### Сборка в GitHub Actions

В режиме «статика в образе» генерацию делает workflow сборки образа темы: `static build` между
`storefront-runtime build` и `docker build`. В режиме бакета все сборки, полные и точечные,
выполняет workflow `static-site.yml` в репозитории темы. Его
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
| Статика на локальном диске реплики     | у каждой из двух реплик своя версия сайта, GitHub Actions не может писать на диск ноды Swarm; статика в образе не то же самое: она одинакова во всех репликах |
| Статика прямо в `build/client`         | `express.static` отдаёт её раньше гибридной логики: HTML в обход `/auth/*`, статусов из manifest и заголовков            |
| Сохранять SSR-ответ промаха в бакет    | как ISR в Next.js, но второй писатель рядом с builder-ом, гонки с публикацией и HTML без индекса зависимостей           |
| Auth в Worker или прямые вызовы IAM    | ломает контракт конфиденциального клиента (client secret, HttpOnly cookie, IP покупателя) без выигрыша                  |

## Изменения по репозиториям

### `packages/shopana-storefront-runtime` (`@shopana/storefront`)

1. Режим «полный документ»: заголовок `x-shopana-static-render`, `onAllReady` без `isbot`,
   отключение чтения cookie и visitor id (`headers.ts`, `entry.server.tsx`), shell-ветка в
   `createRuntimePageLoader` (`server.ts:129`) и вид `{ kind: 'shell' }` в `hydration.ts`.
2. `src/static/`: `createStaticRenderer(build)` (Request → `{ status, html, cacheState,
entities, validUntil }`), пул воркеров, CSS-pruning, запись в каталог (по умолчанию
   `build/static`) и в R2 (S3 API), sitemap/robots, manifest.
3. Гибридный сервер `src/static/server.ts`: свой `express` с `@react-router/express` вместо
   `react-router-serve`, middleware статики, драйверы хранилища `fs` и `s3`, `fs:build/static`
   по умолчанию при наличии manifest, кеш в памяти с
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

1. `static.config.ts`, список оболочек, перечислитель коллекций (из меню плюс список).
2. Убрать `viewerEngagement`/`viewerCapabilities`/`viewerSubscription` из SSR-запросов отзывов и
   вопросов, вынести в отдельный клиентский запрос.
3. Шапка и таб-бар: скелетон корзины и аккаунта до монтирования; промо-метка в меню клиентский
   запрос.
4. Карточки и страница товара: показ базовых баллов гостя, обновление на месте после входа.
5. `scripts/deploy-theme.mjs smoke`: на шаге A проверять `x-shopana-static: hit` и `304` на
   `If-None-Match` для сгенерированной страницы, `miss` и SSR для неизвестной, `__shopanaStatic`
   и отсутствие секретов; на шаге B добавить `s-maxage` и `cf-cache-status`. Проверка, что
   гостевой переход не делает запросов к `/graphql`.
6. Workflow сборки образа: шаг `static build` в `build/static` перед `docker build`, ночной cron;
   Dockerfile копирует `build/static`. Для режима бакета workflow полной сборки
   `.github/workflows/static-full-build.yml`.

### `internal`

1. API чтения событий магазина по курсору и токен интеграции для координатора
   (`plans/static-invalidation-and-ci-builds.ru.md`, «Лента событий internal»).
2. Gateway: `persistedDocuments` с манифестом по `HIVE_STOREFRONT_PERSISTED_DOCUMENTS_URL` и
   `allowArbitraryDocuments: true` (сделано, этап 0); плагин `Cache-Control` и `Cache-Tag` для
   `GET` persisted documents из allow-list.
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
3. Секреты CI: ключ записи в бакет, серверный GraphQL URL и приватный
   storefront-токен (`shopana-storefront-private-token`), чтобы gateway не считал builder обычным
   браузером.

Шаг B:

1. `deploy/worker/`: Worker с `wrangler.toml` (R2 binding, route на hostname, переменная
   SSR-origin), деплой через Terraform или wrangler в CI.
2. `deploy/terraform/modules/frontend-edge`: custom domain R2 для ассетов, Worker route, новые
   Cache Rules.
3. Токен Cloudflare purge у координатора и в CI; `cdn: 'cloudflare'` в публикации.

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
- **Инвалидация.** Событие `productUpdated` из ленты → своя страница и популярные в очереди,
  остальные затронутые dirty; попадание по dirty → рендер; гибридная нода отдаёт новую версию не
  позже TTL, на шаге B purge тега страницы; `navigationMenuUpdated` → полная пересборка.
  Подробности в `plans/static-invalidation-and-ci-builds.ru.md`, «Тестирование».
- **Worker (шаг B).** Тесты на `workerd`/miniflare: переписывание ключей, фолбэк на origin, деградация в
  оболочку, проксирование `/auth/*` с cookie.
- **Stage.** `deploy-theme.mjs smoke` на шаге A: `x-shopana-static: hit` и `304` для
  сгенерированной страницы, неизвестный адрес отвечает живым рендером (`miss`), а через пару минут
  уже из статики (`hit`). На шаге B дополнительно `s-maxage` и `cf-cache-status: HIT` на втором
  запросе, `/auth/login` не кешируется, `GET /graphql` кешируется, `POST` нет.

## Этапы

**0. `GET` с `documentId` в Hive Gateway. Выполнен** (6 ноября 2026). Проверено на
`@graphql-hive/gateway-runtime` 2.10.7 (тот, что в `internal`): runtime запускался в процессе
на `supergraph-storefront.graphql`, запросы шли через `gateway.fetch`, без отдельного сервера.

| Запрос                                              | Текущий конфиг                       | С `persistedDocuments`                 |
| --------------------------------------------------- | ------------------------------------ | -------------------------------------- |
| `GET /graphql?query=…`                              | `200`, данные                        | ошибка `CANNOT_SEND_PQ_ID_AND_BODY`    |
| `GET /graphql?documentId=…`                         | ошибка `Must provide query string`   | `200`, данные                          |
| `GET /graphql?documentId=…&variables=…`             | —                                    | `200`, переменные применяются          |
| `GET` с неизвестным `documentId`                    | —                                    | ошибка `PERSISTED_QUERY_NOT_IN_LIST`   |
| `GET` с `documentId` мутации                        | —                                    | `405`, мутации только через `POST`     |
| `POST {documentId}`                                 | —                                    | `200`, данные                          |
| `GET /graphql?query=…` и `allowArbitraryDocuments`  | —                                    | `200`, данные                          |
| `GET /graphql/uk?documentId=…`                      | `404`                                | `200` с `graphqlEndpoint: '/graphql/:locale?'`, но ломает websockets (ниже) |
| `GET /graphql?locale=uk&documentId=…`               | —                                    | `200`, лишний параметр не мешает       |

Выводы:

- Сейчас gateway `GET` с `documentId` **не принимает**: `persistedDocuments` в
  `infra/federation/gateway-storefront.config.ts` не задан. Обычный `GET` с текстом запроса
  работает уже сегодня.
- Нужна опция `persistedDocuments` с `getPersistedOperation` (поиск по манифесту документов из
  codegen) и `allowArbitraryDocuments: true`: остальные клиенты и `POST` с сессией продолжают слать
  текст запроса. Без этого флага gateway отклоняет любой запрос без `documentId`.
- Мутации по `GET` gateway отклоняет сам (`405`), отдельная защита не нужна.
- Локаль в пути (`graphqlEndpoint: '/graphql/:locale?'`) отклонена: CLI hive-gateway 2.11.2
  создаёт `WebSocketServer({ path: graphqlEndpoint })`, `ws` сравнивает путь строго, и upgrade
  на `/graphql` получает `400`. Плагин перезаписи пути тоже отклонён: request-id в gateway и
  `storefront-access` хранятся в `WeakMap` по исходному `Request` и теряются. Локаль передаётся
  в query: `GET /graphql?locale=uk&documentId=…`; endpoint остаётся `/graphql`.
- Сделано в internal (не закоммичено на момент записи): `persistedDocuments` с манифестом,
  который gateway скачивает при старте по `HIVE_STOREFRONT_PERSISTED_DOCUMENTS_URL` (без
  переменной манифест пустой), `allowArbitraryDocuments: true`; 13 тестов в `infra/federation`
  проходят.
- Плагин `storefront-access` (`plugins/storefront-access/index.ts`) от метода запроса не зависит:
  `onRequest` одинаково обрабатывает `GET` и `POST`. В этой проверке он не подключался.

**1. Рендер без UA. Выполнен** по `plans/ua-free-rendering.ru.md`: HTML одного адреса не
зависит от User-Agent.

**2. Режим «полный документ» в runtime и CLI `static build` (неделя).**
Заголовок режима, `onAllReady`, без cookie и visitor id, shell-страницы, `/__env.js`,
CSS-pruning, пул воркеров, запись в каталог и в бакет, manifest. Полная генерация на
mock-сервере. _Готово, когда_ полная генерация на mock-сервере укладывается в оценку 1–2 минуты, а
повторный рендер даёт тот же HTML.

**3. Гибридный сервер `start` (3–4 дня).**
Свой сервер вместо `react-router-serve`, middleware статики, драйверы `fs` и `s3`, кеш в памяти,
старые ассеты из хранилища, `/__env.js`, сообщение о промахе, `--static-only`, тесты сервера.
_Готово, когда_ сайт с mock-сервера открывается через `start` с `fs:.static`: сгенерированные
адреса отдаются как `hit`, остальные рендерит SSR, `/auth/*` работает, гидратация без ошибок.

**4. Клиентский режим статики в SDK и теме (неделя).**
`page-data.json` в `clientLoader`, `useViewerRefresh` без `evict` (личный запрос), скелетоны
шапки, вынос `viewer*` полей, промо-метка меню на клиент, полная навигация при смене локали.
Лёгкие запросы остатков и промо — по этапам `plans/static-volatile-data.ru.md`.
_Готово, когда_ сценарии «гость без сети» и «персонализация после входа» проходят.

**5. Статика в образе: локально и при сборке образа (2–3 дня).**
`static build` по умолчанию в `build/static`, автоматический `fs:build/static` в `start`, шаг
генерации в workflow сборки образа, копирование в Dockerfile, ночной cron. _Готово, когда_
локально `build` → `static build` → `start` отдаёт сгенерированные страницы как `hit`, а
`pet.shopana.dev` после деплоя образа из GitHub Actions делает то же без бакета.

**6. Шаг A на stage: бакет и полная сборка в GitHub Actions (2–3 дня).**
Бакет R2 и ключи в Terraform, замер чтения объекта из бакета по S3 API с ноды Swarm (p50/p95
для полного и условного `GET`), `STOREFRONT_STATIC_STORE` у `theme`, workflow полной сборки без
purge, обновлённый smoke. _Готово, когда_ есть цифры чтения из бакета, `pet.shopana.dev` отдаёт сгенерированные страницы с
ноды как `hit`, неизвестные адреса рендерит SSR, ночная пересборка и пересборка по релизу образа
проходят без ручных действий. С этого момента stage живёт в режиме «полная пересборка по
расписанию».

**7. Точечная инвалидация (1–1,5 недели, обе стороны).**
Internal: API чтения событий по курсору. Storefront: координатор с чтением ленты, индекс
зависимостей, eager и dirty, отчёты о попаданиях от ноды, дочист, публикация только изменившегося,
таймеры, workflow `static-site.yml`, `theme-static` в стеке, без purge
(`plans/static-invalidation-and-ci-builds.ru.md`). Быстрые данные вне HTML — по
`plans/static-volatile-data.ru.md`. _Готово, когда_ правка товара в админке stage обновляет его
страницу на ноде не позднее двух минут, непопулярный листинг с ним обновляется после открытия, а
тесты координатора проходят.

**8. Шаг B: Worker и кеш CDN перед нодой (3–4 дня).**
Проверка Worker с R2 binding и cookie auth на тестовом hostname, Worker и его тесты, custom
domain для ассетов, Cache Rules в Terraform, Cache API с `Cache-Tag`, purge по тегам и тегу
прошлой сборки, smoke для CDN,
перепроверка `STOREFRONT_TRUSTED_PROXY_HOPS`. _Готово, когда_ `pet.shopana.dev` отдаёт статику
из CDN (`cf-cache-status: HIT`), промахи и `/auth/*` идут на гибридную ноду, а правка товара
обновляет страницу в CDN не позднее двух минут.

**9. Кеш GraphQL `GET` на CDN (неделя).**
Persisted documents в codegen, второй `HttpLink`, плагин `Cache-Control` в gateway, Cache Rule.
_Готово, когда_ подгрузка второй страницы листинга двумя разными браузерами даёт
`cf-cache-status: HIT` на втором, а запрос с сессией `BYPASS`.

Этапы 3 и 4 можно вести параллельно с этапом 2. Проверка «одна версия на адрес» делается в
конце этапа 3: HTML, который отдаёт гибридный сервер, одинаков для мобильного и десктопного UA.
Этап 5 уже даёт рабочий сайт со статикой; этапы 6–7 добавляют бакет и точечную перегенерацию,
когда задержки до следующей пересборки образа станет мало. К этапам 8–9 можно переходить, когда
понадобится разгрузить ноду и ускорить отдачу из CDN.

## Риски и открытые вопросы

- **Устаревшие данные на dirty-страницах.** Непопулярная страница показывает прошлую версию до
  первого открытия плюс 1–1,5 минуты. Остатки и промо после выноса в быстрые данные актуальны и
  там; полная гарантия цен и остатков есть только в корзине и чекауте.
- **Полная пересборка при изменении layout.** Любое изменение меню или настроек магазина это
  тысячи рендеров. Если это окажется частым, меню тоже переводится на клиентскую загрузку из слоя
  2 с коротким TTL.
- **Задержка обновления на шаге A.** Новая версия страницы видна на ноде через
  `STOREFRONT_STATIC_CACHE_TTL` после публикации; уменьшать TTL можно, это только больше условных
  `GET` в бакет.
- **Бакет на пути каждого запроса на шаге A.** Холодная запись кеша стоит запрос в R2 (замер на
  этапе 6). Если задержка окажется заметной, кеш прогревается по manifest после старта реплики.
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
  уже сделанный статический CSS снижают. Как следующий шаг
  не инлайнить `__shopanaApolloState`, а подключать `page-data.json` и в документ.
- **Блог.** Данных в API нет; пока генерируется из mock темы, после появления API
  (`articles`) добавляются перечислитель и события.
- **Коллекции.** В storefront API нет `Query.collections`; список берётся из меню и конфигурации
  темы, поэтому коллекция вне меню не попадёт в статику без явного указания.
- **Персонализированные цены в будущем.** Сейчас цен по сегментам нет; если появятся, цена
  переходит в клиентский слой по той же схеме, что и баллы лояльности, а HTML остаётся гостевым.
- **Consistency между HTML и JSON.** Оба пишутся одной операцией и чистятся одним тегом страницы;
  в окне между ними клиент может получить новый JSON к старому HTML, это безопасно, так как
  JSON только дополняет кеш Apollo.
