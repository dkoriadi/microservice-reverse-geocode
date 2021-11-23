terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}

module "aws_api_gw" {
  source            = "./../../modules/svc-app-api-gw"
  is_aws_deployment = var.is_aws_deployment
}