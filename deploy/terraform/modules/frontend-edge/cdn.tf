# Step B of plans/static-coordinator.ru.md: HTML and the data of pages come from R2 through the
# CDN worker (deploy/worker) and the cache of the CDN; assets from the bucket's custom domain
# without the worker; the hybrid node behind the Tunnel answers misses, auth and the rest.
# Purges by tag (pg:<pageKey>, build:<buildId>, sf-*) keep the cache fresh.

locals {
  cdn_hosts = sort(keys(var.static_cdn))
  # Paths the worker never runs for: the node or the bucket's domain answers them directly.
  worker_bypass = ["/assets/*", "/graphql*", "/auth/*", "/__builder/*", "/__env.js", "/apps/*", "/.well-known/*", "/cdn-cgi/*"]
  worker_bypass_routes = merge([
    for hostname in local.cdn_hosts : {
      for path in local.worker_bypass : "${hostname}${path}" => hostname
    }
  ]...)
}

# The bucket of each hostname on its own subdomain: the origin of /assets/*.
resource "cloudflare_r2_custom_domain" "static_assets" {
  for_each    = var.static_cdn
  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.static_site[each.value.environment].name
  domain      = "static.${each.key}"
  zone_id     = var.zone_id
  enabled     = true
}

# The worker answers the hostname's pages and their data.
resource "cloudflare_workers_route" "static_site" {
  for_each = var.static_cdn
  zone_id  = var.zone_id
  pattern  = "${each.key}/*"
  script   = each.value.worker
}

# More specific routes without a script: no worker for these paths.
resource "cloudflare_workers_route" "static_bypass" {
  for_each = local.worker_bypass_routes
  zone_id  = var.zone_id
  pattern  = each.key
}

# /assets/* from the bucket's domain, with its Host: the same hostname for the browser.
resource "cloudflare_ruleset" "origin" {
  count   = length(local.cdn_hosts) > 0 ? 1 : 0
  zone_id = var.zone_id
  name    = "Storefront static assets from R2"
  kind    = "zone"
  phase   = "http_request_origin"
  rules = [
    for hostname in local.cdn_hosts : {
      ref         = "static_assets_${replace(hostname, ".", "_")}"
      description = "Assets of ${hostname} from its R2 custom domain"
      expression  = "http.host eq ${jsonencode(hostname)} and starts_with(http.request.uri.path, \"/assets/\")"
      action      = "route"
      action_parameters = {
        host_header = "static.${hostname}"
        origin      = { host = "static.${hostname}" }
      }
    }
  ]
}
