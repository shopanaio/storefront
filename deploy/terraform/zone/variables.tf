variable "cloudflare_zone_id" { type = string }
variable "root_domain" { type = string }
variable "challenge_frontend" {
  type    = bool
  default = true
}
