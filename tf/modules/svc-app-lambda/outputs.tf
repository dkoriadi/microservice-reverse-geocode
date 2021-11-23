# Outputs for AWS cloud only
output "lambda_function_arn_svc_app" {
  description = "Lambda function ARN for svc-app handler"
  value = var.is_aws_deployment ? module.lambda_function[0].lambda_function_arn : null
}

output "lambda_function_invoke_arn_svc_app" {
  description = "Lambda function Invoke ARN for svc-app handler"
  value = var.is_aws_deployment ? module.lambda_function[0].lambda_function_invoke_arn : null
}

output "lambda_function_name_svc_app" {
  description = "Lambda function name for svc-app handler"
  value = var.is_aws_deployment ? module.lambda_function[0].lambda_function_name : null
}

# Outputs for localstack only
output "lambda_function_arn_svc_app_local" {
  description = "Lambda function ARN for svc-app handler"
  value = var.is_aws_deployment ? null : aws_lambda_function.svc_app_lambda[0].arn
}

output "lambda_function_invoke_arn_svc_app_local" {
  description = "Lambda function Invoke ARN for svc-app handler"
  value = var.is_aws_deployment ? null : aws_lambda_function.svc_app_lambda[0].invoke_arn
}

output "lambda_function_name_svc_app_local" {
  description = "Lambda function name for svc-app handler"
  value = var.is_aws_deployment ? null : aws_lambda_function.svc_app_lambda[0].function_name
}




