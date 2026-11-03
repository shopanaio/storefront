mock_provider "cloudflare" {}
variables {
  zone_id   = "11111111111111111111111111111111"
  hostnames = ["pet.shopana.dev"]
}

run "free_plan_and_dynamic_bypass" {
  command = plan
  assert {
    condition     = cloudflare_ruleset.cache.rules[0].expression == "http.host in {\"pet.shopana.dev\"}"
    error_message = "Theme rules must target pet.shopana.dev only, preserving the admin and backend hostnames."
  }
  assert {
    condition     = length(cloudflare_ruleset.cache.rules) == 3 && length(cloudflare_ruleset.frontend_security.rules) == 1
    error_message = "Stay within Free's 10 Cache Rules and 5 custom WAF rules."
  }
  assert {
    condition     = cloudflare_ruleset.cache.rules[0].action_parameters.cache == false && cloudflare_ruleset.cache.rules[2].action_parameters.edge_ttl.default == 31536000
    error_message = "Dynamic pages must bypass cache, while hashed assets get a long TTL."
  }
  assert {
    condition     = strcontains(cloudflare_ruleset.frontend_security.rules[0].expression, "/graphql") && strcontains(cloudflare_ruleset.frontend_security.rules[0].expression, "/auth/") && strcontains(cloudflare_ruleset.frontend_security.rules[0].expression, ".data")
    error_message = "The page challenge must exclude GraphQL, auth and React Router data."
  }
  assert {
    condition     = cloudflare_bot_management.this.fight_mode == false && cloudflare_ruleset.frontend_security.rules[0].action == "managed_challenge"
    error_message = "Use a scoped frontend challenge, not zone-wide Bot Fight Mode."
  }
  assert {
    condition     = strcontains(cloudflare_ruleset.frontend_security.rules[0].expression, "/apps/") && strcontains(cloudflare_ruleset.frontend_security.rules[0].expression, "/.well-known/")
    error_message = "Agent streaming and IAM discovery must not receive frontend challenges."
  }
}
