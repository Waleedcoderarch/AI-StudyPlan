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
  default = "dev"
}

variable "vpc_cidr" {
  type    = string
  default = "10.10.0.0/16"
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
  default = "30"
}

variable "billing_alarm_threshold_usd" {
  type    = number
  default = 25
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
  default = 3
}
