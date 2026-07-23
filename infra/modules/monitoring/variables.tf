variable "name_prefix" {
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

variable "ecs_cluster_id" {
  type = string
}

variable "ecs_cluster_name" {
  type = string
}

variable "ecs_security_group_id" {
  type = string
}

variable "http_listener_arn" {
  type = string
}

variable "alb_url" {
  type = string
}

variable "alb_arn_suffix" {
  type = string
}

variable "server_target_group_arn_suffix" {
  type = string
}

variable "server_service_name" {
  type = string
}

variable "sns_topic_arn" {
  type = string
}

variable "prometheus_image" {
  type = string
}

variable "grafana_image" {
  type = string
}

variable "yace_image" {
  type = string
}

variable "alertmanager_image" {
  type = string
}

variable "grafana_admin_user" {
  type    = string
  default = "admin"
}

variable "grafana_admin_password" {
  type      = string
  sensitive = true
}

variable "alert_email" {
  type = string
}

variable "smtp_smarthost" {
  type    = string
  default = "smtp.gmail.com:587"
}

variable "smtp_username" {
  type    = string
  default = ""
}

variable "smtp_password" {
  type      = string
  sensitive = true
  default   = ""
}

variable "cpu" {
  type    = number
  default = 1024
}

variable "memory" {
  type    = number
  default = 2048
}

variable "log_retention_days" {
  type    = number
  default = 7
}

variable "tags" {
  type    = map(string)
  default = {}
}
