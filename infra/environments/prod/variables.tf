variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "ai-studyplan"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "enable_nat_gateway" {
  type    = bool
  default = false
}

variable "image_tag" {
  type    = string
  default = "latest"
}

variable "groq_api_key" {
  type      = string
  sensitive = true
}

variable "groq_model" {
  type    = string
  default = "llama-3.1-8b-instant"
}

variable "alert_email" {
  type = string
}

variable "monthly_budget_usd" {
  type    = string
  default = "100"
}

variable "billing_alarm_threshold_usd" {
  type    = number
  default = 80
}

variable "server_cpu" {
  type    = number
  default = 512
}

variable "server_memory" {
  type    = number
  default = 1024
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
  default = 2
}

variable "client_desired_count" {
  type    = number
  default = 2
}

variable "server_min_count" {
  type    = number
  default = 2
}

variable "server_max_count" {
  type    = number
  default = 10
}
