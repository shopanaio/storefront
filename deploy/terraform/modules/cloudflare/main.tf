resource "cloudflare_zero_trust_tunnel_cloudflared" "this" {
  account_id = var.account_id
  name       = "shopana-theme-${var.environment}"
  config_src = "cloudflare"
}

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "this" {
  account_id = var.account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.this.id
  config = {
    ingress = concat(
      [{ hostname = var.hostname, path = "^/graphql/?$", service = var.storefront_api_origin }],
      var.auth_origin == null ? [] : [
        { hostname = var.hostname, path = "^/auth/applications/[^/]+/.*$", service = var.auth_origin },
        { hostname = var.hostname, path = "^/\\.well-known/oauth-authorization-server/auth/applications/[^/]+$", service = var.auth_origin }
      ],
      var.pet_assistant_origin == null ? [] : [
        { hostname = var.hostname, path = "^/apps/pet-assistant/v1(/.*)?$", service = var.pet_assistant_origin }
      ],
      [
        { hostname = var.hostname, service = var.theme_origin },
        { service = "http_status:404" }
      ]
    )
  }
}

resource "cloudflare_dns_record" "theme" {
  zone_id = var.zone_id
  name    = var.hostname
  type    = "CNAME"
  content = "${cloudflare_zero_trust_tunnel_cloudflared.this.id}.cfargotunnel.com"
  proxied = true
  ttl     = 1
}

data "cloudflare_zero_trust_tunnel_cloudflared_token" "this" {
  account_id = var.account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.this.id
}

output "tunnel_id" { value = cloudflare_zero_trust_tunnel_cloudflared.this.id }
output "tunnel_token" {
  value     = data.cloudflare_zero_trust_tunnel_cloudflared_token.this.token
  sensitive = true
}
output "app_url" { value = "https://${var.hostname}" }
output "graphql_url" { value = "https://${var.hostname}/graphql" }
output "iam_url" { value = var.auth_origin == null ? "" : "https://${var.hostname}" }
output "pet_assistant_url" { value = var.pet_assistant_origin == null ? "" : "https://${var.hostname}/apps/pet-assistant/v1" }
