output "s3_bucket_name" {
  description = "Nom du bucket S3 -- cible de \"aws s3 sync\" a chaque deploiement"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "ID de la distribution -- necessaire pour invalider le cache a chaque deploiement"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "Domaine *.cloudfront.net genere par AWS -- utilisable des maintenant, avant que cornalix.ca ne soit branche (SCRUM-38)"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_arn" {
  description = "ARN de la distribution -- a referencer pour l'alias Route53 (SCRUM-38)"
  value       = aws_cloudfront_distribution.frontend.arn
}
