# CDN и Worker для публичного Neon S3

Этот профиль управляет Worker `storefront-static-stage`, Worker API `storefront-api-stage`, их
маршрутами, Cache Rules и Smart Tiered Cache зоны `shopana.dev`. R2, WAF, Bot Management, DNS и
Tunnel здесь не создаются и не меняются.
HTML: Cache API → публичный Neon S3 → существующий origin Traefik → Node SSR.
Генерацию отсутствующего HTML по-прежнему ставит в очередь Node.
API: Worker API на `<hostname>/graphql*` → GET-подзапрос `?__cdn=…` через кеш зоны → Tunnel →
Traefik → storefront-шлюз (план `internal/plans/storefront-cdn-worker-cache.ru.md`).

## Владение конфигурацией

Профиль введён 20 ноября 2026. До применения API подтвердил отсутствие пользовательского
ruleset фазы `http_request_cache_settings`, Worker и его маршрутов.
После применения **этот state — единственный владелец Cache Rules этой зоны**.
Не применяйте одновременно `cloudflare_ruleset.cache` из профиля `deploy/terraform/zone`:
у зоны один entry point на фазу. Для переноса владения нужен согласованный перенос state,
а не создание второго ruleset. Worker этого профиля обновляется Terraform, не Wrangler.

## Входные данные и запуск

Скопируйте `backend.hcl.example` в `backend.hcl` и `terraform.tfvars.example` в
`terraform.tfvars`; заполните account, zone, hostname, Worker и публичный origin бакета.
Для stage origin — endpoint Neon с `/theme-static`, без `/site`: prefix задаётся binding.
Токен Cloudflare передайте через `CLOUDFLARE_API_TOKEN`, внутренний токен координатора —
через `TF_VAR_coordinator_token` (из stage `static-env.json`). Не передавайте токены в CLI
аргументах и не добавляйте их в Git.

Из корня storefront:

```bash
mkdir -p deploy/terraform/cdn/.state
node_modules/.bin/esbuild deploy/worker/src/http-worker.ts --bundle --format=esm \
  --target=es2022 --outfile=deploy/terraform/cdn/.state/worker.js
node_modules/.bin/esbuild deploy/worker/src/api-worker.ts --bundle --format=esm \
  --target=es2022 --outfile=deploy/terraform/cdn/.state/api-worker.js
terraform -chdir=deploy/terraform/cdn init -backend-config=backend.hcl
terraform -chdir=deploy/terraform/cdn validate
terraform -chdir=deploy/terraform/cdn plan -out=.state/deploy.tfplan
terraform -chdir=deploy/terraform/cdn apply .state/deploy.tfplan
```

Проверьте plan перед apply. State и plan содержат секретный binding координатора:
держите `.state` с правами `0700`, файлы — `0600`. Они игнорируются Git.
Токен из Infisical при первом выкате загружался программно и передавался Terraform через env;
значение не печаталось.

## Кэш и проверки

- HTML хранится на edge 60 секунд; браузеру выставляется `max-age=0` и на MISS, и на HIT.
- TTL выбран коротким, поскольку автоматический purge после генерации пока не подключён.
  Смена объекта в S3 сама по себе не очищает уже сохранённый HTML CDN.
- `x-shopana-cdn: MISS | HIT` показывает результат Cache API.
  `x-shopana-static-server: worker` показывает выдачу объекта Worker-ом.
- Авторизация, аккаунт, корзина, checkout, API, поиск и локализованные варианты этих путей
  обходят кэш; параметры, меняющие страницу, тоже обходят его. SSR-ответы не сохраняются.
- Хэшированные `/assets/*` идут без Worker и кэшируются правилами зоны на год;
  `/images/*`, `/embed/*`, `/error-game/*`, favicon и manifest — на два часа.
- На stage сохраняется `X-Robots-Tag: noindex, nofollow`.
- Cloudflare Cache API хранит данные отдельно в каждом датацентре. MISS в другом городе
  после HIT в первом — нормален.

```bash
curl -sSI https://pet.shopana.dev/
curl -sSI https://pet.shopana.dev/
curl -sSI https://pet.shopana.dev/cart
curl -sSI 'https://pet.shopana.dev/?sort=NEWEST'
```

Ожидается MISS → HIT для главной; у динамических страниц нет `x-shopana-cdn: HIT`.
При обновлении HTML можно дождаться TTL или выполнить разрешённый API purge. Полный purge
зоны затрагивает также другие её hostname; не используйте его без необходимости.

## Worker API и кеш ответов storefront API

- Выкладка: сначала `cdn_mode = "off"` (Worker только пересылает POST как есть), затем
  `cdn_mode = "on"` и в окружении шлюза `CACHE_CDN_ENABLED=true`.
- `key_contract` равен `CDN_KEY_CONTRACT` шлюза (`internal/infra/federation/cdn/contract.ts`):
  хеш состава ключа и белого списка заголовков подзапроса. При несовпадении шлюз отвечает
  `Shopana-Cdn-Bypass: contract-mismatch`, и ответы не кешируются.
- `max_document_bytes` равен `gateway.storefront.max_document_bytes` шлюза.
- Cache Rule `theme_graphql_cdn` идёт после `theme_dynamic`: последнее совпавшее правило
  перекрывает `cache = false`. Срок — по `Cloudflare-CDN-Cache-Control` шлюза; ответ без
  заголовка срока и статусы от 300 не хранятся, устаревшая копия не отдаётся. Правило действует
  только на строку запроса, которая начинается с `__cdn=`.
- Маршрут `/graphql*` переходит из маршрутов без скрипта в маршрут Worker API блоком `moved`:
  первое применение меняет маршрут на месте. Tiered Caching зоны включается вместе со Smart
  topology.
- Purge Everything не используется: зона общая со статическим сайтом. Сброс кеша API магазина —
  purge тега `gateway:cdn:store:{storeId}`, всего API окружения — `gateway:cdn:api` (оба через
  `cdnTag` с namespace окружения). Лимит purge аккаунта делится поровну между исполнителем purge
  API (`runtime-scheduler` в `internal`) и сборщиком статического сайта
  (`CLOUDFLARE_PURGE_PLAN`).
- Метрики Worker — датасет Analytics Engine `storefront_api_cdn`: `blob1` — результат (`hit`,
  `miss`, `expired`, `bypass`, `error`), `blob2` — причина (`slow-fill` — заполнение из origin, `miss` или `expired`, дольше 5 с),
  `blob3` — colo, `blob4` — первый тег языка, `double1` — длительность в мс.

```bash
curl -sS -D - -o /dev/null https://pet.shopana.dev/graphql \
  -H 'content-type: application/json' -H 'x-shopana-storefront-access-token: <публичный>' \
  --data '{"query":"query Menu{__typename}"}' | grep -i shopana-cdn
```

### Необязательные возможности аккаунта

`analytics_engine_enabled = false` исключает привязку Analytics Engine, когда сервис ещё не включён
в аккаунте. Worker и кеш продолжают работать, метрики датасета не записываются.
`manage_smart_tiered_cache = false` пропускает управление Smart topology при отсутствии у токена
`Zone Settings Edit`; обычный Tiered Cache остаётся включён. Для полного профиля включите Analytics
Engine в аккаунте, добавьте право токену и верните оба значения в `true` (значения по умолчанию).
