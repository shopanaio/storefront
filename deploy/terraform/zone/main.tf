module "frontend_edge" {
  source             = "../modules/frontend-edge"
  zone_id            = var.cloudflare_zone_id
  hostnames          = var.hostnames
  challenge_frontend = var.challenge_frontend
}
