variable "cloudflare_account_id" { type = string }
variable "cloudflare_zone_id" { type = string }
variable "hostname" { type = string }
variable "storefront_api_origin" { type = string }
variable "auth_origin" {
  type    = string
  default = null
}
variable "pet_assistant_origin" {
  type    = string
  default = null
}
