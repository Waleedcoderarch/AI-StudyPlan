variable "name_prefix" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "assign_public_ip" {
  type    = bool
  default = true
}

variable "alb_security_group_id" {
  type = string
}

variable "server_target_group_arn" {
  type = string
}

variable "client_target_group_arn" {
  type = string
}

variable "server_image" {
  type = string
}

variable "client_image" {
  type = string
}

variable "groq_secret_arn" {
  type = string
}

variable "groq_model" {
  type    = string
  default = "llama-3.1-8b-instant"
}

variable "cors_origin" {
  type = string
}

variable "efs_file_system_id" {
  type = string
}

variable "efs_access_point_id" {
  type = string
}

variable "server_cpu" {
  type    = number
  default = 256
}

variable "server_memory" {
  type    = number
  default = 512
}

variable "client_cpu" {
  type    = number
  default = 256
}

variable "client_memory" {
  type    = number
  default = 512
}

variable "server_desired_count" {
  type    = number
  default = 1
}

variable "client_desired_count" {
  type    = number
  default = 1
}

variable "server_min_count" {
  type    = number
  default = 1
}

variable "server_max_count" {
  type    = number
  default = 4
}

variable "log_retention_days" {
  type    = number
  default = 7
}

variable "enable_container_insights" {
  type    = bool
  default = false
}

variable "tags" {
  type    = map(string)
  default = {}
}
