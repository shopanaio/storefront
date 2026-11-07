variable "cloudflare_account_id" { type = string }
variable "cloudflare_zone_id" { type = string }
variable "hostname" { type = string }
variable "storefront_api_origin" { type = string }
variable "iam_public_url" {
  type    = string
  default = null
}
variable "pet_assistant_origin" {
  type    = string
  default = null
}

variable "storefront_api_host_header" { type = string }
variable "pet_assistant_host_header" {
  type    = string
  default = null
}

# The coordinator of the static site (theme-static); null until the stack runs it.
variable "static_coordinator_origin" {
  type    = string
  default = "http://theme-static:3100"
}
