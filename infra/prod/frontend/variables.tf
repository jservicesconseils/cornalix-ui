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
