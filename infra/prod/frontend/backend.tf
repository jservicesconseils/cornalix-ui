# Meme backend distant que les stacks de cornalix-ms-identity (bucket
# S3 + table DynamoDB crees par son infra/bootstrap, partages par tout
# le projet Cornalix, pas seulement ce repo).
terraform {
  backend "s3" {
    bucket         = "cornalix-tfstate-591859078355"
    key            = "prod/frontend/terraform.tfstate"
    region         = "ca-central-1"
    dynamodb_table = "cornalix-tfstate-locks"
    encrypt        = true
  }
}
