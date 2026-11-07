variable "zone_id" { type = string }
variable "hostnames" {
  type = set(string)
  validation {
    condition = length(var.hostnames) > 0 && alltrue([
      for hostname in var.hostnames : can(regex("^[a-z0-9][a-z0-9.-]*\\.[a-z]{2,}$", hostname))
    ])
    error_message = "Provide at least one lowercase hostname without a scheme or path."
  }
}
variable "challenge_frontend" {
  type        = bool
  default     = true
  description = "Managed Challenge for frontend page requests from unverified clients."
}
variable "account_id" {
  type        = string
  default     = null
  description = "Cloudflare account of the static site buckets; required with static_site_buckets."
}
variable "static_site_buckets" {
  type        = map(string)
  default     = {}
  description = "R2 bucket of the static site per environment (stage = \"shopana-storefront-static-stage\")."
  validation {
    condition = alltrue([
      for bucket in values(var.static_site_buckets) : can(regex("^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$", bucket))
    ])
    error_message = "R2 bucket names are 3-63 lowercase letters, digits and hyphens."
  }
  validation {
    condition     = length(var.static_site_buckets) == 0 || can(regex("^[a-f0-9]{32}$", var.account_id))
    error_message = "static_site_buckets needs account_id, the 32-character Cloudflare account ID."
  }
}
variable "static_site_location" {
  type        = string
  default     = "eeur"
  description = "R2 location hint of the static site buckets: next to the Swarm nodes."
}

# Step B of plans/static-coordinator.ru.md: the CDN in front of the node. Per hostname: the
# environment of its bucket (a key of static_site_buckets) and the name of its worker
# (deploy/worker, `wrangler deploy --env <environment>`). Empty: step A, HTML bypasses the CDN.
variable "static_cdn" {
  type = map(object({
    environment = string
    worker      = string
  }))
  default = {}
  validation {
    condition     = alltrue([for hostname, cdn in var.static_cdn : contains(keys(var.static_site_buckets), cdn.environment)])
    error_message = "Each static_cdn hostname needs the bucket of its environment in static_site_buckets."
  }
}
