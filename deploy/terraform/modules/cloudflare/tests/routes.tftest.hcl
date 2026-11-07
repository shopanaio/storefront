mock_provider "cloudflare" {}

variables {
  account_id                 = "00000000000000000000000000000000"
  zone_id                    = "11111111111111111111111111111111"
  hostname                   = "example.com"
  storefront_api_origin      = "http://shopana-production-platform_traefik:8080"
  storefront_api_host_header = "api.example.com"
  pet_assistant_origin       = "http://shopana-production-platform_traefik:8080"
  pet_assistant_host_header  = "apps.example.com"
  iam_public_url             = "https://auth.example.com"
}

run "production_api_via_existing_traefik" {
  command = plan
  variables { environment = "production" }
  assert {
    condition     = output.graphql_url == "https://example.com/graphql"
    error_message = "Browser GraphQL must remain same-origin on the apex domain."
  }
  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[0].service == "http://shopana-production-platform_traefik:8080" && cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[0].origin_request.http_host_header == "api.example.com"
    error_message = "GraphQL must reach the existing Traefik with the backend router Host header."
  }
  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[1].origin_request.http_host_header == "apps.example.com" && can(regex(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[1].path, "/apps/pet-assistant/v1/copilotkit/agent/default/run")) && can(regex(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[1].path, "/apps/pet-assistant/v1/threads"))
    error_message = "Agent API and streaming must reach the existing apps router."
  }
  assert {
    condition     = length(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress) == 4 && cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[2].service == "http://theme:3000" && cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[3].service == "http_status:404"
    error_message = "The theme catch-all must follow both API rules; unknown hosts must return 404."
  }
  assert {
    condition     = output.iam_url == "https://auth.example.com" && output.pet_assistant_url == "https://example.com/apps/pet-assistant/v1"
    error_message = "IAM must keep its canonical issuer while agent requests remain same-origin."
  }
}

run "stage_without_optional_backends" {
  command = plan
  variables {
    environment          = "stage"
    hostname             = "pet.shopana.dev"
    iam_public_url       = null
    pet_assistant_origin = null
  }
  assert {
    condition     = length(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress) == 3 && output.iam_url == "" && output.pet_assistant_url == ""
    error_message = "Disabled IAM/agent must not emit enabled URLs or agent ingress."
  }
}

run "pet_hostname_is_stage" {
  command = plan
  variables {
    environment                = "stage"
    hostname                   = "pet.shopana.dev"
    storefront_api_origin      = "http://shopana-stage-platform_traefik:8080"
    storefront_api_host_header = "api.shopana.dev"
    pet_assistant_origin       = "http://shopana-stage-platform_traefik:8080"
    pet_assistant_host_header  = "apps.shopana.dev"
    iam_public_url             = "https://auth.shopana.dev"
  }
  assert {
    condition     = output.app_url == "https://pet.shopana.dev" && output.graphql_url == "https://pet.shopana.dev/graphql" && output.iam_url == "https://auth.shopana.dev" && output.pet_assistant_url == "https://pet.shopana.dev/apps/pet-assistant/v1"
    error_message = "Stage must use pet.shopana.dev for the theme/API and the existing auth.shopana.dev issuer."
  }
  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[0].origin_request.http_host_header == "api.shopana.dev" && cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[1].origin_request.http_host_header == "apps.shopana.dev"
    error_message = "Stage ingress must select the existing Traefik Host routers."
  }
  assert {
    condition     = alltrue([for rule in slice(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress, 0, 2) : !can(regex(rule.path, "/auth/callback")) && !can(regex(rule.path, "/auth/applications/app-id/oauth2/token"))]) && cloudflare_dns_record.theme.name == "pet.shopana.dev"
    error_message = "IAM must stay on its canonical origin and theme BFF auth routes must stay on the theme."
  }
}

run "static_coordinator_before_the_theme" {
  command = plan
  variables {
    environment               = "stage"
    hostname                  = "pet.shopana.dev"
    pet_assistant_origin      = null
    static_coordinator_origin = "http://theme-static:3100"
  }
  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[1].service == "http://theme-static:3100" && can(regex(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[1].path, "/__builder/api/leases")) && !can(regex(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[1].path, "/products/x"))
    error_message = "The coordinator API must reach theme-static before the theme catch-all, and nothing else."
  }
  assert {
    condition     = length(cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress) == 4 && cloudflare_zero_trust_tunnel_cloudflared_config.this.config.ingress[2].service == "http://theme:3000"
    error_message = "The theme stays the catch-all after the coordinator."
  }
}
