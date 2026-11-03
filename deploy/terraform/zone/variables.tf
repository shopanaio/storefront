variable "cloudflare_zone_id" { type = string }
variable "hostnames" { type = set(string) }
variable "challenge_frontend" {
  type    = bool
  default = true
}
