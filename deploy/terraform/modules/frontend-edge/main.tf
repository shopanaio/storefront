locals {
  hosts = "http.host in {${jsonencode(var.root_domain)} ${jsonencode("stage.${var.root_domain}")}}"
  # Only dedicated static namespaces. Never cache React Router data, API or HTML by extension.
  static = join(" or ", [
    for prefix in ["/assets/", "/images/", "/embed/", "/error-game/"] :
    "starts_with(http.request.uri.path, ${jsonencode(prefix)})"
  ])
  dynamic = join(" or ", [
    for prefix in ["/graphql", "/auth/", "/account", "/api/", "/apps/", "/.well-known/", "/cdn-cgi/"] :
    "starts_with(http.request.uri.path, ${jsonencode(prefix)})"
  ])
  public_file = "http.request.uri.path in {\"/favicon.ico\" \"/manifest.webmanifest\" \"/robots.txt\" \"/sitemap.xml\"}"
}

# There can only be one zone entry point per phase: both environments belong in this state.
resource "cloudflare_ruleset" "cache" {
  zone_id = var.zone_id
  name    = "Storefront CDN (Free)"
  kind    = "zone"
  phase   = "http_request_cache_settings"
  rules = [
    {
      ref               = "theme_bypass_by_default"
      description       = "Never cache HTML, React Router data, sessions or API responses"
      expression        = local.hosts
      action            = "set_cache_settings"
      action_parameters = { cache = false }
    },
    {
      ref         = "theme_static"
      description = "Public static assets: two hours at the edge"
      expression  = "(${local.hosts}) and http.request.method in {\"GET\" \"HEAD\"} and (${local.static} or ${local.public_file})"
      action      = "set_cache_settings"
      action_parameters = {
        cache       = true
        edge_ttl    = { mode = "override_origin", default = 7200 }
        browser_ttl = { mode = "respect_origin" }
      }
    },
    {
      ref         = "theme_fingerprinted_assets"
      description = "Vite fingerprinted assets: one year at the edge and in browsers"
      expression  = "(${local.hosts}) and http.request.method in {\"GET\" \"HEAD\"} and starts_with(http.request.uri.path, \"/assets/\")"
      action      = "set_cache_settings"
      action_parameters = {
        cache       = true
        edge_ttl    = { mode = "override_origin", default = 31536000 }
        browser_ttl = { mode = "override_origin", default = 31536000 }
      }
    }
  ]
}

resource "cloudflare_ruleset" "frontend_security" {
  zone_id = var.zone_id
  name    = "Storefront frontend challenge (Free)"
  kind    = "zone"
  phase   = "http_request_firewall_custom"
  rules = [{
    ref         = "theme_frontend_challenge"
    description = "Challenge page clients; preserve verified bots, APIs, auth and static assets"
    expression  = "(${local.hosts}) and http.request.method in {\"GET\" \"HEAD\"} and not cf.client.bot and not ends_with(http.request.uri.path, \".data\") and not (${local.static} or ${local.public_file} or ${local.dynamic})"
    action      = "managed_challenge"
    enabled     = var.challenge_frontend
  }]
}

# Free Bot Fight Mode cannot be skipped by path and can challenge same-origin SSR API calls.
# Protection is supplied by the scoped frontend rule above instead.
resource "cloudflare_bot_management" "this" {
  zone_id    = var.zone_id
  fight_mode = false
}
