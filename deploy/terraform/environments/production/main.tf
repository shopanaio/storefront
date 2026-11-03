module "edge" {
  source                     = "../../modules/cloudflare"
  environment                = "production"
  account_id                 = var.cloudflare_account_id
  zone_id                    = var.cloudflare_zone_id
  hostname                   = var.hostname
  storefront_api_origin      = var.storefront_api_origin
  iam_public_url             = var.iam_public_url
  pet_assistant_origin       = var.pet_assistant_origin
  storefront_api_host_header = var.storefront_api_host_header
  pet_assistant_host_header  = var.pet_assistant_host_header
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
output "storefront_api_host_header" { value = module.edge.storefront_api_host_header }
output "pet_assistant_host_header" { value = module.edge.pet_assistant_host_header }
