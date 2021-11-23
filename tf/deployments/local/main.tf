terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

# Configure the localstack for testing locally
# No AWS credentials needed also! :)
# Setup link: https://docs.localstack.cloud/get-started/ 
provider "aws" {
  access_key = "test"
  secret_key = "test"
  region     = var.aws_region

  s3_force_path_style         = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  // All available AWS resources on localstack
  endpoints {
    apigateway     = "http://localhost:4566" // AWS API GW
    cloudformation = "http://localhost:4566"
    cloudwatch     = "http://localhost:4566"
    dynamodb       = "http://localhost:4566"
    es             = "http://localhost:4566"
    firehose       = "http://localhost:4566"
    iam            = "http://localhost:4566"
    kinesis        = "http://localhost:4566"
    lambda         = "http://localhost:4566" // Lambda proxy integration
    route53        = "http://localhost:4566"
    redshift       = "http://localhost:4566"
    s3             = "http://localhost:4566"
    secretsmanager = "http://localhost:4566"
    ses            = "http://localhost:4566"
    sns            = "http://localhost:4566"
    sqs            = "http://localhost:4566"
    ssm            = "http://localhost:4566"
    stepfunctions  = "http://localhost:4566"
    sts            = "http://localhost:4566"
  }
}

module "aws_api_gw" {
  source            = "./../../modules/svc-app-api-gw"
  is_aws_deployment = var.is_aws_deployment
}