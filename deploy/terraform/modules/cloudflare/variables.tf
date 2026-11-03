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
variable "iam_public_url" {
  type    = string
  default = null
  validation {
    condition     = var.iam_public_url == null ? true : can(regex("^https://[a-z0-9.-]+$", var.iam_public_url))
    error_message = "IAM public URL must be its canonical HTTPS origin without a trailing slash or path."
  }
}
variable "pet_assistant_origin" {
  type    = string
  default = null
}

variable "storefront_api_host_header" {
  type = string
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]*\\.[a-z]{2,}$", var.storefront_api_host_header))
    error_message = "Set the hostname of the existing Traefik storefront router."
  }
}
variable "pet_assistant_host_header" {
  type    = string
  default = null
}
