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
      [{
        hostname       = var.hostname
        path           = "^/graphql/?$"
        service        = var.storefront_api_origin
        origin_request = { http_host_header = var.storefront_api_host_header }
      }],
      var.pet_assistant_origin == null ? [] : [{
        hostname       = var.hostname
        path           = "^/apps/pet-assistant/v1(/.*)?$"
        service        = var.pet_assistant_origin
        origin_request = { http_host_header = var.pet_assistant_host_header }
      }],
      [
        { hostname = var.hostname, service = var.theme_origin },
        { service = "http_status:404" }
      ]
    )
  }
  lifecycle {
    precondition {
      condition     = var.pet_assistant_origin == null || var.pet_assistant_host_header != null
      error_message = "Enabled agent ingress requires its existing Traefik router Host header."
    }
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
output "iam_url" { value = var.iam_public_url == null ? "" : var.iam_public_url }
output "pet_assistant_url" { value = var.pet_assistant_origin == null ? "" : "https://${var.hostname}/apps/pet-assistant/v1" }
output "storefront_api_host_header" { value = var.storefront_api_host_header }
output "pet_assistant_host_header" { value = var.pet_assistant_origin == null ? "" : var.pet_assistant_host_header }
