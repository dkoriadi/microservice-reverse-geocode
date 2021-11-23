output "apigw_localstack_address" {
  description = "API GW localstack address"
  # Hacky workaroudn to split long strings
  value = join("", [
    "http://localhost:4566/restapis/",
    "${module.aws_api_gw.apigw_svc_app_id}/",
    "${aws_api_gateway_stage.svc-app.stage_name}/",
    "_user_request_/"
  ])
}
