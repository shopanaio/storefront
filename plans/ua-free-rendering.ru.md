# Рендер без User-Agent: одна версия страницы на адрес

## Вывод

**Одна версия HTML на адрес достижима, и обвязки приложения можно отдавать в HTML обе.** От UA
на сервере зависит гораздо меньше, чем показывает сырой поиск. Из 288 совпадений `rg` по UA и
медиа-хукам реальных точек ветвления 54. Ещё 9 — инфраструктура, которая уходит целиком, 4 —
мёртвый код. Структурных различий разметки (класс «в») 10, из них 7 — это `AppSwitch` и пять
экранов стека. Остальное либо уже CSS, либо срабатывает только после взаимодействия и уже живёт на
`matchMedia` после гидратации.

**Рекомендация — полный вариант, но через минимальный как первый шаг.** Минимальный вариант
(в HTML мобильная версия, после гидратации уточнение) делается за 1,5–2 дня. Он сразу снимает
зависимость HTML от UA, и SSG может собирать одну версию страницы. Цена — пересборка стека и
сдвиг вёрстки на десктопе после гидратации. Полный вариант (обе обвязки в HTML, видимость по CSS,
после гидратации лишняя размонтируется) убирает и это. Его основная работа — слить `Screen` и
`DesktopScreen` в один кадр экрана и `MobileApp` с `DesktopApp` в одно приложение. Оценка 5–7 дней.

**Второй чанк почти ничего не стоит.** В текущей сборке (`.runtime/build`, 5 ноября) собственный
код мобильной обвязки — 2,2 КБ gzip, десктопной — 5,5 КБ gzip. Общая часть обоих приложений
весит 226 КБ gzip и грузится в любом случае. Поэтому одно приложение с обеими обвязками стоит
около 5,5 КБ лишнего на телефоне и снимает весь вопрос выбора чанка до гидратации.

**`isbot` в `entry.server.tsx` на разметку не влияет.** Он выбирает только момент ответа
(`onAllReady` или `onShellReady`), DOM после гидратации один и тот же. Для SSG нужен явный режим
«полный документ», а не подмена UA.

## Как устроено сейчас

Цепочка одна, и почти всё остальное от неё зависит:

1. `src/runtime/layout.tsx:95` оборачивает приложение в `ResponsiveProvider`.
2. `src/ui-kit/UserAgent/ResponsiveProvider.tsx:15-22` один раз в `useState` разбирает UA:
   на сервере — заголовок `user-agent` (`useServerRequestHeaders`), в браузере —
   `window.navigator.userAgent`.
3. `src/ui-kit/UserAgent/parseUserAgent.ts:3-13` (`ua-parser-js`): `isMobile` — только
   `device.type === 'mobile'`. Планшет даёт `isDesktop: false` и `isMobile: false`.
4. `ResponsiveClientProvider.tsx:25` кладёт `{ isMobile, isDesktop }` в `UAClientContext`,
   `useUA.ts:6` его читает.
5. Два потребителя контекста:
   - `src/mobile-app/AppSwitch.tsx:72,88-92` раз и навсегда выбирает `MobileApp` или
     `DesktopApp`, а `:48-54` до гидратации грузит чанк по `parseUserAgent(navigator.userAgent)`
     через `waitBeforeHydration`.
   - `src/hooks/useMediaQuery.ts:19-24` (`useAssumedViewportWidth`) выдаёт предполагаемую ширину:
     телефон — `xs` (375), десктоп — `xl` (1280), планшет — `md` (768). Хук работает в два шага:
     до `useHydrated()` — предположение, после — настоящий `matchMedia` (`:57-61`). На нём стоят
     `useIsMobile` (`max-width: 1023.95px`), `useIsDesktop` и `useBreakpoints`.

Кроме темы UA читают ещё четыре места. `entry.server.tsx:87-91` вызывает `isbot`, а SDK и
`storefront-auth` пересылают UA дальше в API (`directGateway.ts:27-28`, `routes.ts:759`,
`iamHeadless.ts:227-232`). `storefront-ui` и `checkout` от UA не зависят. Их
`useBreakpointDown` (`packages/storefront-ui/src/useMediaQuery.ts:16-33`) отдаёт на сервере
`defaultValue` (по умолчанию `false`, то есть десктоп) и сразу после гидратации переключается на
`matchMedia` синхронной перерисовкой.

Заголовка `Vary: User-Agent` runtime не ставит. Сегодняшний HTML нельзя класть в общий кеш CDN:
десктоп получил бы мобильную разметку, а `AppSwitch` загрузил бы чанк по своему UA, и гидратация
не совпала бы.

## Инвентаризация

Поиск: `rg` по `useUA`, `useIsMobile`, `isMobile`, `isDesktop`, `isTablet`, `ResponsiveProvider`,
`ResponsiveClientProvider`, `parseUserAgent`, `useMediaQuery`, `useBreakpoints`, `useBreakpoint`,
`Grid.useBreakpoint`, `AppSwitch`, `MobileApp`, `DesktopApp`, `waitBeforeHydration`, `isbot`,
`user-agent`, `userAgent`, `useAssumedViewportWidth`, `matchMedia`. Дополнительно: `innerWidth`,
`screen.width`, `ontouchstart`, `maxTouchPoints`, `pointer: coarse`, `isIOS`. Охват:
`themes/brand-bite-crunch/src` и все `packages/*/src` без `dist`, `lib`, `node_modules`.

Получилось 288 строк. Из них 17 — типы OpenAPI (`shopana-storefront-sdk/src/openapi/application-auth.ts`),
26 — тесты и `vitest.setup.ts` с заглушкой `matchMedia`, ещё около 10 — комментарии и реэкспорты.
`storefront-modal-stack` встречается только в `vitest.setup.ts`. `useViewportMetrics` и
`useKeyboardMetrics` читают `innerWidth` только в эффектах, от UA не зависят. `isIOS` и `isTablet`
из `parseUserAgent` нигде не используются.

Классы замены:

- **(а)** чистый CSS, медиа-запрос или antd Grid: обе версии в HTML, видимость задаёт `@media`;
- **(б)** поведение после взаимодействия или после гидратации: остаётся на `matchMedia`
  (`useIsMobile`, `useBreakpointDown`), во время гидратации не читается;
- **(в)** структурное различие разметки, которое нельзя скрыть CSS без двойного рендера;
- **(г)** серверная логика, не связанная с разметкой.

Вид ветвления: **Р** — разметка, **С** — CSS и размеры, **П** — поведение при взаимодействии,
**Ч** — выбор чанка, **Ст** — стриминг, **Код** — HTTP-статус.

### Источник UA: уходит целиком

| #   | Файл:строка                                                                                   | Что делает                                                       | Судьба                                              |
| --- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| И1  | `src/ui-kit/UserAgent/parseUserAgent.ts:3-13`                                                 | `UAParser` → `isMobile`, `isTablet`, `isDesktop`, `isIOS`        | удалить вместе с `ua-parser-js`, `@types/…`         |
| И2  | `src/ui-kit/UserAgent/ResponsiveProvider.tsx:15-22`                                           | заголовок `user-agent` на сервере, `navigator` в браузере        | удалить                                             |
| И3  | `src/ui-kit/UserAgent/ResponsiveClientProvider.tsx:25`                                        | контекст `UAClientContext`                                       | удалить                                             |
| И4  | `src/ui-kit/UserAgent/useUA.ts:6`                                                             | чтение контекста                                                 | удалить; потребители ниже                           |
| И5  | `src/runtime/layout.tsx:20,95,105`                                                            | обёртка `ResponsiveProvider` над `Theme`                         | убрать обёртку                                      |
| И6  | `src/hooks/useMediaQuery.ts:19-24,37-40`                                                      | `useAssumedViewportWidth`: 375 / 1280 / 768 по UA                | постоянная ширина                                   |
| И7  | `src/hooks/useIsMobile.ts:4-5`, `useBreakpoints.ts:4-22`                                      | обёртки над И6                                                   | остаются, становятся UA-независимыми автоматически  |
| И8  | `packages/storefront-ui/src/useMediaQuery.ts:16-33`                                           | `getServerSnapshot = defaultValue (false)`, без флага гидратации | общий флаг гидратации и та же предполагаемая ширина |
| И9  | `packages/shopana-storefront-runtime/src/react-router/hydration.ts:17`, `entry.client.tsx:23` | `waitBeforeHydration`: механизм, сам UA не читает                | остаётся; меняется только вызов в `AppSwitch`       |

### Точки ветвления

| #   | Файл:строка                                                                   | Что ветвится                                                                                     | Вид    | Класс | Замена                                                                                 |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------ | ----- | -------------------------------------------------------------------------------------- |
| 1   | `src/mobile-app/AppSwitch.tsx:48-54`                                          | до гидратации грузится чанк `MobileApp` или `DesktopApp` по `navigator.userAgent`                | Ч      | в     | ждать один чанк приложения без условий                                                 |
| 2   | `src/mobile-app/AppSwitch.tsx:72,88-92`                                       | `useUA().isMobile` раз и навсегда выбирает `MobileApp` или `DesktopApp`                          | Р, Ч   | в     | одно приложение с обеими обвязками (полный) или выбор после гидратации (минимальный)   |
| 3   | `src/mobile-app/activities/Home.tsx:21-39`                                    | `DesktopScreen` + `desktopPageEnd` или `Screen` + свой `SearchDockProvider` + `appHomeEnd`       | Р      | в     | один кадр экрана                                                                       |
| 4   | `src/mobile-app/activities/PageScreen.tsx:20-42`                              | `DesktopScreen` с подвалом или `Screen` с app bar, плавающей «назад», `backOverContent`          | Р      | в     | то же                                                                                  |
| 5   | `src/mobile-app/activities/Catalog.tsx:14-22`                                 | `Screen bleed` или `DesktopScreen` с `desktopPageEnd`                                            | Р      | в     | то же                                                                                  |
| 6   | `src/mobile-app/activities/Account.tsx:44-48`                                 | `Screen bleed` или `DesktopScreen`                                                               | Р      | в     | то же                                                                                  |
| 7   | `src/mobile-app/activities/Checkout.tsx:41-46`                                | `Screen bleed backOnRoot appBar={false}` или `DesktopScreen header={false}`                      | Р      | в     | то же                                                                                  |
| 8   | `src/templates/cart/sections/CartPageSection/index.tsx:25-28`                 | на телефоне `/cart` бросает `PageNotFound()`: на сервере это ответ 404                           | Р, Код | в     | решение продукта (см. «Открытые вопросы»): страница корзины для всех                   |
| 9   | `src/templates/cart/sections/CartDrawer/index.tsx:48,69`                      | кнопка «Переглянути кошик» скрыта на телефоне; ящик `dynamic(..., { ssr: false })`               | Р      | б     | `isSheet` из `useIsMobile()` (`:44`) или показывать всегда                             |
| 10  | `src/templates/collection/sections/CollectionPageSection/index.tsx:475,531`   | боковая колонка фильтров не рендерится для телефона; CSS уже прячет её ниже `lg` (`:693-697`)    | Р, С   | а     | рендерить всегда; замерить цену `ListingFilter` на телефоне                            |
| 11  | `src/templates/index/sections/SearchHero/index.tsx:45,73`                     | `compact={isMobile}` у композера: класс `styles.compact` (`Composer.tsx:188,427`)                | С      | а     | `compact`-стили под `mq.max.lg` в `Composer.tsx`, проп убрать                          |
| 12  | `src/layouts/theme/CompactHeader.tsx:56,135-160`                              | кнопка ящика навигации или меню категорий                                                        | Р, С   | а     | обе в DOM, видимость по `mq.lg`                                                        |
| 13  | `src/layouts/theme/CompactHeader.tsx:167`                                     | размер логотипа 32 или 40                                                                        | С      | а     | размер через CSS                                                                       |
| 14  | `src/layouts/theme/CompactHeader.tsx:172-182,190,219-228`                     | кнопка «Бажання», подписи аккаунта и корзины                                                     | Р, С   | а     | `display: none` ниже `lg`                                                              |
| 15  | `src/layouts/theme/CompactHeader.tsx:112`                                     | зависимость эффекта замера мега-меню                                                             | П      | б     | без изменений                                                                          |
| 16  | `src/layouts/theme/PageLayout.tsx:21,28`                                      | хлебные крошки только на десктопе                                                                | Р, С   | а     | `display: none` ниже `lg`                                                              |
| 17  | `src/layouts/theme/AppDrawer/AppDrawer.tsx:50,124`                            | `placement` снизу или слева; ящик `ssr: false`                                                   | П      | б     | без изменений                                                                          |
| 18  | `src/layouts/theme/SearchDock/VoiceTrack.tsx:49,64`                           | настоящий микрофон только на десктопе, в эффекте                                                 | П      | б     | без изменений                                                                          |
| 19  | `src/layouts/theme/SearchDock/ComposerSearch.tsx:54,64`                       | отправка: модальный ассистент или телефонный чат                                                 | П      | б     | без изменений                                                                          |
| 20  | `src/layouts/theme/SearchDock/ComposerSearch.tsx:73`                          | `opensDialog`: `readOnly`, `data-expandable`, `previewable` у композера (`Composer.tsx:175-243`) | Р, П   | б     | решать в `onPointerDown` по `matchMedia`, атрибуты в HTML нейтральные                  |
| 21  | `src/assistant/chat/SelectionCard.tsx:109,136,148`                            | где стоит метка «в кошику»; чат только на клиенте                                                | Р      | б     | без изменений (можно перевести в CSS)                                                  |
| 22  | `src/assistant/ui/SignInNudgeSheet.tsx:16,19`                                 | шторка или `Modal`, открывается событием                                                         | П      | б     | без изменений                                                                          |
| 23  | `src/assistant/ui/HowItWorks.tsx:32,69`                                       | шторка или `Modal` по клику                                                                      | П      | б     | без изменений                                                                          |
| 24  | `src/ui-kit/Confirm/useConfirm.tsx:17,26`                                     | мобильный ящик подтверждения или `modal.confirm`, внутри колбэка                                 | П      | б     | без изменений                                                                          |
| 25  | `src/templates/product/blocks/Questions/QuestionEditorModal.tsx:47-132`       | форма вопроса в шторке или в модалке, по клику                                                   | П      | б     | без изменений                                                                          |
| 26  | `src/templates/product/blocks/Rate/RateModal.tsx:9,26`                        | шторка или модалка; `LayoutOverlays` грузит её с `ssr: false`                                    | П      | б     | без изменений                                                                          |
| 27  | `src/templates/product/blocks/Rate/ReviewGalleryModal.tsx:43,146`             | шторка или модалка по клику                                                                      | П      | б     | без изменений                                                                          |
| 28  | `src/templates/collection/blocks/SelectionRules/index.tsx:71,76`              | клик: телефонный чат или модальный ассистент                                                     | П      | б     | без изменений                                                                          |
| 29  | `src/templates/collection/blocks/FilterDrawer/index.tsx:30,122`               | `placement` ящика фильтров, по клику                                                             | П      | б     | без изменений                                                                          |
| 30  | `src/templates/cart/sections/CartDrawer/index.tsx:44`                         | `isSheet`: шторка или модалка, `ssr: false`                                                      | П      | б     | без изменений                                                                          |
| 31  | `src/templates/shared/atoms/UniversalSwiper.tsx:131-132,185`                  | `slidesPerView`, `dynamicBullets` по `useBreakpoints`; `key` по `useIsMobile` пересоздаёт Swiper | Р, С   | а     | до гидратации `StaticSwiper` с CSS по `breakpoints` (`Swiper.tsx:144`), после — Swiper |
| 32  | `src/templates/shared/atoms/SliderNavButtons.tsx:148-155`                     | кнопки листания не рендерятся, если страница одна                                                | Р, С   | а     | число страниц по брейкпоинтам — CSS                                                    |
| 33  | `src/templates/shared/atoms/SwiperContainer.tsx:24-35`                        | отступы контейнера по брейкпоинтам                                                               | С      | а     | `@media` в стилях                                                                      |
| 34  | `src/templates/product/atoms/ProductCollapse/index.tsx:22,38`                 | `Grid.useBreakpoint()`: заголовок `h3` или `h4`; на сервере `{}`, то есть всегда `h4`            | Р, С   | а     | один уровень, размер через CSS                                                         |
| 35  | `src/templates/product/blocks/ProductGallery/index.tsx:93`                    | превью только на `lg`, `matchMedia` в обработчике клика                                          | П      | б     | уже правильно                                                                          |
| 36  | `src/templates/index/sections/PetCategoryBanners/motion.tsx:152,167,184`      | пружина, гироскоп, курсор — `matchMedia` в эффектах                                              | П      | б     | уже правильно                                                                          |
| 37  | `src/templates/index/sections/PetCategoryBanners/DepthAnimal.tsx:13-26`       | `hover: hover` после `useHydrated`                                                               | П      | б     | уже правильно                                                                          |
| 38  | `src/templates/index/sections/SearchHero/useTypewriter.ts:11-38`              | `prefers-reduced-motion` после `useHydrated`                                                     | П      | б     | уже правильно                                                                          |
| 39  | `src/hooks/useRipple.ts:19`                                                   | `prefers-reduced-motion` в обработчике                                                           | П      | б     | уже правильно                                                                          |
| 40  | `src/hooks/useScrollToTopOnListingChange.ts:19`                               | то же, в эффекте                                                                                 | П      | б     | уже правильно                                                                          |
| 41  | `src/components/ErrorScreen/runner/engine.ts:268`                             | то же, в игре экрана ошибки                                                                      | П      | б     | уже правильно                                                                          |
| 42  | `src/ui-kit/IframeWidget/MediaMatch.ts:19-22`                                 | обёртка `matchMedia` с проверкой SSR                                                             | П      | б     | уже правильно                                                                          |
| 43  | `src/modules/account/views/AccountSections.tsx:1669`                          | `navigator.userAgent` для поиска своей сессии IAM; не класс устройства                           | П      | б     | уже правильно                                                                          |
| 44  | `packages/storefront-ui/src/drawer/DrawerBase.tsx:129-134,183`                | `isSheet`: снизу или справа, кнопка закрытия; закрытый ящик в HTML не попадает                   | П      | б     | без изменений                                                                          |
| 45  | `packages/storefront-ui/src/drawer/ResponsiveDialog.tsx:83-118`               | шторка или диалог                                                                                | П      | б     | без изменений                                                                          |
| 46  | `packages/storefront-ui/src/phone/CountryPicker.tsx:118,139`                  | нативный `<select>` или поповер; триггер виден в форме                                           | Р      | а     | оба триггера в DOM, видимость по `mq`                                                  |
| 47  | `packages/checkout/src/components/CheckoutView.tsx:36-63`                     | `stacked`: строки заказа сверху или в сводке, комментарий в сводке                               | Р      | в     | в SSG checkout — оболочка; после гидратации как сейчас                                 |
| 48  | `packages/checkout/src/components/summary/SummaryLines.tsx:44,93`             | список строк или свёрнутый блок                                                                  | Р      | в     | то же                                                                                  |
| 49  | `packages/checkout/src/components/BrandHeader.tsx:20-21`                      | кнопка корзины в шапке checkout ниже `lg`                                                        | Р, С   | а     | CSS                                                                                    |
| 50  | `packages/checkout/src/ui/SearchDrawerHeader.tsx:21`                          | кнопка закрытия в ящике поиска                                                                   | П      | б     | без изменений                                                                          |
| 51  | `packages/storefront-auth/src/ui/containers/surfaces.tsx:37,51`               | кнопка закрытия в ящике входа                                                                    | П      | б     | без изменений                                                                          |
| 52  | `packages/shopana-storefront-runtime/src/react-router/entry.server.tsx:87-91` | `isbot(user-agent)`: `onAllReady` вместо `onShellReady`                                          | Ст     | г     | явный режим «полный документ» для SSG                                                  |
| 53  | `packages/shopana-storefront-sdk/src/server/directGateway.ts:27-28`           | пересылает UA покупателя в прямой шлюз GraphQL                                                   | —      | г     | без изменений; у builder уйдёт его собственный UA                                      |
| 54  | `packages/storefront-auth/src/server/routes.ts:759`, `iamHeadless.ts:227-232` | UA покупателя в заголовке `shopana-end-user-agent` для сессий IAM                                | —      | г     | без изменений: это запросы входа, не HTML страницы                                     |

### Мёртвый код

| Файл                                                        | Что там                                   | Почему мёртвый                                                                                                                                                               |
| ----------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/layouts/theme/Header.tsx:50-145`                       | 11 упоминаний `isMobile`, `DesktopSearch` | только `component: Header` в `HeaderSection.config.ts:383`; `HeaderSection.tsx` и `Layout.tsx` никто не импортирует, layout страниц — `@n/theme` → `layouts/theme/index.tsx` |
| `src/templates/search/blocks/DesktopSearch/index.tsx:33-96` | 9 упоминаний                              | импортирует только `Header.tsx`                                                                                                                                              |
| `src/templates/search/atoms/SearchInput/index.tsx:49-74`    | кнопка вместо поля на телефоне            | импортирует только `DesktopSearch`                                                                                                                                           |
| `src/hooks/useIsDesktop.ts:4`                               | `useMediaQuery({ minWidth: xl })`         | потребителей нет                                                                                                                                                             |

Удалить их можно отдельно: правка `HeaderSection.config.ts` (`component`) нужна, но на рендер это
не влияет. В подсчёт ниже они не входят.

### Итоги по классам

| Класс                    | Мест | Из них правки нужны | Где                                                                                          |
| ------------------------ | ---- | ------------------- | -------------------------------------------------------------------------------------------- |
| (а) CSS / медиа-запрос   | 12   | 12                  | 10–14, 16, 31–34, 46, 49                                                                     |
| (б) после взаимодействия | 29   | 2                   | 9 (переход с `useUA` на `useIsMobile`), 20 (атрибуты композера); остальные 27 уже правильные |
| (в) структурные          | 10   | 8                   | 1–8; 47–48 в checkout уже без UA, для SSG checkout — оболочка                                |
| (г) серверные            | 3    | 1                   | 52 (`isbot` → явный режим); 53–54 не трогать                                                 |
| **Всего**                | 54   | 23                  |                                                                                              |
| Инфраструктура (И1–И9)   | 9    | 7                   | И1–И6, И8                                                                                    |
| Мёртвый код              | 4    | по желанию          |                                                                                              |

По файлам темы: `useUA()` вызывают 11 файлов (10 потребителей плюс `useMediaQuery`),
`useIsMobile()` — 19 файлов (из них 3 мёртвых), `useBreakpoints()` — 3, `Grid.useBreakpoint` — 1.
В этих файлах 86 упоминаний `isMobile`, `isPhone` и `isSheet`. Цифры из исходной оценки
(34 файла, 99 мест) получаются, если считать каждую строку и тестовые моки отдельно.

Важное наблюдение: **все (б) на `useIsMobile` работают без правок в любом варианте.** Хук уже
отдаёт настоящий `matchMedia` после гидратации, а эти компоненты до взаимодействия либо не
рендерятся (`ssr: false`, закрытые ящики), либо читают значение в обработчике или эффекте. Правка
нужна только в источнике предположения (И6), и они перестают зависеть от UA сами.

## Обвязки приложения

### Что общее, что различается

| Часть                                      | `MobileApp.tsx`                                             | `DesktopApp.tsx`                                                                     |
| ------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `useStackApp(initialEntry)`                | да (`:28-29`)                                               | да (`:31-32`)                                                                        |
| `NavigationScope onNavigate={openInStack}` | да (`:33`)                                                  | да (`:53`)                                                                           |
| `InitialPageContext`                       | да                                                          | да                                                                                   |
| `Stack`                                    | переходы по правилам `navigate` (справа, снизу, fade)       | `presentFrom="fade"`: любое движение — fade (`StackFlow/index.tsx:1433-1434,1547`)   |
| Обёртка                                    | `div` `relative` + `isolation`                              | `div.root` то же, шапка `position: fixed` над экранами                               |
| `TabBar` + `useScrollAwayTabBar`           | да (`:27`, `:37`)                                           | —                                                                                    |
| `CompactHeader`                            | —                                                           | да, высота замеряется в `--app-header-height` (`:39-49`), скрыта на checkout (`:36`) |
| `HeaderAppDrawer`                          | на корне (`:42`)                                            | внутри `CompactHeader` (`CompactHeader.tsx:232`)                                     |
| `LayoutOverlays`                           | да (`:40`)                                                  | да (`:63`)                                                                           |
| `SearchDockProvider`                       | только вокруг страницы на `Home` (`activities/Home.tsx:35`) | на корне (`:55`)                                                                     |
| `SearchDock`                               | —                                                           | да (`:64`)                                                                           |

Экраны (`activities/*`) общие, но каждый сам выбирает кадр по `useUA()`:

- `components/Screen.tsx`: `AppScreen` с app bar движка (назад/крестик, логотип или название
  чата, поиск справа), плавающая «назад» без app bar, место под таб-бар (`:181-183`),
  `bleed`/`fill`.
- `components/DesktopScreen.tsx`: `AppScreen appBar={null}`, место под шапку
  `var(--app-header-height, 53px / 57px)` (`:59-65`), `<main>` и подвал (`desktopPageEnd`).

`Chat` (`activities/Chat.tsx`) всегда мобильный `Screen` и в HTML не попадает: он не пишет
историю и не открывается по адресу (`Stack.ts:79-82`).

### Какое состояние держат обёртки

- **Стек** — в `useState` компонента `Stack` (`StackFlow/index.tsx:1323-1342`): записи,
  направление, `presentFrom` переходов, закрывающиеся экраны, виртуальный экран, ключи
  смонтированных и `openedOnKey`. Плюс модульные `current` и `controllerRef` (`:1346-1360`) и
  роутер (`setRouter` из `useStackApp.ts:49-51`). Размонтирование `Stack` теряет глубину стека,
  позиции прокрутки экранов и локальное состояние страниц. Кеш Apollo и история браузера
  остаются.
- **`useNavigationStore`** (`activity.ts:75-85`, zustand на уровне модуля): `tab`, `top`,
  `topBranch`, `scrolledAway`. Переживает смену обвязки; `useStackApp` перезаписывает его при
  монтировании (`useStackApp.ts:26-34`).
- **`useModalStore`** (корзина, ящик навигации, поиск) — модульный, переживает.
- **`NavigationScope`** — только контекст с обработчиком, своего состояния нет.
- **`InitialPageContext`** — `useState(routerPage)` в `useRouterHistory` (`useStackApp.ts:47`).
- **`SearchDockContext`** — `heroScrolledPast` в провайдере. Сейчас на телефоне провайдер свой на
  каждом `Home`, на десктопе один на приложение.
- **`DesktopApp`** — переменная высоты шапки на корне и `ResizeObserver`.

### Можно ли один `Stack` с обеими обвязками

Да. `Stack` создаётся один раз на модуль (`Stack.ts:51`, `stackflow({...})`) и уже общий для обоих
приложений: два `Stack` одновременно не нужны и невозможны. Различия сводятся к трём вещам:

1. **Хром вокруг стека** (`TabBar` или `CompactHeader` + `SearchDock`). Обе обвязки рендерятся в
   HTML, каждая в обёртке с `display: none` по `mq.lg` / `mq.max.lg`. После гидратации лишняя
   размонтируется хуком «обе до гидратации, одна после»:
   `const mounted = !hydrated || matches(query)`. Её эффекты (`useScrollAwayTabBar`, замер шапки,
   слушатель прокрутки `CompactHeader`) работают только у активной.
2. **Кадр экрана** (`Screen` или `DesktopScreen`). Нужен один компонент, в котором есть и app bar
   движка (скрыт с `lg`), и место под шапку (скрыто ниже `lg`), и место под таб-бар (ниже `lg`).
   Содержимое страницы стоит в дереве на одном месте, поэтому смена ширины его не пересоздаёт.
3. **Переходы** (`presentFrom="fade"`). Это поведение (б): `Stack` читает проп только при
   движении, его можно брать из `useMediaQuery` после гидратации.

Что придётся развести:

- `HeaderAppDrawer` смонтирован дважды, если в DOM обе обвязки: в `MobileApp.tsx:42` и в
  `CompactHeader.tsx:232`. Оба ящика слушают один флаг стора. Ящик нужно вынести на корень
  приложения и в `layouts/theme/index.tsx`, а из `CompactHeader` убрать.
- `SearchDockProvider` нужен один на корне. Мобильный `Home` перестаёт оборачивать страницу.
- Подвал: мобильные экраны деталей и списков сейчас без подвала, десктопные — с подвалом
  (`desktopPageEnd`), у мобильного `Home` — `appHomeEnd` с местом под таб-бар. Один `FooterSection`
  с местом под таб-бар ниже `lg` и `display: none` на экранах, где у телефона подвала нет.
  Нужно проверить, не требует ли дизайн подвал на мобильных деталях.
- `AppScreen` движка с app bar и без него различается структурой: нужно проверить, что скрытый
  app bar (`display: none`) не оставляет отступа и не ломает анимации `appBarSet`
  (`StackFlow/index.tsx:1492-1496`, `:680-725`).

### Несовпадение предположения и вьюпорта

Что происходит сегодня и в каждом варианте, если в HTML одна версия, а экран другой:

| Что              | Минимальный вариант (HTML мобильный, экран десктопный)                                                       | Полный вариант                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Первая отрисовка | мобильный app bar, таб-бар, компактный композер, без боковых фильтров и крошек — на широком экране           | правильная с первого кадра: видимость задаёт CSS                       |
| После гидратации | `AppSwitch` меняет `MobileApp` на `DesktopApp`: стек размонтируется, страница рендерится заново              | лишняя обвязка размонтируется; страница не пересоздаётся               |
| Догрузка чанка   | `DesktopApp` + `CompactHeader` (5,5 КБ gzip); можно начать до гидратации по `matchMedia` при загрузке модуля | нет: обвязки в одном чанке                                             |
| CLS              | большой: шапка, сетка листинга, подвал                                                                       | около нуля; остаются места (б), которые меняются только после действия |
| Запросы данных   | нет: кеш Apollo тот же                                                                                       | нет                                                                    |

Как уменьшить в минимальном варианте:

- Чанк другой обвязки грузить при загрузке модуля `AppSwitch` по `matchMedia` (в модуле, а не в
  рендере, поэтому это не чтение во время гидратации), не дожидаясь гидратации.
- Переключение делать в переходе. Флаг `useHydrated` уже ставится в `startTransition`
  (`storefront-sdk/src/core/Hydrated.tsx:24-26`), поэтому `lazy` в переходе не покажет `fallback`:
  React держит старый экран, пока не готов новый.
- Решать один раз сразу после гидратации и потом не следовать изменению ширины. Сегодня выбор
  тоже фиксирован на всю жизнь `AppSwitch`. Повторная смена посреди работы теряла бы стек.
- Опционально: встроенный скрипт в `<head>` ставит `data-viewport` на `<html>` по `matchMedia`, а
  CSS прячет `#app` до переключения. Это убирает показ чужой вёрстки ценой задержки первой
  отрисовки на десктопе. На `<html>` уже есть `suppressHydrationWarning` (`layout.tsx:122`),
  атрибут ошибок не даст. Делать только если сдвиг окажется заметнее задержки.

## Правило гидратации

Во время гидратационного прохода нельзя читать `window`, `matchMedia`, `navigator`: первый рендер
в браузере обязан совпасть с HTML. Всё, что зависит от экрана, читает `useHydrated()` и до него
отдаёт постоянное предположение, одинаковое на сервере и в браузере. Флаг ставится в переходе,
поэтому перерисовка после гидратации не блокирует ввод и не гидратирует лениво пропущенные
границы синхронно (комментарий в `Hydrated.tsx:15-21`).

Сегодня так работает только `src/hooks/useMediaQuery.ts`, и предположение там зависит от UA.
`storefront-ui` (`useMediaQuery.ts:28-32`) использует `getServerSnapshot` без флага: React
гидратирует с `defaultValue`, а потом синхронно перерисовывает, если `matchMedia` не совпал. Ошибки
это не даёт, но даёт длинную задачу. Значение по умолчанию (десктоп) расходится с мобильным
предположением темы. Поэтому в обоих вариантах `storefront-ui` получает флаг гидратации и
предполагаемую ширину через `StorefrontUIProvider`. Тема передаёт их в `ui-kit/Theme/Theme.tsx:44`,
вложенный провайдер checkout (`CheckoutProviders.tsx:54`) меняет только свои поля. Без провайдера
(тесты, Storybook пакетов) хук ведёт себя как «уже гидратировано» — так же, как `HydratedContext`
по умолчанию `true` (`Hydrated.tsx:13`).

## Граница «мобильное приложение»

Сегодня граница — класс устройства: телефон получает `MobileApp`, планшет — `DesktopApp`, в
котором `CompactHeader` ниже `lg` всё равно показывает кнопку ящика (`useIsMobile`). Без UA
граница должна быть медиа-запросом. Предлагается `(max-width: 1023.95px)`, то есть `mq.max.lg`:

- ровно та же граница у `useIsMobile` (`hooks/useIsMobile.ts:5`), у шторок `DrawerBase`
  (`storefront-ui/src/breakpoints.ts`, `drawerSheet: below('lg')`) и у `stacked` в checkout;
- планшет в портрете (768–1023) получит таб-бар вместо компактной шапки. Это изменение дизайна,
  его нужно подтвердить;
- телефон в альбомной ориентации (до 932 px) остаётся мобильным, как сейчас.

Альтернатива — `md` (768): планшет остаётся десктопным, но тогда граница обвязки расходится с
границей всех шторок и `useIsMobile`. Не рекомендуется.

## Вариант 1: минимальный

### Какую версию класть в HTML: мобильную

- **Индексация.** Google индексирует мобильную версию (mobile-first), основной краулер ходит со
  смартфонным UA. Без UA он получит мобильный HTML, тот же, что сегодня.
- **Цена ошибки.** При несовпадении перерисовка, догрузка чанка и пересборка стека ложатся на
  устройство, где предположение не сработало. Слабый телефон и медленная сеть хуже переносят
  лишний рендер, чем десктоп. Мобильное предположение переносит эту работу на десктоп.
- **Доля трафика.** Для e-commerce обычно больше половины — телефоны. Точную долю нужно взять из
  аналитики магазина; от неё зависит только то, сколько людей увидят сдвиг, не выбор.
- **Цена HTML.** Мобильная разметка меньше: нет меню категорий, боковых фильтров, крошек.

### Правки по файлам

| Файл                                                                                         | Правка                                                                                                                                                                                                                                                                                                   | Объём     |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `src/ui-kit/UserAgent/*` (4 файла)                                                           | удалить; вместо них `src/ui-kit/Viewport/viewport.ts`: `APP_MOBILE_QUERY = '(max-width: 1023.95px)'`, `ASSUMED_VIEWPORT_WIDTH = breakpoints.xs`, контекст `AppVariantContext` (`'mobile' \| 'desktop'`) и `useAppVariant()`                                                                              | −80 / +30 |
| `package.json` темы                                                                          | убрать `ua-parser-js`, `@types/ua-parser-js`                                                                                                                                                                                                                                                             | 2 строки  |
| `src/runtime/layout.tsx:20,95,105`                                                           | убрать `ResponsiveProvider`                                                                                                                                                                                                                                                                              | −3        |
| `src/hooks/useMediaQuery.ts:19-24,37`                                                        | `useAssumedViewportWidth` → `ASSUMED_VIEWPORT_WIDTH`; убрать импорт `useUA`                                                                                                                                                                                                                              | −8        |
| `src/mobile-app/AppSwitch.tsx:48-54`                                                         | `waitBeforeHydration(loadMobileApp())` без условия; рядом `if (!matchMedia(APP_MOBILE_QUERY).matches) void loadDesktopApp()` — предзагрузка без ожидания                                                                                                                                                 | ~6        |
| `src/mobile-app/AppSwitch.tsx:72,88-92`                                                      | `variant` в состоянии: `'mobile'`, пока `useHydrated()` ложно; при первом `hydrated` один раз `matchMedia(APP_MOBILE_QUERY)` и, если не совпало, смена в `startTransition`. `App` выбирается по `variant`, `<AppVariantContext.Provider>` вокруг `App`. При смене `entry` пересчитать из текущего `href` | ~25       |
| `src/mobile-app/activities/{Home,PageScreen,Catalog,Account,Checkout}.tsx`                   | `useUA().isMobile` → `useAppVariant() === 'mobile'`: кадр обязан совпасть с обвязкой, поэтому из контекста `AppSwitch`, а не из `matchMedia`                                                                                                                                                             | 5 × 2     |
| `src/templates/cart/sections/CartPageSection/index.tsx:25-28`                                | убрать `MobileCartNotFound`: `/cart` рендерит страницу для всех (см. «Открытые вопросы»)                                                                                                                                                                                                                 | −4        |
| `src/templates/cart/sections/CartDrawer/index.tsx:9,48,69`                                   | `useUA` → `isSheet` (или кнопка «Переглянути кошик» для всех, если страница корзины есть у всех)                                                                                                                                                                                                         | 3         |
| `src/templates/collection/sections/CollectionPageSection/index.tsx:39,475,531`               | колонку фильтров рендерить всегда; CSS уже прячет её ниже `lg`                                                                                                                                                                                                                                           | −3        |
| `src/templates/index/sections/SearchHero/index.tsx:15,45,73` + `SearchDock/Composer.tsx:427` | стили `compact` под `mq.max.lg`, проп `compact` убрать у героя                                                                                                                                                                                                                                           | ~8        |
| `packages/storefront-ui/src/useMediaQuery.ts`, `StorefrontUIProvider.tsx`                    | поле `viewport: { hydrated, assumedWidth }` в контексте; до `hydrated` запрос считается по ширине (разбор `min-width`/`max-width`), после — `matchMedia`; опцию `defaultValue` убрать                                                                                                                    | ~40       |
| `src/ui-kit/Theme/Theme.tsx:44`                                                              | передать `viewport={{ hydrated: useHydrated(), assumedWidth: ASSUMED_VIEWPORT_WIDTH }}`                                                                                                                                                                                                                  | 2         |
| `packages/storefront-ui` тесты                                                               | проверка «до гидратации — по ширине, после — `matchMedia`»                                                                                                                                                                                                                                               | ~40       |

Итого около 15 файлов и 1,5–2 дня с проверкой. Классы (а) кроме 10 и 11 в этом варианте
не трогаются: они уже на `useIsMobile` / `useBreakpoints` и с мобильным предположением дают
правильный мобильный HTML, а на десктопе перерисовываются после гидратации.

### Как сохраняется совпадение гидратации

Сервер и первый рендер в браузере берут одно и то же: `variant = 'mobile'`,
`ASSUMED_VIEWPORT_WIDTH = 375` и тот же `assumedWidth` для `storefront-ui`. `matchMedia` читается
только в эффекте после `hydrated` и при загрузке модуля для предзагрузки. Чанк `MobileApp`
ожидается до гидратации на любом устройстве, поэтому граница `Suspense` в `AppSwitch.tsx:109`
гидратируется готовой.

### Чанки

На телефоне — ровно как сейчас: один `MobileApp`. На десктопе `MobileApp` нужен для гидратации, а
`DesktopApp` догружается параллельно и заменяет его после. Второй чанк — 5,5 КБ gzip, общая часть
(226 КБ) уже загружена.

### `entry.server.tsx` и `isbot`

Разметка от него не зависит, вариант 1 его не трогает. Для SSG в runtime добавляется явный режим
рендера (опция `handleRequest` или заголовок builder): «полный документ», то есть `onAllReady`.
`isbot` остаётся только для живого SSR.

### Тесты и Storybook

- Тесты темы (15 файлов `*.test.*`) UA не используют. `vitest.setup.ts` пакетов дают заглушку
  `matchMedia` с `matches: false`. С флагом гидратации по умолчанию `true` поведение не меняется.
  10 тестов checkout подменяют `matchMedia` сами, им тоже ничего не нужно.
- Storybook темы (`STORYBOOK=true`, `storybook/preview.tsx`) не ставит ни `ResponsiveProvider`, ни
  `HydratedProvider`. Сейчас `useUA()` там даёт `{}`, то есть десктопные кадры и десктопную
  `CartPage`, а `useMediaQuery` уже работает на `matchMedia`, потому что `useHydrated()` без
  провайдера — `true`. После правки `useAppVariant()` без провайдера должен отдавать вариант по
  `matchMedia`: истории без обёрток начинают следовать переключателю вьюпорта Storybook.
  Корневой Storybook пакетов (`.storybook/`, пилот checkout) не меняется.

### Checkout и account на стеке

Оба — экраны стека (`routes.ts:64-70`), их кадр выбирает активность. Account в HTML — это
`RuntimePage` модуля, внутри которого UA не читается. Checkout: `CheckoutView` сейчас на любом
устройстве отдаёт в HTML десктопную раскладку (`defaultValue: false`). С общей предполагаемой
шириной он отдаст мобильную, в одну линию с кадром. В плане SSG обе страницы — оболочки
(`static-site-generation.ru.md`, «Оболочки (shell)»), их содержимое рисуется после гидратации, и
класс (в) у 47–48 на статику не влияет.

## Вариант 2: полный

Цель: HTML один, правильный на любом экране с первого кадра. Ни один хук не выбирает разметку до
гидратации.

### Правки по файлам

| Файл                                                                                            | Правка                                                                                                                                                                                                                                                                                                                                                                                         | Объём         |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| всё из варианта 1, кроме `AppSwitch` и активностей                                              | `ui-kit/UserAgent` удалён, `useMediaQuery` с постоянной шириной, `storefront-ui` с флагом, корзина, листинг, герой                                                                                                                                                                                                                                                                             | как выше      |
| `src/mobile-app/MobileApp.tsx` + `DesktopApp.tsx` → `src/mobile-app/App.tsx`                    | одно приложение: `useStackApp`, `NavigationScope`, `InitialPageContext`, `SearchDockProvider`, `HeaderAppDrawer` и `LayoutOverlays` по одному разу; `<MobileChrome>` (`TabBar`, `useScrollAwayTabBar`) и `<DesktopChrome>` (фиксированная шапка с замером, `CompactHeader`, `SearchDock`), каждая в обёртке с `display: none` по `mq` и с `useChromeMounted(query)` = `!hydrated \|\| matches` | ~120 (из 130) |
| `src/mobile-app/hooks/useChromeMounted.ts` (новый)                                              | «обе до гидратации, одна после», `useSyncExternalStore` с флагом `useHydrated`                                                                                                                                                                                                                                                                                                                 | ~25           |
| `src/mobile-app/AppSwitch.tsx`                                                                  | один `lazy(() => import('./App'))`; `waitBeforeHydration(loadApp())` без условия; `useUA`, `parseUserAgent`, два `loaded*` уходят                                                                                                                                                                                                                                                              | −30           |
| `src/mobile-app/components/Screen.tsx` + `DesktopScreen.tsx` → один `Screen`                    | `AppScreen` с app bar движка (с `lg` — `display: none`), место под шапку `var(--app-header-height)` (ниже `lg` — `display: none`), место под таб-бар ниже `lg`, плавающая «назад» ниже `lg`; проп `header={false}` для checkout; подвал по пропу `end`                                                                                                                                         | ~80           |
| `src/mobile-app/activities/{Home,PageScreen,Catalog,Account,Checkout}.tsx`                      | ветвление уходит: один `<Screen …>` с пропами обеих сторон; `Home` без своего `SearchDockProvider`; `appHomeEnd` и `desktopPageEnd` → один конец с местом под таб-бар через CSS                                                                                                                                                                                                                | 5 × −10       |
| `src/mobile-app/App.tsx` → `Stack`                                                              | `presentFrom={desktop ? 'fade' : undefined}` из `useMediaQuery({ minWidth: lg })` — после гидратации, читается только при движении                                                                                                                                                                                                                                                             | 2             |
| `src/layouts/theme/CompactHeader.tsx:56,135-232`                                                | кнопка ящика и меню обе в DOM, логотип, «Бажання», подписи — `@media`; `<HeaderAppDrawer />` (`:232`) убрать; `isMobile` остаётся только в зависимостях эффекта (`:112`)                                                                                                                                                                                                                       | ~30           |
| `src/layouts/theme/index.tsx`                                                                   | `<HeaderAppDrawer />` рядом с `CompactHeader`, раз он ушёл из шапки                                                                                                                                                                                                                                                                                                                            | 1             |
| `src/layouts/theme/PageLayout.tsx:21,28`                                                        | крошки всегда, ниже `lg` — `display: none`                                                                                                                                                                                                                                                                                                                                                     | 4             |
| `src/layouts/theme/SearchDock/ComposerSearch.tsx:73` + `Composer.tsx:175-243`                   | `opensDialog` решается в `onPointerDown` по `matchMedia`; `readOnly` и `data-expandable` в HTML нейтральные                                                                                                                                                                                                                                                                                    | ~15           |
| `src/templates/shared/atoms/UniversalSwiper.tsx`, `SliderNavButtons.tsx`, `SwiperContainer.tsx` | до гидратации `slidesPerView` и число страниц из `breakpoints` через CSS `StaticSwiper`; `useBreakpoints` и `key` только после                                                                                                                                                                                                                                                                 | ~40           |
| `src/templates/product/atoms/ProductCollapse/index.tsx:22,38`                                   | один уровень заголовка, размер через CSS; `Grid` убрать                                                                                                                                                                                                                                                                                                                                        | 5             |
| `packages/storefront-ui/src/phone/CountryPicker.tsx:118-140`                                    | нативный `<select>` и кнопка поповера в DOM вместе, видимость по `mq`                                                                                                                                                                                                                                                                                                                          | ~20           |
| `packages/checkout/src/components/BrandHeader.tsx:20-21`                                        | кнопка корзины через CSS                                                                                                                                                                                                                                                                                                                                                                       | 5             |
| мёртвый код                                                                                     | `Header.tsx`, `HeaderSection.tsx`, `Layout.tsx`, `DesktopSearch`, `SearchInput`, `useIsDesktop.ts`; `HeaderSection.config.ts:383`                                                                                                                                                                                                                                                              | около −900    |

Итого около 35 файлов и 5–7 дней, из них 2–3 дня — кадр экрана и одно приложение с ручной
проверкой переходов стека.

Классы (в) 47–48 в checkout не переводятся в CSS: две раскладки сводки означали бы дважды
строки заказа в DOM, а checkout в SSG — оболочка. После гидратации он перестраивается, как сейчас,
но уже от общего флага, без синхронной перерисовки.

### Как сохраняется совпадение гидратации

В HTML и в первом рендере обе обвязки смонтированы (`useChromeMounted` до `hydrated` — `true`),
все (а) не зависят от JS. Оставшиеся `useMediaQuery` / `useBreakpointDown` — это (б), а также
(в) в checkout. Они до гидратации отдают постоянное мобильное предположение, одинаковое на
сервере и в браузере. После `hydrated` (переход) лишняя обвязка размонтируется; DOM активной и
содержимое экранов не трогаются.

### Чанки

Один чанк приложения, ждётся до гидратации на любом устройстве. Минус 5,5 КБ gzip телефону (код
`CompactHeader`) и столько же плюс десктопу по сравнению с сегодняшним днём; запросов второго чанка
нет ни там, ни там.

### `entry.server.tsx` и `isbot`

Как в варианте 1.

### Тесты и Storybook

- Новые unit-тесты: `useChromeMounted` (до и после флага) и кадр `Screen` (обе части в разметке,
  классы видимости).
- Storybook: истории экранов и шапки показывают обе части. Видимость задаёт CSS, и переключатель
  вьюпорта Storybook сразу показывает нужную. Правило «истории рендерят настоящие компоненты»
  соблюдается без декораторов с разметкой.

### Checkout и account на стеке

Экраны checkout и account получают тот же один `Screen`: checkout — с `header={false}` и
плавающей «назад» ниже `lg`, account — `bleed`. Обвязка `DesktopApp` прятала шапку на checkout по
`useNavigationStore` (`DesktopApp.tsx:36,58`); в `DesktopChrome` это остаётся как есть.

## Сравнение

| Критерий                                | Минимальный                      | Полный                                |
| --------------------------------------- | -------------------------------- | ------------------------------------- |
| HTML не зависит от UA                   | да                               | да                                    |
| Правильная первая отрисовка на десктопе | нет                              | да                                    |
| Второй чанк                             | на десктопе, 5,5 КБ gzip         | нет                                   |
| Пересборка стека после гидратации       | на десктопе                      | нет                                   |
| CLS на десктопе                         | большой (шапка, листинг, подвал) | около нуля                            |
| Смена ширины окна посреди работы        | не отслеживается (как сейчас)    | обвязка и кадр следуют за CSS         |
| Файлов / дней                           | ~15 / 1,5–2                      | ~35 / 5–7 (включая минимальный)       |
| Риск                                    | низкий                           | средний: кадр экрана и анимации стека |

## Рекомендация

Делать полный вариант, этапами, первым — минимальный. Минимальный разблокирует SSG (одна версия
на адрес, без маршрутизации по UA на CDN) и почти весь входит в полный: удаление UA, постоянная
ширина, флаг в `storefront-ui`, корзина, листинг, герой. От него в полном варианте выбрасывается
только переключение в `AppSwitch` и контекст варианта, около 30 строк. Полный убирает цену
минимального на десктопе.

## Этапы

**0. Решения.** Граница обвязки (`lg` или `md`) и судьба `/cart` на телефоне (см. «Открытые
вопросы»).
_Готово, когда_ оба решения записаны в этом документе.

Решения (6 ноября 2026 года):

- **`/cart` — страница корзины для всех** (вариант 1 из «Открытых вопросов»). Без UA сервер не
  отличает телефон, а страница уже свёрстана через `mq`. Ящик корзины на телефоне остаётся, его
  кнопка «Переглянути кошик» по-прежнему видна только в модалке (`isSheet` после гидратации).
- **Граница обвязки — `lg`** (`(max-width: 1023.95px)`): та же, что у `useIsMobile`, шторок
  `DrawerBase` и `stacked` в checkout. Планшет в портрете получает таб-бар.

**1. UA уходит из HTML (минимальный вариант).** Правки из таблицы варианта 1, сценарий проверки
(см. ниже) в репозитории.
_Готово, когда_:

- `rg -n "useUA|parseUserAgent|ResponsiveProvider|ua-parser-js" themes/brand-bite-crunch/src` пуст;
- HTML одного адреса, запрошенный с мобильным и десктопным UA, совпадает побайтно (после
  вычёркивания nonce);
- Playwright: на обоих вьюпортах нет ошибок гидратации; на телефоне нет запроса `DesktopApp-*.js`;
- `yarn test` зелёный.

**2. Флаг гидратации в `storefront-ui`.** Контекст `viewport`, отказ от `defaultValue`,
передача из `Theme.tsx`. Можно параллельно с этапом 1.
_Готово, когда_ на телефоне checkout в HTML в мобильной раскладке, а в профиле гидратации нет
синхронной перерисовки от `useBreakpointDown`.

**3. Классы (а) в CSS.** `CompactHeader`, `PageLayout`, свайперы, `ProductCollapse`,
`CountryPicker`, `BrandHeader`, атрибуты композера.
_Готово, когда_ скриншоты HTML без JS (`javaScriptEnabled: false`) на 390 и 1440 px совпадают с
гидратированной страницей на тех же ширинах для главной, каталога, листинга и товара.

**4. Один кадр экрана.** `Screen` и `DesktopScreen` сливаются, активности без ветвления. Обвязки
пока разные.
_Готово, когда_ при ручной смене `AppVariant` содержимое экрана не пересоздаётся (`useEffect` на
монтирование срабатывает один раз), а переходы стека на телефоне не изменились — по записи до и
после.

**5. Одно приложение с обеими обвязками.** `App.tsx`, `useChromeMounted`, один `HeaderAppDrawer`,
один `SearchDockProvider`, один чанк; переключение варианта в `AppSwitch` удаляется.
_Готово, когда_ сценарий проверки проходит без исключений «второго чанка» на обоих вьюпортах, CLS
меньше 0,05 на десктопе, а смена ширины окна через 1024 px после гидратации меняет обвязку без
ошибок в консоли.

**6. План SSG.** Убрать из `plans/static-site-generation.ru.md` два варианта страницы и всё, что
с ними связано (см. ниже); добавить явный режим «полный документ» в runtime.
_Готово, когда_ builder рендерит один файл на адрес и Cloudflare кеширует его без правил по UA.

## Проверка: Playwright-сценарий

Playwright в репозитории не установлен. Сценарий кладётся рядом с
`themes/brand-bite-crunch/scripts/static-styles/verify.js` и повторяет его схему: production-сборка,
свободный порт, `@shopana/mock-server`. Порт 3001 не используется. Зависимость
`@playwright/test` добавляется в `devDependencies` темы.

1. **HTML не зависит от UA.** Для адресов `/`, `/collections/<handle>`, `/categories/<handle>`,
   `/products/<handle>`, `/search?q=…`, `/cart`, `/checkout`, `/account` (как гостя) получить HTML
   с UA iPhone и с UA Chrome на macOS. Вычеркнуть nonce и время, сравнить побайтно.
2. **Один и тот же HTML на двух вьюпортах.** Сохранённый HTML отдаётся через
   `page.route(url, route => route.fulfill({ body }))`, остальные запросы идут на сервер.
   Контексты: «телефон» (390×844, `isMobile`, `hasTouch`, UA iPhone) и «десктоп» (1440×900).
3. **Ошибки гидратации.** Собирать `page.on('console')` уровня `error` и `page.on('pageerror')`.
   Тест падает на `Hydration`, `did not match`, `Minified React error #418`, `#423`, `#425` и на
   любых `pageerror`. Конец гидратации — атрибут `data-hydrated` на `<html>`: его нужно добавить в тему, эффект
   после `useHydrated() === true`; тест ждёт его через `waitForSelector`.
4. **Второй чанк.** Собирать `page.on('request')` по `/assets/*.js`.
   - Этап 1: на телефоне нет `DesktopApp-*.js` и `CompactHeader-*.js`; на десктопе
     `DesktopApp-*.js` есть ровно один раз.
   - Этап 5: на обоих вьюпортах ни `MobileApp-*`, ни `DesktopApp-*`, только `App-*.js`, и ровно
     один раз.
5. **Сдвиг.** `PerformanceObserver({ type: 'layout-shift', buffered: true })` до и 2 с после
   гидратации: на этапе 5 сумма меньше 0,05 на обоих вьюпортах; на этапе 1 записать значение
   для десктопа как базу.
6. **Ресайз (этап 5).** На десктопе после гидратации `page.setViewportSize({ width: 800 })` и
   обратно: видна нужная обвязка, ошибок нет, путь и стек экранов не изменились.

## Что меняется в плане SSG

В `plans/static-site-generation.ru.md` становятся лишними:

- «Вывод», абзац «Два варианта каждой страницы» (строки 18–20);
- «Рендер одной страницы», п. 2: заголовок `x-shopana-static-render: <device>` и
  `readRenderDevice()` (строки 235–239). Режим «полный документ» остаётся, но без устройства;
- «Клиентская сторона», пункт «Устройство» (строка 299) — сверка `__shopanaStatic.device` с `parseUserAgent`;
- «Cloudflare»: переписывание мобильного пути в `/__m<path>` (строки 505–507) и проверка
  мобильного варианта в smoke (строки 609–610);
- «Тема», п. 5 (`ResponsiveProvider`/`AppSwitch` по `readRenderDevice()`, строка 566);
- «Риски», «UA-вариант на CDN» (строка 660).

Число файлов генератора и объём хранилища уменьшаются вдвое.

## Риски и открытые вопросы

- **`/cart` на телефоне.** Сейчас мобильный UA получает 404, корзина на телефоне — только ящик.
  Без UA сервер не знает, что это телефон. Варианты: (1) страница корзины для всех — она уже
  вёрстана через `mq` (`CartPageSection` импортирует `mq`); (2) после гидратации на узком экране
  открыть ящик и заменить адрес на главную. Рекомендуется (1); решение за продуктом.
- **Планшет в портрете** получает таб-бар при границе `lg`. Нужно подтвердить с дизайном.
- **Подвал на мобильных деталях.** Сейчас его нет, на десктопе есть. В полном варианте он в HTML
  обоих и прячется CSS там, где не нужен; проверить, что так и задумано.
- **Скрытый app bar движка.** `AppScreen` с app bar и анимациями `appBarSet` нужно проверить на
  `display: none` с `lg` до этапа 4: если движок считает высоту app bar в JS, понадобится проп
  движка вместо CSS.
- **Цена боковых фильтров на телефоне** (место 10): «сотни чекбоксов» рендерятся при каждом
  обновлении листинга. Замерить; при заметной цене `ListingFilter` мемоизировать по `filters`
  или монтировать после гидратации только при `lg` — и тогда принять сдвиг колонки на десктопе.
- **Данные свежести сборки.** Размеры чанков взяты из `.runtime/build` от 5 ноября 2026 года;
  после слияния обвязок их нужно перемерить.

## Выполнено

6 ноября 2026 года, этапы 0–5. Этап 6 (план SSG) не делался. Ничего не закоммичено, изменения
лежат в рабочих деревьях storefront и темы.

### По этапам

- **0.** Решения записаны в «Этапах»: `/cart` — страница для всех, граница обвязки — `lg`.
- **1.** `ui-kit/UserAgent` удалён вместе с `ua-parser-js` и `@types/ua-parser-js`.
  Предполагаемая ширина постоянная: `ASSUMED_VIEWPORT_WIDTH = breakpoints.xs` в
  `ui-kit/Viewport/viewport.ts`. `/cart` рендерит страницу для всех. Кнопка «Переглянути кошик»
  в ящике зависит от `isSheet`. Колонка фильтров листинга рендерится всегда. Герой передаёт
  композеру `compact="mobile"` (стили `compact` под `mq.max.lg`). В `<html>` ставится
  `data-hydrated` после `useHydrated()`. В runtime добавлен явный режим «полный документ»:
  заголовок `x-shopana-static-render` (`FULL_DOCUMENT_HEADER` в `entry.server.tsx`); `isbot`
  остался для живого SSR. Промежуточное переключение `MobileApp` → `DesktopApp` после
  гидратации и контекст варианта на этапе 5 удалены.
- **2.** В `StorefrontUIProvider` добавлено поле `viewport: { hydrated, assumedWidth }`.
  `useMediaQuery` до `hydrated` считает `min-width`/`max-width` по ширине (`matchesWidth`),
  после переходит на `matchMedia`. Опция `defaultValue` и тип `MediaQueryOptions` удалены.
  Без провайдера хук ведёт себя как «уже гидратировано». `Theme.tsx` передаёт флаг и ширину.
  README пакета обновлён.
- **3.** В CSS переведены: `CompactHeader` (кнопка ящика и меню категорий в DOM вместе,
  логотип, «Бажання», подписи аккаунта и корзины), крошки `PageLayout`, `ProductCollapse`
  (всегда `h4`, с `lg` размер `h3`), `SwiperContainer` (отступы и «всё влезает» — `@media`),
  `SliderNavButtons` (число страниц по ширине `xl`: кнопки видны только с неё), `BrandHeader`
  в checkout.
- **4.** `DesktopScreen` слит в `Screen`. App bar движка, плавающая «назад», место под неё и
  под таб-бар скрыты с `lg`. Место под шапку скрыто ниже `lg`. Содержимое — один `<main>` на
  одном месте дерева. Для скрытия app bar движку понадобился проп `appBar.className`: у app bar
  и его отступа стили инлайновые, поэтому скрытие идёт через `display: none !important`.
  Активности больше не ветвятся. Подвал страниц — `pageEnd` (скрыт ниже `lg`), у главной —
  `homeEnd` (место под таб-бар ниже `lg`).
- **5.** Одно приложение `mobile-app/App.tsx`: `useStackApp`, `NavigationScope`,
  `InitialPageContext`, `SearchDockProvider`, `LayoutOverlays` и `HeaderAppDrawer` по одному
  разу. Таб-бар (`MobileChrome`) и шапка (`DesktopHeader`) в обёртках с `display: none` по
  `mq`, монтирование через `useChromeMounted` («обе до гидратации, одна после»).
  `presentFrom="fade"` с `lg` после гидратации. `AppSwitch` ждёт один чанк без условий.
  `HeaderAppDrawer` вынесен из `CompactHeader` в приложение и в `layouts/theme/index.tsx`.
  Мёртвый код удалён.

### Чем подтверждено

- `rg -n "useUA|parseUserAgent|ResponsiveProvider|ua-parser-js" themes/brand-bite-crunch/src` —
  пусто.
- `yarn typecheck` (с `yarn build:packages`): тема и Storybook темы без ошибок. Единственная
  ошибка — `packages/shopana-storefront-runtime/src/react-router/vite.test.ts(37,18)` TS2589.
  Она воспроизводится и на исходном `entry.server.tsx`, то есть была до правок.
- Тесты по пакетам: storefront-ui 33, modal-stack 33, storefront-auth 64, checkout 348,
  storefront 28, mock-server 15, тема 100 — зелёные. В `@shopana/storefront-sdk` падают 2 теста
  (`routeParser` «blogs list», `CartProvider` «queued optimistic edits»). SDK не менялся,
  падения были до правок. Из-за них `yarn test` останавливается на первом пакете (`&&`),
  поэтому остальные пакеты запускались по отдельности.
- `yarn lint` по репозиторию красный и до правок: 606 ошибок в `.runtime-analyze`,
  `.claude/worktrees` и 31 в `themes/brand-bite-crunch/src`. Изменённые файлы — 0 ошибок,
  4 старых предупреждения.
- Prettier по изменённым файлам чистый. Тема в `.gitignore` storefront, поэтому prettier
  запускался с `--ignore-path .prettierignore`.
- Production-сборка темы (`yarn build`) зелёная после каждого этапа.
- Новые unit-тесты: `storefront-ui/src/useMediaQuery.test.tsx` (ширина до флага, `matchMedia`
  после, без провайдера) и `mobile-app/hooks/useChromeMounted.test.tsx` (обе обвязки в HTML,
  одна после гидратации; jsdom).

### Отклонения от плана

- **Playwright и e2e не делались** по прямому указанию пользователя: зависимость
  `@playwright/test` не добавлена, сценарий не написан, сервер с моком не поднимался. Поэтому
  не проверены критерии, которым нужен браузер или запущенный сервер: побайтное совпадение
  HTML при двух UA, отсутствие ошибок гидратации, запросы чанков, CLS на десктопе, ресайз
  через 1024 px, скриншоты без JS (этап 3), проверка «содержимое не пересоздаётся» и запись
  переходов (этап 4). Что проверено без них: в теме не осталось ни одного чтения UA в рендере;
  в сборке один чанк `App-*.js`, `MobileApp-*` и `DesktopApp-*` нет.
- **Место 20 (атрибуты композера)** не переведено. `opensDialog` и так на `useIsMobile`, HTML
  от UA не зависит. Перенос решения в `onPointerDown` меняет то, открывается ли клавиатура на
  телефоне, а проверить это без браузера нельзя.
- **Место 46 (`CountryPicker`)** не переведено. Нативный `<select>` и кнопка поповера выглядят
  одинаково (флаг и шеврон), а оба контрола в DOM дали бы два элемента с одним смыслом в дереве
  доступности, различимые только по CSS. Сдвига нет: до гидратации в HTML нативный вариант по
  мобильной ширине, после — нужный.
- **Место 31 (`UniversalSwiper`)** правок не потребовало: до гидратации он уже `StaticSwiper`
  с CSS по `breakpoints`, а `key` и `slidesPerView` из хуков действуют только после.
- **`ProductCollapse`:** граница размера заголовка теперь `lg` темы (1024), а не `lg` antd
  (992).
- **`CompactHeader` ниже `lg`:** у кнопок аккаунта и корзины теперь есть скрытая подпись, и
  antd больше не ставит им `ant-btn-icon-only`. Его размеры (`width: controlHeight`,
  `padding-inline: 0`) повторены CSS под `mq.max.lg`. Внешний вид нужно сверить глазами.
- **`SearchDockProvider`** на этапе 4 поднят в корень мобильного приложения, а не оставлен на
  `Home`: без ветвления в `Home` вложенный провайдер перекрыл бы десктопный.
- **`HeaderSection.config.ts`:** `headerSection` живой (`useHeaderMenuItems` берёт из него
  блоки меню для `CompactHeader`). Удалено только поле `component: Header`, тип —
  `Omit<SectionConfig, 'component'>`.
- **Unit-тест кадра `Screen`** не написан: `Screen` тянет `Stack` со всеми активностями (чат,
  checkout, account), а тесты темы — логика в node. Тест `useChromeMounted` есть.
- В тему добавлены `devDependencies` `@testing-library/react` и `jsdom` (те же диапазоны, что в
  пакетах) для теста `useChromeMounted`.
- Сценарий Playwright в репозиторий не положен: пользователь в этой сессии прямо сказал не
  добавлять Playwright и e2e. Сравнение HTML через серверный рендер тоже не делалось по той
  же причине.

### Не проверено автоматически: как проверить вручную

Всё ниже — на production-сборке темы (`yarn build` в `themes/brand-bite-crunch`, затем
`yarn start` или свой сервер) в Chrome с DevTools, не на порту 3001.

1. **HTML не зависит от UA.** Для `/`, листинга, категории, товара, `/search?q=…`, `/cart`,
   `/checkout` и `/account` получить HTML через `curl -s -A` дважды: с UA iPhone и с UA Chrome
   на macOS. Вычеркнуть nonce (`sed 's/ nonce="[^"]*"//g'`) и сравнить `diff`. Ожидается
   пустой diff и одинаковый статус, у `/cart` 200 на обоих.
2. **Ошибки гидратации.** Открыть страницы из п. 1 при ширине 390 px (эмуляция iPhone) и
   1440 px. В консоли нет `Hydration`, `did not match`, React `#418`/`#423`/`#425` и
   необработанных ошибок. Признак конца гидратации — атрибут `data-hydrated` на `<html>`.
3. **Второй чанк.** На вкладке Network с фильтром `assets/*.js` на обеих ширинах есть ровно
   один `App-*.js` и нет `MobileApp-*`/`DesktopApp-*`.
4. **CLS.** На 1440 px: Performance → запись перезагрузки, или в консоли
   `new PerformanceObserver(l => console.log(l.getEntries().reduce((s, e) => s + e.value, 0))).observe({ type: 'layout-shift', buffered: true })`
   через 2 с после `data-hydrated`. Ожидается сумма меньше 0,05.
5. **Ресайз.** На десктопе после гидратации сузить окно до 800 px и расширить обратно:
   шапка сменяется таб-баром и обратно, адрес и экран стека те же, ошибок в консоли нет.
6. **Без JS (этап 3).** DevTools → Disable JavaScript, перезагрузить на 390 и 1440 px:
   главная, каталог, листинг, товар выглядят как гидратированные (шапка, крошки, фильтры,
   подвал, слайдеры).
7. **Этап 4.** На телефоне сравнить переходы стека (вперёд, назад, вкладки, товар поверх) с
   прежней версией. Вид кнопок аккаунта и корзины в шапке ниже `lg` — круглые, как раньше.

### Размеры чанков (сборка 6 ноября 2026 года)

| Что                                              | Было (5 ноября)                         | Стало                    |
| ------------------------------------------------ | --------------------------------------- | ------------------------ |
| Собственный код приложения                       | `MobileApp` 2,2 КБ, `DesktopApp` 5,5 КБ | `App-*.js` 4,4 КБ gzip   |
| Приложение со статическими импортами сверх корня | 226 КБ общая часть + своя обвязка       | 76 файлов, 226,2 КБ gzip |
| Чанков приложения на странице                    | один, по UA                             | один на любом устройстве |

`CompactHeader` лежит в общей части (его использует и layout сайта), поэтому одно приложение
стоит телефону около +2,2 КБ gzip, а десктопу около −1,1 КБ, а не 5,5 КБ, как оценивалось.

### Изменённые файлы

storefront:

- `packages/shopana-storefront-runtime/src/react-router/entry.server.tsx`
- `packages/storefront-ui/src/StorefrontUIProvider.tsx`, `useMediaQuery.ts`, `index.ts`,
  `README.md`; новый `useMediaQuery.test.tsx`
- `packages/checkout/src/components/BrandHeader.tsx`
- `yarn.lock` (минус `ua-parser-js` и зависимости, плюс записи темы)

`themes/brand-bite-crunch`:

- `package.json`
- удалены: `src/ui-kit/UserAgent/*` (4 файла), `src/mobile-app/MobileApp.tsx`,
  `DesktopApp.tsx`, `components/DesktopScreen.tsx`, `src/layouts/theme/Header.tsx`,
  `HeaderSection.tsx`, `Layout.tsx`, `src/templates/search/blocks/DesktopSearch/index.tsx`,
  `src/templates/search/atoms/SearchInput/index.tsx`, `src/hooks/useIsDesktop.ts`
- новые: `src/ui-kit/Viewport/viewport.ts`, `src/mobile-app/App.tsx`,
  `src/mobile-app/hooks/useChromeMounted.ts`, `useChromeMounted.test.tsx`
- изменены: `src/runtime/layout.tsx`, `src/hooks/useMediaQuery.ts`, `src/ui-kit/Theme/Theme.tsx`,
  `src/ui-kit/StackFlow/index.tsx`, `src/mobile-app/AppSwitch.tsx`, `routes.ts`,
  `components/Screen.tsx`, `activities/{Home,PageScreen,Catalog,Account,Checkout}.tsx`,
  `src/layouts/theme/{CompactHeader,PageLayout,index,HeaderSection.config}.tsx|ts`,
  `src/layouts/theme/SearchDock/Composer.tsx`,
  `src/templates/cart/sections/{CartPageSection,CartDrawer}/index.tsx`,
  `src/templates/collection/sections/CollectionPageSection/index.tsx`,
  `src/templates/index/sections/SearchHero/index.tsx`,
  `src/templates/product/atoms/ProductCollapse/index.tsx`,
  `src/templates/shared/atoms/{SwiperContainer,SliderNavButtons}.tsx`

`src/layouts/theme/SearchDock/ComposerSearch.tsx` в рабочем дереве темы изменён не этой
работой (логика отправки в ассистента). Эта правка не трогалась.

### Что осталось

- Ручная или браузерная проверка того, что не проверено без e2e (список выше), особенно CLS и
  ресайз через `lg`, вид кнопок шапки ниже `lg` и переходы стека на телефоне.
- Этап 6: план SSG (другая сессия).
- Решение по месту 20 (композер) и 46 (`CountryPicker`), если нужна идеальная первая отрисовка
  и для них.
- Подтвердить с дизайном таб-бар на планшете в портрете и отсутствие подвала на мобильных
  деталях.
