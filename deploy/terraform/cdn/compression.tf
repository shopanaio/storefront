# Cloudflare не сжимает application/graphql-response+json по умолчанию.
# Правило распространяется на GraphQL-ответы всех хостов этой зоны, включая Admin API.
resource "cloudflare_ruleset" "graphql_compression" {
  zone_id = var.zone_id
  name    = "GraphQL response compression"
  kind    = "zone"
  phase   = "http_response_compression"

  rules = [{
    ref         = "graphql_response_compression"
    description = "Brotli and Gzip for GraphQL response JSON"
    enabled     = true
    expression  = "http.response.content_type.media_type eq \"application/graphql-response+json\""
    action      = "compress_response"
    action_parameters = {
      algorithms = [{ name = "brotli" }, { name = "gzip" }]
    }
  }]
}
