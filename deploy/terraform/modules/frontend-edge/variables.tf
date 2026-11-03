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
