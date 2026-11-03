mock_provider "cloudflare" {}

variables {
  account_id            = "00000000000000000000000000000000"
  zone_id               = "11111111111111111111111111111111"
  hostname              = "example.com"
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
  assert {
    condition     = output.iam_url == "https://example.com" && output.pet_assistant_url == "https://example.com/apps/pet-assistant/v1"
    error_message = "IAM and agent API URLs must use the same origin as the theme."
  }
  assert {
    condition     = can(regex(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[1].path, "/auth/applications/app-id/oauth2/token")) && !can(regex(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[1].path, "/auth/callback"))
    error_message = "IAM token calls must reach IAM; the callback must stay on the theme."
  }
  assert {
    condition     = can(regex(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[3].path, "/apps/pet-assistant/v1/copilotkit/agent/default/run")) && can(regex(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[3].path, "/apps/pet-assistant/v1/threads"))
    error_message = "Both streaming agent requests and thread APIs must reach the assistant."
  }
}

run "stage_without_optional_backends" {
  command = plan
  variables {
    environment          = "stage"
    hostname             = "pet.shopana.dev"
    auth_origin          = null
    pet_assistant_origin = null
  }
  assert {
    condition     = output.app_url == "https://pet.shopana.dev" && cloudflare_dns_record.theme.name == "pet.shopana.dev"
    error_message = "Stage must use its explicit hostname without adding a stage prefix."
  }
  assert {
    condition     = length(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress) == 3
    error_message = "Disabled IAM and assistant must not expose backend routes."
  }
  assert {
    condition     = output.iam_url == "" && output.pet_assistant_url == ""
    error_message = "Disabled backends must emit empty public URLs."
  }
}

run "pet_hostname_is_stage" {
  command = plan
  variables {
    environment = "stage"
    hostname    = "pet.shopana.dev"
  }
  assert {
    condition     = output.app_url == "https://pet.shopana.dev" && output.graphql_url == "https://pet.shopana.dev/graphql" && output.iam_url == "https://pet.shopana.dev" && output.pet_assistant_url == "https://pet.shopana.dev/apps/pet-assistant/v1"
    error_message = "All stage endpoints must use pet.shopana.dev without a nested stage prefix."
  }
  assert {
    condition     = cloudflare_dns_record.theme.name == "pet.shopana.dev" && cloudflare_zero_trust_tunnel_cloudflared.this.name == "shopana-theme-stage"
    error_message = "The pet hostname must belong to the stage tunnel."
  }
}
