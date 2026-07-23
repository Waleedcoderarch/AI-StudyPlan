variable "name_prefix" {
  type = string
}

variable "monthly_budget_usd" {
  type = string
}

variable "alert_email" {
  type = string
}

variable "create_billing_alarm" {
  description = "Billing metrics only exist in us-east-1"
  type        = bool
  default     = true
}

variable "billing_alarm_threshold_usd" {
  type    = number
  default = 50
}

variable "tags" {
  type    = map(string)
  default = {}
}
