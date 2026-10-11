output "s3_bucket_name" {
  value = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_arn" {
  value = aws_cloudfront_distribution.frontend.arn
}

# Alias CloudFront reel (dev.cornalix.ca) -- jusqu'ici seul
# cloudfront_domain_name (le *.cloudfront.net genere par AWS) etait
# expose, donc les 4 microservices backend n'autorisaient jamais ce
# domaine en CORS une fois le certificat/alias ajoutes (voir aliases
# dans main.tf).
output "custom_domain_name" {
  value = "dev.${var.domain_name}"
}
