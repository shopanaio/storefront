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

| Stage URL | Назначение |
| --- | --- |
| `https://pet.shopana.dev` | Тема и публичная база IAM |
| `https://pet.shopana.dev/graphql` | Storefront API |
| `https://pet.shopana.dev/apps/pet-assistant/v1` | API агента и streaming |
| `https://pet.shopana.dev/auth/callback` | OAuth callback темы |

Account/zone IDs в stage-примере взяты из Terraform `internal`; новая зона не создаётся.
Тема получает собственные Tunnel и DNS record в отдельном local state stage-профиля.
Основной домен и записи backend по-прежнему принадлежат Terraform `internal`.

## Маршрутизация без Traefik

```text
Браузер → Cloudflare CDN/WAF → Tunnel → cloudflared
                                       ├─ /graphql                → storefront gateway
                                       ├─ /auth/applications/...   → IAM
                                       ├─ /.well-known/oauth-...   → IAM discovery
                                       ├─ /apps/pet-assistant/v1... → Pet Assistant
                                       └─ остальные пути          → theme:3000
```

Порядок правил задан в Terraform. `/auth/login`, `/auth/callback` и `/auth/logout` остаются
маршрутами самой темы. Origins backend — приватные DNS-имена сервисов в overlay-сети `internal`,
как `shopana-stage-app_gateway-storefront:4000`. `cloudflared` подключён и к этой сети, и к
отдельной frontend-сети stack. Тема подключена только к frontend-сети.

Один и тот же публичный URL `https://<hostname>/graphql` используется браузером и SSR. Он
проходит через Cloudflare, поэтому нодам нужны исходящий HTTPS и доступ к публичному hostname.
Публиковать входящие порты темы, gateway или connector на хостах не требуется.

## Что используется на Free

Общий профиль `terraform/zone` управляет настройками только для списка `hostnames`.
Для текущего stage это `["pet.shopana.dev"]`: админка `shopana.dev`, API и другие поддомены
не включены в выражения CDN/WAF.

| Трафик | Политика CDN |
| --- | --- |
| HTML, React Router data, API, сессии, личный кабинет | Bypass |
| `/assets/` — fingerprinted JS/CSS и импортированные Vite assets | Edge/browser TTL 1 год |
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
  Для двух реплик с `max_replicas_per_node: 1` и rolling update `start-first` нужны минимум
  **три подходящие ноды** с достаточными ресурсами. VM и Swarm этот Terraform не создаёт.
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
укажите собственные `hostname` и origins backend. Если окружения находятся в одной Cloudflare-зоне,
используйте её существующий zone ID и перечислите нужные hostname в общем профиле `zone`.
Stage-примеры уже содержат `pet.shopana.dev` и account/zone IDs из `internal`.
Local state каждого профиля хранится в его `.state/terraform.tfstate`, например
`deploy/terraform/environments/stage/.state/terraform.tfstate`. Эти файлы игнорируются Git.
Храните их резервные копии в защищённом месте: state содержит connector token и определяет
владение созданными ресурсами. State backend `internal` не используется и не изменяется.

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
`/threads`, `/files` и streaming `/copilotkit/...`. Все эти пути проходят на backend
без CDN-кэша и frontend challenge; bearer token и visitor headers передаются без изменения.
Тема получает access token через свой `/auth/token`, добавляет его к запросам агента,
а confidential client secret и refresh token остаются на сервере.

`NEXT_PUBLIC_IAM_URL` и `NEXT_PUBLIC_IAM_APPLICATION_ID` нужны также в runtime окружении:
OAuth-обработчики читают их динамически из `process.env`. Dockerfile сохраняет значения
сборки в итоговом образе, а Swarm явно передаёт их из экспортированного `build.env`.
Application ID, client ID, resource и зарегистрированные redirect URI должны принадлежать
одному IAM application соответствующего окружения.

## Сборка каждого окружения

### GitHub Actions

Workflow `.github/workflows/build-theme.yml` находится в приватном репозитории
`shopanaio/storefront-brand-bite-and-crunch`. Он выполняется на push ветки и поддерживает
ручной `workflow_dispatch` с выбором окружения и commit/ref публичного framework.
Так `GITHUB_TOKEN` читает исходники своей темы без cross-repository PAT или deploy key.
Framework checkout закреплён на SHA, а образ получает tag с SHA темы и framework.

Образ публикуется в `ghcr.io/shopanaio/storefront-brand-bite-and-crunch/theme` для
`linux/amd64`, как backend `internal`. Полный digest выводится в summary сборки;
его можно использовать как `THEME_IMAGE` в Swarm.

В Actions environment `stage` задаются:

- secret `SHOPANA_API_KEY`: только PUBLIC Headless access token;
- variable `NEXT_PUBLIC_APP_URL`: `https://pet.shopana.dev`;
- variable `NEXT_PUBLIC_IAM_APPLICATION_ID`: IAM application ID магазина;
- при необходимости variables `NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_IAM_URL`,
  `NEXT_PUBLIC_PET_ASSISTANT_URL`, `NEXT_PUBLIC_CART_COOKIE_NAME`,
  `NEXT_PUBLIC_STOREFRONT_COOKIE_POLICY`.

Stage URL по умолчанию — `pet.shopana.dev`; service URL формируются в том же origin.
Без IAM application ID вход покупателей отключён. Production требует собственный
`NEXT_PUBLIC_APP_URL` и environment secrets/variables. Серверные OAuth secrets и session key
в сборку не передаются — только в runtime Docker secrets.

Push запускает проверку workflow на feature-ветке без изменения `main`. Для ручного запуска
через кнопку/CLI GitHub требует, чтобы workflow был доступен на default branch:

```sh
gh workflow run build-theme.yml --repo shopanaio/storefront-brand-bite-and-crunch \
  --ref <theme-branch> -f environment=stage
```

### Локальная сборка

В `deploy/environments/<environment>` скопируйте `build.env.example`, `deploy.env.example`
и `server-env.json.example` в файлы без `.example`. Они игнорируются Git и Docker build context.
В `build.env` задайте URL своего окружения и **PUBLIC**, а не PRIVATE Headless token.
URL должны совпадать с Terraform outputs. Отключая IAM/ассистент в Terraform, очистите их
публичные переменные и удалите ненужные OAuth keys из server-env JSON.

```sh
PROFILE=stage
set -a
. "./deploy/environments/$PROFILE/build.env"
. "./deploy/environments/$PROFILE/deploy.env"
set +a

docker buildx build --platform linux/amd64 --push -t "$THEME_IMAGE" \
  --build-arg STOREFRONT_THEME \
  --build-arg NEXT_PUBLIC_APP_URL \
  --build-arg NEXT_PUBLIC_GRAPHQL_URL \
  --build-arg NEXT_PUBLIC_API_KEY \
  --build-arg NEXT_PUBLIC_IAM_URL \
  --build-arg NEXT_PUBLIC_IAM_APPLICATION_ID \
  --build-arg NEXT_PUBLIC_PET_ASSISTANT_URL \
  --build-arg NEXT_PUBLIC_CART_COOKIE_NAME .
```

Публичные URL встраиваются в bundle: для production нужен отдельный образ. В server-env JSON
задайте случайный session secret длиной минимум 32 символа, серверный OAuth client secret,
resource и callback. Зарегистрируйте в IAM origin `https://<hostname>`, callback
`https://<hostname>/auth/callback` и post-logout URI `https://<hostname>/`.
Проверьте public base URL/issuer конфигурации IAM: discovery и redirect должны возвращать
нужные публичные URL. Tunnel не переписывает JSON discovery или заголовки `Location` backend.

## Secrets и запуск stack

Следующие команды выполняются Docker CLI, подключённым к manager нужного Swarm. Используйте
профиль из предыдущего шага и своё активное Docker context. Создавайте versioned secrets один
раз; для ротации задайте новые имена в `deploy.env` и повторите deploy.

```sh
terraform -chdir="deploy/terraform/environments/$PROFILE" output -raw tunnel_token \
  | docker secret create "$TUNNEL_SECRET" -
docker secret create "$SERVER_ENV_SECRET" "deploy/environments/$PROFILE/server-env.json"

# Content-addressed config: изменения launcher создают новый Docker config.
LAUNCHER_HASH=$(shasum -a 256 deploy/runtime/start.cjs | cut -c1-12)
export LAUNCHER_CONFIG="shopana-theme-$PROFILE-launcher-$LAUNCHER_HASH"

docker network inspect "$BACKEND_NETWORK" >/dev/null
docker compose -f deploy/swarm/theme.yml config --quiet
docker stack config -c deploy/swarm/theme.yml >/dev/null
docker stack deploy --with-registry-auth -c deploy/swarm/theme.yml "shopana-theme-$PROFILE"
docker stack services "shopana-theme-$PROFILE"
```

Connector получает только tunnel secret, тема — только server-env JSON. Launcher читает secret,
проверяет имена серверных переменных и длину session secret, запускает сервер и передаёт сигналы.
API token Cloudflare в контейнеры не передаётся.

## Проверка после деплоя

- В `docker stack services` обе реплики темы и обе реплики connector должны быть `2/2`.
- Откройте домен в браузере: пройдите challenge, проверьте главную, категорию, товар и login.
- В Network браузера GraphQL должен идти на `https://<тот же hostname>/graphql` без CORS.
- На повторном запросе публичного `/assets/<hash>.js` ожидается `CF-Cache-Status: HIT`
  после прогрева; HTML и `/graphql` не должны становиться `HIT`.
- Запросы без браузерного clearance могут получить challenge вместо HTML: учитывайте это
  при публичных smoke tests. Healthcheck темы ходит прямо в контейнер и проверяет SSR.

Без Cloudflare credentials, настоящего домена и `terraform apply` проверяются только схемы,
план с mock provider и локальная конфигурация stack. Проверка реального edge выполняется
после deploy.

## Официальные источники

- [Tunnel с Terraform](https://developers.cloudflare.com/tunnel/guides/terraform/)
- [Параметры cloudflared и token-file](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/configure-tunnels/run-parameters/)
- [Cache Rules: 10 правил на Free](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [WAF custom rules: доступность и Managed Challenge](https://developers.cloudflare.com/waf/custom-rules/)
- [Bot Fight Mode и ограничения исключений](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/)
