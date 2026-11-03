variable "environment" {
  type = string
  validation {
    condition     = contains(["production", "stage"], var.environment)
    error_message = "Use production or stage."
  }
}
variable "account_id" { type = string }
variable "zone_id" { type = string }
variable "hostname" {
  type = string
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]*\\.[a-z]{2,}$", var.hostname))
    error_message = "Use a lowercase hostname without a scheme or path."
  }
}
variable "theme_origin" {
  type    = string
  default = "http://theme:3000"
}
variable "storefront_api_origin" { type = string }
variable "auth_origin" {
  type    = string
  default = null
}
variable "pet_assistant_origin" {
  type    = string
  default = null
}
