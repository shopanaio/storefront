variable "cloudflare_zone_id" { type = string }
variable "hostnames" { type = set(string) }
variable "challenge_frontend" {
  type    = bool
  default = true
}
variable "cloudflare_account_id" {
  type    = string
  default = null
}
variable "static_site_buckets" {
  type    = map(string)
  default = {}
}

# Step B (plans/static-coordinator.ru.md): hostname => { environment, worker }. Empty on step A.
variable "static_cdn" {
  type = map(object({
    environment = string
    worker      = string
  }))
  default = {}
}
