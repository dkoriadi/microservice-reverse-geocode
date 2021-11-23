resource "aws_api_gateway_deployment" "svc-app" {
  rest_api_id = module.aws_api_gw.apigw_svc_app_id

  triggers = {
    redeployment = sha1(jsonencode(module.aws_api_gw.apigw_svc_app_body))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "svc-app" {
  deployment_id = aws_api_gateway_deployment.svc-app.id
  rest_api_id   = module.aws_api_gw.apigw_svc_app_id
  stage_name    = var.stage_name
}