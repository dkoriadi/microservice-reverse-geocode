resource "aws_api_gateway_rest_api" "svc-app" {
  name = "svc-app-api" 
  description = "API GW routes for OAuth2 and reverse geocoding"
  body = data.template_file.svc-app-api-swagger.rendered
  minimum_compression_size = 8388608 # bytes i.e. 8 MB
  endpoint_configuration {
    types = ["REGIONAL"]
  }

  policy = <<EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": "*",
        "Action": "execute-api:Invoke",
        "Resource": "*"
      }
    ]
  }
  EOF

  tags = {
    "api_name" = "svc-app",
    "_custom_id_":"id123" # Used for localstack custom API GW id
  }
}

# Used only for AWS cloud
# Need to give API GW permission to access the Lambda proxy integration
resource "aws_lambda_permission" "allow_apig_svc_app_to_call_lambd" {
  count = var.is_aws_deployment ? 1 : 0
  statement_id = "AllowExecutionFromAPIG_SVC_APP"
  action = "lambda:InvokeFunction"
  function_name = module.lambda_integration.lambda_function_name_svc_app
  principal = "apigateway.amazonaws.com"
  # The /*/*/* part allows invocation from any stage, method and resource path within API Gateway REST API.
  #source_arn = "${aws_api_gateway_rest_api.svc-app.execution_arn}/*/*/*" 
  source_arn = "${aws_api_gateway_rest_api.svc-app.execution_arn}/*/*"
}

data "template_file" "svc-app-api-swagger" {
  # Specify which YAML/JSON template file to import into Terraform
  # Paths are relative to directory where `terraform plan` is being run
  # YAML - AWS Cloud | JSON - Localstack (can't parse YAML)
  template = (
              var.is_aws_deployment 
                ? file("./../../modules/svc-app-api-gw/svc-app-swagger.yaml") 
                : file("./../../modules/svc-app-api-gw/svc-app-swagger.json") 
              )

  # Variable passed into swagger file
  vars = {
    uri_arn = (
              var.is_aws_deployment 
                ? module.lambda_integration.lambda_function_invoke_arn_svc_app 
                : module.lambda_integration.lambda_function_invoke_arn_svc_app_local
              )
  }
}