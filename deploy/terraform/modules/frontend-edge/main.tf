locals {
  hosts = "http.host in {${join(" ", [for hostname in sort(tolist(var.hostnames)) : jsonencode(hostname)])}}"
  # Only dedicated static namespaces. Never cache React Router data, API or HTML by extension.
  static = join(" or ", [
    for prefix in ["/assets/", "/images/", "/embed/", "/error-game/"] :
    "starts_with(http.request.uri.path, ${jsonencode(prefix)})"
  ])
  dynamic = join(" or ", [
    for prefix in ["/graphql", "/auth/", "/account", "/api/", "/apps/", "/.well-known/", "/cdn-cgi/", "/__builder/"] :
    "starts_with(http.request.uri.path, ${jsonencode(prefix)})"
  ])
  public_file = "http.request.uri.path in {\"/favicon.ico\" \"/manifest.webmanifest\" \"/robots.txt\" \"/sitemap.xml\"}"
  # Step B: hostnames whose HTML the CDN caches (static_cdn).
  cdn_expression = length(var.static_cdn) == 0 ? "" : "http.host in {${join(" ", [for hostname in sort(keys(var.static_cdn)) : jsonencode(hostname)])}}"
  cdn_rules = [for rule in [
    {
      ref               = "static_html_and_data"
      description       = "Step B: HTML and page data by their own Cache-Control (s-maxage, purged by tag)"
      expression        = "(${local.cdn_expression}) and http.request.method in {\"GET\" \"HEAD\"} and not (${local.dynamic}) and not ends_with(http.request.uri.path, \".data\")"
      action            = "set_cache_settings"
      action_parameters = { cache = true, edge_ttl = { mode = "respect_origin" }, browser_ttl = { mode = "respect_origin" } }
    },
    {
      ref               = "static_graphql_get"
      description       = "Step B: guest GET /graphql (persisted documents) by the gateway's Cache-Control, the query string in the key"
      expression        = "(${local.cdn_expression}) and http.request.method eq \"GET\" and http.request.uri.path eq \"/graphql\" and not any(len(http.request.headers[\"authorization\"][*]) > 0)"
      action            = "set_cache_settings"
      action_parameters = { cache = true, edge_ttl = { mode = "respect_origin" }, browser_ttl = { mode = "respect_origin" } }
    },
  ] : rule if length(var.static_cdn) > 0]
}

# There can only be one zone entry point per phase: all managed frontend hostnames belong in this state.
resource "cloudflare_ruleset" "cache" {
  zone_id = var.zone_id
  name    = "Storefront CDN (Free)"
  kind    = "zone"
  phase   = "http_request_cache_settings"
  rules = concat([
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
  ], local.cdn_rules)
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
