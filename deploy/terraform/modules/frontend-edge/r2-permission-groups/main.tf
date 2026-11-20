# The R2 object permission groups of an account, by name: an API token for one bucket names
# them. Filtered here, not by the API's name filter: that one wants the name URL-encoded, and
# an account has far fewer groups than the data source's 1000.
terraform {
  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
    }
  }
}

variable "account_id" {
  type        = string
  default     = null
  description = "The account; null looks nothing up."
}

data "cloudflare_account_api_token_permission_groups_list" "all" {
  count      = var.account_id == null ? 0 : 1
  account_id = var.account_id
}

locals {
  names = {
    read  = "Workers R2 Storage Bucket Item Read"
    write = "Workers R2 Storage Bucket Item Write"
  }
  ids = var.account_id == null ? {} : {
    for group in data.cloudflare_account_api_token_permission_groups_list.all[0].result :
    group.name => group.id...
    if contains(values(local.names), group.name)
  }
}

output "read" {
  description = "Reads and lists the objects of a bucket."
  value       = one(lookup(local.ids, local.names.read, []))
}

output "write" {
  description = "Writes and deletes the objects of a bucket."
  value       = one(lookup(local.ids, local.names.write, []))
}
