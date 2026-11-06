# Отделение быстро меняющихся данных от статического HTML

Дополняет `plans/static-site-generation.ru.md` (раздел «Персонализация», «Клиентская сторона»,
«Кеш GraphQL для клиентских переходов») и `plans/static-invalidation-and-ci-builds.ru.md`
(«Аспекты», «Событие → изменения → страницы»). Персонализация (`loyalty`, `viewer*`) переходит
на ту же схему личным лёгким запросом (раздел «Вошедший покупатель»).

**Термин.** «Лёгкий запрос» — persisted GraphQL-запрос SDK: заранее, при сборке SDK,
фиксируется только его текст (манифест gateway), браузер шлёт `documentId` и переменные.
**Ответ живой:** gateway выполняет запрос в catalog и pricing в момент обращения, кеш ответа
только по TTL (CDN на шаге B, response cache gateway на шаге A). Это не статика: файлов в R2 и
`build/static` для этих данных нет, builder их не генерирует, в индекс и инвалидацию они не
входят.

## Вывод

**Делим поля на три класса, а не на «в HTML» и «не в HTML».**

| Класс                                   | Поля                                                                                                 | В HTML и `page-data.json`                | После гидратации                     | Перерендер страницы               |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------ | --------------------------------- |
| **Летучие** (только в отдельном ответе) | `ProductVariant.quantityAvailable`, `ProductVariant.promotions`, `Query.storefrontPromotions`        | нет; нейтральное состояние или скелетон  | лёгкий ответ, TTL 30 с / `validUntil` | никогда                           |
| **Корректируемые** (снимок + поправка)  | `ProductVariant.availableForSale`, `currentlyNotInStock`, `Product.availableForSale`; `price`, `compareAtPrice` по флагу `withPrice` | последнее известное значение из рендера  | тот же лёгкий ответ поправляет кеш   | `pricing` сразу, `availability` лениво |
| **Статические**                         | всё остальное (контент, медиа, состав списков, `selectedOrFirstAvailableVariant`)                    | да                                       | —                                    | как в плане инвалидации           |

**Цена остаётся в HTML.** Она нужна в JSON-LD `Offer` и `og:product:price`, её видят бот и
браузер без JS, она самая заметная часть карточки (замена после загрузки дала бы CLS и мигание),
а меняется только правкой в admin с событием `productUpdated`/`pricing`, то есть редко и
предсказуемо. В лёгкий запрос цена входит по флагу SDK `withPrice`: в режиме бакета `false`
(окно 1–1,5 минуты CI между правкой и публикацией терпимо, корзина и checkout считают цену
сами), в режиме «статика в образе» `true` (HTML обновляется только с образом, без поправки старая
цена висела бы часами). Лёгкий запрос нужен не ради цены: наличие меняется от заказов без
событий, `quantityAvailable` меняется с каждым заказом, промо — по времени и `discount*`.

**Наличие (`availableForSale`) тоже остаётся в HTML как последнее известное значение**, а
`quantityAvailable` уходит из HTML совсем. HTML с булевым наличием меняется только при переходе
«есть ↔ нет», поэтому с публикацией «только при смене хэша» событие `inventory` почти никогда не
доходит до R2 и purge. Промо уходят из HTML целиком: `discount*` и таймеры `validUntil` больше не
перерисовывают ни одной страницы; это и есть главный выигрыш, сейчас `discount*` трогает все
страницы с аспектом `promotions`.

**Транспорт: persisted `GET` к gateway, один батч на страницу.** SDK собирает id вариантов,
которые показывает страница, и делает `GET /graphql?documentId=…&variables={"ids":[…]}` через
`Query.nodes(ids:)`. Гостевых запросов три: `SdkVolatileCards` (листинги, без языка в ключе),
`SdkVolatileVariant` (страница товара) и общий для магазина `SdkStorefrontPromotions` (тексты
промо; промо варианта приходят ключами). Без `Authorization` и visitor id. Gateway ставит
`Cache-Control: public, max-age=0, s-maxage=30, stale-while-revalidate=30` (меньше, если ближе
`validUntil` промо) и `Cache-Tag` по товарам и промо. Вошедшему покупателю добавляется личный
некешируемый `SdkViewerVariants` (лояльность). Гибридная нода и Worker в этом пути не
участвуют. Шаг A (без CDN): кеш ответов в самом gateway (Hive response cache) с тем же TTL. Шаг B:
кеш Cloudflare по URL и purge по тегам (`discount*` → тег промо, admin-правка остатка или цены →
тег товара).

**В кеше Apollo свежий ответ всегда побеждает снимок.** Он пишется в те же нормализованные
`ProductVariant:<id>`, карточки и страница товара читают их через `useFragment` /
`useSuspenseQuery` и перерисовываются сами. Единственное место, где снимок может затереть свежие
данные, это `applyStaticPageData` при клиентском переходе: там летучие и корректируемые поля уже
имеющихся записей сохраняются.

## Что есть сейчас

**Тема: где показываются поля.**

- Карточка листинга: фрагмент `StorefrontListingProductCardVariantFragment`
  (`themes/brand-bite-crunch/src/templates/collection/apollo/useListingProductCardFragment.shopana.graphql:63`)
  берёт `price`, `compareAtPrice` (`:69`, `:73`), `isAvailable: availableForSale` (`:77`),
  `quantityAvailable` (`:78`). Вариант карточки: `selectedVariant: selectedOrFirstAvailableVariant`
  (`:56`) или `matchedVariant` ребра. Промо на карточке нет. Маппер:
  `templates/collection/mappers/mapListingProductCard.ts:203` (`isAvailable = price && variant.isAvailable`),
  `:236–241` (`maxQuantity` из `quantityAvailable` при `DENY`). Карточка читает фрагмент из кеша:
  `templates/collection/blocks/ProductCard/index.tsx:36`.
- Кнопка «в корзину»: `ui-kit/ProductCards/ListingCard/CartButton.tsx:34,45–46` — уже `disabled`
  до гидратации (`useHydrated`), текст «нет в наличии» при `!isAvailable` (`:59`).
- Страница товара: `ProductPageVariantFragment`
  (`runtime/pages/product/ProductPageQuery.graphql:222`): `price`/`compareAtPrice` (`:254–261`),
  `availableForSale`, `currentlyNotInStock`, `quantityAvailable` (`:262–264`), `promotions` без
  `validUntil` обёртки (`:273–277`), `Product.availableForSale` (`:435`). Все варианты страницы
  (по 100) грузятся в `preload` (`runtime/pages/product/index.tsx:35–57`), секция читает их
  `useSuspenseQuery` (`templates/product/sections/ProductPageSection/index.tsx:48`).
- Маппинг варианта: `hooks/product/mapApiProductToProduct.ts:235–250` (`stockStatus`, промо).
- Наличие: `templates/product/atoms/StockStatus/index.tsx:22–25`,
  `templates/product/blocks/ProductMainThreeColumn/index.tsx:263–291` (тег, количество, кнопка),
  `templates/product/blocks/ProductMain/index.tsx:136`. Цена: `PriceAndSale` (`ProductMain:156,172`,
  `templates/product/atoms/PriceAndSale/index.tsx:38`), `ui-kit/Price/Discount.tsx:35`.
- Промо: `templates/product/atoms/ProductPromotions/index.tsx:19–21` (без промо `null`), стоит
  между ценой и кнопкой (`ProductMain/index.tsx:178`, `ProductMainThreeColumn/index.tsx:238`).
  Шапка: `layouts/theme/useHeaderMenuItemLabel.ts:41` (`useStorefrontPromotions(FREE_SHIPPING)`,
  пустая строка до загрузки).
- Сравнение на странице товара: `templates/product/blocks/ProductComparison/index.tsx:223`
  (`availableForSale`, цена колонки из `ProductPageComparisonFragment`, `ProductPageQuery.graphql:125–133`).
- SEO: `seo/jsonLd.ts:212–215` (`availability` из `isAvailable`/`currentlyNotInStock`),
  `:226–249` (`Offer.price`, зачёркнутая цена); `runtime/pages/product/index.tsx:116–126`
  (`og:product` цена и наличие).
- Фильтр «в наличии» и сортировка по цене: `templates/collection/listingFiltersUrl.ts:5,49`,
  `templates/collection/blocks/ListingTitleAndBtn/index.tsx:42–43`. Статический HTML один на
  адрес без query string (`packages/shopana-storefront-runtime/src/static/keys.ts`), поэтому
  отсортированные и отфильтрованные листинги всегда строит клиент; в HTML попадает только порядок
  по умолчанию (`MANUAL` в категории, `NEWEST` глобально, схема `ListingSort`).
- Клиентские страницы (корзина `templates/cart/blocks/CartItem.tsx:110`, вишлист
  `modules/account/views/AccountSections.tsx:220`, box-builder) — оболочки, их это не касается.
- `templates/index/blocks/ProductCard.tsx:53,99` жёстко ставит `isAvailable: true`.

**SDK.**

- Кеш: `packages/shopana-storefront-sdk/src/graphql/apollo/cache.ts:213` (`createApolloCache`),
  объекты без id сливаются (`:294`), `addApolloCacheState` (`:358`) вливает снимок поверх кеша,
  «снимок побеждает» (`mergeApolloCacheStates`, `:389`).
- Транспорт: один `HttpLink` с `POST` (`graphql/apollo/Environment.ts:157`), `authLink` всегда
  добавляет visitor id и токен (`:131–150`).
- Персонализация: `static/viewer.ts:13` (`VIEWER_FIELDS`), `stripViewerFields`, `evictViewerFields`;
  `static/useViewerRefresh.ts:16`.
- Промо: `modules/promotions/react/useStorefrontPromotions.ts:41` (`cache-first`),
  таймер `useValidUntilRefetch` (`:49`, `static/useValidUntilRefetch.ts:13`).
- Индекс страницы: `static/entities.ts:24` (`TIME_FIELDS` — `validUntil`, `endsAt`, …) даёт
  `validUntil` страницы для таймеров перерендера.

**Runtime.** `src/react-router/page.tsx:795–821` (`applyStaticPageData`): `page-data.json`
вливается через `addApolloCacheState`, для покупателя с сессией без viewer-полей.

**Gateway (internal, незакоммиченная работа).** `infra/federation/persisted-documents.ts`,
`gateway-storefront.config.ts:18,31`: `GET ?documentId=` по манифесту; параметр `locale` только
ключ кеша CDN, язык берётся из `Accept-Language` (`gateway-storefront.config.test.ts:93`).
`Cache-Control` и `Cache-Tag` gateway пока не ставит, ответ несёт `Vary: Accept-Language`
(`gateway-storefront.config.ts:51`). Cloudflare: `/graphql` в bypass
(`deploy/terraform/modules/frontend-edge/main.tf:9`).

**Схема.** `Query.nodes(ids: [ID!]!): [Node]!` (`supergraph-storefront.graphql:333`, catalog,
порядок сохраняется). У `ProductVariant` (`:1936`) `price`, `compareAtPrice`, `availableForSale`,
`currentlyNotInStock`, `quantityAvailable` из catalog и `promotions:
StorefrontPromotionPresentation!` из pricing (с `evaluatedAt`, `validUntil`, `revision`).
Скидка в цену не входит, цена считается в checkout.

## Варианты

### Что выносить

| Вариант                                         | Плюсы                                                             | Минусы                                                                                       | Оценка |
| ----------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------ |
| 1. Только промо                                 | проще всего, снимает `discount*` и таймеры                        | `inventory` по-прежнему перерисовывает листинги                                               | 6/10   |
| 2. Промо + остатки целиком (и `availableForSale`) | HTML не зависит от склада                                         | JSON-LD без `availability`, бот и браузер без JS не видят «нет в наличии», CLS на тегах и кнопке | 5/10   |
| **3. Промо + `quantityAvailable` вынести, наличие и цену оставить снимком с поправкой** | SEO и без-JS корректны «на момент рендера», нет CLS, `inventory` почти не публикует | два пути для наличия (снимок и поправка)                                                     | **9/10** |
| 4. Всё, включая цену                            | HTML меняется только от контента                                  | SEO (`Offer` без цены отклоняется), CLS цены, мигание, бот видит пустую цену                  | 3/10   |

### Транспорт

| Вариант                                                  | Кеш                                       | Запросов на страницу | Оценка |
| -------------------------------------------------------- | ----------------------------------------- | -------------------- | ------ |
| **A. Persisted `GET` к gateway, батч id страницы**       | CDN по URL (шаг B), Hive response cache (шаг A) | 1 (листинг 24 id, товар до 100) | **9/10** |
| B. Persisted `GET` на каждый товар                        | лучше переиспользуется между страницами   | 24 на листинге       | 6/10   |
| C. Отдельный JSON от гибридной ноды / Worker (`/__static/volatile/…`) | свой кеш в памяти ноды                    | 1                    | 4/10   |
| D. Летучее в `page-data.json` с коротким TTL              | —                                         | 0                    | 2/10   |

C дублирует gateway: ноде нужен свой ключ API, своя схема ответа и свой кеш, а на шаге B ещё и
маршрут Worker-а. D ломает идею: `page-data.json` тогда меняется вместе с остатками, и
публикация «по хэшу» теряет смысл. B даёт лучший hit rate между страницами, но 24 запроса на
листинг; с `Cache-Tag` по товарам точность purge у A та же.

## Рекомендуемая схема

### Лёгкие запросы

`packages/shopana-storefront-sdk/src/modules/volatile/operations.graphql`, три гостевых:

```graphql
# Листинги: только то, что видно на карточке. Не локализовано: язык в ключе не нужен.
query SdkVolatileCards($ids: [ID!]!, $withPrice: Boolean!) {
  nodes(ids: $ids) {
    ... on ProductVariant {
      id
      availableForSale
      price @include(if: $withPrice) { amount currencyCode }
      compareAtPrice @include(if: $withPrice) { amount currencyCode }
      product { id }
    }
  }
}

# Страница товара: выбранный вариант целиком, остальным только наличие для свотчей опций.
query SdkVolatileVariant(
  $id: ID!
  $siblings: [ID!]!
  $withPrice: Boolean!
  $locale: String
) {
  variant: node(id: $id) {
    ... on ProductVariant {
      id
      availableForSale
      currentlyNotInStock
      quantityAvailable
      price @include(if: $withPrice) { amount currencyCode }
      compareAtPrice @include(if: $withPrice) { amount currencyCode }
      product { id availableForSale }
      promotions { validUntil revision promotions { key } }
    }
  }
  siblings: nodes(ids: $siblings) {
    ... on ProductVariant { id availableForSale }
  }
}

# Тексты промо: один ответ на весь магазин (уже есть, modules/promotions).
query SdkStorefrontPromotions($kinds: [StorefrontPromotionKind!]) {
  storefrontPromotions(kinds: $kinds) { validUntil revision promotions { ...SdkStorefrontPromotion } }
}
```

- Состав фиксирован SDK, тема поля не дописывает; запросы попадают в allow-list gateway через
  манифест persisted documents SDK.
- `$locale` в `SdkVolatileVariant` в запросе не используется: он только делает URL, а значит ключ
  кеша CDN, разным по языкам (язык ответа gateway берёт из `Accept-Language`). Нужен, пока в
  ответе есть что-то локализованное; с промо по ключам его можно убрать после проверки.
- Промо варианта приходят только ключами; тексты, бейджи и условия хук берёт из общего
  `storefrontPromotions` и соединяет по `key`. Ответы по вариантам меньше, смена текста промо
  сбрасывает один общий ответ.
- `$withPrice` — флаг SDK по режиму хранилища: `false` для бакета, `true` для «статики в образе»
  (см. «Вывод»).
- Лимит батча 100 id. id сортируются: один набор — один URL — одна запись кеша. 100 global id
  около 6 КБ в URL, у Cloudflare лимит 16 КБ.

### Жизненный цикл лёгкого запроса

```text
сборка SDK: текст запроса → манифест persisted documents → gateway (allow-list «гостевые»)
builder/SSR: фрагменты темы без летучих полей → HTML и page-data.json без них
браузер:
HTML ──► гидратация ──► useEffect провайдера ──► GET ──► CDN / gateway ──► writeQuery ──► useFragment
скелетон   та же         id за один кадр,      без токена   s-maxage 30 с    ProductVariant:<id>  перерисовка
           разметка      сортировка, по 100    и visitor id                                     компонента
```

1. **Сервер и builder** летучих полей не запрашивают (их нет во фрагментах темы) и лёгкие
   запросы не выполняют: провайдер запускает их из `useEffect`, который на сервере не работает.
2. **Регистрация.** `useVolatileCard(id)` в карточке листинга и `useVolatileVariant(id, siblings)`
   в секции товара и колонках сравнения кладут id в `VolatileDataProvider` (`AppProviders`) и
   читают `ProductVariant:<id>` через `useFragment`. Сами хуки ничего не запрашивают.
3. **Батч.** Провайдер ждёт конца кадра (`requestAnimationFrame`), сортирует id, режет по 100,
   пропускает id, запрошенные меньше 30 с назад (клиентские переходы), и шлёт `GET` отдельным
   `HttpLink` без `Authorization` и visitor id. На странице товара заодно запрашивается
   `SdkStorefrontPromotions`, если его нет в кеше.
4. **Ответ** пишется `writeQuery` в те же нормализованные записи, что лежат из снимка.
5. **Рендер.** `ready` = есть ли летучее поле у записи в кеше: `false` на сервере и при
   гидратации, поэтому разметка совпадает с HTML. Летучие поля: скелетон → значение.
   Корректируемые: значение снимка, DOM меняется только при расхождении.

```tsx
function Promotions({ variantId }: { variantId: string }) {
  const { promotions, ready } = useVolatileVariant(variantId);
  if (!ready) return <PromotionsSkeleton />; // сервер и гидратация
  if (!promotions.length) return null;
  return <ProductPromotions promotions={promotions} />;
}
```

6. **Повторные запросы**, пока страница открыта: таймер `validUntil` промо (перезапрос id этих
   вариантов и общего списка; `useValidUntilRefetch` переезжает сюда), `visibilitychange` в
   `visible` для id старше 30 с, ошибка «нет в наличии» от мутации корзины, подгрузка листинга по
   курсору (батч только на новые id).

Правило против ошибок гидратации: нейтральное состояние зависит только от наличия данных в кеше,
не от `typeof window` и `Date.now()`; данные появляются строго после гидратации. Так уже
работает кнопка корзины (`CartButton.tsx:34`, `useHydrated`).

### Что в HTML вместо значения (гидратация, CLS)

| Место                                   | В HTML                                       | После ответа                         | CLS                        |
| --------------------------------------- | -------------------------------------------- | ------------------------------------ | -------------------------- |
| Цена, зачёркнутая цена, бейдж скидки цены | снимок                                      | поправка при `withPrice`, если отличается | нет (ширина почти та же)   |
| «В наличии» / «нет в наличии», кнопка     | снимок `availableForSale`                    | поправка                             | нет (тег и кнопка той же высоты) |
| Максимум в поле количества               | без ограничения (`maxQuantity: null`)        | `quantityAvailable` при `DENY`       | нет                        |
| Промо на странице товара                 | скелетон одной строки (высота `ProductPromotions`) | 0 промо — блок схлопывается, 2+ — растёт | только при расхождении   |
| Метка бесплатной доставки в шапке        | пусто (как сейчас при загрузке)              | текст                                | в меню, вне первого экрана |
| Колонки сравнения на странице товара     | снимок цены и наличия                        | поправка по `variant.id` колонки     | нет                        |

Мигания нет: корректируемые поля меняются только при реальном расхождении, без анимации.
Скелетон промо — единственный новый плейсхолдер; без JS он прячется (стиль под `<noscript>`).
Где поставить блок промо, чтобы его рост не двигал кнопку «в корзину», решает дизайн (открытый
вопрос ниже): сейчас он стоит между ценой и кнопкой.

`selectedOrFirstAvailableVariant` остаётся статическим: если вариант карточки закончился,
поправка покажет «нет в наличии», а другой вариант карточка выберет при следующем рендере
листинга (ленивая перегенерация по `availability`, см. ниже). Делать вариант карточки летучим
означало бы тянуть в лёгкий ответ весь фрагмент карточки.

### Кеш, TTL, теги

Gateway, плагин для `GET` с `documentId` из allow-list «гостевые и кешируемые» и без
`Authorization`:

- `Cache-Control: public, max-age=0, s-maxage=<ttl>, stale-while-revalidate=<swr>`.
  `SdkVolatileCards`: `ttl = 30`, `swr = 30`. `SdkVolatileVariant`: `ttl = min(30, validUntil − now)`
  по `promotions.validUntil`, `swr = 0`, если `validUntil` наступает раньше `ttl + swr`.
  `SdkStorefrontPromotions`: `ttl = min(600, validUntil − now)`.
- `ETag` по хэшу ответа: после TTL CDN перепроверяет у origin и получает `304` без тела.
- `Cache-Tag`: `sf-vol` и `sf-p-<productUuid>` для запросов по вариантам (uuid из global id
  `product.id`), `sf-promo` для `SdkStorefrontPromotions`. Cloudflare снимает заголовок перед
  отдачей клиенту.
- Ключ кеша CDN — полный URL: `documentId`, `variables` с отсортированными id (и `locale`, где он
  есть). `Vary` Cloudflare не учитывает, поэтому язык, если нужен, в URL.
- Запросы с `Authorization` — `private, no-store`, как сейчас. `max-age=0`: браузер ответ не
  держит, свежесть обеспечивает CDN.

Purge по тегам на Cloudflare доступен на всех планах с 2025 года; лимиты Free (запросов в минуту
и тегов в запросе) проверяются на этапе 0. Purge делает координатор (не job в GitHub Actions,
рендера нет), ему нужен токен `Cache Purge`.

| Событие                                          | Действие с лёгким ответом              |
| ------------------------------------------------ | -------------------------------------- |
| `discount*`                                      | purge `sf-promo` (один общий ответ) и `sf-vol` (ключи промо вариантов) |
| `productUpdated` `inventory`, `pricing`, `variant` | purge `sf-p-<productId>`              |
| заказы, возвраты (событий нет)                   | TTL 30 с                               |
| старт или конец промо по времени                 | TTL до `validUntil`                    |

### Масштаб каталога

Размер запроса от каталога не зависит: в нём только id того, что на странице (24 карточки или
варианты одного товара). При 10 000 товаров растёт число разных ключей кеша (страницы товаров и
листингов × локали) и доля промахов на редких страницах. Промах — поиск `nodes(ids:)` по
первичному ключу, единицы миллисекунд; это дешевле SSR, который статика заменила. Ключи
дробятся сильнее всего на фильтрах и бесконечной прокрутке (новый набор id — новый URL).

Что держит нагрузку:

- два запроса по потребности (`SdkVolatileCards` без количества и промо — около 1 КБ gzip на 24
  карточки; полные данные только у выбранного варианта страницы товара);
- промо ключами плюс один общий `storefrontPromotions`, почти всегда из кеша;
- без языка в ключе у наличия и цены: при двух локалях вдвое больше попаданий;
- `ETag` и `304` после TTL;
- склеивание одновременных промахов: на шаге B это делает Cloudflare, на шаге A — response cache
  gateway; если Hive не склеивает, нужна своя обёртка «один запрос в полёте на ключ» (этап 0).

Итог: для популярных страниц около одного запроса в подграфы на страницу за 30 с, для редких —
один на просмотр.

Отклонено: шарды по хэшу id на весь каталог (ключей мало, но 24 карточки попадают в ~23 разные
корзины — 23 запроса на страницу); один файл «все остатки магазина» (около 100 КБ gzip на визит
каждые 30 с); загрузка по мере появления в экране через `IntersectionObserver` (запросов больше,
ключи дробятся сильнее).

### Без CDN (шаг A, «статика в образе» и бакет) и с Worker + CDN (шаг B)

- **Шаг A.** HTML отдаёт нода (из `build/static` или бакета), лёгкий ответ идёт мимо неё:
  Tunnel → Traefik → gateway, как любой `/graphql`. Каждый просмотр страницы — один `GET` в
  gateway. Чтобы catalog и pricing не получали каждый, gateway включает response cache Hive
  (в памяти, `session: () => null` для гостевых документов из allow-list, ключ с
  `Accept-Language`, TTL как у `s-maxage`). Нагрузка на подграфы — не больше одного запроса на
  набор id и локаль за 30 с на реплику gateway. Purge на шаге A нет: TTL 30 с.
- **«Статика в образе».** Здесь выигрыш больше всего: HTML обновляется только с образом, и без
  лёгкого ответа остатки и промо в нём устаревали бы до следующей сборки. С ним (и `withPrice:
  true`) до сборки в HTML устаревают только цена и булево наличие, а их поправляет тот же ответ.
- **Шаг B.** Cache Rule: `GET /graphql` с `documentId` и без `Authorization` eligible, «respect
  origin», query string в ключе; bypass остаётся для `POST` и запросов с `Authorization`. Worker
  на `/graphql` не вешается. Response cache gateway остаётся вторым уровнем за CDN.

### Apollo: снимок и свежий ответ

- Свежий ответ пишется обычным `cache.writeQuery`: скаляры `ProductVariant:<id>` и `Product:<id>`
  заменяются, `StorefrontPromotionPresentation` без id сливается (`cache.ts:294`), список
  `promotions` заменяется. Новые type policies не нужны.
- Порядок: SSR-состояние документа → гидратация → лёгкий ответ. Снимок старше ответа и
  раньше его, поэтому свежее побеждает без меток времени.
- Исключение — `applyStaticPageData` (`page.tsx:815`) при клиентском переходе: `page-data.json`
  другой страницы вливается «снимок побеждает» и может вернуть старые цену и наличие варианта,
  который уже обновлён. Решение: `VOLATILE_FIELDS` в `static/volatile.ts` рядом с `VIEWER_FIELDS`
  и функция `keepFreshVolatileFields(state, cache)`: для записей, у которых в кеше уже есть
  значения корректируемых полей, эти поля из снимка выбрасываются. Применяется в
  `applyStaticPageData` так же, как `stripViewerFields`.
- Builder при записи `page-data.json` и перед хэшированием HTML выбрасывает летучие поля из
  снимка (`stripVolatileFields`): страховка от фрагмента темы, который запросил
  `quantityAvailable`, и стабильность хэша.
- Общий механизм — таблица полей по типам и функции strip — выносится в
  `static/fieldClasses.ts`; `VIEWER_FIELDS` и `VOLATILE_FIELDS` — два её экземпляра. Тест
  проверяет, что классы не пересекаются.

### Вошедший покупатель (лояльность, сегменты)

Гостевые лёгкие запросы одинаковы для всех: промо по BR-sp01 одни для гостя и покупателя, цен
по сегментам нет, сегментные скидки и промокоды применяются только в checkout. От покупателя
зависят `ProductVariant.loyalty` (баллы по тиру, `state`, `remainingUses`), `viewer*` у отзывов,
`savedForComparison`. Для них второй слой — **личный лёгкий запрос**:

| Слой      | Запрос                                 | Кто запрашивает  | Кеш                          | Что пишет в кеш                                   |
| --------- | -------------------------------------- | ---------------- | ---------------------------- | ------------------------------------------------- |
| Гостевой  | `SdkVolatileCards`, `SdkVolatileVariant`, `SdkStorefrontPromotions` | все              | CDN, `s-maxage` 30 с         | наличие, количество, ключи промо, цена по флагу   |
| Личный    | `SdkViewerVariants`                    | только с сессией | `POST`, `private, no-store`  | `loyalty`, в будущем `viewerPromotions`           |

```graphql
query SdkViewerVariants($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on ProductVariant {
      id
      loyalty { purchaseOpportunity { key state presentation { badge headline } reward { kind } } }
    }
  }
}
```

1. HTML один для всех и гостевой: базовые баллы лояльности из снимка.
2. После гидратации — гостевой батч, как у гостя.
3. Когда `SessionContext` увидел `shopana_signed_in` и получил токен, провайдер шлёт личный батч
   по тем же зарегистрированным id, `POST` с `Authorization`.
4. Ответ пишется в `ProductVariant:<id>.loyalty`, `useFragment` перерисовывает бейдж баллов.
5. Вход и выход на странице перезапускают личный батч; при выходе — гостевой запрос `loyalty`.

Гостевой и личный ответы пишут разные поля одной записи, порядок прихода не важен.

**`useViewerRefresh` без `evict`.** Сейчас он вызывает `evict` полей `loyalty`, и «активные
запросы перезапрашивают их». Риск (проверить): `ProductVariant.loyalty` читает `ProductPageQuery`
через `useSuspenseQuery` (`ProductPageSection/index.tsx:48`); при неполных данных Apollo,
вероятно, перезапросит весь `ProductPageQuery` — товар, до 100 вариантов, медиа — и секция уйдёт
в Suspense fallback. Вместо этого: `evict` не делается, гостевые баллы из снимка видны до
личного ответа, перезапрашивается только `loyalty` по id. `useViewerRefresh` становится
триггером личного батча; `VIEWER_FIELDS` остаётся для `stripViewerFields` при вливании
`page-data.json`. `viewer*` отзывов и `savedForComparison` — так же, своими маленькими запросами
по id отзывов и колонок.

**Сегментные промо в будущем** — отдельным полем схемы (`ProductVariant.viewerPromotions` в
pricing, internal), не тем же `promotions`: иначе гостевой кешируемый ответ может отдать гостю
промо чужого сегмента при ошибке с `Authorization`, а гостевое и личное значения затирали бы
друг друга в нормализованном кеше. Компонент объединяет оба списка по `key`; тексты сегментных
промо приходят в личном ответе целиком, а не через общий `storefrontPromotions`.

Цена карточки остаётся базовой для всех, сегментная скидка видна в корзине и checkout, как
сейчас. Если появятся цены по сегментам, `price` тоже станет личным полем: HTML показывает
базовую, личный запрос — цену покупателя.

Нагрузка: у гостя без изменений, у вошедшего +1 некешируемый `POST` на страницу (поиск по id в
loyalty, без рендера).

## Изменения в индексе и маппере событий

К `plans/static-invalidation-and-ci-builds.ru.md` (разделы «Аспекты», «Событие → изменения →
страницы», «Источники jobs»); сам файл правит владелец плана.

- **Аспект `promotions` (256) исчезает.** Полей в снимке больше нет, `Query#storefrontPromotions`
  не попадает в `page_deps`. Строка `discount*` маппера: ни одной страницы, только purge
  `sf-promo` и `sf-vol`. Эскалация «все страницы с аспектом» для скидок пропадает.
- **Аспект `inventory` (4) становится `availability`:** `availableForSale`, `currentlyNotInStock`,
  `Product.availableForSale`, а также `selectedOrFirstAvailableVariant` (выбор варианта карточки).
  `quantityAvailable` из таблицы удаляется. Причина `inventory` даёт изменения с флагом `lazy`:
  страницы помечаются dirty и рендерятся при обращении или ночью, с публикацией только при
  смене хэша. Поскольку в HTML только булево наличие, хэш меняется лишь при переходе «есть ↔ нет».
- **`pricing` (2) без изменений:** причина `pricing` рендерит сразу (SEO, Merchant Center).
- В `list`/`query` масках `availability` остаётся там, где состав зависит от наличия (правило
  `inStock` динамической коллекции), `pricing` — где есть правило по цене.
- `Change` получает поле `purgeTags?: string[]`; маппер заполняет его для `discount*`,
  `productUpdated` с `inventory`/`pricing`/`variant`. Координатор чистит теги сам.
- **Таймеры.** `TIME_FIELDS` (`static/entities.ts:24`) больше не видит `promotions.validUntil`
  и `endsAt` промо: таймеры перерендера остаются только для окон коллекций и прочего контента.
- Тест таблицы аспектов (каждое поле каждого фрагмента темы классифицировано) дополняется:
  поле из `VOLATILE_FIELDS` во фрагменте страницы — ошибка.

## Изменения по пакетам

### `packages/shopana-storefront-sdk`

- `modules/volatile/`: `operations.graphql` (`SdkVolatileCards`, `SdkVolatileVariant`,
  `SdkViewerVariants`), `VolatileDataProvider` (гостевой и личный батчи, `fetchedAt`,
  `visibilitychange`, таймеры `validUntil`, флаг `withPrice` из конфигурации хранилища), хуки
  `useVolatileCard(id)`, `useVolatileVariant(id, siblings)` (соединяет ключи промо с
  `storefrontPromotions`); провайдер подключается в `AppProviders`.
- `graphql/apollo/Environment.ts:157`: второй `HttpLink` с `useGETForQueries: true` для
  allow-list гостевых запросов (`SdkVolatileCards`, `SdkVolatileVariant`,
  `SdkStorefrontPromotions`), `authLink` для них не добавляет `Authorization` и visitor id.
  `SdkViewerVariants` идёт обычным `POST` с токеном. Это часть слоя 2 плана SSG, здесь он нужен
  уже на шаге A.
- `static/useViewerRefresh.ts`: без `evict`, запускает личный батч при смене сессии
  (согласовать с сессией, которая реализует этапы 2–6 плана SSG).
- `static/fieldClasses.ts`, `static/volatile.ts`: `VOLATILE_FIELDS`, `stripVolatileFields`,
  `keepFreshVolatileFields`; `viewer.ts` переходит на общий механизм.
- `useStorefrontPromotions`: `skip` на сервере и до гидратации, таймер `validUntil` остаётся.
- Таблица `STATIC_FIELD_ASPECTS` и маппер событий: см. раздел выше.

### `packages/shopana-storefront-runtime`

- `src/react-router/page.tsx:795` `applyStaticPageData`: `keepFreshVolatileFields`.
- Builder (`static-render.ts`, `static-site.ts`): `stripVolatileFields` перед записью
  `page-data.json` и хэшированием; отказ сборки, если в HTML-снимке нашлось летучее поле.
- Координатор: `purgeTags` из маппера, токен Cloudflare, флаг `lazy` у job.

### Тема `brand-bite-crunch`

- Убрать `quantityAvailable` и `promotions` из `ProductPageVariantFragment`
  (`ProductPageQuery.graphql:264,273–277`) и `quantityAvailable` из карточки
  (`useListingProductCardFragment.shopana.graphql:78`).
- `mapApiProductToProduct.ts:235–250`, `mapListingProductCard.ts:236–241`: `maxQuantity` и
  `promotions` берутся из `useVolatileVariant`, а не из фрагмента.
- `ProductPromotions`: скелетон до `ready`. Карточки, `StockStatus`, кнопки и
  `PriceAndSale` ничего не меняют: они читают кеш, который поправляет ответ; нужна только
  регистрация id (`useVolatileCard` в `ListingProductCard`, `useVolatileVariant` в секции товара
  и колонках сравнения).
- `templates/index/blocks/ProductCard.tsx:53,99`: убрать жёсткий `isAvailable: true` (отдельно,
  если блок показывает реальные товары).

### `internal` (только план, правит владелец)

- Gateway: плагин `Cache-Control`/`Cache-Tag` для гостевых persisted `GET`; response cache Hive
  с ключом по `Accept-Language` и склеиванием одновременных промахов; `ETag`; гостевые запросы
  SDK в манифесте и allow-list.
- Pricing (в будущем): сегментные промо отдельным полем `ProductVariant.viewerPromotions`.
- Открытый вопрос: событие `productUpdated` с `inventory` при переходе наличия «есть ↔ нет» от
  заказов. Сейчас его нет, и JSON-LD `availability` устаревает до ночной сборки.

### Инфраструктура

- `deploy/terraform/modules/frontend-edge/main.tf:9`: `/graphql` из bypass для `GET` с
  `documentId` без `Authorization` (шаг B).

## Тестирование

Только unit, typecheck, lint, build; без Playwright и e2e.

- SDK: батч (id копятся за кадр, сортируются, режутся по 100, повторно не запрашиваются 30 с);
  `stripVolatileFields`/`keepFreshVolatileFields` на нормализованном снимке и на списке ответов;
  классы полей не пересекаются; `ready` `false` при серверном рендере; соединение ключей промо
  с общим списком; `withPrice` включает и выключает цену; личный батч уходит только с сессией и
  с `Authorization`, гостевой — никогда с ним.
- `useViewerRefresh`: смена сессии не вызывает `evict` и не перезапрашивает `ProductPageQuery`,
  перезапрашивается только `SdkViewerVariants`.
- Слияние: снимок → ответ → `applyStaticPageData` другой страницы с тем же вариантом: в кеше
  остаются цена и наличие из ответа.
- Builder: в `page-data.json` и HTML нет `quantityAvailable` и `promotions`; два рендера с разными
  остатками (без перехода наличия) и разными промо дают одинаковый хэш.
- Маппер: `discount*` → нет страниц, `purgeTags: ['sf-promo', 'sf-vol']`; `inventory` → `lazy`.
- Gateway (internal): `Cache-Control` по `validUntil`, `Cache-Tag` по товарам, `no-store` с
  `Authorization`.
- Гидратация: тест рендера секции товара и карточки на сервере и в jsdom без сети — одинаковая
  разметка, скелетон промо на месте.

## Этапы

0. Проверить на stage: лимиты purge по тегам на Free, поведение `stale-while-revalidate` на
   Cloudflare, Hive response cache с `Accept-Language` и склеивание промахов; поведение
   `useSuspenseQuery` после `evict` (0,5 дня).
1. SDK: классы полей, три гостевых запроса и `SdkViewerVariants`, GET-линк, провайдер и хуки,
   `useViewerRefresh` без `evict` (2,5 дня).
2. Тема: фрагменты без летучих полей, регистрация id, скелетон промо (1 день).
3. Runtime: `applyStaticPageData`, strip в builder, хэш (0,5 дня).
4. Gateway: заголовки, response cache, манифест (1 день, internal).
5. Индекс и маппер: аспекты, `lazy`, `purgeTags` (1 день; после этапов плана инвалидации).
6. Шаг B: Cache Rule и purge по тегам (0,5 дня).

## Риски

- **SEO.** Цена и наличие в HTML и JSON-LD остаются; промо в HTML нет (поисковикам они не нужны,
  а показывать закончившееся промо боту хуже). Наличие из-за заказов устаревает в JSON-LD до
  ночной сборки или ленивого рендера (см. открытый вопрос в internal). Googlebot выполняет JS и
  получит свежий ответ из кеша CDN.
- **Нагрузка на gateway.** На шаге A один `GET` на просмотр, без response cache это поток
  `nodes` в catalog и pricing. Response cache обязателен до включения схемы на проде.
  Фрагментация ключей: бесконечная прокрутка и фильтры дают разные наборы id; hit rate меряется
  на stage, при плохом — переход на батч по товарам (вариант B). Размер каталога на размер
  запроса не влияет (см. «Масштаб каталога»). Вошедший даёт +1 некешируемый `POST` на страницу.
- **Цена в HTML и в корзине.** В режиме бакета окно от правки до публикации 1–1,5 минуты CI
  (`withPrice: false`); в режиме «статика в образе» лёгкий ответ с ценой закрывает его до 30 с
  (сразу после purge на шаге B). Скидки в цене карточки нет, промо
  считаются только в checkout; checkout остаётся источником правды по цене и остатку.
- **Без JS.** Видны цена и наличие на момент рендера, промо нет, количество не ограничено;
  кнопка «в корзину» и так требует JS.
- **CLS промо.** При расхождении снимка с ответом блок промо меняет высоту между ценой и кнопкой.
  Открытый вопрос для дизайна: скелетон фиксированной высоты или блок промо ниже кнопки.
- **Вариант карточки.** Закончившийся вариант карточки не заменяется другим до ленивого рендера.
- **Приватность.** Гостевой лёгкий запрос никогда не несёт visitor id и токен; проверка в тесте
  линка. Личные поля никогда не попадают в гостевые запросы: сегментные промо — только отдельным
  полем схемы.
- **Длина URL.** 100 id около 6 КБ; больше 100 id режется на несколько запросов.
