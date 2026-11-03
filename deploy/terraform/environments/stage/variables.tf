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
