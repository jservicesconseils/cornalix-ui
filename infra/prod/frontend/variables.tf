variable "project" {
  type    = string
  default = "cornalix"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "aws_region" {
  description = "Région du bucket S3 (ca-central-1, Loi 25 -- CloudFront lui-même est un service global, sans région)."
  type        = string
  default     = "ca-central-1"
}

variable "domain_name" {
  description = "Domaine du déploiement (SCRUM-38) -- même valeur que infra/prod/platform/variables.tf (cornalix-ms-identity)."
  type        = string
  default     = "cornalix.ca"
}
