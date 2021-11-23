terraform {
  required_version = ">= 0.12"
}

# Used for AWS cloud only
# Don't try to rename this module
module "lambda_function" {
  count = var.is_aws_deployment ? 1 : 0
  # Source argument is standard code, don't rename this also
  source = "terraform-aws-modules/lambda/aws"

  function_name = "MicroserviceAppFunction"
  description   = "Deployed via Terraform. Source code entry point from app.js"
  handler       = "app.lambdaHandler"
  runtime       = "nodejs14.x"
  timeout       = 30

  # Paths are relative to directory where `terraform plan` is being run
  source_path = "./../../../handlers"

  tags = {
    Name = "svc-app-lambda"
  }
}

# Used for localstack only
resource "aws_lambda_function" "svc_app_lambda" {
  count = var.is_aws_deployment ? 0 : 1
  function_name = "MicroserviceAppFunction"
  filename      = "./build/handlers-restapi-v1.0.zip" # Update this for each change
  handler       = "app.lambdaHandler"
  role          = "fake_iam_role"
  runtime       = "nodejs14.x"
  timeout       = 30
  memory_size   = 128
}