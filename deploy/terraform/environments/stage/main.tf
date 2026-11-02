module "edge" {
  source                = "../../modules/cloudflare"
  environment           = "stage"
  account_id            = var.cloudflare_account_id
  zone_id               = var.cloudflare_zone_id
  root_domain           = var.root_domain
  storefront_api_origin = var.storefront_api_origin
  auth_origin           = var.auth_origin
  pet_assistant_origin  = var.pet_assistant_origin
}
output "tunnel_id" { value = module.edge.tunnel_id }
output "tunnel_token" {
  value     = module.edge.tunnel_token
  sensitive = true
}
output "app_url" { value = module.edge.app_url }
output "graphql_url" { value = module.edge.graphql_url }
output "iam_url" { value = module.edge.iam_url }
output "pet_assistant_url" { value = module.edge.pet_assistant_url }
