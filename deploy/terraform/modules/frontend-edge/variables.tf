variable "zone_id" { type = string }
variable "root_domain" {
  type = string
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]*\\.[a-z]{2,}$", var.root_domain))
    error_message = "Use a lowercase apex domain without a scheme or path."
  }
}
variable "challenge_frontend" {
  type        = bool
  default     = true
  description = "Managed Challenge for frontend page requests from unverified clients."
}
