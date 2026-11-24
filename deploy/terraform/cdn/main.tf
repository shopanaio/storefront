# Этот state владеет CDN-фазой зоны. Не применяйте параллельно cache resource профиля zone.
variable "account_id" { type = string }
variable "zone_id" { type = string }
variable "hostname" { type = string }
variable "site_origin" { type = string }
variable "worker_name" { type = string }
variable "noindex" {
  type    = bool
  default = true
}
variable "coordinator_token" {
  type      = string
  sensitive = true
}
variable "api_worker_name" { type = string }
# Worker API: `off` — только POST к шлюзу как есть, `on` — CDN-путь анонимных публичных query.
variable "cdn_mode" {
  type    = string
  default = "off"
  validation {
    condition     = contains(["on", "off"], var.cdn_mode)
    error_message = "cdn_mode must be on or off."
  }
}
# Необязательные возможности аккаунта: кеш работает и без привязки метрик/Smart topology.
variable "analytics_engine_enabled" {
  type    = bool
  default = true
}
variable "manage_smart_tiered_cache" {
  type    = bool
  default = true
}
# Хеш состава ключа и белого списка заголовков; равен CDN_KEY_CONTRACT шлюза
# (internal/infra/federation/cdn/contract.ts).
variable "key_contract" {
  type    = string
  default = "80bfe35a"
}
# Равен gateway.storefront.max_document_bytes шлюза.
variable "max_document_bytes" {
  type    = number
  default = 32768
}

locals {
  bundle     = "${path.module}/.state/worker.js"
  api_bundle = "${path.module}/.state/api-worker.js"
  host       = "http.host eq ${jsonencode(var.hostname)}"
  bypass     = toset(["/assets/*", "/auth/*", "/__builder/*", "/apps/*", "/.well-known/*", "/cdn-cgi/*"])
}

resource "cloudflare_workers_script" "static" {
  account_id         = var.account_id
  script_name        = var.worker_name
  main_module        = "worker.js"
  content_file       = local.bundle
  content_sha256     = filesha256(local.bundle)
  compatibility_date = "2026-10-01"
  bindings = [
    { name = "SITE_ORIGIN", type = "plain_text", text = var.site_origin },
    { name = "SITE_PREFIX", type = "plain_text", text = "site" },
    { name = "PAGE_TTL", type = "plain_text", text = "60" },
    { name = "NOINDEX", type = "plain_text", text = tostring(var.noindex) },
    { name = "COORDINATOR_URL", type = "plain_text", text = "https://${var.hostname}" },
    { name = "COORDINATOR_TOKEN", type = "secret_text", text = var.coordinator_token },
  ]
}

resource "cloudflare_workers_route" "static" {
  zone_id = var.zone_id
  pattern = "${var.hostname}/*"
  script  = cloudflare_workers_script.static.script_name
}

# Worker API: переводит кешируемый POST в GET-подзапрос к своей зоне; хранит ответ кеш зоны.
# Предел cpu_ms не задаётся: на Workers Paid оплачивается фактическое время, а ошибка лимита
# ударила бы по оформлению заказа.
resource "cloudflare_workers_script" "api" {
  account_id         = var.account_id
  script_name        = var.api_worker_name
  main_module        = "api-worker.js"
  content_file       = local.api_bundle
  content_sha256     = filesha256(local.api_bundle)
  compatibility_date = "2026-10-01"
  bindings = concat([
    { name = "CDN_MODE", type = "plain_text", text = var.cdn_mode },
    { name = "KEY_CONTRACT", type = "plain_text", text = var.key_contract },
    { name = "MAX_DOCUMENT_BYTES", type = "plain_text", text = tostring(var.max_document_bytes) },
    ], var.analytics_engine_enabled ? [
    { name = "ANALYTICS", type = "analytics_engine", dataset = "storefront_api_cdn" },
  ] : [])
}

resource "cloudflare_workers_route" "api" {
  zone_id = var.zone_id
  pattern = "${var.hostname}/graphql*"
  script  = cloudflare_workers_script.api.script_name
}

# Маршрут /graphql* без скрипта становится маршрутом Worker API на месте: удаление и создание
# маршрута с тем же шаблоном Cloudflare отклоняет, а в промежутке /graphql* ушёл бы в /*.
moved {
  from = cloudflare_workers_route.bypass["/graphql*"]
  to   = cloudflare_workers_route.api
}

# Копия ответа API общая для дата-центров, а не своя в каждом, как у caches.default. Smart
# topology действует только при включённом Tiered Caching зоны.
resource "cloudflare_argo_tiered_caching" "on" {
  zone_id = var.zone_id
  value   = "on"
}

resource "cloudflare_tiered_cache" "smart" {
  count   = var.manage_smart_tiered_cache ? 1 : 0
  zone_id = var.zone_id
  value   = "on"
}

resource "cloudflare_workers_route" "bypass" {
  for_each = local.bypass
  zone_id  = var.zone_id
  pattern  = "${var.hostname}${each.value}"
}

resource "cloudflare_ruleset" "cache" {
  zone_id = var.zone_id
  name    = "Storefront CDN"
  kind    = "zone"
  phase   = "http_request_cache_settings"
  rules = [
    {
      ref               = "theme_dynamic"
      description       = "Dynamic responses are never stored by zone cache; guest HTML uses Worker Cache API"
      expression        = local.host
      action            = "set_cache_settings"
      action_parameters = { cache = false }
    },
    {
      # Последнее совпавшее правило перекрывает cache = false правила theme_dynamic. Срок задаёт
      # шлюз (Cloudflare-CDN-Cache-Control); ответ без заголовка срока и статусы от 300 не
      # хранятся, устаревшая копия не отдаётся. Worker всегда ставит __cdn первым параметром.
      ref               = "theme_graphql_cdn"
      description       = "Storefront API: GET subrequests of the API Worker, stored by origin TTL"
      expression        = "(${local.host}) and http.request.uri.path eq \"/graphql\" and http.request.method eq \"GET\" and starts_with(http.request.uri.query, \"__cdn=\")"
      action            = "set_cache_settings"
      action_parameters = { cache = true, edge_ttl = { mode = "bypass_by_default", status_code_ttl = [{ status_code_range = { from = 300, to = 599 }, value = -1 }] }, browser_ttl = { mode = "bypass" }, serve_stale = { disable_stale_while_updating = true } }
    },
    {
      ref               = "theme_public_assets"
      description       = "Public assets: two hours at the edge"
      expression        = "(${local.host}) and http.request.method in {\"GET\" \"HEAD\"} and (starts_with(http.request.uri.path, \"/images/\") or starts_with(http.request.uri.path, \"/embed/\") or starts_with(http.request.uri.path, \"/error-game/\") or http.request.uri.path in {\"/favicon.ico\" \"/manifest.webmanifest\"})"
      action            = "set_cache_settings"
      action_parameters = { cache = true, edge_ttl = { mode = "override_origin", default = 7200 }, browser_ttl = { mode = "respect_origin" } }
    },
    {
      ref               = "theme_hashed_assets"
      description       = "Hashed Vite assets: immutable for one year"
      expression        = "(${local.host}) and http.request.method in {\"GET\" \"HEAD\"} and starts_with(http.request.uri.path, \"/assets/\")"
      action            = "set_cache_settings"
      action_parameters = { cache = true, edge_ttl = { mode = "override_origin", default = 31536000 }, browser_ttl = { mode = "override_origin", default = 31536000 } }
    },
  ]
}

output "worker" { value = cloudflare_workers_script.static.script_name }
output "api_worker" { value = cloudflare_workers_script.api.script_name }

moved {
  from = cloudflare_tiered_cache.smart
  to   = cloudflare_tiered_cache.smart[0]
}
