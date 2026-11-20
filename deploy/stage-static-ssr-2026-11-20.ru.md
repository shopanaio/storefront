# Как выкатили static + SSR на stage 20 ноября 2026

Это описание выполненного выката `pet.shopana.dev`, а не обещание, что обычная команда
деплоя уже воспроизводит все операции. Изменения runtime и плагин находятся в репозитории;
установка плагина в существующий Traefik выполнена отдельно. Секретные значения здесь не приводятся.

## Итоговая схема

```text
Cloudflare Tunnel → существующий Traefik :8080
                       ├─ публичный объект найден → Neon S3 → ответ клиенту
                       └─ объекта нет / S3 недоступен → theme :3000 → Node SSR
                                                          └─ подтверждённый промах + HTTP 200
                                                             → очередь theme-static :3100
                                                             → рендер → запись в Neon S3
```

Traefik читает публичный бакет без ключей. На попадании Node не участвует.
При промахе именно Node сообщает координатору о необходимости генерации: Traefik заданий
не создаёт. Отчёты Node отправляются пачкой раз в 30 секунд; координатор объединяет задания
с задержкой 20 секунд. Поэтому генерация не обязана начаться сразу после первого запроса.
Очередь и индекс координатора находятся в SQLite, а не в DBOS.

Это работает для любых публичных страниц, включая статьи, товары и коллекции.
Для `/` ключ — `site/index.html`, для `/en` — `site/en/index.html`, для статьи
`/blogs/<blog>/<article>` — `site/blogs/<blog>/<article>/index.html`.

Авторизация, аккаунт, корзина, checkout, API и поиск остаются динамическими.
Запросы не GET/HEAD и параметры, меняющие содержимое страницы, обходят статическую выдачу.
Tracking-параметры не меняют ключ страницы. Ошибка подключения к S3 допускает SSR,
но сама по себе не считается подтверждённым отсутствием файла для постановки генерации.

## Хранилище и настройки

Использован существующий публичный бакет Neon, без создания R2 или Cloudflare Worker:

```dotenv
STATIC_STORE=s3://theme-static/site
STATIC_ENDPOINT=https://br-bitter-math-b20mtvty.storage.c-6.eu-central-1.aws.neon.tech
STATIC_REGION=eu-central-1
STATIC_COORDINATOR_URL=http://theme-static:3100
```

Ключи этого endpoint были взяты из `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `AWS_REGION` stage Infisical. Другой endpoint из `S3_ENDPOINT`
не содержал бакета `theme-static` и возвращал 404 — его не использовали.

Локальные, игнорируемые Git файлы с правами `0600`:

- `deploy/environments/stage/server-env.json` — рабочие настройки темы, ключи чтения S3
  и `STOREFRONT_STATIC_COORDINATOR_TOKEN`.
- `deploy/environments/stage/static-env.json` — `STATIC_OPERATOR_TOKEN`, тот же
  `STOREFRONT_STATIC_COORDINATOR_TOKEN`, `STOREFRONT_PRIVATE_TOKEN`, ключи записи S3.
- `deploy/environments/stage/deploy.env` — endpoint, регион, bucket/prefix и актуальные
  имена Docker secrets/configs.

Два новых случайных токена созданы отдельно; в Infisical их не добавляли.
Настройки загружаются в контейнеры через Docker secrets и launchers
`deploy/runtime/start.cjs`, `deploy/runtime/start-static.cjs`.
Для цепочки Tunnel → Traefik → Node задан `STOREFRONT_TRUSTED_PROXY_HOPS=2`.

Для рендера использован действующий private Headless token магазина. Одновременная отправка
private и public токенов вызывала `STOREFRONT_CREDENTIAL_AMBIGUOUS`; исправление находится
в `packages/shopana-storefront-sdk/src/graphql/apollo/Environment.ts`.

## Как заменили файлы и запустили сервисы

Нода темы: `80.240.26.161`, hostname `shopana-stage-theme`.

| Сервис | Реплики | Запуск |
| --- | --- | --- |
| `shopana-theme-stage_theme` | 2 | `node /run/configs/start.cjs`, порт 3000 |
| `shopana-theme-stage_theme-static` | 1 | `node /run/configs/start-static.cjs`, порт 3100 |

Координатору выделены лимиты 2 CPU / 2 GiB, `STATIC_RENDER_CONCURRENCY=2`.
Его volume — `shopana-theme-stage_theme-static-data`, путь `/data`, владелец UID 1000.
Индекс — `/data/index.sqlite`. Удалять volume при обновлении не нужно.

Сборка темы подготовлена в изолированной директории
`/private/tmp/shopana-theme-static-20261120`. Финальный каталог файлов на сервере:
`/opt/shopana/releases/20261120-static-r4`.

Существующий образ не содержал нового launcher runtime. Поэтому замены одного `build`
было недостаточно: первый такой запуск завершился ошибкой отсутствующего
`/app/packages/shopana-storefront-runtime/bin/storefront-runtime.js`.
В финальном варианте смонтировали полный комплект:

| В каталоге release | В контейнере |
| --- | --- |
| `build` | `/app/themes/brand-bite-crunch/.runtime/build` |
| `packages/shopana-storefront-runtime` | `/app/packages/shopana-storefront-runtime` |
| `packages/shopana-storefront-runtime` | `/app/node_modules/@shopana/storefront` |
| `packages/shopana-storefront-sdk` | `/app/node_modules/@shopana/storefront-sdk` |
| `themes/brand-bite-crunch/package.json` | `/app/themes/brand-bite-crunch/package.json` |

Рабочая директория обоих контейнеров — `/app/themes/brand-bite-crunch`.
Runtime включает `bin`, `dist`, `src/init.js`, `package.json`; SDK — `dist`, `package.json`.
Это замена файлов поверх существующего образа, не новый опубликованный image digest.
Сервисы обновлялись с сохранением старых release-каталогов для отката.

## Подключение существующего Traefik

Использован `shopana-stage-platform_traefik`, образ `traefik:v3.7.13`, две реплики:

- `209.250.234.161` — `shopana-stage-monolith`;
- `45.76.83.214` — `shopana-stage-background-workers`.

Плагин из `deploy/traefik/static-first` скопирован на обе ноды в
`/opt/shopana/releases/20261120-static-edge/plugin` и смонтирован read-only в
`/plugins-local/src/github.com/shopanaio/staticfirst`.
Нужны также скрытый файл `.traefik.yml` и `go.mod` — копировать только `*.go` недостаточно.

Добавлены аргументы Traefik:

```text
--experimental.localplugins.shopanastatic.modulename=github.com/shopanaio/staticfirst
--experimental.abortonpluginfailure=true
```

В существующий файл маршрутов добавлены router, middleware и upstream из раздела
[Stage: публичный Neon S3 и Traefik](README.md#stage-публичный-neon-s3-и-traefik).
Имеющиеся маршруты backend сохранены. Upstream SSR:
`http://shopana-theme-stage_theme:3000`; балансировку реплик выполняет Swarm.
На статические ответы также добавлен `X-Robots-Tag: noindex, nofollow` для stage.
Сохранено доверие forwarded headers только overlay-сети `10.81.0.0/16`.

Traefik обновлялся `stop-first`, `parallelism=1`: при двух подходящих нодах и ограничении
одна реплика на ноду `start-first` не мог разместить дополнительную задачу.
При устранении зависшего обновления лимит временно повышался до двух; в итоге возвращена
одна реплика на ноду, сервис завершил обновление с двумя работающими репликами.
Проверочный временный сервис `shopana-static-router-preflight` после проверки удалён.

## Cloudflare Tunnel

В существующем Tunnel `shopana-theme-stage` сохранены специализированные маршруты:

| Путь на `pet.shopana.dev` | Origin |
| --- | --- |
| `/graphql` | существующий Traefik с backend API Host |
| `/apps/pet-assistant/v1…` | существующий Traefik с apps Host |
| `/__builder/*` | `http://theme-static:3100` |
| остальной сайт | `http://shopana-stage-platform_traefik:8080` |

Builder API защищён токенами. Default origin был изменён с `http://theme:3000` только
после проверки плагина в отдельном Traefik. Изменение default origin также сохранено
в `deploy/terraform/environments/stage/main.tf`.
DNS работающего магазина не заменялся адресом бакета.

## Генерация и проверка

Первый полный build по `themes/brand-bite-crunch/static.config.ts` сформировал главную
для UK и EN, служебные файлы и assets. Остальные проверяемые страницы появились по промахам.
`pages.home=true` ограничивает первоначальный полный build, но не генерацию публичных URL
по промахам. Полный build может удалить страницы вне текущего плана: для точечного
обновления уже опубликованных страниц использован `mode: paths`.

При браузерной проверке сохранённого HTML обнаружена ошибка гидратации React #418.
Причина — изменение правил и идентификаторов Emotion функцией `pruneEmotionStyles`
после рендера. В `src/static/renderer.ts` сохранение HTML изменено на исходный документ
без этой обработки. После пересборки runtime все 8 опубликованных страниц перегенерированы
через `mode: paths`; ошибок рендера — 0.

Секрет оператора для следующих команд должен быть загружен в окружение безопасным способом:

```bash
curl -fsS 'https://pet.shopana.dev/__builder/api/status' \
  -H "Authorization: Bearer $STATIC_OPERATOR_TOKEN"

curl -fsS 'https://pet.shopana.dev/__builder/api/builds' \
  -H "Authorization: Bearer $STATIC_OPERATOR_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"mode":"paths","paths":["/","/en"],"reason":"manual-refresh"}'

curl -sSI https://pet.shopana.dev/
curl -sSI https://pet.shopana.dev/cart
```

На статической странице ожидаются HTTP 200, `x-shopana-static: hit`,
`x-shopana-static-server: traefik`. Корзина остаётся SSR без заголовка `…server: traefik`.
Не следует требовать ETag/304 без проверки конкретного S3 origin: на публичной выдаче Neon
при этом выкате ETag отсутствовал.

Подтверждён полный путь для статьи `/blogs/korysni-materialy/yak-vysushyty-sobaku-rushnykom`:
объект S3 404 → публичный SSR 200/miss → Node поставил задание → объект S3 200 →
публичный ответ 200/hit с `x-shopana-static-server: traefik`.

Итоговые проверки:

- 41 тест runtime: builder, server, coordinator — прошли.
- Go-тесты плагина — прошли.
- 6 страниц на desktop и mobile, всего 12 переходов — HTTP 200, ошибок React нет.
- В координаторе 8 страниц, очередь и аренды пусты, `deadJobs=0`.
- Обновления theme, theme-static и Traefik завершены; реплики 2/2, 1/1 и 2/2.

## Где сохранены операции и что ещё не автоматизировано

Локальные материалы выполненного выката:
`/Users/filip.sapronov/Projects/internal/.state/deploy/stage-20261120-static/`.
Каталог игнорируется Git и не является переносимым инструментом деплоя; внутри есть
секретные файлы, его нельзя целиком публиковать или коммитить.

Основные скрипты: `prepare-runtime-r4.py`, `activate-r4.py`, `activate-edge.py`,
`tunnel.mjs --apply --front`, `refresh-pages-r4.py`, `check.py`, `browser-check.cjs`.
Там же сохранены резервные конфигурации до изменения, manifests и результаты проверок.
Скрипты привязаны к этому окружению; повторять их без чтения текущего состояния нельзя.

Для полностью воспроизводимого стандартного деплоя ещё нужно включить в штатный процесс:

1. Доставку плагина на все подходящие ноды Traefik, mount и статические аргументы.
2. Слияние маршрутов плагина с управляемой конфигурацией backend Traefik.
3. Согласованную доставку theme build, runtime и SDK либо полноценный образ с ними.
4. Проверку совместимости smoke с публичным Neon, где ETag может отсутствовать.

Один `deploy-theme.mjs deploy` пока не устанавливает плагин в платформенный Traefik.
Не заменяйте этот факт утверждением о готовом развёртывании одной командой.
