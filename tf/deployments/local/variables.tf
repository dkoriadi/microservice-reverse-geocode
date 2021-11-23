# Input variable definitions
variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-2"
}

variable "is_aws_deployment" {
  description = "Set this flag to enable deployment to AWS cloud"
  type        = bool
  default     = false
}

variable "stage_name" {
  description = "Stage name for localstack"
  type        = string
  default     = "dev"
}