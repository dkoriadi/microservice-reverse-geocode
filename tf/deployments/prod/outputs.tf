output "apigw_address" {
  description = "API GW localstack address"
  # Hacky workaround to split long strings
  value = join("", [
    "https://${var.rest_api_id}.",
    "execute-api.",
    "${var.aws_region}.amazonaws.com/",
    "${aws_api_gateway_stage.svc-app-prod.stage_name}/",
  ])
}
