terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

############################################
# Bucket S3 -- jamais public directement, seul CloudFront (via Origin
# Access Control) peut y lire des objets (SCRUM-37).
############################################
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project}-${var.environment}-frontend-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.project}-${var.environment}-frontend"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

############################################
# CloudFront -- sert le bucket S3 en HTTPS, avec repli vers index.html
# pour les routes cote client Angular (404/403 S3 -> 200 index.html).
# Pas de domaine personnalise ni de certificat ACM pour l'instant
# (certificat CloudFront par defaut, *.cloudfront.net) -- SCRUM-38
# branche cornalix.ca une fois la zone Route53 et le certificat prets.
############################################
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project}-${var.environment}-frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  # Palier le moins cher (Amerique du Nord + Europe uniquement) --
  # suffisant pour l'audience visee (PME quebecoises, Loi 25).
  price_class = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "s3-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods          = ["GET", "HEAD"]
    target_origin_id        = "s3-frontend"
    viewer_protocol_policy  = "redirect-to-https"
    compress                = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # Angular gere le routage cote client : une URL profonde (ex.
  # /tableau-de-bord) n'existe pas comme objet S3 -- CloudFront doit
  # renvoyer index.html quand meme (avec un 200, pas un 404, pour que
  # le navigateur execute l'appli au lieu d'afficher une erreur).
  custom_error_response {
    error_code         = 403
    response_code       = 200
    response_page_path  = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code       = 200
    response_page_path  = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project}-${var.environment}-frontend"
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontServicePrincipal"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.frontend.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
        }
      }
    }]
  })
}
