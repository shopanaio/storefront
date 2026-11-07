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

run "static_site_bucket_and_scoped_keys" {
  command = plan
  variables {
    account_id          = "22222222222222222222222222222222"
    static_site_buckets = { stage = "shopana-storefront-static-stage" }
  }
  override_module {
    target  = module.r2_permission_groups
    outputs = { read = "r2-read", write = "r2-write" }
  }
  assert {
    condition     = cloudflare_r2_bucket.static_site["stage"].name == "shopana-storefront-static-stage"
    error_message = "Each environment gets its own static site bucket."
  }
  assert {
    condition = (
      length(cloudflare_account_token.static_site_read["stage"].policies[0].permission_groups) == 1 &&
      cloudflare_account_token.static_site_read["stage"].policies[0].permission_groups[0].id == "r2-read" &&
      jsondecode(cloudflare_account_token.static_site_read["stage"].policies[0].resources) == {
        "com.cloudflare.edge.r2.bucket.22222222222222222222222222222222_default_shopana-storefront-static-stage" = "*"
      }
    )
    error_message = "The theme's key only reads, and only its own bucket."
  }
  assert {
    condition = (
      toset([for group in cloudflare_account_token.static_site_write["stage"].policies[0].permission_groups : group.id]) == toset(["r2-read", "r2-write"]) &&
      cloudflare_account_token.static_site_write["stage"].policies[0].resources == cloudflare_account_token.static_site_read["stage"].policies[0].resources
    )
    error_message = "The builder's key reads and writes its own bucket only."
  }
  assert {
    condition     = length(cloudflare_ruleset.cache.rules) == 3
    error_message = "Cache Rules do not change on step A: HTML still bypasses the CDN."
  }
}

run "static_site_bucket_needs_account" {
  command = plan
  variables {
    static_site_buckets = { stage = "shopana-storefront-static-stage" }
  }
  expect_failures = [var.static_site_buckets]
}

run "step_b_cdn_worker_assets_and_cache_rules" {
  command = plan
  variables {
    account_id          = "22222222222222222222222222222222"
    static_site_buckets = { stage = "shopana-storefront-static-stage" }
    static_cdn          = { "pet.shopana.dev" = { environment = "stage", worker = "storefront-static-stage" } }
  }
  override_module {
    target  = module.r2_permission_groups
    outputs = { read = "r2-read", write = "r2-write" }
  }
  assert {
    condition     = cloudflare_workers_route.static_site["pet.shopana.dev"].pattern == "pet.shopana.dev/*" && cloudflare_workers_route.static_site["pet.shopana.dev"].script == "storefront-static-stage"
    error_message = "The worker answers the pages of the hostname."
  }
  assert {
    condition     = contains(keys(cloudflare_workers_route.static_bypass), "pet.shopana.dev/assets/*") && contains(keys(cloudflare_workers_route.static_bypass), "pet.shopana.dev/auth/*") && contains(keys(cloudflare_workers_route.static_bypass), "pet.shopana.dev/__builder/*") && cloudflare_workers_route.static_bypass["pet.shopana.dev/graphql*"].script == null
    error_message = "Assets, GraphQL, auth and the coordinator never run the worker."
  }
  assert {
    condition     = cloudflare_r2_custom_domain.static_assets["pet.shopana.dev"].domain == "static.pet.shopana.dev" && cloudflare_ruleset.origin[0].rules[0].action_parameters.origin.host == "static.pet.shopana.dev"
    error_message = "Assets come from the bucket's custom domain."
  }
  assert {
    condition     = length(cloudflare_ruleset.cache.rules) == 5 && cloudflare_ruleset.cache.rules[4].ref == "static_graphql_get" && strcontains(cloudflare_ruleset.cache.rules[4].expression, "authorization") && cloudflare_ruleset.cache.rules[3].action_parameters.edge_ttl.mode == "respect_origin"
    error_message = "HTML and guest GET /graphql follow the origin's Cache-Control; the bypass stays for the rest."
  }
}
