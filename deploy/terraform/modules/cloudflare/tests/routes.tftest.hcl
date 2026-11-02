mock_provider "cloudflare" {}

variables {
  account_id            = "00000000000000000000000000000000"
  zone_id               = "11111111111111111111111111111111"
  root_domain           = "example.com"
  storefront_api_origin = "http://gateway-storefront:4000"
  auth_origin           = "http://runtime-monolith:10010"
  pet_assistant_origin  = "http://runtime-monolith:10096"
}

run "production_same_origin" {
  command = plan
  variables { environment = "production" }
  assert {
    condition     = output.graphql_url == "https://example.com/graphql"
    error_message = "Production must use the apex domain for same-origin GraphQL."
  }
  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[0].path == "^/graphql/?$" && cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[0].service == "http://gateway-storefront:4000"
    error_message = "GraphQL must reach the backend before the frontend catch-all."
  }
  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[4].service == "http://theme:3000" && cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[5].service == "http_status:404"
    error_message = "Only this hostname may reach the theme; unmatched hosts must return 404."
  }
  assert {
    condition     = alltrue([for rule in slice(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress, 0, 5) : rule.hostname == "example.com"])
    error_message = "Every application route must share the production origin."
  }
}

run "stage_without_optional_backends" {
  command = plan
  variables {
    environment          = "stage"
    auth_origin          = null
    pet_assistant_origin = null
  }
  assert {
    condition     = output.app_url == "https://stage.example.com" && cloudflare_dns_record.theme.name == "stage.example.com"
    error_message = "Stage must use stage.<root_domain>."
  }
  assert {
    condition     = length(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress) == 3
    error_message = "Disabled IAM and assistant must not expose backend routes."
  }
}
