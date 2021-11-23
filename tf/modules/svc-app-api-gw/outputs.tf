output "apigw_svc_app_id" {
  description = "API GW id for svc-app"
  value = aws_api_gateway_rest_api.svc-app.id
}

output "apigw_svc_app_body" {
  description = "API GW body for svc-app"
  value = aws_api_gateway_rest_api.svc-app.body
}

output "apigw_svc_app_api_name" {
  description = "API GW name for svc-app retrieved from tags"
  value = aws_api_gateway_rest_api.svc-app.tags_all["api_name"]
}


