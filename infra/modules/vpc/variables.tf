variable "name_prefix" {
  type = string
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "enable_nat_gateway" {
  description = "NAT is costly; disable in dev and run Fargate tasks in public subnets instead."
  type        = bool
  default     = false
}

variable "tags" {
  type    = map(string)
  default = {}
}
