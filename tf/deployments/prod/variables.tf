# Input variable definitions
variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-2"
}

variable "is_aws_deployment" {
  description = "Set this flag to enable deployment to AWS cloud"
  type        = bool
  default     = true
}

variable "stage_name" {
  description = "Stage name for AWS cloud"
  type        = string
  default     = "prod"
}

variable "rest_api_id" {
  description = "REST API id for AWS cloud"
  type        = string
  default     = "id123" # Same id as dev stage
}