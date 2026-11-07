module "frontend_edge" {
  source              = "../modules/frontend-edge"
  zone_id             = var.cloudflare_zone_id
  hostnames           = var.hostnames
  challenge_frontend  = var.challenge_frontend
  account_id          = var.cloudflare_account_id
  static_site_buckets = var.static_site_buckets
  static_cdn          = var.static_cdn
}

output "static_site" { value = module.frontend_edge.static_site }
output "static_site_read_keys" {
  value     = module.frontend_edge.static_site_read_keys
  sensitive = true
}
output "static_site_write_keys" {
  value     = module.frontend_edge.static_site_write_keys
  sensitive = true
}
