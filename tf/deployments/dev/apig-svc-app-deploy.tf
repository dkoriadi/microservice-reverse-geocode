resource "aws_api_gateway_deployment" "svc-app-dev" {
  #rest_api_id = var.rest_api_id
  rest_api_id = module.aws_api_gw.apigw_svc_app_id

  triggers = {
    redeployment = sha1(jsonencode(module.aws_api_gw.apigw_svc_app_body))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "svc-app-dev" {
  deployment_id = aws_api_gateway_deployment.svc-app-dev.id
  #rest_api_id = var.rest_api_id
  rest_api_id   = module.aws_api_gw.apigw_svc_app_id
  stage_name    = var.stage_name
}