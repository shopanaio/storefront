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

locals {
  bundle = "${path.module}/.state/worker.js"
  host   = "http.host eq ${jsonencode(var.hostname)}"
  bypass = toset(["/assets/*", "/graphql*", "/auth/*", "/__builder/*", "/apps/*", "/.well-known/*", "/cdn-cgi/*"])
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
