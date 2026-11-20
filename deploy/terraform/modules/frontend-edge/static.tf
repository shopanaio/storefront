# The static site of each environment (step A of plans/static-site-generation.ru.md): one R2
# bucket, read by the theme service over the S3 API and written by the builder in GitHub
# Actions. Two account tokens per bucket, scoped to it: R2 derives the S3 credentials of a
# token from it (access key id = token id, secret = SHA-256 of the token value). Cache Rules do
# not change on step A: HTML still bypasses the CDN.

locals {
  r2_bucket_resource = {
    for environment, bucket in cloudflare_r2_bucket.static_site :
    environment => "com.cloudflare.edge.r2.bucket.${var.account_id}_default_${bucket.name}"
  }
}

module "r2_permission_groups" {
  source     = "./r2-permission-groups"
  account_id = length(var.static_site_buckets) > 0 ? var.account_id : null
}

resource "cloudflare_r2_bucket" "static_site" {
  for_each   = var.static_site_buckets
  account_id = var.account_id
  name       = each.value
  location   = var.static_site_location
}

# The theme service reads pages, data and old assets.
resource "cloudflare_account_token" "static_site_read" {
  for_each   = var.static_site_buckets
  account_id = var.account_id
  name       = "storefront-static-${each.key}-read"
  policies = [{
    effect            = "allow"
    permission_groups = [{ id = module.r2_permission_groups.read }]
    # A JSON object in provider 5: the bucket and every object in it.
    resources = jsonencode({ (local.r2_bucket_resource[each.key]) = "*" })
  }]
  lifecycle {
    precondition {
      condition     = module.r2_permission_groups.read != null
      error_message = "The account has no single \"Workers R2 Storage Bucket Item Read\" permission group."
    }
  }
}

# The builder of GitHub Actions writes, lists and deletes.
resource "cloudflare_account_token" "static_site_write" {
  for_each   = var.static_site_buckets
  account_id = var.account_id
  name       = "storefront-static-${each.key}-write"
  policies = [{
    effect            = "allow"
    permission_groups = [{ id = module.r2_permission_groups.read }, { id = module.r2_permission_groups.write }]
    resources         = jsonencode({ (local.r2_bucket_resource[each.key]) = "*" })
  }]
  lifecycle {
    precondition {
      condition     = module.r2_permission_groups.read != null && module.r2_permission_groups.write != null
      error_message = "The account has no single \"Workers R2 Storage Bucket Item Read\" and \"Write\" permission groups."
    }
  }
}

output "static_site" {
  description = "STOREFRONT_STATIC_STORE and the S3 endpoint of each environment's static site."
  value = {
    for environment, bucket in var.static_site_buckets : environment => {
      store    = "s3://${bucket}/site"
      endpoint = "https://${var.account_id}.r2.cloudflarestorage.com"
      region   = "auto"
    }
  }
}

output "static_site_read_keys" {
  description = "S3 credentials of the theme service: read only."
  sensitive   = true
  value = {
    for environment, token in cloudflare_account_token.static_site_read : environment => {
      access_key_id     = token.id
      secret_access_key = sha256(token.value)
    }
  }
}

output "static_site_write_keys" {
  description = "S3 credentials of the builder in GitHub Actions: read and write."
  sensitive   = true
  value = {
    for environment, token in cloudflare_account_token.static_site_write : environment => {
      access_key_id     = token.id
      secret_access_key = sha256(token.value)
    }
  }
}
