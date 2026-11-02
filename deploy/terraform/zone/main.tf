module "frontend_edge" {
  source             = "../modules/frontend-edge"
  zone_id            = var.cloudflare_zone_id
  root_domain        = var.root_domain
  challenge_frontend = var.challenge_frontend
}
