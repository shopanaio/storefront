# Тема: Cloudflare Free, Tunnel и Docker Swarm

Схема повторяет соглашения `internal`: Cloudflare provider
`5.19.1`, отдельные окружения, connector token как Docker secret, два connector на разных нодах
и `cloudflared tunnel ready` для healthcheck. Образ connector закреплён на `2026.10.2`.
Terraform выполняется локально; у каждого профиля свой local state. Terraform Cloud и
`terraform login` не требуются.

Stage темы использует **`https://pet.shopana.dev`** в существующей Cloudflare-зоне `shopana.dev`.
Это самостоятельный hostname stage: дополнительный префикс `stage.` не добавляется.
Поле `hostname` задаётся явно для каждого окружения; production пока оставлен шаблоном
`example.com` и не занимает основной адрес админки `shopana.dev`.

## Деплой в существующий Swarm internal

На серверах остаётся **один Swarm**. Стеки `shopana-stage-platform` и
`shopana-stage-app` принадлежат internal; тема разворачивается отдельным стеком
`shopana-theme-stage`. Повторять `docker swarm init`, создавать серверы или переносить
backend services в стек темы не нужно. Скрипт ниже не выполняет эти операции и не
изменяет существующие стеки backend.

```text
Swarm internal
├── shopana-stage-platform
├── shopana-stage-app ─────────────────── shopana-stage-edge
└── shopana-theme-stage                              │
    ├── cloudflared × 2 ──────────────────────────────┘
    └── theme × 2
        └── shopana-theme-stage_frontend (общая с cloudflared)
```

Команды выполняются из корня этого репозитория на рабочем компьютере. Docker CLI
подключается по SSH к существующему manager; Terraform читает свой локальный state.
На manager нужен Docker, на рабочем компьютере — Node.js 22+, Docker CLI, Terraform
и SSH-доступ. SSH-пользователь должен иметь права управлять Docker.

```sh
docker context create internal-stage --docker 'host=ssh://root@MANAGER_IP'
docker --context internal-stage node ls
docker --context internal-stage stack ls

# Идемпотентно создаёт локальные файлы с правами 0600 и случайный session secret.
# Уже существующие файлы и session secret сохраняются.
node scripts/deploy-theme.mjs init stage
```

Заполните `deploy/environments/stage/server-env.json`: PUBLIC Headless token именно
stage-магазина, IAM application ID, OAuth client ID/secret и resource. URL уже заданы
для `pet.shopana.dev`. Зарегистрируйте этот origin и оба redirect URI в IAM application.
Файлы игнорируются Git; скрипт не копирует ключи из локального backend или в GitHub Actions.
`deploy.env` уже содержит digest опубликованного образа. Для ротации увеличивайте версию
`SERVER_ENV_SECRET` или `TUNNEL_SECRET`; существующие secrets никогда не перезаписываются.

Для приватного GHCR авторизуйтесь токеном с `read:packages` и доступом к package.
Не передавайте токен как аргумент командной строки и не записывайте его в deploy.env:

```sh
printf '%s' "$GHCR_READ_TOKEN" | docker --context internal-stage login ghcr.io \
  --username "$GITHUB_USER" --password-stdin

node scripts/deploy-theme.mjs check stage --context internal-stage
node scripts/deploy-theme.mjs deploy stage --context internal-stage
node scripts/deploy-theme.mjs status stage --context internal-stage
```

`check` выполняет только чтение: проверяет runtime-настройки и Terraform outputs,
существующий manager и overlay, минимум три ready/active linux/amd64-ноды, подключение
backend services к edge-сети, proxy hops, IAM public URL и доступность образа в registry.
Docker context требуется явно: скрипт не переключает глобальный context.

`deploy` сначала повторяет проверки, затем читает tunnel token из local Terraform state,
создаёт Docker secrets через stdin, создаёт config с хэшем launcher и выполняет
`docker stack deploy --with-registry-auth`. Повторный запуск с тем же содержимым secrets
безопасен; несовпадение содержимого требует нового имени версии. Старые secrets/configs
сохраняются для отката. Скрипт не выполняет Terraform apply и не включает Cache/WAF.

Если приватный образ заранее перенесён через artifact Actions, сначала проверьте его digest и
загрузите на **все** подходящие узлы. После этого используйте `check` и `deploy` с дополнительным
`--preloaded`. В этом режиме скрипт проверяет точный linux/amd64 digest в кэше manager и передаёт
`--resolve-image never`; оператор отвечает за предварительную загрузку остальных узлов. Сборка
образа не повторяется. Workflow темы поддерживает `mode=export` и `image_digest` для такого переноса.

Для service-managed клиента магазина берите зарегистрированный callback из
`customersQuery.storefrontAuthClient`. Headless OTP допускает callback другого origin: он
используется при серверном обмене кода, а origin cookies задаёт `NEXT_PUBLIC_APP_URL`.
Preflight проверяет OAuth credentials через canonical IAM и запрещает такой режим при включённых
social providers. Пустой `IAM_OAUTH_POST_LOGOUT_REDIRECT_URI` оставляет выход локальным для темы.
Социальному входу нужен доступный callback на origin самой темы.

Скрипт ждёт обе пары реплик `2/2`, завершения обновления и 90 секунд работы задач,
считает rollback ошибкой и выполняет публичный smoke: SSR, отсутствие private secrets
в HTML, same-origin GraphQL и canonical IAM discovery/issuer. Таймаут ожидания — 10 минут.
Healthcheck контейнера читает статический `manifest.webmanifest`, чтобы запуск реплик не
зависел от SSR-запросов к каталогу и не создавал их каждые несколько секунд при прогреве.
Полную готовность SSR отдельно проверяет публичный smoke после стабилизации стека.
Повторить HTTP-проверку отдельно:

```sh
node scripts/deploy-theme.mjs smoke stage
```

Login, logout, cookies и streaming агента дополнительно проверьте в браузере с реальным
пользователем. Эти действия публичный smoke без пользовательской сессии не доказывает.

### Совместимость с backend internal

API темы используют существующий Traefik: `shopana-stage-platform_traefik:8080`.
Tunnel сохраняет публичный адрес `pet.shopana.dev`, но задаёт origin Host
`api.shopana.dev` для GraphQL и `apps.shopana.dev` для агента. Эти Host выбирают уже
существующие Traefik routers; входящие browser Origin и bearer headers сохраняются.
Параметры origin и Host заданы явно в Terraform.

Для gateway сохраняется `STOREFRONT_TRUSTED_PROXY_HOPS=2` (Cloudflare → Traefik),
для самой темы — `1` (Cloudflare → theme). Traefik уже доверяет forwarded headers из
edge-сети `10.81.0.0/16`. `check` проверяет gateway hops, подключение Traefik/backend
к edge-сети и совпадение IAM public URL.

Авторизация использует существующий `https://auth.shopana.dev` и его issuer.
`/auth/login`, `/auth/callback`, `/auth/token`, `/auth/refresh`, `/auth/logout` остаются
BFF-маршрутами темы на `pet.shopana.dev`. IAM application должен разрешать origin темы,
callback и post-logout URI; OAuth secret остаётся в Docker secret темы. Общие настройки
бекенда и его issuer менять не требуется.

Диагностика и точечный откат сервисов темы:

```sh
docker --context internal-stage service logs --tail 100 shopana-theme-stage_theme
docker --context internal-stage service logs --tail 100 shopana-theme-stage_cloudflared
docker --context internal-stage service rollback shopana-theme-stage_theme
```

Логи могут содержать данные запросов; не публикуйте их без проверки. Откат сервиса
восстанавливает его предыдущий image/config/secret. Для согласованного возврата всего
стека укажите предыдущие digest и имена secrets в deploy.env и повторите deploy.

| Stage URL                                       | Назначение                           |
| ----------------------------------------------- | ------------------------------------ |
| `https://pet.shopana.dev`                       | Тема                                 |
| `https://pet.shopana.dev/graphql`               | Storefront API через Traefik         |
| `https://pet.shopana.dev/apps/pet-assistant/v1` | API агента и streaming через Traefik |
| `https://auth.shopana.dev`                      | Канонический IAM origin/issuer       |
| `https://pet.shopana.dev/auth/callback`         | OAuth callback темы                  |

Account/zone IDs в stage-примере взяты из Terraform `internal`; новая зона не создаётся.
Тема получает собственные Tunnel и DNS record в отдельном local state stage-профиля.
Основной домен и записи backend по-прежнему принадлежат Terraform `internal`.

## Маршрутизация через существующий Traefik

```text
pet.shopana.dev → Cloudflare → Tunnel → cloudflared
                                       ├─ /graphql → Traefik (Host: api.shopana.dev) → gateway
                                       ├─ /apps/pet-assistant/v1... → Traefik (Host: apps.shopana.dev) → агент
                                       └─ остальные пути → theme:3000

auth.shopana.dev → существующий Tunnel/Traefik internal → IAM
```

Порядок правил задан в Terraform. IAM не проксируется через домен темы.
`cloudflared` темы подключён к backend edge overlay и отдельной frontend-сети;
сама тема подключена только к frontend-сети. Traefik принадлежит platform stack internal.

Один и тот же публичный URL `https://<hostname>/graphql` используется браузером и SSR. Он
проходит через Cloudflare, поэтому нодам нужны исходящий HTTPS и доступ к публичному hostname.
Публиковать входящие порты темы, gateway или connector на хостах не требуется.

## Что используется на Free

Общий профиль `terraform/zone` управляет настройками только для списка `hostnames`.
Для текущего stage это `["pet.shopana.dev"]`: админка `shopana.dev`, API и другие поддомены
не включены в выражения CDN/WAF.

| Трафик                                                                    | Политика CDN                               |
| ------------------------------------------------------------------------- | ------------------------------------------ |
| HTML, React Router data, API, сессии, личный кабинет                      | Bypass                                     |
| `/assets/` — fingerprinted JS/CSS и импортированные Vite assets           | Edge/browser TTL 1 год                     |
| `/images/`, `/embed/`, `/error-game/`, favicon, manifest, robots, sitemap | Edge TTL 2 часа; browser headers из origin |

Это **3 из 10 бесплатных Cache Rules**. Query string остаётся частью стандартного cache key.
Не добавляйте изменяемые файлы без хэша в `/assets/`: браузерный годовой кэш не очищается purge.
Изображения с других доменов этим CDN-профилем не кэшируются.

Антиробот — **1 из 5 бесплатных WAF custom rules**: Managed Challenge для GET/HEAD страниц
перечисленных hostname, кроме проверенных Cloudflare ботов. Первый визит человека также может получить
проверку; после успешной проверки Cloudflare использует clearance cookie. API, IAM, callbacks,
ассистент, React Router `.data` и статика исключены. Это защита страниц, а не rate limit API.

Zone-wide Bot Fight Mode явно выключен: на Free его нельзя исключить по пути через WAF Skip,
и он может ломать SSR-запросы к same-origin API. Платные Bot Score, Super Bot Fight Mode,
Argo, Cache Reserve, Workers, кастомные cache keys и платные WAF rulesets не используются.
Free Managed Ruleset и базовая DDoS-защита Cloudflare остаются платформенными возможностями.

Один ruleset entry point на фазу принадлежит **одному Terraform state**. Поэтому CDN/WAF
нельзя дублировать в `production` и `stage`. Если зона уже содержит Cache/WAF rulesets,
сначала импортируйте их в профиль `zone` и перенесите существующие правила в конфигурацию:
не создавайте второй entry point и не удаляйте чужие правила. Для общей с `internal` зоны
согласуйте единственного владельца этих настроек. Ресурс Bot Management импортируется по zone ID.

## Предпосылки

- Домен уже делегирован Cloudflare; зона имеет Free plan и активный Universal SSL.
- Используется существующий Swarm `internal` с доступной backend edge overlay-сетью.
  Для двух реплик connector с `max_replicas_per_node: 1` и rolling update `start-first` нужны минимум
  **три подходящие ноды** с достаточными ресурсами. Тема обновляется `stop-first`: на время
  обновления работает одна реплика, зато обновление не зависит от свободного места на ноде. VM и Swarm этот Terraform не создаёт.
- Собранные образы доступны всем нодам в registry, с release tag или digest. Архитектура
  сборки должна совпадать с архитектурой нод.
- Отдельные Headless PUBLIC tokens и OAuth clients/redirect URI для production и stage.
- `CLOUDFLARE_API_TOKEN` с Tunnel Write для аккаунта, DNS Write и Zone WAF/Bot Management
  permissions для зоны; права должны позволять читать connector token. Токен задаётся через
  окружение, не через versioned файлы. Для текущего этапа Tunnel/DNS права CDN/WAF не нужны.

## Terraform

Структура совпадает с `internal`: `terraform/modules`, `terraform/environments/{stage,production}`.
Дополнительный профиль `terraform/zone` владеет общими CDN/WAF настройками.

Для каждого из `deploy/terraform/zone`, `deploy/terraform/environments/stage`,
`deploy/terraform/environments/production` скопируйте `backend.hcl.example` в `backend.hcl`,
`terraform.tfvars.example` в `terraform.tfvars` и заполните значения. Для обоих окружений
укажите собственные `hostname`, origins Traefik, Host headers его routers и canonical IAM URL. Если окружения находятся в одной Cloudflare-зоне,
используйте её существующий zone ID и перечислите нужные hostname в общем профиле `zone`.
Stage-примеры уже содержат `pet.shopana.dev` и account/zone IDs из `internal`.
Local state каждого профиля хранится в его `.state/terraform.tfstate`, например
`deploy/terraform/environments/stage/.state/terraform.tfstate`. Эти файлы игнорируются Git.
Храните их резервные копии в защищённом месте: state содержит connector token и определяет
владение созданными ресурсами. State backend `internal` не используется и не изменяется.

После изменения маршрутов stage повторите `plan`/`apply` этого профиля перед deploy темы;
это обновляет существующий tunnel config, не создаёт новый Swarm и не включает CDN/WAF.

Перед применением общего профиля проверьте доступ токена к Rulesets API: чтения зоны и DNS
недостаточно. Для CDN нужны Cache Rules/Cache Settings permissions, для защиты — Zone WAF,
для изменения Bot Fight Mode — соответствующие Bot Management permissions. Если list rulesets
возвращает 403, сначала дополните права и проверьте существующие entry points.

**Текущий этап: только Tunnel и DNS для `pet.shopana.dev`.** Профиль `terraform/zone`
отложен: Cache Rules, WAF и Bot Management сейчас не применяются. Они не входят в stage-профиль,
поэтому его можно планировать и применять независимо от дополнительных прав на CDN/WAF.

```sh
umask 077
terraform -chdir=deploy/terraform/environments/stage init -backend-config=backend.hcl
terraform -chdir=deploy/terraform/environments/stage plan -out=release.tfplan
terraform -chdir=deploy/terraform/environments/stage apply release.tfplan
```

После отдельного решения включить CDN/WAF выполните `init`, `plan`, `apply` для
`deploy/terraform/zone`; до этого настройки зоны остаются существующими.

Для production замените `stage` на `production`. Обе конфигурации выводят `app_url`,
`graphql_url`, `tunnel_id` и sensitive `tunnel_token`. State содержит connector token:
доступ к нему должен быть ограничен. Не публикуйте state, plans или raw output токена.

Также доступны `iam_url` и `pet_assistant_url` для `NEXT_PUBLIC_IAM_URL` и
`NEXT_PUBLIC_PET_ASSISTANT_URL`. API агента использует `.../apps/pet-assistant/v1`, включая
`/threads`, `/files` и streaming `/copilotkit/...`. Все эти пути проходят через существующий Traefik на backend
без CDN-кэша и frontend challenge; bearer token и visitor headers передаются без изменения.
Тема получает access token через свой `/auth/token`, добавляет его к запросам агента,
а confidential client secret и refresh token остаются на сервере.

Все настройки подключения — runtime-конфигурация: `NEXT_PUBLIC_*`, OAuth client credentials
и session secret задаются в `server-env.json`. Публичная часть передаётся браузеру в SSR HTML,
остальные значения остаются серверными. Смена ключа или URL не требует нового билда.

`STOREFRONT_SERVER_GRAPHQL_URL` — внутренний адрес шлюза для серверных запросов темы (на stage
`http://gateway-storefront:4000/graphql`, сервис доступен через сеть `BACKEND_NETWORK`). Браузер и
боты по-прежнему ходят на `NEXT_PUBLIC_GRAPHQL_URL`; этот адрес в браузер не передаётся. Без
переменной сервер тоже ходит на публичный адрес. Мимо Cloudflare и Traefik тема сама задаёт
`X-Forwarded-For: <адрес покупателя>, storefront-server` и `User-Agent` покупателя: шлюз с
`STOREFRONT_TRUSTED_PROXY_HOPS=2` читает адрес покупателя тем же правилом. Адрес берётся по
`STOREFRONT_TRUSTED_PROXY_HOPS` темы, поэтому подделанные клиентом записи до шлюза не доходят.
Не подключайте подсеть `BACKEND_NETWORK` к `STOREFRONT_TRUSTED_FORWARDER_CIDRS`: в ней же работает
Traefik, и шлюз начнёт отвечать `STOREFRONT_BUYER_IP_INVALID` на все запросы браузера.
Application ID, client ID, resource и зарегистрированные redirect URI должны принадлежать
одному IAM application соответствующего окружения.

## Сборка образа

Workflow `.github/workflows/build-theme.yml` находится в приватном репозитории
`shopanaio/storefront-brand-bite-and-crunch`. Он запускается при push ветки и поддерживает
ручной `workflow_dispatch` с выбором commit/ref framework. Секреты и environment-specific
variables в Actions не нужны. `GITHUB_TOKEN` используется только для checkout своей темы
и публикации в GHCR; публичный framework checkout закреплён на SHA.

Один образ `linux/amd64` публикуется в `ghcr.io/shopanaio/storefront-brand-bite-and-crunch/theme`.
Tag содержит SHA темы и framework, summary — immutable digest для `THEME_IMAGE`.
Образ несёт статику одного окружения (см. «Статика»): tag оканчивается на `-<environment>`.

```sh
docker buildx build --platform linux/amd64 --push \
  -t ghcr.io/YOUR_ORG/THEME:RELEASE .
```

Ручной запуск после появления workflow на default branch:

```sh
gh workflow run build-theme.yml --repo shopanaio/storefront-brand-bite-and-crunch \
  --ref <theme-branch>
```

В `deploy/environments/<environment>` скопируйте `deploy.env.example` и
`server-env.json.example` в файлы без `.example`. Они игнорируются Git и Docker build context.
В `deploy.env` задайте digest одного и того же образа, имена Docker secrets и backend network.
В `server-env.json` задайте PUBLIC Headless token, URL окружения, IAM application/client IDs,
OAuth client secret и случайный session secret длиной минимум 32 символа.
Runtime URL должны совпадать с Terraform outputs. Отключая IAM/ассистент, очистите их
публичные переменные и удалите ненужные OAuth keys из JSON.

Зарегистрируйте в IAM origin `https://<hostname>`, callback
`https://<hostname>/auth/callback` и post-logout URI `https://<hostname>/`.
Проверьте public base URL/issuer IAM: Tunnel не переписывает JSON discovery или `Location`.

## Статика

План `plans/static-site-generation.ru.md`, шаг A. Тема отдаёт готовый HTML гостевых страниц
и рендерит SSR только то, чего в статике нет (`x-shopana-static: hit | miss`).

- **Статика в образе.** `build-theme.yml` между `yarn build` и `docker build` выполняет
  `storefront-runtime static build` против API выбранного окружения (`environment` workflow,
  ночью `stage`); Dockerfile берёт в образ ту же `.runtime/build` (server, client, static), которой
  статика отрендерена, а не пересобирает тему.
  Поэтому образ привязан к окружению: tag получает суффикс `-<environment>`. Без
  `STATIC_STORE` в `deploy.env` тема отдаёт статику образа.
- **Бакет.** `deploy/terraform/zone` (`static_site_buckets`, `cloudflare_account_id`) создаёт
  бакет R2 на окружение и два ключа S3: чтение для темы (`static_site_read_keys` →
  `STOREFRONT_STATIC_S3_ACCESS_KEY_ID`/`..._SECRET_ACCESS_KEY` в `server-env.json`), запись для
  GitHub Actions (`static_site_write_keys` → secrets окружения в репозитории темы). В
  `deploy.env` задайте `STATIC_STORE` и `STATIC_ENDPOINT` из output `static_site`. Бакет пишет
  `static-site.yml` темы по заданиям координатора (ниже), ночью и по ручному запуску — полной
  сборкой; на шаге A без purge: реплики видят новые страницы через `STOREFRONT_STATIC_CACHE_TTL`
  (10 с).
- `CLOUDFLARE_API_TOKEN` профиля `zone` для бакетов дополнительно нужны права аккаунта
  Workers R2 Storage Write (бакет), API Tokens Write (ключи) и чтение permission groups.
  `apply` профиля `zone` применяет и его Cache Rules, WAF и Bot Management (см. «Terraform»).
- Variables окружения GitHub Actions темы: `STOREFRONT_PUBLIC_URL`, `NEXT_PUBLIC_GRAPHQL_URL`,
  `NEXT_PUBLIC_API_KEY`, `STOREFRONT_STATIC_STORE`, `STOREFRONT_STATIC_S3_ENDPOINT`; secrets:
  `STOREFRONT_PRIVATE_TOKEN`, `STOREFRONT_SERVER_GRAPHQL_URL` (необязателен),
  `STOREFRONT_STATIC_S3_ACCESS_KEY_ID`, `STOREFRONT_STATIC_S3_SECRET_ACCESS_KEY`.
- `deploy-theme.mjs smoke` проверяет `hit`, `ETag` и `304` главной, `miss` и `no-store`
  неизвестного товара, `/__env.js`, отсутствие секретов в HTML и `/__builder/api/health`
  координатора.

### Координатор `theme-static`

План `plans/static-coordinator.ru.md`. Сервис `theme-static` того же образа
(`storefront-runtime static coordinator`, порт 3100, одна реплика) читает ленту событий магазина,
держит индекс зависимостей страниц в SQLite на volume `theme-static-data`, ставит задания и
запускает `static-site.yml` темы через GitHub App; рендер и публикация идут в GitHub Actions.

- Нода volume: `docker node update --label-add shopana.static=true <node>` (одна).
- Tunnel: `/__builder/*` публичного hostname идёт на `theme-static:3100`
  (`static_coordinator_origin` окружения в Terraform), Cache Rules и challenge его не трогают.
- `deploy.env`: `STATIC_ENV_SECRET` (имя Docker secret), `STATIC_GITHUB_REPOSITORY`,
  `STATIC_GITHUB_APP_ID`, `STATIC_GITHUB_INSTALLATION_ID`, `SHOPANA_ADMIN_GRAPHQL_URL`,
  `SHOPANA_STORE_NAME`, `SHOPANA_EVENTS_TOKEN_URL`, `SHOPANA_EVENTS_CLIENT_ID`; шаг B —
  `CLOUDFLARE_ZONE_ID`. `STATIC_ENVIRONMENT` скрипт задаёт по профилю.
- `static-env.json` (рядом с `server-env.json`, игнорируется Git): refresh-токен служебного
  пользователя ленты, `STATIC_OPERATOR_TOKEN`, internal token `STOREFRONT_STATIC_COORDINATOR_TOKEN`
  (тот же, что в `server-env.json` темы: им нода сообщает о попаданиях), PEM ключа GitHub App,
  ключ записи бакета для снимков индекса (`__builder/index/`), шаг B — `CLOUDFLARE_PURGE_TOKEN`.
  `init` создаёт файл со случайными токенами.
- GitHub App `shopana-static-dispatch`: одно разрешение `Actions: Read and write`, установлен
  только в репозиторий темы. Job аутентифицируется OIDC (`id-token: write`, audience
  `shopana-static-coordinator`); координатор принимает только `static-site.yml@refs/heads/main`
  своего окружения.
- После деплоя с новым `THEME_IMAGE` скрипт ставит полную сборку
  (`POST /__builder/api/builds {mode: 'full', image}`). Ручной запуск:

  ```bash
  curl -X POST "$APP_URL/__builder/api/builds" -H "Authorization: Bearer $STATIC_OPERATOR_TOKEN" \
    -H 'Content-Type: application/json' -d '{"mode":"entities","entities":["Product:<uuid>"],"reason":"manual"}'
  ```

- Состояние: `GET /__builder/api/status` (очередь, dirty, курсор и его отставание, аренды,
  `currentImage`, последняя полная сборка, очередь purge, `dead_jobs`).

## Secrets и запуск stack

Используйте `scripts/deploy-theme.mjs deploy` из раздела выше: он проверяет совместимость
backend, создаёт versioned secrets с метками содержимого и запускает отдельный stack.
Для ротации задайте новые имена secrets в `deploy.env` и повторите deploy с тем же
`THEME_IMAGE`. Swarm выполнит rolling update контейнеров; пересборка образа не требуется.
Secrets, ранее созданные вручную без метки содержимого, скрипт не переиспользует:
для первого управляемого деплоя задайте новые имена версий.

Connector получает только tunnel secret, тема — только server-env JSON, `theme-static` — только
static-env JSON. Launcher читает secret,
проверяет имена серверных переменных и длину session secret, запускает сервер и передаёт сигналы.
API token Cloudflare в контейнеры не передаётся.

## Проверка после деплоя

- В `docker stack services` обе реплики темы и обе реплики connector должны быть `2/2`,
  `theme-static` — `1/1`.
- Откройте домен в браузере: проверьте главную, категорию, товар, login и streaming агента.
- В Network браузера GraphQL должен идти на `https://<тот же hostname>/graphql` без CORS.
- Cache Rules/WAF пока отложены: `HIT` и challenge не являются условиями текущего деплоя.
  HTML и `/graphql` не должны становиться `HIT`. Healthcheck темы ходит прямо в контейнер
  и проверяет SSR.

Без Cloudflare credentials, настоящего домена и `terraform apply` проверяются только схемы,
план с mock provider и локальная конфигурация stack. Проверка реального edge выполняется
после deploy.

## Официальные источники

- [Tunnel с Terraform](https://developers.cloudflare.com/tunnel/guides/terraform/)
- [Параметры cloudflared и token-file](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/configure-tunnels/run-parameters/)
- [Cache Rules: 10 правил на Free](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [WAF custom rules: доступность и Managed Challenge](https://developers.cloudflare.com/waf/custom-rules/)
- [Bot Fight Mode и ограничения исключений](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/)
