variable "project" {
  type    = string
  default = "cornalix"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "aws_region" {
  type    = string
  default = "ca-central-1"
}

variable "domain_name" {
  description = "Domaine du deploiement -- meme valeur que infra/prod/platform/variables.tf (cornalix-ms-identity). Expose ici sur dev.<domain_name>."
  type        = string
  default     = "cornalix.ca"
}
