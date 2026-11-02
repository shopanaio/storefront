terraform {
  required_version = ">= 1.9, < 2.0"
  backend "remote" {}
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.19.1"
    }
  }
}
provider "cloudflare" {}
