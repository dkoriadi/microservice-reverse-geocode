terraform {
  required_version = ">= 0.12"
}

module "lambda_integration" {
  source = "./../svc-app-lambda"
  is_aws_deployment = var.is_aws_deployment
}